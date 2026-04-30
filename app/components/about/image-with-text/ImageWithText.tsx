import {Image} from '@shopify/hydrogen';
import {RichText} from '@shopify/hydrogen';
import {Link} from 'react-router';
import {motion} from 'framer-motion';
import { Button } from '~/components/Button';


export type ImageWithTextProps = {
  /** נתיב או URL לתמונה */
  image: string;
  /** כותרת */
  title: string;
  /** טקסט (תומך ב-RichText מ-Shopify) */
  text: string;
  /** טקסט הכפתור */
  buttonText: string;
  /** קישור הכפתור (אופציונלי) */
  buttonLink?: string;
  /** מיקום התמונה: 'left' | 'right' */
  imagePosition?: 'left' | 'right';
  /** כיתוב נוסף */
  className?: string;
};

export function ImageWithText({
  image,
  title,
  text,
  buttonText,
  buttonLink = '#',
  imagePosition = 'left',
  className,
}: ImageWithTextProps) {
  const isImageLeft = imagePosition === 'left';

  const imageBlock = (
    <>
      <Image
        src={image}
        alt={title}
        className="object-cover w-full "
        width="auto"
        height="auto"
      />
    </>
  );

  const contentBlock = (
    <>

      <h2 className="text-3xl md:text-4xl font-medium mb-4">{title}</h2>
      <div className="text-lg text-gray-700 mb-6">
       <RichText data={text} />
      </div>

    </>
  );

  return (
    <section className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center pt-16 px-40 max-md:px-7 `}>
      {isImageLeft ? (
        <>
          <div className="order-2 lg:order-1 h-full">{imageBlock}</div>
          <div className="order-1 lg:order-2">{contentBlock}</div>
        </>
      ) : (
        <>
          <div className="order-1 lg:order-1">{contentBlock}</div>
          <div className="order-2 lg:order-2 h-full">{imageBlock}</div>
        </>
      )}
    </section>
  );
}
