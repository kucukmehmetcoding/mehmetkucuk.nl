import type {MetadataRoute} from 'next';
import {prisma} from './prisma';
import {SUPPORTED_LANGS} from './i18n';

export async function getSitemapEntries(baseUrl: string): Promise<MetadataRoute.Sitemap> {
  const siteUrl = baseUrl.replace(/\/+$/, '');

  const articles = await prisma.article.findMany({
    where: {published: true},
    select: {
      updatedAt: true,
      translations: {select: {lang: true, slug: true}},
    },
    orderBy: {updatedAt: 'desc'},
    take: 1000
  });

  const entries: MetadataRoute.Sitemap = [];
  for (const article of articles) {
    if (!article.translations?.length) continue;

    const languages = article.translations.reduce<Record<string, string>>((acc, t) => {
      acc[t.lang] = `${siteUrl}/${t.lang}/post/${t.slug}`;
      return acc;
    }, {});

    const xDefaultUrl =
      languages['tr'] ?? languages[article.translations[0].lang];

    for (const translation of article.translations) {
      const url = `${siteUrl}/${translation.lang}/post/${translation.slug}`;
      entries.push({
        url,
        lastModified: article.updatedAt,
        changeFrequency: 'monthly',
        priority: 0.8,
        alternates: {
          languages: {
            ...languages,
            'x-default': xDefaultUrl,
          },
        },
      });
    }
  }

  // include evergreen pages
  const evergreenPaths = ['', '/news', '/search', '/about', '/contact', '/privacy', '/terms', '/cookies'];
  const now = new Date();
  const pages: MetadataRoute.Sitemap = SUPPORTED_LANGS.flatMap((lang) =>
    evergreenPaths.map((path) => {
      const languages = SUPPORTED_LANGS.reduce<Record<string, string>>((acc, l) => {
        acc[l] = `${siteUrl}/${l}${path}`;
        return acc;
      }, {});
      return {
        url: `${siteUrl}/${lang}${path}`,
        changeFrequency: path === '' || path === '/news' ? 'daily' : 'weekly',
        priority: path === '' ? 1.0 : path === '/news' ? 0.9 : 0.6,
        lastModified: now,
        alternates: {
          languages: {
            ...languages,
            'x-default': `${siteUrl}/tr${path}`,
          },
        },
      };
    })
  );

  return [...pages, ...entries];
}
