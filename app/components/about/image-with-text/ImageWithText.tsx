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
    <motion.div className=""
      initial="hidden"
      whileInView="visible"
      viewport={{once: true, amount: 0.2}}
      variants={{
        hidden: {opacity: 0, x: 100},
        visible: {opacity: 1, x: 0},
      }}
      transition={{duration: 1, ease: [0.25, 0.46, 0.45, 0.94]}}
    >
      <Image
        src={image}
        alt={title}
        className="object-cover w-full "
        width={600}
        height={450}
      />
    </motion.div>
  );

  const contentBlock = (
    <motion.div className="flex flex-col justify-center text-right items-start"
      initial="hidden"
      whileInView="visible"
      viewport={{once: true, amount: 0.2}}
      variants={{
        hidden: {opacity: 0, x: -100},
        visible: {opacity: 1, x: 0},
      }}
      transition={{duration: 1, ease: [0.25, 0.46, 0.45, 0.94]}}
      >

      <h2 className="text-3xl md:text-4xl font-medium mb-4">{title}</h2>
      <div className="text-lg text-gray-700 mb-6">
       <RichText data={text} />
      </div>

    </motion.div>
  );

  return (
    <section className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center pt-16 px-40`}>
      {isImageLeft ? (
        <>
          <div className="order-2 lg:order-1">{imageBlock}</div>
          <div className="order-1 lg:order-2">{contentBlock}</div>
        </>
      ) : (
        <>
          <div className="order-1 lg:order-1">{contentBlock}</div>
          <div className="order-2 lg:order-2">{imageBlock}</div>
        </>
      )}
    </section>
  );
}
