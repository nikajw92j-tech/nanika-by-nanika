'use client';

import { motion, useScroll } from 'framer-motion';
import { useRef } from 'react';
import { Reveal } from '@/components/animations/Reveal';

export function Timeline({ items }: { items: { year: string; title: string; text: string }[] }) {
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 75%', 'end 50%'] });
  return (
    <ol ref={ref} className="relative ml-3 space-y-14 pl-10 md:ml-[50%] md:pl-14">
      <span aria-hidden className="absolute bottom-0 left-0 top-0 w-px bg-ink/10" />
      <motion.span aria-hidden className="absolute left-0 top-0 h-full w-px origin-top bg-gold" style={{ scaleY: scrollYProgress }} />
      {items.map((t, i) => (
        <Reveal as="li" key={i} className="relative">
          <span className="absolute -left-[2.85rem] top-1.5 h-3 w-3 rounded-full border-2 border-gold bg-cream md:-left-[3.85rem]" />
          <p className="font-serif text-sm uppercase tracking-[0.2em] text-gold">{t.year}</p>
          <h3 className="mt-2 font-serif text-3xl">{t.title}</h3>
          <p className="mt-2 max-w-md text-taupe">{t.text}</p>
        </Reveal>
      ))}
    </ol>
  );
}
