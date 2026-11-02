'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { cn } from '@/lib/utils';

type Point = { id: string; name: string; text: string };

/** SVG სილუეტის ზომის ხაზები და მარკერები — id ემთხვევა locales/*.json → howTo.points */
const shapes: Record<string, { line: JSX.Element; dot: [number, number] }> = {
  shoulders: { line: <line x1="92" y1="100" x2="208" y2="100" />, dot: [208, 100] },
  bust: { line: <ellipse cx="150" cy="138" rx="52" ry="9" />, dot: [202, 138] },
  waist: { line: <ellipse cx="150" cy="178" rx="39" ry="7" />, dot: [189, 178] },
  hips: { line: <ellipse cx="150" cy="240" rx="58" ry="10" />, dot: [208, 240] },
  sleeve: { line: <line x1="212" y1="104" x2="230" y2="204" />, dot: [230, 204] },
  length: { line: <line x1="262" y1="92" x2="262" y2="360" />, dot: [262, 360] },
  height: { line: <line x1="36" y1="18" x2="36" y2="492" />, dot: [36, 18] },
};

export function MeasureGuide({ points, tip }: { points: Point[]; tip: string }) {
  const [active, setActive] = useState(points[0]?.id ?? 'bust');
  const current = points.find((p) => p.id === active);

  return (
    <div className="grid items-center gap-10 md:grid-cols-2">
      <div className="relative mx-auto w-full max-w-sm">
        <svg viewBox="0 0 300 510" className="w-full" role="img" aria-label="ზომების სილუეტი">
          {/* სილუეტი */}
          <g fill="rgb(var(--beige))" stroke="rgb(var(--taupe))" strokeWidth="1">
            <circle cx="150" cy="44" r="24" />
            <path d="M139 68 L161 68 L164 86 C 186 89 204 92 210 104 L 230 204 L 219 207 L 200 122 C 198 142 192 160 189 178 C 196 196 205 216 208 240 L 222 360 L 78 360 L 92 240 C 95 216 104 196 111 178 C 108 160 102 142 100 122 L 81 207 L 70 204 L 90 104 C 96 92 114 89 136 86 Z" />
            <path d="M118 360 L 120 492 L 132 492 L 140 360 M160 360 L 168 492 L 180 492 L 182 360" />
          </g>
          {/* ზომის ხაზები */}
          {points.map((p) => {
            const s = shapes[p.id];
            if (!s) return null;
            const isActive = p.id === active;
            return (
              <g
                key={p.id}
                role="button"
                tabIndex={0}
                aria-label={p.name}
                aria-pressed={isActive}
                className="cursor-pointer outline-none [&:focus-visible_circle]:stroke-ink"
                onMouseEnter={() => setActive(p.id)}
                onFocus={() => setActive(p.id)}
                onClick={() => setActive(p.id)}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setActive(p.id)}
              >
                <g
                  fill="none"
                  stroke={isActive ? 'rgb(var(--wine))' : 'rgb(var(--gold))'}
                  strokeWidth={isActive ? 2.2 : 1.2}
                  strokeDasharray="5 4"
                  className="transition-all duration-300"
                  opacity={isActive ? 1 : 0.55}
                >
                  {s.line}
                </g>
                <circle cx={s.dot[0]} cy={s.dot[1]} r="14" fill="transparent" />
                <circle
                  cx={s.dot[0]}
                  cy={s.dot[1]}
                  r={isActive ? 7 : 5}
                  fill={isActive ? 'rgb(var(--wine))' : 'rgb(var(--gold))'}
                  stroke="rgb(var(--cream))"
                  strokeWidth="2"
                  className="transition-all duration-300"
                />
                {isActive && (
                  <circle cx={s.dot[0]} cy={s.dot[1]} r="7" fill="none" stroke="rgb(var(--wine))" className="origin-center animate-ping [transform-box:fill-box] motion-reduce:hidden" />
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <div>
        <ul className="flex flex-wrap gap-2">
          {points.map((p, i) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => setActive(p.id)}
                aria-pressed={p.id === active}
                className={cn('rounded-full border px-4 py-2 text-sm transition-colors', p.id === active ? 'border-ink bg-ink text-cream' : 'border-ink/15 hover:border-ink')}
              >
                {i + 1}. {p.name}
              </button>
            </li>
          ))}
        </ul>
        <div className="relative mt-8 min-h-[150px]" aria-live="polite">
          <AnimatePresence mode="wait">
            {current && (
              <motion.div key={current.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.35 }}>
                <h3 className="font-serif text-3xl">{current.name}</h3>
                <p className="mt-3 text-lg leading-relaxed text-taupe">{current.text}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <p className="mt-6 border-l-2 border-gold pl-4 text-sm text-taupe">{tip}</p>
      </div>
    </div>
  );
}
