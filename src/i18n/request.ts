import {getRequestConfig} from 'next-intl/server';
import {defaultLocale, SUPPORTED_LANGS, type Locale} from '@/lib/i18n';

function resolveLocale(locale: string | undefined): Locale {
  if (locale && SUPPORTED_LANGS.includes(locale as Locale)) {
    return locale as Locale;
  }
  return defaultLocale;
}

export default getRequestConfig(async ({locale}) => {
  const resolved = resolveLocale(locale);
  const messages = (await import(`../../messages/${resolved}.json`)).default;

  return {
    messages,
    locale: resolved,
    timeZone: 'Europe/Istanbul'
  };
});
