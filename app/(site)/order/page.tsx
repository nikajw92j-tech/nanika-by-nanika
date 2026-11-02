import type { Metadata } from 'next';
import { telHref, waHref } from '@/config/site';
import { getCategories, getContent, getGallery, getProductBySlug } from '@/lib/data/public';
import { tr } from '@/lib/i18n/config';
import { getDictionary, getLocale } from '@/lib/i18n/server';
import { formatPrice } from '@/lib/utils';
import { Reveal } from '@/components/animations/Reveal';
import { OrderForm, type SelectedModel } from '@/components/order/OrderForm';
import { QuestionForm } from '@/components/order/QuestionForm';
import { PageHero } from '@/components/ui/SectionHeading';
import { Clock, Mail, MapPin, Messenger, Phone, WhatsApp } from '@/components/ui/icons';

export function generateMetadata(): Metadata {
  const dict = getDictionary(getLocale());
  return { title: dict.nav.order, description: dict.order.subtitle, alternates: { canonical: '/order' } };
}

type Search = { product?: string; model?: string; color?: string; size?: string; custom?: string; category?: string };

export default async function OrderPage({ searchParams }: { searchParams: Search }) {
  const locale = getLocale();
  const dict = getDictionary(locale);
  const [content, categories] = await Promise.all([getContent(), getCategories()]);

  let selected: SelectedModel | null = null;
  if (searchParams.product) {
    const p = await getProductBySlug(searchParams.product);
    if (p) {
      selected = {
        kind: 'product',
        id: p.slug,
        title: tr(p.name, locale),
        image: p.cover,
        sizes: p.sizes,
        colors: p.colors.map((c) => c.name),
        price: formatPrice(p.finalPrice),
      };
    }
  } else if (searchParams.model) {
    const g = (await getGallery()).find((i) => i.id === searchParams.model);
    if (g) {
      selected = { kind: 'gallery', id: g.id, title: tr(g.title, locale) || dict.gallery.title, image: g.url, sizes: [], colors: [], price: null };
    }
  }

  const { contact, social } = content;
  const quick = [
    { href: telHref(contact.phone), label: dict.common.call, sub: contact.phone, Icon: Phone },
    { href: waHref(contact.whatsapp), label: 'WhatsApp', sub: contact.phone, Icon: WhatsApp, external: true },
    { href: social.messenger, label: 'Messenger', sub: 'nanikabynanika', Icon: Messenger, external: true },
  ];

  return (
    <>
      <PageHero eyebrow={dict.order.eyebrow} title={dict.order.title} subtitle={dict.order.subtitle} />
      <section className="container grid gap-14 pb-24 lg:grid-cols-12 lg:gap-20 md:pb-36">
        <div className="lg:col-span-8">
          <Reveal>
            <OrderForm
              categories={categories.map((c) => ({ slug: c.slug, name: tr(c.name, locale) }))}
              selected={selected}
              whatsapp={contact.whatsapp}
              initial={{
                color: searchParams.color,
                size: searchParams.size,
                custom: searchParams.custom === '1' ? true : undefined,
                category: selected?.kind === 'gallery' ? undefined : searchParams.category,
              }}
            />
          </Reveal>
        </div>

        <aside className="space-y-10 lg:col-span-4">
          <Reveal delay={0.1}>
            <h2 className="label mb-4">{dict.order.quick}</h2>
            <ul className="space-y-3">
              {quick.map(({ href, label, sub, Icon, external }) => (
                <li key={label}>
                  <a
                    href={href}
                    {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    className="group flex items-center gap-4 border border-ink/10 p-4 transition-colors hover:border-gold hover:bg-beige/40"
                  >
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-ink text-cream transition-colors group-hover:bg-gold group-hover:text-ink">
                      <Icon width={20} height={20} />
                    </span>
                    <span>
                      <span className="block font-medium">{label}</span>
                      <span className="text-sm text-taupe">{sub}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.15}>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-3"><Mail className="shrink-0 text-gold" /> <a href={`mailto:${contact.email}`} className="link-underline break-all">{contact.email}</a></li>
              <li className="flex gap-3"><MapPin className="shrink-0 text-gold" /> {tr(contact.address, locale)}</li>
              <li className="flex gap-3"><Clock className="shrink-0 text-gold" /> {tr(contact.hours, locale)}</li>
            </ul>
          </Reveal>
          <Reveal delay={0.2} className="border-t border-ink/10 pt-8">
            <h2 className="font-serif text-2xl">{dict.order.questionTitle}</h2>
            <p className="mb-5 mt-1 text-sm text-taupe">{dict.order.questionText}</p>
            <QuestionForm />
          </Reveal>
        </aside>
      </section>

      {/* რუკა — მხოლოდ თუ ფიზიკური მისამართი არსებობს (ადმინი → კონტაქტი → Google Maps embed URL) */}
      {contact.mapEmbedUrl && (
        <section className="container pb-24">
          <iframe
            src={contact.mapEmbedUrl}
            title="Google Maps"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-[420px] w-full border-0 grayscale"
          />
        </section>
      )}
    </>
  );
}
