import Image from 'next/image';
import Link from 'next/link';
import { BLUR_DATA_URL } from '@/lib/blur';
import { Reveal } from '@/components/animations/Reveal';
import { ArrowRight } from '@/components/ui/icons';

export type PromoView = {
  id: string;
  title: string;
  subtitle: string;
  image: string | null;
  link: string | null;
  discount: number | null;
};

/** აქციის ბანერი მთავარ გვერდზე (/admin/promotions) */
export function PromoBanner({ promos, cta }: { promos: PromoView[]; cta: string }) {
  if (!promos.length) return null;
  return (
    <section className="container space-y-4 pb-16">
      {promos.map((p) => {
        const inner = (
          <div className="group relative grid overflow-hidden bg-wine text-cream md:grid-cols-2">
            <div className="relative z-10 flex flex-col justify-center gap-4 p-8 md:p-14">
              {p.discount && (
                <span className="w-fit rounded-full border border-cream/40 px-4 py-1 text-xs uppercase tracking-[0.2em]">
                  −{p.discount}%
                </span>
              )}
              <h2 className="font-serif text-3xl md:text-5xl">{p.title}</h2>
              {p.subtitle && <p className="max-w-md text-cream/80">{p.subtitle}</p>}
              {p.link && (
                <span className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-gold">
                  {cta} <ArrowRight width={16} height={16} className="transition-transform group-hover:translate-x-1" />
                </span>
              )}
            </div>
            <div className="relative min-h-[220px]">
              {p.image ? (
                <Image src={p.image} alt={p.title} fill sizes="(min-width: 768px) 50vw, 100vw" placeholder="blur" blurDataURL={BLUR_DATA_URL} className="object-cover transition-transform duration-1000 group-hover:scale-105" />
              ) : (
                <div className="absolute inset-0 bg-[repeating-linear-gradient(135deg,rgb(255_255_255/0.06)_0_1px,transparent_1px_14px)]" />
              )}
            </div>
          </div>
        );
        return (
          <Reveal key={p.id}>
            {p.link ? (
              <Link href={p.link} className="block">
                {inner}
              </Link>
            ) : (
              inner
            )}
          </Reveal>
        );
      })}
    </section>
  );
}
