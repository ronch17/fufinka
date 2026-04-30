import {useLoaderData} from 'react-router';
import type {Route} from './+types/products.$handle';
import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
  Image
} from '@shopify/hydrogen';
import {ProductPrice} from '~/components/ProductPrice';
import {ProductImageGallery} from '~/components/ProductImageGallery';
import {ProductForm} from '~/components/ProductForm';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {Breadcrumbs} from '~/components/Breadcrumb';
import {ProductDetailsMeta} from '~/components/ProductDetailsMeta';
import {ProductSocialShare} from '~/components/ProductSocialShare';
import {ProductItem} from '~/components/ProductItem';
import type {RecommendedProductFragment} from 'storefrontapi.generated';
import sectionBg from '~/assets/products-background.jpeg';

export const meta: Route.MetaFunction = ({data}) => {
  return [
    {title: `Hydrogen | ${data?.product.title ?? ''}`},
    {
      rel: 'canonical',
      href: `/products/${data?.product.handle}`,
    },
  ];
};

export async function loader(args: Route.LoaderArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context, params, request}: Route.LoaderArgs) {
  const {handle} = params;
  const {storefront} = context;

  if (!handle) {
    throw new Error('Expected product handle to be defined');
  }

  const [{product}] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {handle, selectedOptions: getSelectedProductOptions(request)},
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  // The API handle might be localized, so redirect to the localized handle
  redirectIfHandleIsLocalized(request, {handle, data: product});

  let relatedProducts: RecommendedProductFragment[] = [];

  try {
    const {productRecommendations} = await storefront.query(
      PRODUCT_RECOMMENDATIONS_QUERY,
      {
        variables: {productId: product.id},
      },
    );
    const list = productRecommendations?.filter(
      (p: {id: string}) => p.id !== product.id,
    );
    if (list?.length) {
      relatedProducts = list as RecommendedProductFragment[];
    }
  } catch {
    relatedProducts = [];
  }

  return {
    product,
    pageUrl: new URL(request.url).href,
    relatedProducts,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context, params}: Route.LoaderArgs) {
  // Put any API calls that is not critical to be available on first page render
  // For example: product reviews, product recommendations, social feeds.

  return {};
}

export default function Product() {
  const {product, pageUrl, relatedProducts} = useLoaderData<typeof loader>();

  // Optimistically selects a variant with given available variant information
  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  // Sets the search param to the selected variant without navigation
  // only when no search params are set in the url
  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  // Get the product options array
  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const {title, descriptionHtml} = product;



  return (
<>
      <header>
        <div className="h-64 flex flex-col items-center justify-center  text-black overflow-hidden relative " style={{backgroundImage: `url(${sectionBg})`, backgroundSize: 'cover'}}>
       
          <h1 className='text-4xl font-medium md:text-5xl mb-5 z-5'>{title}</h1>
       
          <Breadcrumbs
          className='text-black text-2xl font-medium z-5'
            items={[
              {label: 'בית', to: '/'},
              {label: 'גלריית עבודות', to: '/collections/all'},
              {label: title},
            ]}
          />
        </div>
      </header>
    <div className="product my-20 px-20">
      <ProductImageGallery
        productImages={product.images?.nodes ?? []}
        variantImage={selectedVariant?.image}
      />
      <div className="product-main">
        <h3 className="text-4xl font-medium mb-2 max-md:mt-5 max-md:text-center">{title}</h3>
        <ProductPrice
          price={selectedVariant?.price}
          compareAtPrice={selectedVariant?.compareAtPrice}
          className="text-2xl font-medium text-gray-500 max-md:text-center"
        />
        <br />
        <ProductForm
          productOptions={productOptions}
          selectedVariant={selectedVariant}
        />
        <br />
        <br />
        <p>
          <strong>תיאור המוצר</strong>
        </p>
        <br />
        <div dangerouslySetInnerHTML={{__html: descriptionHtml}} />

        <ProductDetailsMeta product={product} selectedVariant={selectedVariant} />

        <ProductSocialShare url={pageUrl} title={title} />
      </div>

 

      <Analytics.ProductView
        data={{
          products: [
            {
              id: product.id,
              title: product.title,
              price: selectedVariant?.price.amount || '0',
              vendor: product.vendor,
              variantId: selectedVariant?.id || '',
              variantTitle: selectedVariant?.title || '',
              quantity: 1,
            },
          ],
        }}
      />
    </div>
         {relatedProducts.length > 0 ? (
        <section
          className="mt-16 border-t border-gray-200 pt-12 px-20 mb-10"
          aria-labelledby="related-products-heading"
        >
          <h2
            id="related-products-heading"
            className="mb-8 text-center text-2xl font-medium md:text-3xl"
          >
            מוצרים קשורים
          </h2>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
            {relatedProducts.map((related) => (
              <ProductItem key={related.id} product={related} loading="lazy" />
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice {
      amount
      currencyCode
    }
    id
    image {
      __typename
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
    selectedOptions {
      name
      value
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
  }
` as const;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    availableForSale
    handle
    productType
    tags
    publishedAt
    descriptionHtml
    description
    category {
      id
      name
      ancestors {
        name
      }
    }
    collections(first: 10) {
      nodes {
        id
        title
        handle
      }
    }
    images(first: 20) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
    encodedVariantExistence
    encodedVariantAvailability
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          ...ProductVariant
        }
        swatch {
          color
          image {
            previewImage {
              url
            }
          }
        }
      }
    }
    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
    adjacentVariants (selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    seo {
      description
      title
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
` as const;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_FRAGMENT}
` as const;

/** Same fields as homepage RecommendedProduct — used by ProductItem */
const RELATED_PRODUCT_CARD_FRAGMENT = `#graphql
  fragment RelatedProductCard on Product {
    id
    title
    handle
    availableForSale
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    featuredImage {
      id
      url
      altText
      width
      height
    }
  }
` as const;

const PRODUCT_RECOMMENDATIONS_QUERY = `#graphql
  query ProductRecommendationsByProduct(
    $productId: ID!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    productRecommendations(productId: $productId, intent: RELATED) {
      ...RelatedProductCard
    }
  }
  ${RELATED_PRODUCT_CARD_FRAGMENT}
` as const;
