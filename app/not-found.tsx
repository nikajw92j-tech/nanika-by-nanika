import Link from 'next/link';
import { getDictionary, getLocale } from '@/lib/i18n/server';

export default function NotFound() {
  const dict = getDictionary(getLocale());
  return (
    <main className="grain relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-6 text-center">
      <Link href="/" className="absolute top-8 font-serif text-2xl uppercase tracking-[0.22em]">
        Nanika
      </Link>
      <svg viewBox="0 0 400 160" className="w-[min(90vw,520px)]" aria-hidden>
        <text x="50%" y="125" textAnchor="middle" className="font-serif" fontSize="150" fill="none" stroke="rgb(var(--gold))" strokeWidth="1.2" strokeDasharray="6 5">
          404
        </text>
        {/* გაწყვეტილი ძაფი */}
        <path d="M20 150 C 120 120, 160 170, 200 140" fill="none" stroke="rgb(var(--wine))" strokeWidth="1.5" strokeDasharray="4 4" />
        <path d="M230 150 C 270 130, 320 170, 380 140" fill="none" stroke="rgb(var(--wine))" strokeWidth="1.5" strokeDasharray="4 4" />
      </svg>
      <h1 className="mt-6 max-w-xl text-h2 text-balance">{dict.notFound.title}</h1>
      <p className="mt-4 max-w-md text-taupe">{dict.notFound.text}</p>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link href="/" className="rounded-full bg-ink px-7 py-3 text-sm text-cream transition-colors hover:bg-gold hover:text-ink">
          {dict.common.backHome}
        </Link>
        <Link href="/gallery" className="rounded-full border border-ink px-7 py-3 text-sm transition-colors hover:bg-ink hover:text-cream">
          {dict.hero.ctaGallery}
        </Link>
      </div>
    </main>
  );
}
