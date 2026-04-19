import {Await, useLoaderData, Link} from 'react-router';
import type {Route} from './+types/_index';
import {Suspense} from 'react';
import {Image} from '@shopify/hydrogen';
import type {
  FeaturedCollectionFragment,
  RecommendedProductsQuery,
} from 'storefrontapi.generated';
import {ProductItem} from '~/components/ProductItem';
import {Hero} from '~/components/home/Hero/Hero';
import {
  HOMEPAGE_QUERY,
  FEATURED_COLLECTIONS_GALLERY_QUERY,
} from '~/components/home/queries';
import {AboutSection} from '~/components/home/about/AboutSection';
import {FeaturedCollections} from '~/components/home/featured-collections/FeaturedCollections';
import {FeaturedCollectionsGallery} from '~/components/home/featured-collections-gallery/FeaturedCollectionsGallery';
import { ImageWithText } from '~/components/home/image-with-text/ImageWithText';

export const meta: Route.MetaFunction = () => {
  return [{title: 'Fufinka | בית'}];
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
async function loadCriticalData({context}: Route.LoaderArgs) {
  const [featuredData, homepageData, galleryData] = await Promise.all([
    context.storefront.query(FEATURED_COLLECTION_QUERY),
    context.storefront.query(HOMEPAGE_QUERY),
    context.storefront.query(FEATURED_COLLECTIONS_GALLERY_QUERY),
  ]);
  return {
    featuredCollection: featuredData.collections.nodes,
    homepage: homepageData.metaobject,
    galleryCollections: galleryData.collections.nodes,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: Route.LoaderArgs) {
  const recommendedProducts = context.storefront
    .query(RECOMMENDED_PRODUCTS_QUERY)
    .catch((error: Error) => {
      // Log query errors, but don't throw them so the page can still render
      console.error(error);
      return null;
    });

  return {
    recommendedProducts,
  };
}

export default function Homepage() {
  const data = useLoaderData<typeof loader>();

  // למצוא את השדה hero_slides
  const slidesField = data.homepage?.fields.find(
    (f) => f.key === 'hero_slides'
  );

  // למפות כל slide לאובייקט נוח
  const slides =
    slidesField?.references?.nodes.map((node) =>
      Object.fromEntries(
        node.fields.map((f) => [
          f.key,
          f.reference?.image?.url || f.value,
        ])
      )
    ) || [];

  const aboutField = data.homepage?.fields.find(
  f => f.key === "about_section"
);

const aboutNode = aboutField?.reference;

const about =
  aboutNode &&
  Object.fromEntries(
    aboutNode.fields.map((f) => [
      f.key,
      f.reference?.image?.url || f.value,
    ])
  );

  const imageWithTextData = data.homepage?.fields.find(
    f => f.key === "image_with_text_section"
  );

  const imageWithTextNode = imageWithTextData?.reference;

  const imageWithTextValues =
    imageWithTextNode &&
    Object.fromEntries(
      imageWithTextNode.fields.map((f) => [
        f.key,
        f.reference?.image?.url || f.value,
      ])
    );

    const imageWithTextData2 = data.homepage?.fields.find(
      f => f.key === "image_with_text_section_2"
    );

  const imageWithTextNode2 = imageWithTextData2?.reference;

  const imageWithTextValues2 =
    imageWithTextNode2 &&
    Object.fromEntries(
      imageWithTextNode2.fields.map((f) => [
        f.key,
        f.reference?.image?.url || f.value,
      ])
    );


  return (
    <div className="home">
      <Hero slides={slides} />
      <AboutSection about={about} />
      <FeaturedCollections collections={data.featuredCollection} />
            <FeaturedCollectionsGallery collections={data.galleryCollections} />
      {/* <RecommendedProducts products={data.recommendedProducts} /> */}

     <ImageWithText 
        image={imageWithTextValues.picture}
        title={imageWithTextValues.title}
        text={imageWithTextValues.text}
        buttonText="אני רוצה להרשם"
        buttonLink="/" 
    />

    <ImageWithText 
        image={imageWithTextValues2.picture}
        title={imageWithTextValues2.title}
        text={imageWithTextValues2.text}
        buttonText="אני רוצה להרשם"
        buttonLink="/" 
        imagePosition="right"
    />
    

    </div>
  );
}

// function FeaturedCollection({
//   collection,
// }: {
//   collection: FeaturedCollectionFragment[];
// }) {
//   if (!collection) return null;
//   const image = collection?.image;
//   return (
// <>
//   {collection.map((collection) => (
//           <Link
//             key={collection.id}
//             to={`/collections/${collection.handle}`}
//             className="group block"
//           >
//             {collection.image && (
//               <div className="overflow-hidden rounded-lg">
//                 <Image
//                   data={collection.image}
//                   sizes="100vw"
//                   className="group-hover:scale-105 transition duration-300"
//                 />
//               </div>
//             )}
//             <h3 className="mt-4 text-lg font-semibold">
//               {collection.title}
//             </h3>
//           </Link>
//         ))}
// </>
//   );
// }

function RecommendedProducts({
  products,
}: {
  products: Promise<RecommendedProductsQuery | null>;
}) {
  return (
    <div className="recommended-products">
      <h2>Recommended Products</h2>
      <Suspense fallback={<div>Loading...</div>}>
        <Await resolve={products}>
          {(response) => (
            <div className="recommended-products-grid">
              {response
                ? response.products.nodes.map((product) => (
                    <ProductItem key={product.id} product={product} />
                  ))
                : null}
            </div>
          )}
        </Await>
      </Suspense>
      <br />
    </div>
  );
}

const FEATURED_COLLECTION_QUERY = `#graphql
  fragment FeaturedCollection on Collection {
    id
    title
    image {
      id
      url
      altText
      width
      height
    }
    handle
  }
  query FeaturedCollection($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 4, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...FeaturedCollection
      }
    }
  }
` as const;

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  fragment RecommendedProduct on Product {
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
  query RecommendedProducts ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 4, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...RecommendedProduct
      }
    }
  }
` as const;
