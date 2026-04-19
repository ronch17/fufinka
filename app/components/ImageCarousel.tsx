import {useCallback, useEffect, useMemo, useState} from 'react';
import {Image} from '@shopify/hydrogen';
import {ChevronLeft, ChevronRight} from 'lucide-react';

const VISIBLE_COUNT = 5;

export type CarouselMediaImage = {
  __typename?: 'MediaImage' | string;
  id?: string | null;
  image?: {
    url: string;
    altText?: string | null;
    width?: number | null;
    height?: number | null;
  } | null;
};

function normalizeMedia(items: CarouselMediaImage[]) {
  const seen = new Set<string>();
  const out: {
    url: string;
    altText?: string | null;
    width?: number | null;
    height?: number | null;
  }[] = [];
  for (const item of items) {
    const img = item.image;
    if (!img?.url) continue;
    const key = item.id ?? img.url;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      url: img.url,
      altText: img.altText,
      width: img.width,
      height: img.height,
    });
  }
  return out;
}

type ImageCarouselProps = {
  media: CarouselMediaImage[];
  /** גודל srcset לכל תמונה בשורה (חמש בשורה) */
  sizes?: string;
  /** יחס גובה-רוחב לכל תא */
  aspectClassName?: string;
  className?: string;
};

export function ImageCarousel({
  media,
  sizes = '(min-width: 64em) 18vw, 19vw',
  aspectClassName = 'aspect-[3/4]',
  className = '',
}: ImageCarouselProps) {
  const images = useMemo(() => normalizeMedia(media), [media]);
  const [startIndex, setStartIndex] = useState(0);

  const maxStart = Math.max(0, images.length - VISIBLE_COUNT);

  useEffect(() => {
    setStartIndex((s) => Math.max(0, Math.min(s, maxStart)));
  }, [maxStart]);

  const goPrev = useCallback(() => {
    setStartIndex((s) => Math.max(0, s - 1));
  }, []);

  const goNext = useCallback(() => {
    setStartIndex((s) => Math.min(maxStart, s + 1));
  }, [maxStart]);

  if (images.length === 0) return null;

  const cells = Array.from({length: VISIBLE_COUNT}, (_, i) => {
    const img = images[startIndex + i];
    return img ?? null;
  });

  const canSlide = images.length > VISIBLE_COUNT;

  return (
    <div className={`relative w-full ${className}`} dir="rtl">
      {canSlide && (
        <div className="pointer-events-none absolute inset-y-0 -inset-x-1 z-10 flex items-center justify-between sm:-inset-x-2">
          <button
            type="button"
            onClick={goNext}
            disabled={startIndex >= maxStart}
            className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-white/95 text-neutral-800 shadow-sm transition hover:bg-white disabled:pointer-events-none disabled:opacity-35 cursor-pointer"
            aria-label="הזז את השורה קדימה"
          >
            <ChevronRight className="h-5 w-5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={goPrev}
            disabled={startIndex <= 0}
            className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-white/95 text-neutral-800 shadow-sm transition hover:bg-white disabled:pointer-events-none disabled:opacity-35 cursor-pointer"
            aria-label="הזז את השורה אחורה"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>
        </div>
      )}

      <ul
        className="grid w-full grid-cols-5 gap-2"
        aria-label={`גלריה, ${images.length} תמונות`}
      >
        {cells.map((img, i) => {
          const globalIndex = startIndex + i;
          return (
            <li key={img?.url ?? `slot-${startIndex}-${i}`} className="min-w-0">
              {img ? (
                <div
                  className={`overflow-hidden rounded-lg bg-neutral-100 ${aspectClassName}`}
                >
                  <Image
                    data={img}
                    alt={
                      img.altText ||
                      `תמונה ${globalIndex + 1} מתוך ${images.length}`
                    }
                    className="size-full object-cover"
                    sizes={sizes}
                  />
                </div>
              ) : (
                <div
                  className={`rounded-lg bg-neutral-100/60 ${aspectClassName}`}
                  aria-hidden
                />
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
