import {useState, useEffect, useCallback} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import {RichText, Image} from '@shopify/hydrogen';

/* =========================
   TYPES
========================= */

export type TestimonialField = {
  key: string;
  value: string;
  reference?: any;
};

type TestimonialsProps = {
  testimonials: Testimonial[];
  autoPlayInterval?: number;
};

/* =========================
   HELPERS
========================= */

function safeParse(json: string) {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function mapTestimonials(metaobjects: any[]): Testimonial[] {
  return metaobjects.map((item: any) => {
    const data = Object.fromEntries(
      (item.fields || []).map((f: any) => [
        f.key,
        f.reference?.image?.url || f.value,
      ])
    );

    // console.log(data.fields);

    return {
      id: item.id,
      name: data.fields.author,
      text: data.fields.text ? safeParse(data.fields.text) : null,
      image: data.fields.image || null,
    };
  });
}

/* =========================
   ANIMATION
========================= */

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -80 : 80,
    opacity: 0,
  }),
};

const transition = {
  duration: 0.45,
  ease: 'easeInOut' as const,
};

/* =========================
   COMPONENT
========================= */

export function Testimonials({
  testimonials,
  autoPlayInterval = 5000,
}: TestimonialsProps) {
  const [[current, direction], setCurrent] = useState<[number, number]>([0, 0]);
  const [paused, setPaused] = useState(false);

  const count = testimonials.length;

  const paginate = useCallback(
    (newDirection: number) => {
      setCurrent(([prev]) => [
        (prev + newDirection + count) % count,
        newDirection,
      ]);
    },
    [count],
  );

  useEffect(() => {
    if (paused || count <= 1) return;

    const id = setInterval(() => paginate(1), autoPlayInterval);

    return () => clearInterval(id);

  }, [paused, count, autoPlayInterval, paginate]);

  if (!count) return null;

  const testimonial = testimonials[current];

  function getField(fields, key) {
  return fields.find((f) => f.key === key)?.value;
}

  function getField2(fields, key) {
  return fields.find((f) => f.key === key)?.reference?.image?.url;
}


const author = getField(testimonial.fields, "author");
const text = getField(testimonial.fields, "text");
const image = getField2(testimonial.fields, "image");


  return (
    <section
      dir="rtl"
      className="relative w-full overflow-hidden bg-[#d9a7b1d6] py-16 px-4"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
    

      {/* Content */}
      <div className="relative flex items-center justify-center max-w-2xl mx-auto min-h-[240px]">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={testimonial.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={transition}
            className=" inset-0 flex flex-col items-center justify-center gap-6 text-center px-6"
          >
            {/* Quote */}
            <span className="translate-y-8 text-4xl font-serif">
              &#8220;
            </span>

            {/* Author */}
            <div className="flex flex-col items-center gap-2 mt-2">
              {image && (
                <Image
                  src={image}
                  alt={author}
                  className="w-15 h-30 rounded-full object-cover border-2 border-[#d9a7b1]"
                />
              )}

              <span className="font-semibold text-sm text-neutral-900">
                — {author}
              </span>
            </div>

            {/* Text */}
            {text && (
              <RichText
                data={text}
                className="text-lg leading-relaxed text-neutral-700 max-w-xl"
              />
            )}

            
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Arrows */}
      {count > 1 && (
        <>
          <button
            aria-label="הקודם"
            onClick={() => paginate(-1)}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full border border-neutral-300 bg-white hover:bg-neutral-100 transition text-neutral-600"
          >
            &#8249;
          </button>

          <button
            aria-label="הבא"
            onClick={() => paginate(1)}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full border border-neutral-300 bg-white hover:bg-neutral-100 transition text-neutral-600"
          >
            &#8250;
          </button>
        </>
      )}

      {/* Dots */}
      {count > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {testimonials.map((t, i) => (
            <button
              key={t.id}
              aria-label={`עבור להמלצה ${i + 1}`}
              onClick={() =>
                setCurrent(([prev]) => [i, i > prev ? 1 : -1])
              }
              className={`h-2 rounded-full transition-all duration-300 ${
                i === current
                  ? 'bg-neutral-800 w-5'
                  : 'bg-neutral-300 w-2 hover:bg-neutral-500'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
