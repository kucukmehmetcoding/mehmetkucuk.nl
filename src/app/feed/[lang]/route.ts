import {NextResponse} from 'next/server';
import {prisma} from '@/lib/prisma';
import {SUPPORTED_LANGS} from '@/lib/i18n';

export const revalidate = 3600; // Revalidate every hour

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://mehmetkucuk.nl';
const SITE_NAME = 'MK News Intelligence';

const langMeta: Record<string, {title: string; description: string}> = {
  tr: {
    title: 'MK News Intelligence - Türkçe Haberler',
    description: 'Yapay zeka destekli çok dilli haber platformundan en son Türkçe haberler.',
  },
  en: {
    title: 'MK News Intelligence - English News',
    description: 'Latest English news from AI-powered multilingual news platform.',
  },
  nl: {
    title: 'MK News Intelligence - Nederlands Nieuws',
    description: 'Laatste Nederlandse nieuws van AI-gedreven meertalig nieuwsplatform.',
  },
};

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

export async function GET(request: Request, {params}: {params: {lang: string}}) {
  const lang = params.lang;

  if (!SUPPORTED_LANGS.includes(lang as any)) {
    return new NextResponse('Not found', {status: 404});
  }

  const meta = langMeta[lang] || langMeta.en;

  // Fetch latest published articles with translations
  const articles = await prisma.article.findMany({
    where: {published: true},
    select: {
      id: true,
      category: true,
      imageUrl: true,
      publishedAt: true,
      createdAt: true,
      translations: {
        where: {lang: lang as any},
        select: {
          slug: true,
          title: true,
          summary: true,
          body: true,
        },
        take: 1,
      },
    },
    orderBy: {publishedAt: 'desc'},
    take: 50, // Latest 50 articles
  });

  // Filter articles that have a translation in the requested language
  const articlesWithTranslation = articles.filter((a) => a.translations.length > 0);

  const buildDate = new Date().toUTCString();
  const lastBuildDate = articlesWithTranslation[0]?.publishedAt?.toUTCString() || buildDate;

  const items = articlesWithTranslation.map((article) => {
    const trans = article.translations[0];
    const pubDate = article.publishedAt?.toUTCString() || article.createdAt.toUTCString();
    const link = `${SITE_URL}/${lang}/post/${trans.slug}`;
    const description = trans.summary || stripHtml(trans.body).slice(0, 300) + '...';
    const guid = `${SITE_URL}/article/${article.id}/${lang}`;

    let mediaContent = '';
    if (article.imageUrl) {
      mediaContent = `
      <media:content url="${escapeXml(article.imageUrl)}" medium="image" />
      <enclosure url="${escapeXml(article.imageUrl)}" type="image/jpeg" length="0" />`;
    }

    return `
    <item>
      <title>${escapeXml(trans.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="false">${guid}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${description}]]></description>
      <category>${escapeXml(article.category)}</category>${mediaContent}
    </item>`;
  });

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:media="http://search.yahoo.com/mrss/"
  xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${escapeXml(meta.title)}</title>
    <link>${SITE_URL}/${lang}</link>
    <description>${escapeXml(meta.description)}</description>
    <language>${lang}</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <pubDate>${buildDate}</pubDate>
    <ttl>60</ttl>
    <generator>${SITE_NAME}</generator>
    <atom:link href="${SITE_URL}/feed/${lang}" rel="self" type="application/rss+xml" />
    <image>
      <url>${SITE_URL}/icon.png</url>
      <title>${escapeXml(meta.title)}</title>
      <link>${SITE_URL}/${lang}</link>
    </image>
${items.join('')}
  </channel>
</rss>`;

  return new NextResponse(rss, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
