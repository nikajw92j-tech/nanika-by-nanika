import Image from 'next/image';
import { BLUR_DATA_URL } from '@/lib/blur';
import { Stagger, StaggerItem } from '@/components/animations/Reveal';
import { ExternalButton } from '@/components/ui/Button';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Facebook, Instagram } from '@/components/ui/icons';

export function SocialFeed({
  eyebrow,
  title,
  facebookLabel,
  facebook,
  instagram,
  images,
}: {
  eyebrow: string;
  title: string;
  facebookLabel: string;
  facebook: string;
  instagram: string;
  images: { url: string; alt: string }[];
}) {
  const tiles = Array.from({ length: 6 }, (_, i) => images[i] ?? null);
  return (
    <section className="container py-24 md:py-32">
      <SectionHeading eyebrow={eyebrow} title={title} align="center" />
      <Stagger className="mt-12 grid grid-cols-3 gap-2 md:grid-cols-6 md:gap-3">
        {tiles.map((img, i) => (
          <StaggerItem key={i}>
            <a
              href={facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Facebook — ${img?.alt ?? 'Nanika'}`}
              className="group relative block aspect-square overflow-hidden bg-beige"
            >
              {img ? (
                <Image src={img.url} alt={img.alt} fill sizes="(min-width: 768px) 16vw, 33vw" placeholder="blur" blurDataURL={BLUR_DATA_URL} className="object-cover transition-transform duration-700 group-hover:scale-110" />
              ) : (
                <div className="placeholder-tile h-full w-full" />
              )}
              <span className="absolute inset-0 flex items-center justify-center bg-ink/50 text-cream opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                <Facebook width={22} height={22} />
              </span>
            </a>
          </StaggerItem>
        ))}
      </Stagger>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <ExternalButton href={facebook} target="_blank" rel="noopener noreferrer" icon={<Facebook width={18} height={18} />}>
          {facebookLabel}
        </ExternalButton>
        <ExternalButton href={instagram} target="_blank" rel="noopener noreferrer" variant="outline" icon={<Instagram width={18} height={18} />}>
          Instagram
        </ExternalButton>
      </div>
    </section>
  );
}
