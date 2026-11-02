import { Counter } from '@/components/animations/Counter';
import { Reveal } from '@/components/animations/Reveal';

/** რიცხვები — მხოლოდ რეალური მონაცემები (ადმინ-პანელი → კონტენტი → რიცხვები). */
export function Stats({ eyebrow, items }: { eyebrow: string; items: { value: number; suffix: string; label: string }[] }) {
  if (!items.length) return null;
  return (
    <section className="border-y border-ink/10 bg-beige/40 py-20 md:py-28">
      <div className="container">
        <Reveal>
          <p className="eyebrow mb-12 justify-center md:mb-16 [&]:flex">{eyebrow}</p>
        </Reveal>
        <dl
          className="mx-auto grid max-w-5xl justify-center gap-12 text-center"
          style={{ gridTemplateColumns: `repeat(auto-fit, minmax(200px, 1fr))` }}
        >
          {items.map((s, i) => (
            <Reveal key={i} delay={i * 0.1} className="flex flex-col">
              <dt className="order-2 mt-3 text-sm uppercase tracking-[0.2em] text-taupe">{s.label}</dt>
              <dd className="order-1 font-serif text-6xl text-ink md:text-8xl">
                <Counter value={s.value} suffix={s.suffix} />
              </dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
