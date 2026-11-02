import type { Metadata } from 'next';
import { getContent } from '@/lib/data/public';
import { tr } from '@/lib/i18n/config';
import { getDictionary, getLocale } from '@/lib/i18n/server';
import { Reveal, Stagger, StaggerItem } from '@/components/animations/Reveal';
import { StitchLine } from '@/components/animations/StitchLine';
import { Accordion } from '@/components/ui/Accordion';
import { ButtonLink } from '@/components/ui/Button';
import { PageHero, SectionHeading } from '@/components/ui/SectionHeading';
import { ArrowRight, Scissors } from '@/components/ui/icons';

export function generateMetadata(): Metadata {
  const dict = getDictionary(getLocale());
  return { title: dict.services.eyebrow, description: dict.services.subtitle, alternates: { canonical: '/services' } };
}

export default async function ServicesPage() {
  const locale = getLocale();
  const dict = getDictionary(locale);
  const content = await getContent();
  const faq = content.faq.items.map((f) => ({ q: tr(f.q, locale), a: tr(f.a, locale) }));

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd).replace(/</g, '\\u003c') }} />
      <PageHero eyebrow={dict.services.eyebrow} title={dict.services.title} subtitle={dict.services.subtitle} />

      <section className="container pb-20">
        <Stagger className="grid gap-px border border-ink/10 bg-ink/10 md:grid-cols-2 lg:grid-cols-3">
          {content.services.items.map((s, i) => (
            <StaggerItem key={i} className="group flex flex-col bg-cream p-8 transition-colors duration-500 hover:bg-beige/50 md:p-10">
              <span className="font-serif text-sm text-gold">0{i + 1}</span>
              <h2 className="mt-6 font-serif text-3xl">{tr(s.title, locale)}</h2>
              <p className="mt-3 flex-1 leading-relaxed text-taupe">{tr(s.text, locale)}</p>
              <dl className="mt-8 grid grid-cols-2 gap-4 border-t border-dashed border-ink/20 pt-5 text-sm">
                <div>
                  <dt className="label">{dict.services.price}</dt>
                  <dd className="font-medium">{tr(s.price, locale)}</dd>
                </div>
                <div>
                  <dt className="label">{dict.services.time}</dt>
                  <dd className="font-medium">{tr(s.time, locale)}</dd>
                </div>
              </dl>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="bg-beige/40 py-20 md:py-28">
        <div className="container">
          <SectionHeading title={dict.services.extrasTitle} />
          <Stagger className="mt-12 grid gap-6 md:grid-cols-3">
            {content.services.extras.map((e, i) => (
              <StaggerItem key={i} className="flex gap-5">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-gold/50 text-gold">
                  <Scissors />
                </span>
                <div>
                  <h3 className="font-serif text-2xl">{tr(e.title, locale)}</h3>
                  <p className="mt-2 text-taupe">{tr(e.text, locale)}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <StitchLine className="my-8" />

      <section className="container grid gap-12 pb-24 md:grid-cols-12 md:pb-36">
        <div className="md:col-span-4">
          <SectionHeading title={dict.services.faqTitle} />
          <Reveal delay={0.2}>
            <ButtonLink href="/order" className="mt-8" icon={<ArrowRight width={18} height={18} />}>
              {dict.common.orderNow}
            </ButtonLink>
          </Reveal>
        </div>
        <div className="md:col-span-8">
          <Accordion items={faq} />
        </div>
      </section>
    </>
  );
}
