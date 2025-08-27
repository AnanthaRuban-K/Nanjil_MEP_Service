// lib/i18n/dictionaries.ts (Fixed)
import type { Locale } from './config';

const dictionaries = {
  tamil: () => import('./dictionaries/tamil.json').then((module) => module.default),
  english: () => import('./dictionaries/english.json').then((module) => module.default),
} as const;

export const getDictionary = async (locale: Locale) => {
  const dictionary = dictionaries[locale];
  if (!dictionary) {
    console.warn(`Dictionary for locale '${locale}' not found, falling back to tamil`);
    return dictionaries.tamil();
  }
  return dictionary();
};