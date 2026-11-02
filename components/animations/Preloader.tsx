'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { createContext, useContext, useEffect, useState } from 'react';

const ReadyContext = createContext(true);
/** true — როცა preloader დასრულდა და hero-ს ანიმაციები შეიძლება დაიწყოს */
export const useSiteReady = () => useContext(ReadyContext);

const KEY = 'nanika-preloaded';

/**
 * ეს სკრიპტი სრულდება HTML-ის პარსინგისას, preloader-ის მარკაპამდე —
 * სესიაში მეორედ შემოსვლისას (ან reduced-motion-ზე) preloader საერთოდ არ ჩანს.
 */
export const preloaderScript = `try{if(sessionStorage.getItem('${KEY}')||matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.dataset.preloaded='1'}catch(e){}`;

export function PreloaderProvider({ children }: { children: React.ReactNode }) {
  const [show, setShow] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (document.documentElement.dataset.preloaded) {
      setShow(false);
      setReady(true);
      return;
    }
    const t1 = setTimeout(() => setReady(true), 950);
    const t2 = setTimeout(() => {
      setShow(false);
      try {
        sessionStorage.setItem(KEY, '1');
      } catch {}
    }, 850);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <ReadyContext.Provider value={ready}>
      <AnimatePresence>
        {show && (
          <motion.div
            key="preloader"
            className="preloader fixed inset-0 z-[100] flex items-center justify-center bg-ink text-cream [html[data-preloaded]_&]:hidden"
            exit={{ y: '-100%' }}
            transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
            aria-hidden
          >
            <svg viewBox="0 0 520 120" className="w-[min(78vw,520px)]" role="presentation">
              <text
                x="50%"
                y="72"
                textAnchor="middle"
                className="preloader-text font-serif"
                fontSize="88"
                letterSpacing="18"
              >
                NANIKA
              </text>
              {/* ნაკერის ხაზი */}
              <line
                x1="80"
                y1="104"
                x2="440"
                y2="104"
                className="preloader-stitch"
                stroke="rgb(var(--gold))"
                strokeWidth="1.5"
                strokeDasharray="6 6"
              />
            </svg>
            <style>{`
              .preloader-text{fill:transparent;stroke:rgb(var(--cream));stroke-width:1;stroke-dasharray:420;stroke-dashoffset:420;animation:pl-draw 0.75s cubic-bezier(.65,0,.35,1) forwards, pl-fill .3s .55s ease forwards}
              .preloader-stitch{clip-path:inset(0 100% 0 0);animation:pl-stitch .65s .1s cubic-bezier(.65,0,.35,1) forwards}
              @keyframes pl-draw{to{stroke-dashoffset:0}}
              @keyframes pl-fill{to{fill:rgb(var(--cream))}}
              @keyframes pl-stitch{to{clip-path:inset(0 0 0 0)}}
            `}</style>
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </ReadyContext.Provider>
  );
}
