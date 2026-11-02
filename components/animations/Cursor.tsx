'use client';

import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useEffect, useState } from 'react';

/**
 * Custom cursor (მხოლოდ desktop / მაუსი). ელემენტზე data-cursor="ტექსტი" ატრიბუტით
 * წრე დიდდება და აჩვენებს ტექსტს (მაგ. „ნახვა“).
 */
export function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const [label, setLabel] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 500, damping: 40, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 500, damping: 40, mass: 0.5 });

  useEffect(() => {
    const mq = window.matchMedia('(pointer: fine) and (prefers-reduced-motion: no-preference)');
    const update = () => setEnabled(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);
      const target = (e.target as HTMLElement | null)?.closest<HTMLElement>('[data-cursor]');
      setLabel(target?.dataset.cursor ?? null);
    };
    const leave = () => setVisible(false);
    window.addEventListener('pointermove', move, { passive: true });
    document.documentElement.addEventListener('pointerleave', leave);
    return () => {
      window.removeEventListener('pointermove', move);
      document.documentElement.removeEventListener('pointerleave', leave);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[90] flex items-center justify-center rounded-full mix-blend-normal"
      style={{ x: sx, y: sy, translateX: '-50%', translateY: '-50%' }}
      animate={{
        width: label ? 88 : 10,
        height: label ? 88 : 10,
        opacity: visible ? 1 : 0,
        backgroundColor: label ? 'rgba(30,26,23,0.9)' : 'rgba(184,149,106,1)',
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 26 }}
    >
      <motion.span
        className="text-[0.7rem] font-medium uppercase tracking-[0.2em] text-cream"
        animate={{ opacity: label ? 1 : 0, scale: label ? 1 : 0.6 }}
      >
        {label}
      </motion.span>
    </motion.div>
  );
}
