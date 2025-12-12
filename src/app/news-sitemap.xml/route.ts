import {NextResponse} from 'next/server';
import {prisma} from '@/lib/prisma';

// Force dynamic rendering - database required at runtime
export const dynamic = 'force-dynamic';

// Google News Sitemap - revalidate every hour
export const revalidate = 3600;

export async function GET() {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://mehmetkucuk.nl';

  // Fetch articles published in the last 2 days (Google News requirement)
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  const articles = await prisma.article.findMany({
    where: {
      published: true,
      publishedAt: {
        gte: twoDaysAgo,
      },
    },
    include: {
      translations: true,
    },
    orderBy: {publishedAt: 'desc'},
    take: 1000,
  });

  const urls = articles.flatMap((article) =>
    article.translations.map((t) => {
      const langCode = t.lang === 'tr' ? 'tr' : t.lang === 'nl' ? 'nl' : 'en';
      return `
    <url>
      <loc>${SITE_URL}/${langCode}/post/${t.slug}</loc>
      <news:news>
        <news:publication>
          <news:name>MK News Intelligence</news:name>
          <news:language>${langCode}</news:language>
        </news:publication>
        <news:publication_date>${(article.publishedAt || new Date()).toISOString()}</news:publication_date>
        <news:title><![CDATA[${t.title}]]></news:title>
        <news:keywords><![CDATA[${article.category}, technology, news]]></news:keywords>
      </news:news>
      <image:image>
        <image:loc>${article.imageUrl || `${SITE_URL}/og-image.jpg`}</image:loc>
        <image:title><![CDATA[${t.title}]]></image:title>
      </image:image>
    </url>`;
    })
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.join('\n')}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}
