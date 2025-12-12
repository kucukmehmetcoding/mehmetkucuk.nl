export const SUPPORTED_LANGS = ['tr', 'en', 'nl'] as const;
export type Locale = (typeof SUPPORTED_LANGS)[number];

export function isLocale(value: string): value is Locale {
  return SUPPORTED_LANGS.includes(value as Locale);
}

export const defaultLocale: Locale = 'tr';

export const localeLabels: Record<Locale, string> = {
  tr: 'Türkçe',
  en: 'English',
  nl: 'Nederlands'
};
