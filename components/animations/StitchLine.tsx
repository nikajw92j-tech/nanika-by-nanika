'use client';

import { motion, useReducedMotion, useScroll, useSpring } from 'framer-motion';
import { useId, useRef } from 'react';
import { cn } from '@/lib/utils';

/**
 * ნაკერის ხაზი: dashed SVG ხაზი, რომელიც სქროლის პარალელურად „იკერება“.
 * (dash-ის შესანარჩუნებლად ანიმირდება mask, არა თავად ხაზი)
 */
export function StitchLine({ className, flip = false }: { className?: string; flip?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const id = useId().replace(/:/g, '');
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 90%', 'end 40%'] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  const d = flip
    ? 'M1180 4 C 900 4, 860 116, 600 116 S 260 4, 20 60'
    : 'M20 4 C 300 4, 340 116, 600 116 S 940 4, 1180 60';

  return (
    <div ref={ref} aria-hidden className={cn('container pointer-events-none', className)}>
      <svg viewBox="0 0 1200 120" className="h-16 w-full md:h-24" preserveAspectRatio="none" fill="none">
        <defs>
          <mask id={`m-${id}`}>
            <motion.path
              d={d}
              stroke="white"
              strokeWidth="6"
              style={{ pathLength: reduce ? 1 : progress }}
            />
          </mask>
        </defs>
        <path
          d={d}
          stroke="rgb(var(--gold))"
          strokeWidth="1.5"
          strokeDasharray="8 8"
          mask={`url(#m-${id})`}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}
