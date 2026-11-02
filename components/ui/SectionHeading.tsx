import { cn } from '@/lib/utils';
import { Reveal } from '@/components/animations/Reveal';

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'left',
  as: Tag = 'h2',
  className,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  as?: 'h1' | 'h2';
  className?: string;
}) {
  return (
    <div
      className={cn(
        'max-w-3xl',
        align === 'center' && 'mx-auto text-center [&_.eyebrow]:justify-center',
        className,
      )}
    >
      {eyebrow && (
        <Reveal>
          <p className="eyebrow mb-5">{eyebrow}</p>
        </Reveal>
      )}
      <Reveal delay={0.08}>
        <Tag className={cn('text-balance', Tag === 'h1' ? 'text-h1' : 'text-h2')}>{title}</Tag>
      </Reveal>
      {subtitle && (
        <Reveal delay={0.16}>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-taupe md:text-lg [.text-center_&]:mx-auto">
            {subtitle}
          </p>
        </Reveal>
      )}
    </div>
  );
}

/** შიდა გვერდების სათაური */
export function PageHero({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <section className="container pb-12 pt-[calc(var(--header-h)+3.5rem)] md:pb-20 md:pt-[calc(var(--header-h)+6rem)]">
      <SectionHeading eyebrow={eyebrow} title={title} subtitle={subtitle} as="h1" />
    </section>
  );
}
