import {NextResponse} from 'next/server';
import {SUPPORTED_LANGS} from '@/lib/i18n';

export const revalidate = 86400; // 24 hours

export async function GET() {
  const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://mehmetkucuk.nl').replace(/\/+$/, '');
  const now = new Date().toISOString();

  const sitemaps = [
    `${SITE_URL}/sitemaps/pages.xml`,
    ...SUPPORTED_LANGS.map((lang) => `${SITE_URL}/sitemaps/${lang}`),
    `${SITE_URL}/news-sitemap.xml`,
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps
  .map(
    (loc) => `  <sitemap>
    <loc>${loc}</loc>
    <lastmod>${now}</lastmod>
  </sitemap>`
  )
  .join('\n')}
</sitemapindex>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=86400',
    },
  });
}
