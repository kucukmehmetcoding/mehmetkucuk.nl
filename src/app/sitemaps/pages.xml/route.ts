import {NextResponse} from 'next/server';
import {SUPPORTED_LANGS} from '@/lib/i18n';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mehmetkucuk.nl';
  const urls = SUPPORTED_LANGS.map((lang) => {
    const alternates = SUPPORTED_LANGS.map(
      (alt) =>
        `<xhtml:link rel="alternate" hreflang="${alt}" href="${baseUrl}/${alt}" />`
    ).join('') + `<xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}/tr" />`;
    return `
      <url>
        <loc>${baseUrl}/${lang}</loc>
        <changefreq>daily</changefreq>
        <priority>0.6</priority>
        ${alternates}
      </url>`;
  }).join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>`;

  return new NextResponse(xml, {
    headers: {'content-type': 'application/xml; charset=utf-8'}
  });
}
