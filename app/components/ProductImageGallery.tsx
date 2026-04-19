import {useCallback, useEffect, useMemo, useState} from 'react';
import {Image} from '@shopify/hydrogen';
import {ChevronLeft, ChevronRight} from 'lucide-react';

type GalleryImage = {
  __typename?: string;
  id?: string | null;
  url: string;
  altText?: string | null;
  width?: number | null;
  height?: number | null;
};

function uniqueImages(images: (GalleryImage | null | undefined)[]): GalleryImage[] {
  const seen = new Set<string>();
  const out: GalleryImage[] = [];
  for (const img of images) {
    if (!img?.url) continue;
    const key = img.id ?? img.url;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(img as GalleryImage);
  }
  return out;
}

export function ProductImageGallery({
  productImages,
  variantImage,
}: {
  /** מסודר לפי סדר המוצר ב-Shopify */
  productImages: GalleryImage[];
  /** תמונת הווריאנט הנבחר — מסנכרנים אליה כשמשתנה */
  variantImage?: GalleryImage | null;
}) {
  const images = useMemo(() => {
    const fromProduct = uniqueImages(productImages);
    if (fromProduct.length > 0) return fromProduct;
    if (variantImage?.url) return [variantImage];
    return [];
  }, [productImages, variantImage]);

  const [activeIndex, setActiveIndex] = useState(0);

  const clampIndex = useCallback(
    (i: number) => Math.max(0, Math.min(i, images.length - 1)),
    [images.length],
  );

  useEffect(() => {
    if (!variantImage || images.length === 0) return;
    const idx = variantImage.id
      ? images.findIndex((img) => img.id === variantImage.id)
      : images.findIndex((img) => img.url === variantImage.url);
    if (idx >= 0) setActiveIndex(idx);
  }, [variantImage, images]);

  useEffect(() => {
    setActiveIndex((i) => clampIndex(i));
  }, [images.length, clampIndex]);

  const goPrev = useCallback(() => {
    setActiveIndex((i) => clampIndex(i - 1));
  }, [clampIndex]);

  const goNext = useCallback(() => {
    setActiveIndex((i) => clampIndex(i + 1));
  }, [clampIndex]);

  const active = images[activeIndex];

  if (images.length === 0) {
    return <div className="product-image" />;
  }

  if (images.length === 1) {
    return (
      <div className="product-image">
        <Image
          alt={active.altText || 'Product Image'}
          aspectRatio="1/1"
          data={active}
          key={active.id}
          sizes="(min-width: 45em) 50vw, 100vw"
        />
      </div>
    );
  }

  return (
    <div
      className="product-image product-image-gallery outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          goPrev();
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          goNext();
        }
      }}
    >
      <div className="relative">
        <Image
          alt={active.altText || 'Product Image'}
          aspectRatio="1/1"
          data={active}
          key={active.id}
          sizes="(min-width: 45em) 50vw, 100vw"
        />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-1">
         
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white/90 text-gray-800 shadow-sm transition hover:bg-white cursor-pointer"
            aria-label="תמונה הבאה"
          >
            <ChevronRight className="h-6 w-6" aria-hidden />
          </button>

           <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white/90 text-gray-800 shadow-sm transition hover:bg-white cursor-pointer"
            aria-label="תמונה קודמת"
          >
            <ChevronLeft className="h-6 w-6" aria-hidden />
          </button>
        </div>
      </div>

      <ul
        className="mt-3 flex flex-wrap gap-2"
        role="tablist"
        aria-label="בחירת תמונה"
      >
        {images.map((img, index) => {
          const selected = index === activeIndex;
          return (
            <li key={img.id ?? img.url ?? index}>
              <button
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setActiveIndex(index)}
                className={`block overflow-hidden rounded border-2 transition ${
                  selected
                    ? 'border-gray-900 ring-1 ring-gray-900'
                    : 'border-transparent opacity-80 hover:opacity-100'
                }`}
              >
                <Image
                  alt={img.altText || ''}
                  aspectRatio="1/1"
                  className="h-16 w-16 object-cover"
                  data={img}
                  sizes="64px"
                />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
