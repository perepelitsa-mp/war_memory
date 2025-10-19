import { motion, useReducedMotion } from 'framer-motion';
import { type PropsWithChildren } from 'react';

type RevealProps = PropsWithChildren<{
  delay?: number;
  offset?: number;
  duration?: number;
  className?: string;
}>;

export function Reveal({
  children,
  delay = 0,
  offset = 24,
  duration = 0.6,
  className,
}: RevealProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: offset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ delay, duration, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
