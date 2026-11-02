'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { navItems, telHref } from '@/config/site';
import { useI18n } from '@/lib/i18n/client';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/ui/Logo';
import { ButtonLink } from '@/components/ui/Button';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { Close } from '@/components/ui/icons';

type Props = { phone: string; email: string; social: { facebook: string; instagram: string } };

export function Header({ phone, email, social }: Props) {
  const { dict } = useI18n();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (open) window.__lenis?.stop();
    else window.__lenis?.start();
    document.body.style.overflow = open ? 'hidden' : '';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  return (
    <>
      <a
        href="#main"
        className="sr-only z-[80] rounded bg-ink px-4 py-2 text-cream focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        {dict.nav.skip}
      </a>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-silk',
          scrolled
            ? 'border-b border-ink/5 bg-cream/75 py-3 backdrop-blur-xl'
            : 'bg-transparent py-5 md:py-7',
        )}
      >
        <div className="container flex items-center justify-between gap-6">
          <Logo className={cn('origin-left transition-transform duration-500', scrolled && 'scale-90')} />

          <nav aria-label="Main" className="hidden xl:block">
            <ul className="flex items-center gap-7">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? 'page' : undefined}
                    className={cn(
                      'link-underline py-1 text-sm transition-colors',
                      isActive(item.href) ? 'text-ink [background-size:100%_1px]' : 'text-ink/70 hover:text-ink',
                    )}
                  >
                    {dict.nav[item.key]}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-4">
            <LanguageSwitcher className="hidden sm:flex" />
            <ButtonLink href="/order" className="hidden min-h-[2.75rem] px-6 md:inline-flex">
              {dict.nav.order}
            </ButtonLink>
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              className="group flex h-11 w-11 flex-col items-center justify-center gap-1.5 xl:hidden"
            >
              <span className="sr-only">{dict.nav.menu}</span>
              <span className="h-px w-7 bg-ink transition-transform group-hover:translate-x-1" />
              <span className="h-px w-7 bg-ink" />
              <span className="h-px w-5 self-end bg-ink transition-all group-hover:w-7" />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label={dict.nav.menu}
            className="fixed inset-0 z-[70] flex flex-col bg-ink text-cream"
            initial={{ clipPath: 'circle(0% at calc(100% - 2.5rem) 2.5rem)' }}
            animate={{ clipPath: 'circle(150% at calc(100% - 2.5rem) 2.5rem)' }}
            exit={{ clipPath: 'circle(0% at calc(100% - 2.5rem) 2.5rem)' }}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          >
            <div className="container flex items-center justify-between py-5">
              <span className="font-serif text-2xl uppercase tracking-[0.22em]">Nanika</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-cream/20"
                autoFocus
              >
                <Close />
                <span className="sr-only">{dict.nav.close}</span>
              </button>
            </div>
            <nav aria-label="Mobile" className="container flex flex-1 flex-col justify-center">
              <ul className="space-y-2">
                {navItems.map((item, i) => (
                  <li key={item.href} className="overflow-hidden">
                    <motion.div
                      initial={{ y: '100%' }}
                      animate={{ y: 0 }}
                      transition={{ delay: 0.25 + i * 0.06, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <Link
                        href={item.href}
                        className={cn(
                          'flex items-baseline gap-4 py-1 font-serif text-4xl transition-colors sm:text-5xl',
                          isActive(item.href) ? 'text-gold' : 'hover:text-rose',
                        )}
                      >
                        <span className="font-sans text-xs text-cream/60">0{i + 1}</span>
                        {dict.nav[item.key]}
                      </Link>
                    </motion.div>
                  </li>
                ))}
              </ul>
            </nav>
            <motion.div
              className="container flex flex-wrap items-end justify-between gap-6 pb-8 text-sm text-cream/80"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <div className="space-y-1">
                <a href={telHref(phone)} className="block hover:text-gold">{phone}</a>
                <a href={`mailto:${email}`} className="block hover:text-gold">{email}</a>
                <div className="flex gap-4 pt-2">
                  <a href={social.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-gold">Facebook</a>
                  <a href={social.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-gold">Instagram</a>
                </div>
              </div>
              <LanguageSwitcher className="[&_button]:text-cream/60 [&_button[aria-pressed=true]]:text-cream [&_span.bg-ink\/20]:bg-cream/30" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
