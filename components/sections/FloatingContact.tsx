'use client';

import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion';
import { useEffect, useState } from 'react';
import { waHref } from '@/config/site';
import { useI18n } from '@/lib/i18n/client';
import { scrollToY } from '@/components/animations/SmoothScroll';
import { ArrowUp, Close, Messenger, WhatsApp } from '@/components/ui/icons';

/** მცურავი კონტაქტის ღილაკი (WhatsApp / Messenger) + „ზემოთ ასვლა“ სქროლის პროგრესით */
export function FloatingContact({ whatsapp, messenger }: { whatsapp: string; messenger: string }) {
  const { dict } = useI18n();
  const [open, setOpen] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  useEffect(() => scrollYProgress.on('change', (v) => setShowTop(v > 0.12)), [scrollYProgress]);

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3 md:bottom-8 md:right-8">
      <AnimatePresence>
        {showTop && (
          <motion.button
            key="top"
            type="button"
            onClick={() => scrollToY(0)}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            className="relative flex h-12 w-12 items-center justify-center rounded-full bg-cream/90 text-ink shadow-lg backdrop-blur"
            aria-label={dict.common.toTop}
          >
            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 48 48" aria-hidden>
              <circle cx="24" cy="24" r="22" fill="none" stroke="rgb(var(--beige))" strokeWidth="2" />
              <motion.circle
                cx="24"
                cy="24"
                r="22"
                fill="none"
                stroke="rgb(var(--gold))"
                strokeWidth="2"
                style={{ pathLength: progress }}
              />
            </svg>
            <ArrowUp width={18} height={18} />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            className="flex flex-col items-end gap-2"
            initial="hidden"
            animate="show"
            exit="hidden"
            variants={{ show: { transition: { staggerChildren: 0.05 } }, hidden: {} }}
          >
            {[
              { href: waHref(whatsapp), label: 'WhatsApp', Icon: WhatsApp, color: 'bg-[#25D366] text-white' },
              { href: messenger, label: 'Messenger', Icon: Messenger, color: 'bg-[#0084FF] text-white' },
            ].map(({ href, label, Icon, color }) => (
              <motion.a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
                className="flex items-center gap-3 rounded-full bg-cream py-1.5 pl-4 pr-1.5 text-sm shadow-lg"
              >
                {label}
                <span className={`flex h-9 w-9 items-center justify-center rounded-full ${color}`}>
                  <Icon width={18} height={18} />
                </span>
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={dict.common.contactUs}
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-ink text-cream shadow-xl transition-transform hover:scale-105"
      >
        {!open && (
          <span aria-hidden className="absolute inset-0 animate-pulseRing rounded-full bg-gold motion-reduce:hidden" />
        )}
        <span className="relative">{open ? <Close /> : <WhatsApp width={24} height={24} />}</span>
      </button>
    </div>
  );
}
