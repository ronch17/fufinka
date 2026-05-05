import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import type {
  CollectionItemFragment,
  ProductItemFragment,
  RecommendedProductFragment,
  RelatedProductCardFragment,
  WorkshopsProductsQuery,
} from 'storefrontapi.generated';
import {useVariantUrl} from '~/lib/variants';
import {AddToCartButton} from './AddToCartButton';
import {useAside} from './Aside';

type WorkshopProductNode =
  WorkshopsProductsQuery['products']['nodes'][number];

type ProductCard = {
  id: string;
  handle: string;
  title: string;
  featuredImage?: CollectionItemFragment['featuredImage'];
  priceRange: {minVariantPrice: {amount: string; currencyCode: string}};
  selectedOrFirstAvailableVariant?: Pick<
    NonNullable<ProductItemFragment['selectedOrFirstAvailableVariant']>,
    'id'
  > | null;
};

/** למזג optimistic cart — צריך לפחות product.handle כמו בשורת סל אמיתית */
function optimisticSelectedVariantForCard(
  product: ProductCard,
  availableForSale: boolean,
) {
  const id = product.selectedOrFirstAvailableVariant?.id;
  if (!id) return undefined;
  const image = product.featuredImage;
  return {
    __typename: 'ProductVariant' as const,
    id,
    title: product.title,
    availableForSale,
    requiresShipping: true,
    selectedOptions: [] as Array<{name: string; value: string}>,
    product: {
      __typename: 'Product' as const,
      id: product.id,
      handle: product.handle,
      title: product.title,
      vendor: '',
    },
    price: product.priceRange.minVariantPrice,
    ...(image ? {image} : {}),
  };
}

export function ProductItem({
  product,
  loading,
}: {
  product:
    | CollectionItemFragment
    | ProductItemFragment
    | RecommendedProductFragment
    | RelatedProductCardFragment
    | WorkshopProductNode;
  loading?: 'eager' | 'lazy';
}) {
  const variantUrl = useVariantUrl(product.handle);
  const {open} = useAside();
  const image = product.featuredImage;
  const availableForSale = product.availableForSale ?? false;
  const merchandiseId =
    product.selectedOrFirstAvailableVariant?.id ?? null;
  const canAddToCart = Boolean(availableForSale && merchandiseId);
  const optimisticVariant = optimisticSelectedVariantForCard(
    product,
    availableForSale,
  );

  return (
    <div className="relative group">
        <Link
      className="product-item text-center space-y-2 relative  "
      key={product.id}
      prefetch="intent"
      to={variantUrl}
      data-available-for-sale={availableForSale}
    >
      {!availableForSale && (
        <span className="absolute right-4 top-4  z-1 bg-[#d01036] text-white font-bold px-2 py-1 rounded-full shadow-1xl">
          SOLD
        </span>
      )}
      {image && (
        <Image
          alt={image.altText || product.title}
          aspectRatio="1/1"
          crop="top"
          data={image}
          loading={loading}
          sizes="(min-width: 45em) 400px, 100vw"
        />
      )}
      <h4 className="text-xl font-medium">{product.title}</h4>
      <small className="textarea-lg text-gray-500">
        <Money data={product.priceRange.minVariantPrice} />
      </small>
    </Link>
          <div className="md:absolute md:inset-x-0 md:bottom-0 z-10 overflow-hidden pointer-events-none group-hover:pointer-events-auto  ">
            <div className="md:translate-y-full md:group-hover:translate-y-0 transition-transform duration-300 ease-out md:bg-black/60 py-3 flex items-center justify-center">
              {canAddToCart ? (
              <AddToCartButton
                analytics={{
                  product_id: product.id,
                  product_name: product.title,
                  product_price: product.priceRange.minVariantPrice.amount,
                }}
                disabled={!canAddToCart}
                lines={
                  merchandiseId && optimisticVariant
                    ? [
                        {
                          merchandiseId,
                          quantity: 1,
                          selectedVariant: optimisticVariant,
                        },
                      ]
                    : []
                }
                onClick={() => open('cart')}
              >
                <span className="text-black text-sm font-medium  transition cursor-pointer ">
                  הוספה לסל
                </span>
              </AddToCartButton>
            ) : (
              <span className="text-white/80 text-sm">אזל מהמלאי</span>
            )}
          </div>
          </div>
        </div>
  );
}
