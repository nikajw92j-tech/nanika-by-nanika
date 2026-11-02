import 'server-only';
import { cookies } from 'next/headers';
import ka from '@/locales/ka.json';
import en from '@/locales/en.json';
import ru from '@/locales/ru.json';
import type { Locale } from '@/lib/types';
import { defaultLocale, isLocale, LOCALE_COOKIE } from './config';

export type Dictionary = typeof ka;
const dictionaries: Record<Locale, Dictionary> = { ka, en: en as Dictionary, ru: ru as Dictionary };

export function getLocale(): Locale {
  const value = cookies().get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : defaultLocale;
}

export const getDictionary = (locale: Locale) => dictionaries[locale];
export const allDictionaries = dictionaries;
