'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { setLocale } from '@/app/actions/locale';
import { localeLabels, locales } from '@/lib/i18n/config';
import { useI18n } from '@/lib/i18n/client';
import { cn } from '@/lib/utils';

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale } = useI18n();
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <div
      role="group"
      aria-label="Language"
      className={cn('flex items-center gap-1 text-xs font-medium tracking-wider', pending && 'opacity-60', className)}
    >
      {locales.map((l, i) => (
        <span key={l} className="flex items-center">
          {i > 0 && <span className="mx-1 h-3 w-px bg-ink/20" aria-hidden />}
          <button
            type="button"
            lang={l}
            aria-pressed={l === locale}
            onClick={() =>
              start(async () => {
                await setLocale(l);
                router.refresh();
              })
            }
            className={cn(
              'rounded px-1.5 py-1 transition-colors',
              l === locale ? 'text-ink' : 'text-taupe hover:text-ink',
            )}
          >
            {localeLabels[l]}
          </button>
        </span>
      ))}
    </div>
  );
}
