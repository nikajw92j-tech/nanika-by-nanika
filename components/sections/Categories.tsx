import Image from 'next/image';
import Link from 'next/link';
import { BLUR_DATA_URL } from '@/lib/blur';
import { Stagger, StaggerItem } from '@/components/animations/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ArrowRight } from '@/components/ui/icons';

export type CategoryCard = { slug: string; name: string; image: string | null };

export function Categories({
  eyebrow,
  title,
  subtitle,
  items,
  viewLabel,
  soonLabel,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  items: CategoryCard[];
  viewLabel: string;
  soonLabel: string;
}) {
  return (
    <section className="bg-beige/40 py-24 md:py-36">
      <div className="container">
        <SectionHeading eyebrow={eyebrow} title={title} subtitle={subtitle} />
        <Stagger className="mt-14 grid grid-cols-2 gap-3 md:mt-20 md:grid-cols-3 md:gap-6">
          {items.map((c, i) => (
            <StaggerItem key={c.slug} className={i === 0 ? 'col-span-2 md:col-span-1 md:row-span-2' : ''}>
              <Link
                href={`/gallery?category=${c.slug}`}
                data-cursor={viewLabel}
                className="group relative block h-full overflow-hidden"
              >
                <div
                  className={`relative w-full overflow-hidden ${i === 0 ? 'aspect-[4/3] md:aspect-auto md:h-full md:min-h-[520px]' : 'aspect-[4/5]'}`}
                >
                  {c.image ? (
                    <>
                      <Image
                        src={c.image}
                        alt={c.name}
                        fill
                        sizes="(min-width: 768px) 33vw, 50vw"
                        placeholder="blur"
                        blurDataURL={BLUR_DATA_URL}
                        className="object-cover transition-transform duration-[1.2s] ease-silk group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
                    </>
                  ) : (
                    // TODO: კატეგორიის ფოტო — დაამატე გალერეაში ამ კატეგორიით
                    <div className="placeholder-tile absolute inset-0 transition-transform duration-[1.2s] ease-silk group-hover:scale-105">
                      <span className="font-serif text-5xl italic text-gold/50 md:text-6xl">{c.name.charAt(0)}</span>
                    </div>
                  )}
                </div>
                <div
                  className={`absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 md:p-6 ${c.image ? 'text-cream' : 'text-ink'}`}
                >
                  <div>
                    <h3 className="font-serif text-xl md:text-3xl">{c.name}</h3>
                    {!c.image && <p className="mt-1 text-xs text-taupe">{soonLabel}</p>}
                  </div>
                  <span className="flex h-10 w-10 shrink-0 -translate-x-2 items-center justify-center rounded-full border border-current opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-100">
                    <ArrowRight width={16} height={16} />
                  </span>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
