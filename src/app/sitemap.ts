import type {MetadataRoute} from 'next';
import {SUPPORTED_LANGS} from '@/lib/i18n';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mehmetkucuk.nl';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const perLang = SUPPORTED_LANGS.map((lang) => ({
    url: `${siteUrl}/sitemaps/${lang}`,
    lastModified
  }));
  return [...perLang, {url: `${siteUrl}/sitemaps/pages.xml`, lastModified}];
}
