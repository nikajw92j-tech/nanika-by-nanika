import { waHref } from '@/config/site';
import { Reveal } from '@/components/animations/Reveal';
import { ButtonLink, ExternalButton } from '@/components/ui/Button';
import { ArrowRight, Messenger, WhatsApp } from '@/components/ui/icons';

export function CtaBanner({
  title,
  text,
  formLabel,
  whatsapp,
  messenger,
}: {
  title: string;
  text: string;
  formLabel: string;
  whatsapp: string;
  messenger: string;
}) {
  return (
    <section className="container pb-24 md:pb-36">
      <div className="relative overflow-hidden bg-rose/30 px-6 py-16 text-center md:px-16 md:py-24">
        <div aria-hidden className="pointer-events-none absolute inset-3 border border-dashed border-gold/70" />
        <Reveal>
          <h2 className="text-h1 text-balance">{title}</h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mx-auto mt-5 max-w-lg font-serif text-2xl italic text-taupe md:text-3xl">{text}</p>
        </Reveal>
        <Reveal delay={0.2} className="mt-10 flex flex-wrap justify-center gap-3">
          <ExternalButton href={waHref(whatsapp)} target="_blank" rel="noopener noreferrer" icon={<WhatsApp width={18} height={18} />}>
            WhatsApp
          </ExternalButton>
          <ExternalButton href={messenger} target="_blank" rel="noopener noreferrer" variant="outline" icon={<Messenger width={18} height={18} />}>
            Messenger
          </ExternalButton>
          <ButtonLink href="/order" variant="outline" icon={<ArrowRight width={18} height={18} />}>
            {formLabel}
          </ButtonLink>
        </Reveal>
      </div>
    </section>
  );
}
