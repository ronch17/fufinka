import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import {Image} from '@shopify/hydrogen';
import {ChevronLeft, ChevronRight} from 'lucide-react';

/** מתאים ל־Tailwind `sm` — מתחת לכך מוצגת תמונה אחת */
const MOBILE_MAX_WIDTH_MEDIA = '(max-width: 639px)';

function useVisibleCount() {
  /** SSR + רינדור ראשון בלקוח: 5 — כדי שלא יהיה mismatch; מתעדכן לפני ציור במובייל */
  const [visibleCount, setVisibleCount] = useState(5);

  useLayoutEffect(() => {
    const mq = window.matchMedia(MOBILE_MAX_WIDTH_MEDIA);
    const sync = () => setVisibleCount(mq.matches ? 1 : 5);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  return visibleCount;
}

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
  /** גודל srcset (ברירת מחדל: מלא רוחב במובייל, מרווחים בדסקטופ) */
  sizes?: string;
  /** יחס גובה-רוחב לכל תא */
  aspectClassName?: string;
  className?: string;
};

export function ImageCarousel({
  media,
  sizes = '(max-width: 639px) 100vw, (min-width: 64em) 18vw, 19vw',
  aspectClassName = 'aspect-[3/4]',
  className = '',
}: ImageCarouselProps) {
  const visibleCount = useVisibleCount();
  const images = useMemo(() => normalizeMedia(media), [media]);
  const [startIndex, setStartIndex] = useState(0);

  const maxStart = Math.max(0, images.length - visibleCount);

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

  const canSlide = images.length > visibleCount;

  const n = images.length;
  /** רוחב המסלול: n תאים בגודל (100%/v) כל אחד — בלי gap כדי ש־translateX באחוזים מהמסלול יהיה מדויק */
  const trackWidth = `calc(100% * ${n} / ${visibleCount})`;
  const trackTransform = `translateX(calc(-${startIndex} * 100% / ${n}))`;

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

      <div className="w-full overflow-hidden" dir="ltr">
        <ul
          className="flex transition-transform duration-350 ease-[cubic-bezier(0.25,0.1,0.25,1)] motion-reduce:transition-none"
          style={{
            width: trackWidth,
            transform: trackTransform,
          }}
          aria-label={`גלריה, ${images.length} תמונות`}
        >
          {images.map((img, globalIndex) => (
            <li
              key={img.url}
              className="min-w-0 shrink-0 px-1"
              style={{width: `calc(100% / ${n})`}}
            >
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
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
