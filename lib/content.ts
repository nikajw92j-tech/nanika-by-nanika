import { siteConfig } from '@/config/site';
import ka from '@/locales/ka.json';
import en from '@/locales/en.json';
import ru from '@/locales/ru.json';
import type { Localized } from '@/lib/types';

type L = Localized;
type Dict = typeof ka;
const dicts = { ka, en: en as Dict, ru: ru as Dict };

export type ServiceItem = { title: L; text: L; price: L; time: L };
export type SiteContent = {
  hero: { eyebrow: L; title: L; subtitle: L; images: string[] };
  about: { title: L; text: L; story: L; image: string; designerImage: string };
  contact: {
    phone: string;
    whatsapp: string;
    email: string;
    address: L;
    hours: L;
    mapEmbedUrl: string;
  };
  social: {
    facebook: string;
    instagram: string;
    instagramHandle: string;
    messenger: string;
    tiktok: string;
  };
  delivery: { text: L; sewingTime: L; priceNote: L };
  services: { items: ServiceItem[]; extras: { title: L; text: L }[] };
  faq: { items: { q: L; a: L }[] };
  stats: { items: { value: number; suffix: string; label: L }[] };
  reviews: { items: { name: string; text: L; source: string }[] };
  beforeAfter: { pairs: { before: string; after: string; caption: L }[] };
  settings: {
    storeName: string;
    currency: 'GEL';
    productionTime: L;
    deliveryOptions: { name: L; price: number | null; time: L }[];
    freeDeliveryFrom: number | null;
  };
};
export type ContentKey = keyof SiteContent;
export const CONTENT_KEYS: ContentKey[] = [
  'hero',
  'about',
  'contact',
  'social',
  'delivery',
  'services',
  'faq',
  'stats',
  'reviews',
  'beforeAfter',
  'settings',
];

/** ერთი და იგივე ველი სამივე ენის ლექსიკონიდან */
const pick = (f: (d: Dict) => string): L => ({ ka: f(dicts.ka), en: f(dicts.en), ru: f(dicts.ru) });

export function defaultContent(): SiteContent {
  return {
    hero: {
      eyebrow: pick((d) => d.hero.eyebrow),
      title: pick((d) => d.hero.title),
      subtitle: pick((d) => d.hero.subtitle),
      images: ['/images/hero/hero-01.webp'],
    },
    about: {
      title: pick((d) => d.aboutShort.title),
      text: pick((d) => d.aboutShort.text),
      story: pick((d) => d.about.story),
      image: '/images/about/atelier.webp',
      designerImage: '', // TODO: დიზაინერის ფოტო
    },
    contact: {
      phone: siteConfig.phone,
      whatsapp: siteConfig.whatsapp,
      email: siteConfig.email,
      address: pick((d) => d.info.address),
      hours: pick((d) => d.info.hours),
      mapEmbedUrl: siteConfig.mapEmbedUrl,
    },
    social: {
      facebook: siteConfig.facebook,
      instagram: siteConfig.instagram,
      instagramHandle: siteConfig.instagramHandle,
      messenger: siteConfig.messenger,
      tiktok: '',
    },
    delivery: {
      text: pick((d) => d.info.delivery),
      sewingTime: pick((d) => d.info.sewingTime),
      priceNote: pick((d) => d.info.priceFrom),
    },
    services: {
      items: dicts.ka.services.items.map((_, i) => ({
        title: pick((d) => d.services.items[i].title),
        text: pick((d) => d.services.items[i].text),
        price: pick((d) => d.services.items[i].price),
        time: pick((d) => d.services.items[i].time),
      })),
      extras: dicts.ka.services.extras.map((_, i) => ({
        title: pick((d) => d.services.extras[i].title),
        text: pick((d) => d.services.extras[i].text),
      })),
    },
    faq: {
      items: dicts.ka.services.faq.map((_, i) => ({
        q: pick((d) => d.services.faq[i].q),
        a: pick((d) => d.services.faq[i].a),
      })),
    },
    stats: {
      items: dicts.ka.stats.items.map((s, i) => ({
        value: s.value,
        suffix: s.suffix,
        label: pick((d) => d.stats.items[i].label),
      })),
    },
    reviews: { items: [] }, // ⚠️ მხოლოდ რეალური შეფასებები — დაამატე ადმინიდან
    beforeAfter: { pairs: [] }, // TODO: ინსპირაცია → შედეგი ფოტოები
    settings: {
      storeName: siteConfig.name,
      currency: 'GEL',
      productionTime: pick((d) => d.info.sewingTime),
      deliveryOptions: [
        {
          name: { ka: 'თბილისი', en: 'Tbilisi', ru: 'Тбилиси' },
          price: null,
          time: { ka: '1–2 დღე [TODO]', en: '1–2 days [TODO]', ru: '1–2 дня [TODO]' },
        },
        {
          name: { ka: 'რეგიონები', en: 'Regions', ru: 'Регионы' },
          price: null,
          time: { ka: '2–4 დღე [TODO]', en: '2–4 days [TODO]', ru: '2–4 дня [TODO]' },
        },
      ],
      freeDeliveryFrom: null,
    },
  };
}

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

/** ბაზის მნიშვნელობები ფარავს ნაგულისხმევს; ცარიელი სტრიქონები არ ფარავს. */
export function mergeContent<T>(base: T, override: unknown): T {
  if (override === undefined || override === null) return base;
  if (Array.isArray(base)) return (Array.isArray(override) ? override : base) as T;
  if (isPlainObject(base) && isPlainObject(override)) {
    const out: Record<string, unknown> = { ...base };
    for (const key of Object.keys(override)) {
      out[key] =
        key in base
          ? mergeContent((base as Record<string, unknown>)[key], override[key])
          : override[key];
    }
    return out as T;
  }
  if (typeof base === 'string') {
    return (typeof override === 'string' && override.trim() ? override : base) as T;
  }
  return override as T;
}
