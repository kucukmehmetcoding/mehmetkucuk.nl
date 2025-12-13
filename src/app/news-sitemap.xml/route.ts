import {NextResponse} from 'next/server';
import {prisma} from '@/lib/prisma';
import {SUPPORTED_LANGS} from '@/lib/i18n';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 300; // 5 minutes

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://mehmetkucuk.nl').replace(/\/+$/, '');

  // Google News sitemap: last 2 days, up to 1000 URLs.
  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000);

  // Publication name shown in Google News.
  const publicationName = 'MK News Intelligence';

  try {
    const translations = await prisma.translation.findMany({
      where: {
        article: {published: true},
        lang: {in: SUPPORTED_LANGS as any},
        OR: [{publishedAt: {gte: cutoff}}, {article: {publishedAt: {gte: cutoff}}}],
      },
      select: {
        lang: true,
        slug: true,
        title: true,
        publishedAt: true,
        createdAt: true,
        article: {select: {publishedAt: true}},
      },
      orderBy: [{publishedAt: 'desc'}, {createdAt: 'desc'}],
      take: 1000,
    });

    const urlsXml = translations
      .map((t) => {
        const lang = String(t.lang);
        if (!t.slug || !t.title) return '';

        const loc = `${SITE_URL}/${lang}/post/${encodeURIComponent(t.slug)}`;
        const publishedAt = (t.publishedAt || t.article?.publishedAt || t.createdAt).toISOString();

        return `  <url>\n    <loc>${escapeXml(loc)}</loc>\n    <news:news>\n      <news:publication>\n        <news:name>${escapeXml(publicationName)}</news:name>\n        <news:language>${escapeXml(lang)}</news:language>\n      </news:publication>\n      <news:publication_date>${escapeXml(publishedAt)}</news:publication_date>\n      <news:title>${escapeXml(t.title)}</news:title>\n    </news:news>\n  </url>`;
      })
      .filter(Boolean)
      .join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\n${urlsXml}\n</urlset>`;

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    // Never fail build/runtime if DB is temporarily unavailable.
    console.error('[news-sitemap] Error:', error);

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\n</urlset>`;

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  }
}
