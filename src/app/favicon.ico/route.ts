import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

function pickFaviconUrl(siteFaviconMain?: string | null, siteFaviconJson?: string | null): string {
  const main = (siteFaviconMain || '').trim();
  if (main) return main;

  const raw = (siteFaviconJson || '').trim();
  if (!raw) return '/icon';

  try {
    const parsed = JSON.parse(raw) as Record<string, string>;
    return parsed.favicon || parsed['icon-32'] || parsed['icon-16'] || '/icon';
  } catch {
    return '/icon';
  }
}

export async function GET(request: NextRequest) {
  try {
    const [mainSetting, jsonSetting] = await Promise.all([
      prisma.siteSetting.findUnique({ where: { key: 'siteFaviconMain' } }),
      prisma.siteSetting.findUnique({ where: { key: 'siteFavicon' } }),
    ]);

    const targetPath = pickFaviconUrl(mainSetting?.value, jsonSetting?.value);

    const res = NextResponse.redirect(new URL(targetPath, request.url), 307);
    // Keep this un-cached so changes take effect even though the URL is stable.
    res.headers.set('Cache-Control', 'no-store');
    return res;
  } catch (error) {
    console.error('[favicon.ico] Error:', error);
    return NextResponse.redirect(new URL('/icon', request.url), 307);
  }
}
