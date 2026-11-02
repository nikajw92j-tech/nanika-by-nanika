import Link from 'next/link';
import { navItems, telHref } from '@/config/site';
import { tr } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/server';
import type { SiteContent } from '@/lib/content';
import type { Locale } from '@/lib/types';
import { Facebook, Instagram, Messenger, WhatsApp } from '@/components/ui/icons';

export function Footer({
  dict,
  locale,
  content,
}: {
  dict: Dictionary;
  locale: Locale;
  content: SiteContent;
}) {
  const { contact, social } = content;
  const year = new Date().getFullYear();
  return (
    <footer className="relative overflow-hidden bg-ink pb-10 pt-20 text-cream/80 md:pt-28">
      <div className="container">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="font-serif text-4xl uppercase tracking-[0.22em] text-cream md:text-5xl">Nanika</p>
            <p className="mt-1 text-[0.6rem] uppercase tracking-[0.42em] text-cream/60">by Nanika · Made in Georgia</p>
            <p className="mt-6 max-w-sm leading-relaxed">{dict.footer.description}</p>
            <div className="mt-8 flex gap-3">
              {[
                { href: social.facebook, label: 'Facebook', Icon: Facebook },
                { href: social.instagram, label: 'Instagram', Icon: Instagram },
                { href: social.messenger, label: 'Messenger', Icon: Messenger },
                { href: `https://wa.me/${contact.whatsapp}`, label: 'WhatsApp', Icon: WhatsApp },
              ].map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-cream/20 transition-colors duration-300 hover:border-gold hover:bg-gold hover:text-ink"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          <div className="md:col-span-3">
            <h2 className="mb-5 font-sans text-xs font-medium uppercase tracking-widest2 text-gold">
              {dict.footer.menu}
            </h2>
            <ul className="space-y-2.5">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="link-underline hover:text-cream">
                    {dict.nav[item.key]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-4">
            <h2 className="mb-5 font-sans text-xs font-medium uppercase tracking-widest2 text-gold">
              {dict.footer.contact}
            </h2>
            <ul className="space-y-2.5">
              <li>
                <a href={telHref(contact.phone)} className="link-underline hover:text-cream">{contact.phone}</a>
              </li>
              <li>
                <a href={`mailto:${contact.email}`} className="link-underline break-all hover:text-cream">
                  {contact.email}
                </a>
              </li>
              <li>{tr(contact.address, locale)}</li>
              <li>
                <a href={social.instagram} target="_blank" rel="noopener noreferrer" className="link-underline hover:text-cream">
                  {social.instagramHandle}
                </a>
              </li>
            </ul>
            <h2 className="mb-3 mt-8 font-sans text-xs font-medium uppercase tracking-widest2 text-gold">
              {dict.footer.hours}
            </h2>
            {/* TODO: სამუშაო საათები — ადმინიდან (/admin/content → კონტაქტი) */}
            <p>{tr(contact.hours, locale)}</p>
          </div>
        </div>

        <div className="mt-20 flex flex-col gap-4 border-t border-cream/10 pt-8 text-xs text-cream/60 md:flex-row md:items-center md:justify-between">
          <p>
            © {year} Nanika by Nanika. {dict.footer.rights}
          </p>
          <p className="uppercase tracking-[0.3em]">Made in Georgia</p>
        </div>
      </div>
      <p
        aria-hidden
        className="pointer-events-none absolute -bottom-[0.18em] left-1/2 -translate-x-1/2 select-none whitespace-nowrap font-serif text-[22vw] uppercase leading-none tracking-[0.1em] text-cream/[0.03]"
      >
        Nanika
      </p>
    </footer>
  );
}
