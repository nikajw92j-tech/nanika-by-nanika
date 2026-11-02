import Image from 'next/image';
import { BLUR_DATA_URL } from '@/lib/blur';
import { ImageReveal } from '@/components/animations/ImageReveal';
import { Reveal } from '@/components/animations/Reveal';
import { ButtonLink } from '@/components/ui/Button';
import { ArrowRight } from '@/components/ui/icons';

export function AboutShort({
  eyebrow,
  title,
  text,
  signature,
  cta,
  image,
}: {
  eyebrow: string;
  title: string;
  text: string;
  signature: string;
  cta: string;
  image: string;
}) {
  return (
    <section className="container grid items-center gap-12 py-24 md:grid-cols-12 md:gap-16 md:py-36">
      <div className="relative md:col-span-5">
        <ImageReveal className="photo-soft aspect-[3/4] w-full max-w-md">
          {image ? (
            <Image
              src={image}
              alt="Nanika-ს ატელიე — ტანსაცმელი საკიდზე და მანეკენები"
              fill
              sizes="(min-width: 768px) 40vw, 100vw"
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
              className="object-cover"
            />
          ) : (
            <div className="placeholder-tile h-full w-full">{/* TODO: ატელიეს ფოტო */}</div>
          )}
        </ImageReveal>
        <div
          aria-hidden
          className="absolute -bottom-6 -right-4 hidden h-40 w-40 rounded-full border border-dashed border-gold/60 md:block"
        />
      </div>
      <div className="md:col-span-7 md:pl-8">
        <Reveal>
          <p className="eyebrow mb-6">{eyebrow}</p>
        </Reveal>
        <Reveal delay={0.08}>
          <h2 className="text-h2 text-balance">{title}</h2>
        </Reveal>
        <Reveal delay={0.16}>
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-taupe">{text}</p>
        </Reveal>
        <Reveal delay={0.24}>
          <p className="mt-8 font-script text-5xl text-gold">{signature}</p>
        </Reveal>
        <Reveal delay={0.3}>
          <ButtonLink href="/about" variant="outline" className="mt-10" icon={<ArrowRight width={18} height={18} />}>
            {cta}
          </ButtonLink>
        </Reveal>
      </div>
    </section>
  );
}
