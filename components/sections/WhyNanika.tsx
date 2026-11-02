import { Stagger, StaggerItem } from '@/components/animations/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Camera, Fabric, Ruler, Truck } from '@/components/ui/icons';

const icons = [Ruler, Camera, Fabric, Truck];

export function WhyNanika({
  eyebrow,
  title,
  items,
}: {
  eyebrow: string;
  title: string;
  items: { title: string; text: string }[];
}) {
  return (
    <section className="container py-24 md:py-36">
      <SectionHeading eyebrow={eyebrow} title={title} align="center" />
      <Stagger className="mt-16 grid gap-px overflow-hidden border border-ink/10 bg-ink/10 sm:grid-cols-2 lg:grid-cols-4 md:mt-20">
        {items.map((item, i) => {
          const Icon = icons[i % icons.length];
          return (
            <StaggerItem key={item.title} className="group relative bg-cream p-8 md:p-10">
              <span className="absolute right-6 top-6 font-serif text-sm text-taupe">0{i + 1}</span>
              <span className="flex h-14 w-14 items-center justify-center rounded-full border border-gold/50 text-gold transition-all duration-500 group-hover:rotate-[20deg] group-hover:bg-gold group-hover:text-cream">
                <Icon width={24} height={24} />
              </span>
              <h3 className="mt-8 font-serif text-2xl">{item.title}</h3>
              <p className="mt-3 leading-relaxed text-taupe">{item.text}</p>
            </StaggerItem>
          );
        })}
      </Stagger>
    </section>
  );
}
