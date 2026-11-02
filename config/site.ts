/**
 * ბრენდის ძირითადი ინფორმაცია — ერთ ადგილას.
 * ⚠️ ადმინ-პანელიდან (/admin/settings, /admin/content) შეცვლილი მნიშვნელობები ამ ფაილზე მაღლა დგას —
 * აქ მოცემულია ნაგულისხმევი მნიშვნელობები, როცა ბაზა ჯერ არ არის დაკავშირებული.
 */
export const siteConfig = {
  name: 'Nanika by Nanika',
  shortName: 'Nanika',
  url: (process.env.NEXT_PUBLIC_SITE_URL || 'https://nanika.ge').replace(/\/$/, ''),
  phone: '+995 593 44 44 30',
  email: 'nana_janiashvili@yahoo.com',
  // wa.me ბმულისთვის — მხოლოდ ციფრები, ქვეყნის კოდით
  whatsapp: '995593444430',
  facebook: 'https://www.facebook.com/nanikabynanika',
  instagram: 'https://www.instagram.com/nanika_janiashvili',
  instagramHandle: '@nanika_janiashvili',
  messenger: 'https://m.me/nanikabynanika',
  // ფიზიკური მისამართი არ არის — მხოლოდ ონლაინ. თუ გაჩნდება, ჩაწერე Google Maps embed URL აქ ან ადმინში.
  mapEmbedUrl: '',
  currency: 'GEL',
  currencySymbol: '₾',
} as const;

export const navItems = [
  { href: '/', key: 'home' },
  { href: '/gallery', key: 'gallery' },
  { href: '/products', key: 'products' },
  { href: '/services', key: 'services' },
  { href: '/how-to-order', key: 'howToOrder' },
  { href: '/about', key: 'about' },
  { href: '/order', key: 'contact' },
] as const;

export const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, '')}`;
export const waHref = (num: string, text?: string) =>
  `https://wa.me/${num.replace(/\D/g, '')}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
