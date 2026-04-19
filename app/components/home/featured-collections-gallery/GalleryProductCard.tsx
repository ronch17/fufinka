import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import {AddToCartButton} from '~/components/AddToCartButton';
import {useAside} from '~/components/Aside';
import {useVariantUrl} from '~/lib/variants';

type GalleryProduct = {
  id: string;
  handle: string;
  title: string;
  featuredImage?: {
    id: string;
    url: string;
    altText?: string | null;
    width?: number | null;
    height?: number | null;
  } | null;
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  selectedOrFirstAvailableVariant?: {
    id: string;
    availableForSale: boolean;
  } | null;
};

export function GalleryProductCard({
  product,
  size = 'small',
}: {
  product: GalleryProduct;
  size?: 'small' | 'large';
}) {
  const variantUrl = useVariantUrl(product.handle);
  const {open} = useAside();
  const image = product.featuredImage;
  const variant = product.selectedOrFirstAvailableVariant;

  const aspectClass = size === 'large' ? 'aspect-[4/5]' : 'aspect-square';

  return (
    <div className="group relative overflow-hidden h-fit cursor-pointer">
      <div className={`relative ${aspectClass} w-full`}>
        <Link
          to={variantUrl}
          prefetch="intent"
          className="block w-full h-full"
        >
          {image && (
            <Image
              data={image}
              alt={image.altText || product.title}
              className="object-cover w-full h-full transition duration-300"
              sizes={size === 'large' ? '60vw' : '25vw'}
            />
          )}
        </Link>
        <div className="absolute inset-x-0 bottom-0 z-10 overflow-hidden pointer-events-none group-hover:pointer-events-auto">
          <div className="translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out bg-black/60 py-3 flex items-center justify-center">
            {variant && variant.availableForSale ? (
              <AddToCartButton
                lines={[
                  {
                    merchandiseId: variant.id,
                    quantity: 1,
                  },
                ]}
                onClick={() => open('cart')}
              >
                <span className="text-black text-sm font-medium  transition cursor-pointer">
                  הוספה לסל
                </span>
              </AddToCartButton>
            ) : (
              <span className="text-white/80 text-sm">אזל מהמלאי</span>
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center gap-2 mt-3">
         <h3 className="font-semibold text-sm md:text-base">
            {product.title}
          </h3>
      <Money data={product.priceRange.minVariantPrice} />
      </div>

    </div>
  );
}
