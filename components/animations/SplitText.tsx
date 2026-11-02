'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useSiteReady } from './Preloader';

/** სიტყვა-სიტყვა ამოსვლა ქვემოდან, mask-ით */
export function SplitText({
  text,
  className,
  delay = 0,
  stagger = 0.07,
}: {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
}) {
  const ready = useSiteReady();
  const reduce = useReducedMotion();
  const words = text.split(' ');
  return (
    <span className={className} aria-label={text} role="text">
      {words.map((word, i) => (
        <span key={i} aria-hidden className="inline-block overflow-hidden pb-[0.12em] align-top">
          <motion.span
            className="inline-block will-change-transform"
            initial={reduce ? { opacity: 0 } : { y: '110%' }}
            animate={ready ? (reduce ? { opacity: 1 } : { y: '0%' }) : undefined}
            transition={{ duration: 1.05, delay: delay + i * stagger, ease: [0.22, 1, 0.36, 1] }}
          >
            {word}
            {i < words.length - 1 ? ' ' : ''}
          </motion.span>
        </span>
      ))}
    </span>
  );
}
