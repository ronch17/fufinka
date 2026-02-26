import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useAnimationFrame,
} from "framer-motion";
import {useRef} from "react";

interface TiltFloatProps {
  children: React.ReactNode;
}

export function TiltFloat({children}: TiltFloatProps) {
  const ref = useRef<HTMLDivElement>(null);

  // tilt values
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);

  // smoothing
  const smoothX = useSpring(rotateX, {stiffness: 150, damping: 20});
  const smoothY = useSpring(rotateY, {stiffness: 150, damping: 20});

  // floating motion values
  const floatX = useMotionValue(0);
  const floatY = useMotionValue(0);

  // תנועה מעגלית תמידית
  useAnimationFrame((t) => {
    const time = t / 1000;
    floatX.set(Math.sin(time) * 8);
    floatY.set(Math.cos(time) * 8);
  });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const percentX = (x / rect.width - 0.5) * 2;
    const percentY = (y / rect.height - 0.5) * 2;

    rotateX.set(percentY * -15);
    rotateY.set(percentX * 15);
  }

  function handleMouseLeave() {
    rotateX.set(0);
    rotateY.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: smoothX,
        rotateY: smoothY,
        x: floatX,
        y: floatY,
      }}
      className="transform-gpu will-change-transform"
    >
      {children}
    </motion.div>
  );
}