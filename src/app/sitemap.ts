import type {MetadataRoute} from 'next';
import {getSitemapEntries} from '@/lib/sitemapUtil';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mehmetkucuk.nl';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return getSitemapEntries(siteUrl);
}
