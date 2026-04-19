import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import type {
  ProductItemFragment,
  CollectionItemFragment,
  RecommendedProductFragment,
} from 'storefrontapi.generated';
import {useVariantUrl} from '~/lib/variants';

export function ProductItem({
  product,
  loading,
}: {
  product:
    | CollectionItemFragment
    | ProductItemFragment
    | RecommendedProductFragment;
  loading?: 'eager' | 'lazy';
}) {
  const variantUrl = useVariantUrl(product.handle);
  const image = product.featuredImage;
  const availableForSale = product.availableForSale ?? false;

  return (
    <Link
      className="product-item text-center space-y-2 relative"
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
  );
}
