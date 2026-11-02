import { siteConfig } from '@/config/site';
import { getContent } from '@/lib/data/public';
import { I18nProvider } from '@/lib/i18n/client';
import { tr } from '@/lib/i18n/config';
import { getDictionary, getLocale } from '@/lib/i18n/server';
import { Cursor } from '@/components/animations/Cursor';
import { PreloaderProvider, preloaderScript } from '@/components/animations/Preloader';
import { SmoothScroll } from '@/components/animations/SmoothScroll';
import { FloatingContact } from '@/components/sections/FloatingContact';
import { Footer } from '@/components/sections/Footer';
import { Header } from '@/components/sections/Header';

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const locale = getLocale();
  const dict = getDictionary(locale);
  const content = await getContent();
  const { contact, social } = content;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ClothingStore',
    name: siteConfig.name,
    url: siteConfig.url,
    image: `${siteConfig.url}/opengraph-image`,
    logo: `${siteConfig.url}/icon.svg`,
    description: dict.meta.description,
    telephone: contact.phone,
    email: contact.email,
    areaServed: { '@type': 'Country', name: 'Georgia' },
    address: { '@type': 'PostalAddress', addressCountry: 'GE' },
    priceRange: '₾₾',
    currenciesAccepted: 'GEL',
    sameAs: [social.facebook, social.instagram].filter(Boolean),
    // TODO: openingHoursSpecification — როცა სამუშაო საათები დაზუსტდება
    slogan: tr(content.hero.title, locale),
  };

  return (
    <I18nProvider locale={locale} dict={dict}>
      <script dangerouslySetInnerHTML={{ __html: preloaderScript }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\u003c') }}
      />
      <PreloaderProvider>
        <div className="grain">
          <SmoothScroll />
          <Cursor />
          <Header phone={contact.phone} email={contact.email} social={social} />
          <main id="main">{children}</main>
          <Footer dict={dict} locale={locale} content={content} />
          <FloatingContact whatsapp={contact.whatsapp} messenger={social.messenger} />
        </div>
      </PreloaderProvider>
    </I18nProvider>
  );
}
