'use client';

import Image from 'next/image';
import { useCallback, useRef, useState } from 'react';
import { BLUR_DATA_URL } from '@/lib/blur';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ChevronLeft, ChevronRight } from '@/components/ui/icons';

type Pair = { before: string; after: string; caption: string };

/** ინსპირაცია → შედეგი: drag slider (მაუსი, touch, კლავიატურა) */
export function BeforeAfter({
  eyebrow,
  title,
  subtitle,
  beforeLabel,
  afterLabel,
  hint,
  pairs,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  beforeLabel: string;
  afterLabel: string;
  hint: string;
  pairs: Pair[];
}) {
  const [pos, setPos] = useState(50);
  const [index, setIndex] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const pair = pairs[index];

  const setFromX = useCallback((clientX: number) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    setPos(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)));
  }, []);

  const side = (src: string | undefined, label: string) =>
    src ? (
      <Image src={src} alt={label} fill sizes="(min-width: 768px) 60vw, 100vw" placeholder="blur" blurDataURL={BLUR_DATA_URL} className="object-cover" draggable={false} />
    ) : (
      // TODO: ინსპირაცია/შედეგის ფოტოები — ადმინ-პანელი → კონტენტი → „ინსპირაცია → შედეგი“
      <div className="placeholder-tile h-full w-full">
        <span className="font-serif text-3xl italic text-gold/60">{label}</span>
      </div>
    );

  return (
    <section className="container py-24 md:py-36">
      <SectionHeading eyebrow={eyebrow} title={title} subtitle={subtitle} align="center" />
      <div className="mx-auto mt-14 max-w-4xl">
        <div
          ref={ref}
          role="slider"
          tabIndex={0}
          aria-label={`${beforeLabel} / ${afterLabel}`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pos)}
          className="relative aspect-[4/3] w-full cursor-ew-resize touch-pan-y select-none overflow-hidden bg-beige md:aspect-[16/10]"
          onPointerDown={(e) => {
            dragging.current = true;
            (e.target as Element).setPointerCapture?.(e.pointerId);
            setFromX(e.clientX);
          }}
          onPointerMove={(e) => dragging.current && setFromX(e.clientX)}
          onPointerUp={() => (dragging.current = false)}
          onPointerCancel={() => (dragging.current = false)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft') setPos((p) => Math.max(0, p - 5));
            if (e.key === 'ArrowRight') setPos((p) => Math.min(100, p + 5));
          }}
        >
          <div className="absolute inset-0">{side(pair?.after, afterLabel)}</div>
          <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
            {side(pair?.before, beforeLabel)}
          </div>
          <span className="absolute left-4 top-4 bg-cream/90 px-3 py-1 text-xs uppercase tracking-[0.2em]">{beforeLabel}</span>
          <span className="absolute right-4 top-4 bg-ink/90 px-3 py-1 text-xs uppercase tracking-[0.2em] text-cream">{afterLabel}</span>
          <div className="pointer-events-none absolute inset-y-0" style={{ left: `${pos}%` }}>
            <div className="absolute inset-y-0 -translate-x-1/2 border-l border-dashed border-cream" />
            <div className="absolute top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-0.5 rounded-full bg-cream text-ink shadow-xl">
              <ChevronLeft width={14} height={14} />
              <ChevronRight width={14} height={14} />
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between text-sm text-taupe">
          <span>{pair?.caption || hint}</span>
          {pairs.length > 1 && (
            <div className="flex gap-2">
              {pairs.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`${i + 1}`}
                  aria-pressed={i === index}
                  className={`h-2 rounded-full transition-all ${i === index ? 'w-8 bg-gold' : 'w-2 bg-ink/20'}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
