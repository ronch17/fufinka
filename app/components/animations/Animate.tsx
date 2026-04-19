import {motion, type Variants} from 'framer-motion';

/**
 * קונפיגורציית מעבר גלובלית
 */
export const transition = {
  duration: 0.5,
  ease: [0.25, 0.46, 0.45, 0.94] as const,
};

/**
 * אנימציית דהייה פשוטה
 */
export const fadeVariants: Variants = {
  initial: {opacity: 0},
  animate: {opacity: 1},
  exit: {opacity: 0},
};

/**
 * אנימציית החלקה מלמעלה (כמו תמונה ב-Hero)
 */
export const slideFromTopVariants: Variants = {
  initial: {y: -80, opacity: 0},
  animate: {y: 0, opacity: 1},
  exit: {y: -40, opacity: 0},
};

/**
 * אנימציית החלקה מלמטה (כמו טקסט ב-Hero)
 */
export const slideFromBottomVariants: Variants = {
  initial: {y: 80, opacity: 0},
  animate: {y: 0, opacity: 1},
  exit: {y: 40, opacity: 0},
};

/**
 * אנימציית החלקה משמאל
 */
export const slideFromLeftVariants: Variants = {
  initial: {x: -80, opacity: 0},
  animate: {x: 0, opacity: 1},
  exit: {x: -40, opacity: 0},
};

/**
 * אנימציית החלקה מימין
 */
export const slideFromRightVariants: Variants = {
  initial: {x: 80, opacity: 0},
  animate: {x: 0, opacity: 1},
  exit: {x: 40, opacity: 0},
};

/**
 * אנימציית scale (הגדלה)
 */
export const scaleVariants: Variants = {
  initial: {scale: 0.9, opacity: 0},
  animate: {scale: 1, opacity: 1},
  exit: {scale: 0.95, opacity: 0},
};

// שמות קצרים לשימוש ב-HeroSlide וקומפוננטות קיימות
export const imageVariants = slideFromTopVariants;
export const textVariants = slideFromBottomVariants;

/**
 * קומפוננטת עטיפה לאנימציות - מאפשרת שימוש מהיר עם variants מוגדרים
 */
interface AnimateProps {
  children: React.ReactNode;
  variant?: keyof typeof variantMap;
  className?: string;
  initial?: string;
  whileInView?: string;
  viewport?: {once: boolean; amount: number};
}

const variantMap = {
  fade: fadeVariants,
  slideFromTop: slideFromTopVariants,
  slideFromBottom: slideFromBottomVariants,
  slideFromLeft: slideFromLeftVariants,
  slideFromRight: slideFromRightVariants,
  scale: scaleVariants,
} as const;

export function Animate({
  initial = 'hidden',   
  whileInView = 'visible',
  viewport = {once: true, amount: 0.2},
  children,
  variant = 'fade',
  className,
}: AnimateProps) {
  const variants = variantMap[variant];

  return (
    <motion.div
      variants={variants}
      initial={initial}
      whileInView={whileInView}
      viewport={viewport}
      animate="animate"
      exit="exit"
      transition={transition}
      className={className}
    >
      {children}
    </motion.div>
  );
}
