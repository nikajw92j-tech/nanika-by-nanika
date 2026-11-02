import Link from 'next/link';
import { cn } from '@/lib/utils';

/** ტექსტური ლოგო ბირკის სტილში: NANIKA + MADE IN GEORGIA */
export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <Link
      href="/"
      aria-label="Nanika by Nanika — მთავარი"
      className={cn('group inline-flex flex-col items-start leading-none', className)}
    >
      <span className="font-serif text-[1.65rem] font-medium uppercase tracking-[0.22em] transition-colors duration-500 group-hover:text-gold">
        Nanika
      </span>
      {!compact && (
        <span className="mt-1 text-[0.55rem] font-medium uppercase tracking-[0.42em] text-taupe">
          by Nanika
        </span>
      )}
    </Link>
  );
}
