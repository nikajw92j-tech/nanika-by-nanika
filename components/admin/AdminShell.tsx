'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { signOut } from '@/app/admin/actions/auth';
import { cn } from '@/lib/utils';
import { Close, Moon, Sun } from '@/components/ui/icons';
import { ToastProvider } from './ui';

const nav = [
  { href: '/admin', label: 'მიმოხილვა', icon: 'M4 13h6V4H4zm10 7h6V11h-6zM4 20h6v-4H4zm10-11h6V4h-6z' },
  { href: '/admin/products', label: 'პროდუქტები', icon: 'M6 7h12l-1 13H7zM9 7a3 3 0 016 0' },
  { href: '/admin/orders', label: 'შეკვეთები', icon: 'M5 4h14v16l-3-2-2 2-2-2-2 2-2-2-3 2zM9 9h6M9 13h6', badge: true },
  { href: '/admin/gallery', label: 'გალერეა', icon: 'M4 5h16v14H4zM4 15l4-4 4 4 3-3 5 5M15 9.5a1.5 1.5 0 100-.01' },
  { href: '/admin/promotions', label: 'აქციები', icon: 'M20 12l-8 8-8-8V4h8zM8.5 8.5h.01' },
  { href: '/admin/content', label: 'კონტენტი', icon: 'M5 4h14v16H5zM8 8h8M8 12h8M8 16h5' },
  { href: '/admin/settings', label: 'პარამეტრები', icon: 'M12 15a3 3 0 100-6 3 3 0 000 6zM19 12a7 7 0 00-.1-1.2l2-1.6-2-3.4-2.4 1a7 7 0 00-2-1.2L14 3h-4l-.5 2.6a7 7 0 00-2 1.2l-2.4-1-2 3.4 2 1.6A7 7 0 005 12c0 .4 0 .8.1 1.2l-2 1.6 2 3.4 2.4-1a7 7 0 002 1.2L10 21h4l.5-2.6a7 7 0 002-1.2l2.4 1 2-3.4-2-1.6c.1-.4.1-.8.1-1.2z' },
];

export function AdminShell({ children, email, newOrders }: { children: ReactNode; email: string; newOrders: number }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.getElementById('admin-root')?.classList.contains('dark') ?? false);
  }, []);
  useEffect(() => setOpen(false), [pathname]);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.getElementById('admin-root')?.classList.toggle('dark', next);
    try {
      localStorage.setItem('nanika-admin-theme', next ? 'dark' : 'light');
    } catch {}
  };

  const isActive = (href: string) => (href === '/admin' ? pathname === '/admin' : pathname.startsWith(href));

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-5 py-6">
        <Link href="/admin" className="leading-none">
          <span className="block font-serif text-2xl uppercase tracking-[0.2em]">Nanika</span>
          <span className="a-muted text-[0.6rem] uppercase tracking-[0.3em]">Admin</span>
        </Link>
        <button type="button" onClick={() => setOpen(false)} className="a-btn-ghost h-9 w-9 p-0 lg:hidden" aria-label="დახურვა">
          <Close width={18} height={18} />
        </button>
      </div>
      <nav className="flex-1 space-y-0.5 px-3" aria-label="ადმინ მენიუ">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive(item.href) ? 'page' : undefined}
            className={cn(
              'relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors',
              isActive(item.href) ? 'text-ink dark:text-cream' : 'a-muted hover:bg-ink/[0.04] dark:hover:bg-cream/5',
            )}
          >
            {isActive(item.href) && (
              <motion.span layoutId="admin-nav" className="absolute inset-0 -z-10 rounded-xl bg-white shadow-sm dark:bg-cream/10" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />
            )}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d={item.icon} />
            </svg>
            {item.label}
            {item.badge && newOrders > 0 && (
              <span className="ml-auto rounded-full bg-gold px-2 py-0.5 text-[0.65rem] font-semibold text-ink">{newOrders}</span>
            )}
          </Link>
        ))}
      </nav>
      <div className="space-y-2 border-t border-ink/[0.07] p-4 dark:border-cream/10">
        <p className="a-muted truncate px-1 text-xs" title={email}>{email}</p>
        <div className="flex gap-2">
          <button type="button" onClick={toggleTheme} className="a-btn-ghost h-10 w-10 p-0" aria-label={dark ? 'ღია თემა' : 'მუქი თემა'}>
            {dark ? <Sun width={18} height={18} /> : <Moon width={18} height={18} />}
          </button>
          <Link href="/" target="_blank" className="a-btn-ghost flex-1 text-xs">საიტი ↗</Link>
          <form action={signOut} className="flex-1">
            <button type="submit" className="a-btn-ghost w-full text-xs">გასვლა</button>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <ToastProvider>
      <div className="lg:grid lg:grid-cols-[250px_1fr]">
        <aside className="sticky top-0 hidden h-screen border-r border-ink/[0.07] dark:border-cream/10 lg:block">{sidebar}</aside>

        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-ink/[0.07] bg-[#F4EFE9]/85 px-4 py-3 backdrop-blur dark:border-cream/10 dark:bg-[#12100E]/85 lg:hidden">
          <Link href="/admin" className="font-serif text-xl uppercase tracking-[0.2em]">Nanika</Link>
          <button type="button" onClick={() => setOpen(true)} className="a-btn-ghost relative" aria-expanded={open}>
            მენიუ
            {newOrders > 0 && <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-gold" />}
          </button>
        </header>
        <AnimatePresence>
          {open && (
            <>
              <motion.div className="fixed inset-0 z-40 bg-ink/40 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
              <motion.aside
                className="fixed inset-y-0 left-0 z-50 w-[82vw] max-w-[300px] bg-[#F4EFE9] shadow-2xl dark:bg-[#12100E] lg:hidden"
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', stiffness: 380, damping: 38 }}
              >
                {sidebar}
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        <main className="min-w-0 px-4 py-6 md:px-8 md:py-10">
          <motion.div key={pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} className="mx-auto max-w-6xl">
            {children}
          </motion.div>
        </main>
      </div>
    </ToastProvider>
  );
}
