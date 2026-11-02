'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ChevronLeft, ChevronRight, Facebook, Star } from '@/components/ui/icons';

type Review = { name: string; text: string; source: string };

/**
 * ⚠️ მხოლოდ რეალური შეფასებები! ემატება ადმინ-პანელიდან (/admin/content → შეფასებები).
 * სანამ არ დაემატება, ჩანს აშკარად მონიშნული placeholder.
 */
export function Reviews({
  eyebrow,
  title,
  placeholder,
  items,
  facebook,
}: {
  eyebrow: string;
  title: string;
  placeholder: string;
  items: Review[];
  facebook: string;
}) {
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const go = (d: number) => {
    setDir(d);
    setI((v) => (v + d + items.length) % items.length);
  };
  const r = items[i];

  return (
    <section className="bg-ink py-24 text-cream md:py-36">
      <div className="container">
        <SectionHeading eyebrow={eyebrow} title={title} align="center" className="[&_.eyebrow]:text-cream/60" />
        {items.length === 0 ? (
          <div className="mx-auto mt-14 max-w-2xl border border-dashed border-gold/50 p-10 text-center text-cream/70">
            {/* TODO: რეალური შეფასებები Facebook-იდან */}
            <p>{placeholder}</p>
            <a href={facebook} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 text-gold hover:underline">
              <Facebook width={18} height={18} /> Facebook
            </a>
          </div>
        ) : (
          <div className="mx-auto mt-14 max-w-3xl text-center">
            <div className="mb-8 flex justify-center gap-1 text-gold" aria-hidden>
              {Array.from({ length: 5 }).map((_, k) => (
                <Star key={k} width={16} height={16} />
              ))}
            </div>
            <div className="relative min-h-[220px] overflow-hidden" aria-live="polite">
              <AnimatePresence mode="wait" custom={dir}>
                <motion.figure
                  key={i}
                  custom={dir}
                  initial={{ opacity: 0, x: dir * 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: dir * -40 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  onDragEnd={(_, info) => {
                    if (info.offset.x < -60) go(1);
                    else if (info.offset.x > 60) go(-1);
                  }}
                >
                  <blockquote className="font-serif text-2xl italic leading-snug md:text-4xl">“{r.text}”</blockquote>
                  <figcaption className="mt-8 text-sm uppercase tracking-[0.2em] text-cream/60">
                    {r.name}
                    {r.source && <span className="text-gold"> · {r.source}</span>}
                  </figcaption>
                </motion.figure>
              </AnimatePresence>
            </div>
            {items.length > 1 && (
              <div className="mt-10 flex justify-center gap-3">
                <button type="button" onClick={() => go(-1)} aria-label="Previous" className="flex h-12 w-12 items-center justify-center rounded-full border border-cream/20 hover:border-gold hover:text-gold">
                  <ChevronLeft />
                </button>
                <button type="button" onClick={() => go(1)} aria-label="Next" className="flex h-12 w-12 items-center justify-center rounded-full border border-cream/20 hover:border-gold hover:text-gold">
                  <ChevronRight />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
