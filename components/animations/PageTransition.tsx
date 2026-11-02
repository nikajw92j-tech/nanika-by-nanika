'use client';

import { motion, useReducedMotion } from 'framer-motion';

let firstLoad = true;

/** რბილი გადასვლა გვერდებს შორის (პირველ ჩატვირთვაზე არ ირთვება — LCP-ს არ აზიანებს) */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  const skip = firstLoad || reduce;
  firstLoad = false;
  return (
    <motion.div
      initial={skip ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
