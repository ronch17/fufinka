import {useState} from 'react';
import {HeroSlide} from './HeroSlide';

export function Hero({slides}: {slides: any[]}) {
  const [index, setIndex] = useState(0);

  const slidess = slides.map((slide, index) => <HeroSlide key={index} homepage={slide} />);

  return (
    <div className=" relative overflow-hidden" style={{background: slides[index].background}}>
      {slidess[index]}

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`w-3 h-3 rounded-full ${
              i === index ? 'bg-black' : 'bg-gray-400'
            }`}
          />
        ))}
      </div>
    </div>
  );
}