'use client';

import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Reveal } from '@/components/animations/Reveal';

type Step = { title: string; text: string };

/** „როგორ ვმუშაობთ“ — desktop-ზე pinned ჰორიზონტალური სქროლი, მობილურზე ვერტიკალური სია */
export function Process({ eyebrow, title, steps }: { eyebrow: string; title: string; steps: Step[] }) {
  const [horizontal, setHorizontal] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const update = () => setHorizontal(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  if (!horizontal || reduce) {
    return (
      <section className="bg-ink py-24 text-cream md:py-32">
        <div className="container">
          <Reveal>
            <p className="eyebrow mb-5 text-cream/60">{eyebrow}</p>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="text-h2 max-w-2xl">{title}</h2>
          </Reveal>
          <ol className="relative mt-14 space-y-10 border-l border-dashed border-gold/50 pl-8">
            {steps.map((s, i) => (
              <Reveal as="li" key={s.title} className="relative">
                <span className="absolute -left-[2.6rem] top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gold text-[0.6rem] text-ink">
                  {i + 1}
                </span>
                <h3 className="font-serif text-2xl">{s.title}</h3>
                <p className="mt-2 text-cream/70">{s.text}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>
    );
  }
  return <HorizontalProcess eyebrow={eyebrow} title={title} steps={steps} />;
}

function HorizontalProcess({ eyebrow, title, steps }: { eyebrow: string; title: string; steps: Step[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);

  useEffect(() => {
    const measure = () => {
      if (!trackRef.current) return;
      setDistance(Math.max(0, trackRef.current.scrollWidth - window.innerWidth));
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -distance]);
  const line = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section ref={sectionRef} className="relative bg-ink text-cream" style={{ height: `calc(100vh + ${distance}px)` }}>
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <motion.div ref={trackRef} style={{ x }} className="flex items-stretch gap-8 pl-[max(3rem,calc((100vw-1280px)/2+3rem))] pr-[10vw] will-change-transform">
          <div className="flex w-[30vw] min-w-[360px] shrink-0 flex-col justify-center pr-10">
            <p className="eyebrow mb-6 text-cream/60">{eyebrow}</p>
            <h2 className="text-h1">{title}</h2>
          </div>
          {steps.map((s, i) => (
            <article
              key={s.title}
              className="group relative flex w-[26vw] min-w-[320px] shrink-0 flex-col justify-between border border-cream/15 p-10 transition-colors duration-500 hover:border-gold/60"
              style={{ minHeight: '56vh' }}
            >
              <span className="font-serif text-[7rem] leading-none text-gold/25 transition-colors duration-500 group-hover:text-gold/60">
                0{i + 1}
              </span>
              <div>
                <h3 className="font-serif text-3xl">{s.title}</h3>
                <p className="mt-4 text-lg leading-relaxed text-cream/70">{s.text}</p>
              </div>
            </article>
          ))}
        </motion.div>
        <div className="container mt-12">
          <div className="h-px w-full bg-cream/10">
            <motion.div className="h-px origin-left bg-gold" style={{ scaleX: line }} />
          </div>
        </div>
      </div>
    </section>
  );
}
