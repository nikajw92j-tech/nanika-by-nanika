'use client';

import { useState } from 'react';

/**
 * შეკვეთები დღეების მიხედვით (ბოლო 30 დღე) — ერთი სერია, ერთი ფერი (ლეგენდა არ სჭირდება).
 * თითო სვეტზე hover/focus tooltip, ეკრანის წამკითხველისთვის — ცხრილი.
 */
export function OrdersChart({ data }: { data: { date: string; count: number }[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((d) => d.count));
  const ticks = Array.from(new Set([0, Math.ceil(max / 2), max]));
  const W = 600;
  const H = 180;
  const pad = { l: 24, b: 22, t: 8 };
  const bw = (W - pad.l) / data.length;
  const fmt = (d: string) => new Date(d).toLocaleDateString('ka-GE', { day: 'numeric', month: 'short' });

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="შეკვეთები ბოლო 30 დღეში" onMouseLeave={() => setHover(null)}>
        {ticks.map((t) => {
          const y = H - pad.b - (t / max) * (H - pad.b - pad.t);
          return (
            <g key={t}>
              <line x1={pad.l} x2={W} y1={y} y2={y} className="stroke-ink/[0.08] dark:stroke-cream/10" />
              <text x={pad.l - 6} y={y + 3} textAnchor="end" className="fill-ink/50 text-[10px] dark:fill-cream/50">{t}</text>
            </g>
          );
        })}
        {data.map((d, i) => {
          const h = (d.count / max) * (H - pad.b - pad.t);
          const x = pad.l + i * bw + 1;
          const w = Math.max(2, bw - 2);
          return (
            <g key={d.date} onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)} tabIndex={0} className="outline-none">
              <rect x={pad.l + i * bw} y={pad.t} width={bw} height={H - pad.b - pad.t} fill="transparent" />
              {d.count > 0 && (
                <path
                  d={`M${x},${H - pad.b} v${-Math.max(0, h - 4)} q0,-4 4,-4 h${w - 8} q4,0 4,4 v${Math.max(0, h - 4)} z`}
                  className={hover === i ? 'fill-ink dark:fill-cream' : 'fill-[#8C6A3F] dark:fill-gold'}
                />
              )}
              {i % 7 === 0 && (
                <text x={x + w / 2} y={H - 6} textAnchor="middle" className="fill-ink/50 text-[10px] dark:fill-cream/50">{fmt(d.date)}</text>
              )}
            </g>
          );
        })}
        <line x1={pad.l} x2={W} y1={H - pad.b} y2={H - pad.b} className="stroke-ink/20 dark:stroke-cream/20" />
      </svg>
      {hover !== null && (
        <div
          className="pointer-events-none absolute top-0 -translate-x-1/2 rounded-lg bg-ink px-2.5 py-1.5 text-xs text-cream shadow-lg dark:bg-cream dark:text-ink"
          style={{ left: `${((pad.l + (hover + 0.5) * bw) / W) * 100}%` }}
        >
          {fmt(data[hover].date)}: <b>{data[hover].count}</b>
        </div>
      )}
      <table className="sr-only">
        <caption>შეკვეთები დღეების მიხედვით</caption>
        <tbody>
          {data.map((d) => (
            <tr key={d.date}><td>{d.date}</td><td>{d.count}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
