import {useEffect, useState} from 'react';
import {AnimatePresence} from 'framer-motion';
import {HeroSlide} from './HeroSlide';

const DEFAULT_AUTO_PLAY_MS = 6000;

export function Hero({
  slides,
  autoPlayIntervalMs = DEFAULT_AUTO_PLAY_MS,
}: {
  slides: Slides[];
  /** מרווח בין מעבר אוטומטי לסלייד הבא (מילישניות). 0 = ללא אוטו־פליי */
  autoPlayIntervalMs?: number;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    if (autoPlayIntervalMs <= 0) return;

    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, autoPlayIntervalMs);

    return () => window.clearInterval(id);
  }, [slides.length, autoPlayIntervalMs]);

  return (
    <div className=" relative overflow-hidden" style={{background: slides[index]?.background}}>
      <AnimatePresence mode="wait">
        {slides[index] && (
          <HeroSlide key={slides[index].title} homepage={slides[index]} />
        )}
      </AnimatePresence>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 cursor-pointer ">
        {slides.map((slide, i) => (
          <button
            key={slide.image}
            type="button"
            aria-label={`מעבר לשקופית ${i + 1} מתוך ${slides.length}`}
            aria-current={i === index ? 'true' : undefined}
            onClick={() => setIndex(i)}
            className={`w-3 h-3 rounded-full transition-colors ${
              i === index ? 'bg-black' : 'bg-gray-400'
            }`}
          />
        ))}
      </div>
    </div>
  );
}