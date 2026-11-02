import type { Metadata } from 'next';
import Image from 'next/image';
import { BLUR_DATA_URL } from '@/lib/blur';
import { getContent } from '@/lib/data/public';
import { tr } from '@/lib/i18n/config';
import { getDictionary, getLocale } from '@/lib/i18n/server';
import { ImageReveal } from '@/components/animations/ImageReveal';
import { Reveal, Stagger, StaggerItem } from '@/components/animations/Reveal';
import { StitchLine } from '@/components/animations/StitchLine';
import { Timeline } from '@/components/sections/Timeline';
import { PageHero, SectionHeading } from '@/components/ui/SectionHeading';

export function generateMetadata(): Metadata {
  const dict = getDictionary(getLocale());
  return { title: dict.about.eyebrow, description: dict.about.title, alternates: { canonical: '/about' } };
}

const processPhotos = [
  { src: '/images/about/process.webp', alt: 'წითელი ჟაკეტი მანეკენზე, საკერავ მანქანასთან' },
  { src: '/images/about/labels.webp', alt: 'Nanika — Made in Georgia ბირკები' },
  { src: '/images/about/label-detail.webp', alt: 'Nanika ბირკა ნაწარმზე' },
  { src: '/images/about/atelier.webp', alt: 'ატელიე — ტანსაცმელი და მანეკენები' },
];

export default async function AboutPage() {
  const locale = getLocale();
  const dict = getDictionary(locale);
  const content = await getContent();
  const designer = content.about.designerImage;

  return (
    <>
      <PageHero eyebrow={dict.about.eyebrow} title={dict.about.title} />

      <section className="container grid items-start gap-12 pb-24 md:grid-cols-12 md:gap-16">
        <div className="md:col-span-5">
          <ImageReveal className="photo-soft aspect-[3/4]">
            {designer ? (
              <Image src={designer} alt={dict.about.designerCaption} fill sizes="(min-width: 768px) 40vw, 100vw" placeholder="blur" blurDataURL={BLUR_DATA_URL} className="object-cover" />
            ) : (
              // TODO: დიზაინერის ფოტო — ადმინ-პანელი → კონტენტი → ჩვენ შესახებ
              <div className="placeholder-tile h-full w-full">
                <span className="font-script text-6xl text-gold/70">Nanika</span>
              </div>
            )}
          </ImageReveal>
          <p className="mt-3 text-sm text-taupe">{dict.about.designerCaption}</p>
        </div>
        <div className="md:col-span-7 md:pt-10">
          <Reveal>
            <p className="whitespace-pre-line font-serif text-2xl leading-relaxed md:text-3xl">{tr(content.about.story, locale)}</p>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-10 font-script text-5xl text-gold">{dict.aboutShort.signature}</p>
          </Reveal>
        </div>
      </section>

      <section className="bg-ink py-24 text-cream md:py-32">
        <div className="container">
          <SectionHeading title={dict.about.philosophyTitle} />
          <Stagger className="mt-14 grid gap-10 md:grid-cols-3">
            {dict.about.philosophy.map((p, i) => (
              <StaggerItem key={p.title} className="border-t border-cream/15 pt-8">
                <span className="font-serif text-6xl text-gold/40">0{i + 1}</span>
                <h3 className="mt-4 font-serif text-3xl">{p.title}</h3>
                <p className="mt-3 text-cream/70">{p.text}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="container relative py-24 md:py-36">
        <div className="md:sticky md:top-32 md:float-left md:max-w-[40%]">
          <SectionHeading title={dict.about.timelineTitle} />
        </div>
        <div className="mt-12 md:mt-0">
          <Timeline items={dict.about.timeline} />
        </div>
      </section>

      <StitchLine />

      <section className="container py-24 md:py-32">
        <SectionHeading title={dict.about.processTitle} />
        <div className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6">
          {processPhotos.map((p, i) => (
            <ImageReveal key={p.src} delay={i * 0.1} className={`photo-soft ${i % 2 ? 'aspect-square md:mt-16' : 'aspect-[3/4]'}`}>
              <Image src={p.src} alt={p.alt} fill sizes="(min-width: 768px) 25vw, 50vw" placeholder="blur" blurDataURL={BLUR_DATA_URL} className="object-cover" />
            </ImageReveal>
          ))}
        </div>
      </section>
    </>
  );
}
