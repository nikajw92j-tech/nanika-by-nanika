'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import type { Locale, Localized } from '@/lib/types';
import { Check, Close } from '@/components/ui/icons';

/* ─── Toast ─── */
type Toast = { id: number; text: string; kind: 'ok' | 'error' };
const ToastCtx = createContext<(text: string, kind?: Toast['kind']) => void>(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((text: string, kind: Toast['kind'] = 'ok') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, text, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), kind === 'error' ? 7000 : 3500);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed inset-x-4 bottom-4 z-[100] flex flex-col items-center gap-2 sm:left-auto sm:right-6 sm:items-end" aria-live="polite">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8 }}
              className={cn(
                'pointer-events-auto flex max-w-md items-start gap-2 rounded-xl px-4 py-3 text-sm shadow-xl',
                t.kind === 'ok' ? 'bg-ink text-cream dark:bg-cream dark:text-ink' : 'bg-wine text-cream',
              )}
              role={t.kind === 'error' ? 'alert' : 'status'}
            >
              {t.kind === 'ok' ? <Check width={18} height={18} className="shrink-0" /> : <Close width={18} height={18} className="shrink-0" />}
              {t.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}

/* ─── Primitives ─── */
export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between md:mb-8">
      <div>
        <h1 className="font-serif text-3xl md:text-4xl">{title}</h1>
        {subtitle && <p className="a-muted mt-1 text-sm">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Field({ label, hint, children, className }: { label: string; hint?: string; children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="a-label">{label}</label>
      {children}
      {hint && <p className="a-muted mt-1 text-xs">{hint}</p>}
    </div>
  );
}

export function Toggle({ checked, onChange, label, hint }: { checked: boolean; onChange: (v: boolean) => void; label: string; hint?: string }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 py-1">
      <span>
        <span className="block text-sm font-medium">{label}</span>
        {hint && <span className="a-muted block text-xs">{hint}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn('relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors', checked ? 'bg-gold' : 'bg-ink/15 dark:bg-cream/20')}
      >
        <motion.span layout className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow', checked ? 'right-0.5' : 'left-0.5')} transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
      </button>
    </label>
  );
}

const badgeTones = {
  neutral: 'bg-ink/[0.06] text-ink/80 dark:bg-cream/10 dark:text-cream/80',
  gold: 'bg-gold/15 text-[#7a5d36] dark:text-gold',
  green: 'bg-emerald-600/10 text-emerald-800 dark:text-emerald-300',
  blue: 'bg-sky-600/10 text-sky-800 dark:text-sky-300',
  red: 'bg-wine/10 text-wine dark:text-[#F08A92]',
};
export function Badge({ tone = 'neutral', children }: { tone?: keyof typeof badgeTones; children: ReactNode }) {
  return <span className={cn('inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium', badgeTones[tone])}>{children}</span>;
}

/** ტექსტის ველი სამ ენაზე (ჩანართებით) */
export function LocalizedField({
  label,
  value,
  onChange,
  multiline = false,
  rows = 3,
  required = false,
}: {
  label: string;
  value: Localized | undefined;
  onChange: (v: Localized) => void;
  multiline?: boolean;
  rows?: number;
  required?: boolean;
}) {
  const [lang, setLang] = useState<Locale>('ka');
  const v = value ?? {};
  const langs: Locale[] = ['ka', 'en', 'ru'];
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="a-label mb-0">
          {label}
          {required && ' *'}
        </span>
        <div className="flex gap-0.5 rounded-lg bg-ink/[0.05] p-0.5 dark:bg-cream/10">
          {langs.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLang(l)}
              className={cn('rounded-md px-2 py-0.5 text-[0.7rem] font-medium uppercase', lang === l ? 'bg-white shadow-sm dark:bg-[#141210]' : 'a-muted')}
            >
              {l}
              {!v[l]?.trim() && l !== 'ka' && <span className="ml-0.5 text-gold">•</span>}
            </button>
          ))}
        </div>
      </div>
      {multiline ? (
        <textarea className="a-input" rows={rows} value={v[lang] ?? ''} lang={lang} onChange={(e) => onChange({ ...v, [lang]: e.target.value })} />
      ) : (
        <input className="a-input" value={v[lang] ?? ''} lang={lang} onChange={(e) => onChange({ ...v, [lang]: e.target.value })} />
      )}
    </div>
  );
}

export function EmptyState({ title, text, action }: { title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="a-card flex flex-col items-center gap-3 py-14 text-center">
      <p className="font-serif text-2xl">{title}</p>
      {text && <p className="a-muted max-w-sm text-sm">{text}</p>}
      {action}
    </div>
  );
}

/** confirm() ფანჯრის ნაცვლად — ორსაფეხურიანი ღილაკი */
export function ConfirmButton({ onConfirm, children, confirmText = 'დარწმუნებული ხარ?', className }: { onConfirm: () => void; children: ReactNode; confirmText?: string; className?: string }) {
  const [armed, setArmed] = useState(false);
  return (
    <button
      type="button"
      className={cn('a-btn-danger', className)}
      onClick={() => (armed ? (setArmed(false), onConfirm()) : setArmed(true))}
      onBlur={() => setArmed(false)}
    >
      {armed ? confirmText : children}
    </button>
  );
}
