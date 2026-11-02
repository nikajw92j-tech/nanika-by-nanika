import type { Metadata, Viewport } from 'next';
import {
  Cormorant_Garamond,
  Great_Vibes,
  Inter,
  Noto_Sans_Georgian,
  Noto_Serif_Georgian,
} from 'next/font/google';
import { siteConfig } from '@/config/site';
import { getDictionary, getLocale } from '@/lib/i18n/server';
import './globals.css';

const serifKa = Noto_Serif_Georgian({
  subsets: ['georgian'],
  weight: ['300', '400', '500'],
  variable: '--font-serif-ka',
  display: 'swap',
});
const sansKa = Noto_Sans_Georgian({
  subsets: ['georgian'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-sans-ka',
  display: 'swap',
});
const serifLatin = Cormorant_Garamond({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-serif-latin',
  display: 'swap',
});
const sansLatin = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-sans-latin',
  display: 'swap',
});
const script = Great_Vibes({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-script',
  display: 'swap',
});

export function generateMetadata(): Metadata {
  const locale = getLocale();
  const dict = getDictionary(locale);
  return {
    metadataBase: new URL(siteConfig.url),
    title: { default: dict.meta.title, template: `%s — ${siteConfig.name}` },
    description: dict.meta.description,
    applicationName: siteConfig.name,
    openGraph: {
      type: 'website',
      siteName: siteConfig.name,
      title: dict.meta.title,
      description: dict.meta.description,
      locale: locale === 'ka' ? 'ka_GE' : locale === 'ru' ? 'ru_RU' : 'en_US',
      url: siteConfig.url,
    },
    twitter: { card: 'summary_large_image', title: dict.meta.title, description: dict.meta.description },
    alternates: { canonical: '/' },
  };
}

export const viewport: Viewport = {
  themeColor: '#F8F4EF',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = getLocale();
  return (
    <html
      lang={locale}
      className={`${serifKa.variable} ${sansKa.variable} ${serifLatin.variable} ${sansLatin.variable} ${script.variable}`}
      suppressHydrationWarning
    >
      <body>{children}</body>
    </html>
  );
}
