import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Magnetic } from '@/components/animations/Magnetic';

type Variant = 'primary' | 'outline' | 'ghost' | 'light';

const styles: Record<Variant, string> = {
  primary: 'bg-ink text-cream before:bg-gold hover:text-ink focus-visible:text-ink',
  outline: 'border border-ink/80 text-ink before:bg-ink hover:text-cream',
  ghost: 'text-ink before:bg-beige',
  light: 'bg-cream text-ink before:bg-rose',
};

const common =
  'group relative isolate inline-flex min-h-[3rem] items-center justify-center gap-3 overflow-hidden rounded-full px-7 py-3 text-sm font-medium tracking-wide transition-colors duration-500 ease-silk ' +
  // ფერის შევსება ქვემოდან ზემოთ
  'before:absolute before:inset-0 before:-z-10 before:origin-bottom before:scale-y-0 before:rounded-full before:transition-transform before:duration-500 before:ease-silk hover:before:scale-y-100 focus-visible:before:scale-y-100 disabled:pointer-events-none disabled:opacity-50';

type BaseProps = { variant?: Variant; magnetic?: boolean; icon?: ReactNode; className?: string };

export function ButtonLink({
  variant = 'primary',
  magnetic = true,
  icon,
  className,
  children,
  ...props
}: BaseProps & ComponentProps<typeof Link>) {
  const el = (
    <Link className={cn(common, styles[variant], className)} {...props}>
      {children}
      {icon}
    </Link>
  );
  return magnetic ? <Magnetic>{el}</Magnetic> : el;
}

export function ExternalButton({
  variant = 'primary',
  magnetic = true,
  icon,
  className,
  children,
  ...props
}: BaseProps & ComponentProps<'a'>) {
  const el = (
    <a className={cn(common, styles[variant], className)} {...props}>
      {icon}
      {children}
    </a>
  );
  return magnetic ? <Magnetic>{el}</Magnetic> : el;
}

export function Button({
  variant = 'primary',
  icon,
  className,
  children,
  ...props
}: Omit<BaseProps, 'magnetic'> & ComponentProps<'button'>) {
  return (
    <button className={cn(common, styles[variant], className)} {...props}>
      {children}
      {icon}
    </button>
  );
}
