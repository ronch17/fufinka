import {motion} from 'framer-motion';
import {Image} from '@shopify/hydrogen';
import {RichText} from '@shopify/hydrogen';
import { Button } from '~/components/Button';
import { Link } from 'react-router-dom';

type About = {
  image: string;
  text: string;
  image2: string;
};

const fadeUpVariants = {
  hidden: {y: 60, opacity: 0},
  visible: {
    y: 0,
    opacity: 1,
    transition: {duration: 2, ease: [0.25, 0.46, 0.45, 0.94]},
  },
};

export function AboutSection({about}: {about: About}) {
  const {image, image2, text} = about;

  return (
    <section className="flex justify-center items-center flex-col text-center lg:px-50 max-lg:px-10 py-20 space-y-6 overflow-hidden">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{once: true, amount: 0.2}}
        variants={{
          hidden: {},
          visible: {
            transition: {staggerChildren: 0.1, delayChildren: 0.1},
          },
        }}
        className="flex flex-col items-center space-y-10"
      >
        <motion.div variants={fadeUpVariants}>
          <Image src={image}
      crop="none"
      alt={image.altText}
      width={100}
      height="auto" />
        </motion.div>
        <motion.p variants={fadeUpVariants}>
          <RichText data={text} className="text-2xl" />
        </motion.p>
        <motion.div variants={fadeUpVariants}>
          <Image src={image2} alt="About Image 2" width={300} height={300} className="rounded-full" />
        </motion.div>
        <motion.div variants={fadeUpVariants}>
          <Button variant="artistic" size="lg" >
            <Link to="/אודות"> עוד על FUFINKA</Link>
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}