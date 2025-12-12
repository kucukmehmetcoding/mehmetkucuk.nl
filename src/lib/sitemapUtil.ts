import type {MetadataRoute} from 'next';
import {prisma} from './prisma';
import {SUPPORTED_LANGS} from './i18n';

export async function getSitemapEntries(baseUrl: string): Promise<MetadataRoute.Sitemap> {
  const articles = await prisma.article.findMany({
    where: {published: true},
    include: {translations: true},
    orderBy: {updatedAt: 'desc'},
    take: 1000
  });

  const entries: MetadataRoute.Sitemap = [];
  for (const article of articles) {
    for (const translation of article.translations) {
      const lang = translation.lang;
      const url = `${baseUrl}/${lang}/news/${article.slug}`;
      const languages = SUPPORTED_LANGS.reduce<Record<string, string>>((acc, l) => {
        acc[l] = `${baseUrl}/${l}/news/${article.slug}`;
        return acc;
      }, {});
      entries.push({
        url,
        lastModified: article.updatedAt,
        changeFrequency: 'hourly',
        priority: 0.8,
        alternates: {
          languages: {
            ...languages,
            'x-default': `${baseUrl}/tr/news/${article.slug}`
          }
        }
      });
    }
  }

  // include evergreen pages
  const pages: MetadataRoute.Sitemap = SUPPORTED_LANGS.map((lang) => ({
    url: `${baseUrl}/${lang}`,
    changeFrequency: 'daily',
    priority: 0.6,
    lastModified: new Date()
  }));

  return [...pages, ...entries];
}
