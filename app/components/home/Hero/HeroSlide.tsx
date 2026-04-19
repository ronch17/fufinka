import {motion} from 'framer-motion';
import {TiltFloat} from './useTilt';
import {Image} from '@shopify/hydrogen';
import bgMockup from '~/assets/background-mockup.png';
import {
  imageVariants,
  textVariants,
  transition,
} from '~/components/animations';
import { Button } from '~/components/Button';


export function HeroSlide({homepage}: {homepage: Slides}) {
  return (
    <motion.section
      className="grid grid-cols-1 md:grid-cols-2 items-center justify-items-center min-h-[80vh] px-8 relative z-0"
      style={{background: homepage.background}}
      initial={{opacity: 0}}
      animate={{opacity: 1}}
      exit={{opacity: 0}}
      transition={transition}
    >
      {/* IMAGE - יורד מלמעלה */}
      <motion.div
        variants={imageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={transition}
      >
        <TiltFloat>
          <Image
            src={homepage.image}
            alt={homepage.title}
            className="object-contain max-sm:w-70 max-sm:my-10"
            width={500}
            height={500}
          />
        </TiltFloat>
      </motion.div>

      <Image
        src={bgMockup}
        alt="Background Mockup"
        className="absolute z-[-1] top-0 right-0 h-full object-cover filter hue-rotate-45"
        width={600}
        height={600}
      />

      {/* TEXT - עולה מלמטה */}
      <motion.div
        className="flex flex-col items-center gap-3  lg:space-y-6 text-center"
        variants={textVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={transition}
      >
        <h1 className="text-6xl font-bold max-sm:text-4xl">{homepage.title}</h1>
        <div className="w-10 border-b-1  border-[var(--color-secondary)]" />

        <Button variant="artistic" size="lg" className="max-sm:text-sm max-sm:px-4 max-sm:mb-15">
          {homepage.button}
        </Button>
      </motion.div>
    </motion.section>
  );
}