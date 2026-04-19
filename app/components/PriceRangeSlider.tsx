import {Range} from 'react-range';
import {useState} from 'react';

type Props = {
  min: number;
  max: number;
  initialMin: number;
  initialMax: number;
};

export function PriceRangeSlider({min, max, initialMin, initialMax}: Props) {
  const [values, setValues] = useState([initialMin, initialMax]);

  function submit(values: number[]) {
    const url = new URL(window.location.href);

    url.searchParams.set('minPrice', values[0].toString());
    url.searchParams.set('maxPrice', values[1].toString());

    window.location.href = url.toString();
  }

  return (
    <div className="w-64">

      <Range
      
        step={1}
        min={min}
        max={max}
        values={values}
        onChange={(values) => setValues(values)}
        onFinalChange={(values) => submit(values)}
        renderTrack={({props, children}) => (
          <div
            {...props}
            className="h-2 w-full bg-gray-300 rounded"
          >
            {children}
          </div>
        )}
        renderThumb={({props}) => (
          <div
            {...props}
            className="h-4 w-4 bg-black rounded-full"
          />
        )}
      />

      <div className="mt-2 text-sm">
        ₪{values[0]} - ₪{values[1]}
      </div>

    </div>
  );
}