'use client';

import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import { useRef } from 'react';
import { BLUR_DATA_URL } from '@/lib/blur';
import { useI18n } from '@/lib/i18n/client';
import { SplitText } from '@/components/animations/SplitText';
import { useSiteReady } from '@/components/animations/Preloader';
import { ButtonLink } from '@/components/ui/Button';
import { ArrowRight } from '@/components/ui/icons';

export function Hero({
  eyebrow,
  title,
  subtitle,
  image,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  image: string | null;
}) {
  const { dict } = useI18n();
  const ref = useRef<HTMLElement>(null);
  const ready = useSiteReady();
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const imgY = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '18%']);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '-12%']);

  // სათაურს ვყოფთ წინადადებებად — თითო ხაზზე
  const lines = (title.match(/[^.!?]+[.!?]*/g) ?? [title]).map((s) => s.trim()).filter(Boolean);
  const fade = (delay: number) => ({
    initial: { opacity: 0, y: reduce ? 0 : 18 },
    animate: ready ? { opacity: 1, y: 0 } : undefined,
    transition: { duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] as const },
  });

  return (
    <section
      ref={ref}
      className="relative overflow-hidden pt-[calc(var(--header-h)+2rem)] md:min-h-[100svh] md:pt-[calc(var(--header-h)+3rem)]"
    >
      <div className="container grid items-center gap-10 pb-16 md:grid-cols-12 md:gap-8 md:pb-24">
        <motion.div style={{ y: textY }} className="relative z-10 md:col-span-7">
          <motion.p className="eyebrow mb-7" {...fade(0.1)}>
            {eyebrow}
          </motion.p>
          <h1 className="text-display font-serif">
            {lines.map((line, i) => (
              <span key={i} className={i === 1 ? 'block italic text-gold md:pl-[8%]' : 'block'}>
                <SplitText text={line} delay={0.15 + i * 0.22} />
              </span>
            ))}
          </h1>
          <motion.p
            className="mt-8 max-w-lg text-base leading-relaxed text-taupe md:text-lg"
            {...fade(0.75)}
          >
            {subtitle}
          </motion.p>
          <motion.div className="mt-10 flex flex-wrap gap-3" {...fade(0.9)}>
            <ButtonLink href="/order" icon={<ArrowRight width={18} height={18} />}>
              {dict.hero.ctaOrder}
            </ButtonLink>
            <ButtonLink href="/gallery" variant="outline">
              {dict.hero.ctaGallery}
            </ButtonLink>
          </motion.div>
        </motion.div>

        <div className="relative md:col-span-5">
          <motion.div
            className="relative mx-auto aspect-[4/5] w-full max-w-[460px] overflow-hidden rounded-t-full"
            initial={reduce ? { opacity: 0 } : { clipPath: 'inset(100% 0% 0% 0%)' }}
            animate={ready ? (reduce ? { opacity: 1 } : { clipPath: 'inset(0% 0% 0% 0%)' }) : undefined}
            transition={{ duration: 1.4, delay: 0.2, ease: [0.76, 0, 0.24, 1] }}
          >
            <motion.div style={{ y: imgY }} className="absolute -inset-y-[10%] inset-x-0">
              {image ? (
                <Image
                  src={image}
                  alt="Nanika — ატელიეში შეკერილი წითელი კოსტიუმი"
                  fill
                  priority
                  sizes="(min-width: 768px) 460px, 100vw"
                  placeholder="blur"
                  blurDataURL={BLUR_DATA_URL}
                  className="animate-[kenburns_22s_ease-in-out_infinite_alternate] object-cover motion-reduce:animate-none"
                />
              ) : (
                <div className="placeholder-tile h-full w-full">{/* TODO: hero ფოტო */}</div>
              )}
            </motion.div>
            {/* დაბალი რეზოლუციის ფოტოსთვის: ტონი + ფაქტურა */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/45 via-ink/5 to-rose/10" />
            <div className="pointer-events-none absolute inset-0 opacity-30 mix-blend-overlay [background-image:radial-gradient(rgb(var(--cream))_0.6px,transparent_0.6px)] [background-size:3px_3px]" />
          </motion.div>

          {/* ბირკის მოტივი */}
          <motion.div
            className="absolute -left-2 bottom-8 rotate-[-6deg] bg-ink px-5 py-3 text-cream shadow-2xl md:-left-10"
            {...fade(1.2)}
          >
            <p className="font-serif text-lg uppercase tracking-[0.28em]">Nanika</p>
            <p className="text-[0.5rem] uppercase tracking-[0.3em] text-cream/70">Made in Georgia</p>
          </motion.div>

          {/* სანტიმეტრის ლენტა */}
          <svg
            aria-hidden
            viewBox="0 0 24 400"
            className="absolute -right-1 top-6 hidden h-[70%] w-6 text-gold md:block"
          >
            <rect x="0" y="0" width="24" height="400" fill="rgb(var(--beige))" />
            {Array.from({ length: 40 }).map((_, i) => (
              <line
                key={i}
                x1="0"
                x2={i % 5 === 0 ? 14 : 7}
                y1={i * 10 + 5}
                y2={i * 10 + 5}
                stroke="currentColor"
                strokeWidth="1"
              />
            ))}
          </svg>
        </div>
      </div>

      <motion.div
        aria-hidden
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-[0.6rem] uppercase tracking-widest2 text-taupe md:flex"
        {...fade(1.4)}
      >
        {dict.common.scroll}
        <span className="h-10 w-px origin-top animate-[scrollcue_2s_ease-in-out_infinite] bg-ink/40" />
      </motion.div>
      <style>{`
        @keyframes kenburns{from{transform:scale(1)}to{transform:scale(1.14) translate(-2%,-1%)}}
        @keyframes scrollcue{0%{transform:scaleY(0)}50%{transform:scaleY(1)}100%{transform:scaleY(0);transform-origin:bottom}}
      `}</style>
    </section>
  );
}
