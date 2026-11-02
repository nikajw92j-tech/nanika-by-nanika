/** უსასრულო მოძრავი ზოლი (CSS — მთავარ ნაკადს არ ტვირთავს) */
export function Marquee({ items }: { items: string[] }) {
  const row = (hidden?: boolean) => (
    <div className="flex shrink-0 items-center" aria-hidden={hidden}>
      {[...items, ...items].map((t, i) => (
        <span key={i} className="flex items-center whitespace-nowrap">
          <span className="px-6 font-serif text-2xl italic md:px-10 md:text-4xl">{t}</span>
          <span className="text-gold">✦</span>
        </span>
      ))}
    </div>
  );
  return (
    <div className="relative flex overflow-hidden border-y border-ink/10 bg-ink py-5 text-cream md:py-7">
      <div className="flex animate-marquee motion-reduce:animate-none">
        {row()}
        {row(true)}
      </div>
    </div>
  );
}
