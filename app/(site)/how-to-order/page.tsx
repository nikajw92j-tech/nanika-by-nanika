import type { Metadata } from 'next';
import { getDictionary, getLocale } from '@/lib/i18n/server';
import { Reveal } from '@/components/animations/Reveal';
import { StitchLine } from '@/components/animations/StitchLine';
import { MeasureGuide } from '@/components/sections/MeasureGuide';
import { ButtonLink } from '@/components/ui/Button';
import { PageHero, SectionHeading } from '@/components/ui/SectionHeading';
import { ArrowRight, Camera, Fabric, Needle, Ruler, Truck } from '@/components/ui/icons';

const icons = [Camera, Ruler, Fabric, Needle, Truck];

export function generateMetadata(): Metadata {
  const dict = getDictionary(getLocale());
  return { title: dict.howTo.eyebrow, description: dict.howTo.subtitle, alternates: { canonical: '/how-to-order' } };
}

export default function HowToOrderPage() {
  const dict = getDictionary(getLocale());
  return (
    <>
      <PageHero eyebrow={dict.howTo.eyebrow} title={dict.howTo.title} subtitle={dict.howTo.subtitle} />

      <section className="container pb-16">
        <ol className="relative grid gap-6 md:grid-cols-5">
          <span aria-hidden className="absolute left-0 right-0 top-8 hidden border-t border-dashed border-gold/60 md:block" />
          {dict.process.steps.map((s, i) => {
            const Icon = icons[i];
            return (
              <Reveal as="li" key={s.title} delay={i * 0.1} className="relative flex gap-5 md:flex-col">
                <span className="relative z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-gold/60 bg-cream text-gold">
                  <Icon width={26} height={26} />
                  <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-ink text-[0.65rem] text-cream">{i + 1}</span>
                </span>
                <div>
                  <h2 className="font-serif text-2xl">{s.title}</h2>
                  <p className="mt-2 text-taupe">{s.text}</p>
                </div>
              </Reveal>
            );
          })}
        </ol>
      </section>

      <StitchLine className="my-10" />

      <section id="measurements" className="container scroll-mt-24 pb-24 md:pb-36">
        <SectionHeading eyebrow={dict.howTo.guideEyebrow} title={dict.howTo.guideTitle} subtitle={dict.howTo.guideSubtitle} />
        <div className="mt-14">
          <MeasureGuide points={dict.howTo.points} tip={dict.howTo.tips} />
        </div>
        <Reveal className="mt-16 flex justify-center">
          <ButtonLink href="/order" icon={<ArrowRight width={18} height={18} />}>
            {dict.common.orderNow}
          </ButtonLink>
        </Reveal>
      </section>
    </>
  );
}
