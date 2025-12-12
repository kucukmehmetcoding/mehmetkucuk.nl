import {NextResponse} from 'next/server';
import {prisma} from '@/lib/prisma';
import {SUPPORTED_LANGS} from '@/lib/i18n';

export const revalidate = 86400; // 24 hours

// Helper to generate hreflang alternates for translations
function generateTranslationHreflangs(allTranslations: {lang: string; slug: string}[], siteUrl: string): string {
  return allTranslations.map(
    (t) => `<xhtml:link rel="alternate" hreflang="${t.lang}" href="${siteUrl}/${t.lang}/post/${t.slug}" />`
  ).join('\n    ') + `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${siteUrl}/tr/post/${allTranslations.find(t => t.lang === 'tr')?.slug || allTranslations[0].slug}" />`;
}

// Helper to generate hreflang alternates for static pages
function generateHreflangs(path: string, siteUrl: string): string {
  return SUPPORTED_LANGS.map(
    (l) => `<xhtml:link rel="alternate" hreflang="${l}" href="${siteUrl}/${l}${path}" />`
  ).join('\n    ') + `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${siteUrl}/tr${path}" />`;
}

export async function GET(request: Request, {params}: {params: {lang: string}}) {
  const lang = params.lang;

  if (!SUPPORTED_LANGS.includes(lang as any)) {
    return new NextResponse('Not found', {status: 404});
  }

  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://mehmetkucuk.nl';

  // Fetch all published content with translation slugs
  const [translations, categories] = await Promise.all([
    prisma.translation.findMany({
      where: {lang: lang as any, article: {published: true}},
      select: {
        slug: true,
        article: {
          select: {
            publishedAt: true,
            translations: {select: {lang: true, slug: true}}
          }
        }
      },
      orderBy: {article: {publishedAt: 'desc'}},
      take: 1000,
    }),
    prisma.article.findMany({
      where: {published: true},
      distinct: ['category'],
      select: {category: true},
    }),
  ]);

  // Build URLs with hreflang alternates
  const urls = [
    // Home
    `<url>
    <loc>${SITE_URL}/${lang}</loc>
    <priority>1.0</priority>
    <changefreq>daily</changefreq>
    ${generateHreflangs('', SITE_URL)}
  </url>`,
    // News
    `<url>
    <loc>${SITE_URL}/${lang}/news</loc>
    <priority>0.9</priority>
    <changefreq>daily</changefreq>
    ${generateHreflangs('/news', SITE_URL)}
  </url>`,
    // Search
    `<url>
    <loc>${SITE_URL}/${lang}/search</loc>
    <priority>0.7</priority>
    <changefreq>weekly</changefreq>
    ${generateHreflangs('/search', SITE_URL)}
  </url>`,
    // Articles with SEO-friendly language-specific slugs
    ...translations.map(
      (trans) =>
        `<url>
    <loc>${SITE_URL}/${lang}/post/${trans.slug}</loc>
    <lastmod>${(trans.article.publishedAt || new Date()).toISOString()}</lastmod>
    <priority>0.8</priority>
    <changefreq>monthly</changefreq>
    ${generateTranslationHreflangs(trans.article.translations, SITE_URL)}
  </url>`
    ),
    // Categories with hreflang
    ...categories.map(
      (cat) =>
        `<url>
    <loc>${SITE_URL}/${lang}/category/${encodeURIComponent(cat.category)}</loc>
    <priority>0.8</priority>
    <changefreq>weekly</changefreq>
    ${generateHreflangs(`/category/${encodeURIComponent(cat.category)}`, SITE_URL)}
  </url>`
    ),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
