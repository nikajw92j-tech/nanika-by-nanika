import Image from 'next/image';
import Link from 'next/link';
import { BLUR_DATA_URL } from '@/lib/blur';
import { ImageReveal } from '@/components/animations/ImageReveal';
import { ButtonLink } from '@/components/ui/Button';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ArrowRight } from '@/components/ui/icons';

export type PreviewItem = { id: string; url: string | null; title: string };

const ratios = ['aspect-[3/4]', 'aspect-square', 'aspect-[4/5]', 'aspect-[3/4]', 'aspect-[4/5]', 'aspect-square'];

export function GalleryPreview({
  eyebrow,
  title,
  cta,
  items,
  viewLabel,
  placeholderLabel,
}: {
  eyebrow: string;
  title: string;
  cta: string;
  items: PreviewItem[];
  viewLabel: string;
  placeholderLabel: string;
}) {
  return (
    <section className="container py-24 md:py-36">
      <div className="flex flex-wrap items-end justify-between gap-8">
        <SectionHeading eyebrow={eyebrow} title={title} />
        <ButtonLink href="/gallery" variant="outline" icon={<ArrowRight width={18} height={18} />}>
          {cta}
        </ButtonLink>
      </div>
      <div className="mt-14 columns-2 gap-3 md:mt-20 md:columns-3 md:gap-6 lg:columns-4">
        {items.map((item, i) => (
          <div key={item.id} className="mb-3 break-inside-avoid md:mb-6">
            <ImageReveal delay={(i % 4) * 0.08} className={ratios[i % ratios.length]}>
              {item.url ? (
                <Link
                  href={`/gallery#${item.id}`}
                  data-cursor={viewLabel}
                  className="group photo-soft relative block h-full w-full"
                >
                  <Image
                    src={item.url}
                    alt={item.title || 'Nanika — ნამუშევარი'}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                    placeholder="blur"
                    blurDataURL={BLUR_DATA_URL}
                    className="object-cover transition-transform duration-[1.2s] ease-silk group-hover:scale-110"
                  />
                  {item.title && (
                    <span className="absolute inset-x-0 bottom-0 z-10 translate-y-2 p-4 font-serif text-lg text-cream opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                      {item.title}
                    </span>
                  )}
                </Link>
              ) : (
                // TODO: ნეიტრალური placeholder — დაამატე ფოტო ადმინიდან (/admin/gallery)
                <div className="placeholder-tile h-full w-full p-6 text-center text-xs uppercase tracking-[0.2em]">
                  {placeholderLabel}
                </div>
              )}
            </ImageReveal>
          </div>
        ))}
      </div>
    </section>
  );
}
