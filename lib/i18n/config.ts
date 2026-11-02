import type { Locale, Localized } from '@/lib/types';

export const locales: Locale[] = ['ka', 'en', 'ru'];
export const defaultLocale: Locale = 'ka';
export const LOCALE_COOKIE = 'NEXT_LOCALE';
export const localeLabels: Record<Locale, string> = { ka: 'ქარ', en: 'EN', ru: 'RU' };
export const intlLocale: Record<Locale, string> = { ka: 'ka-GE', en: 'en-GB', ru: 'ru-RU' };

export const isLocale = (v: unknown): v is Locale => locales.includes(v as Locale);

/** ლოკალიზებული ველიდან ტექსტის ამოღება — ცარიელის შემთხვევაში ქართულზე გადადის. */
export function tr(value: Localized | null | undefined, locale: Locale): string {
  if (!value) return '';
  return value[locale]?.trim() || value.ka?.trim() || value.en?.trim() || '';
}
