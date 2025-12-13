import {NextRequest, NextResponse} from 'next/server';
import {prisma} from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

function resolveToUrlPath(value: string): string {
  const v = value.trim();
  if (!v) return '';
  if (v.startsWith('http://') || v.startsWith('https://')) return v;
  return v.startsWith('/') ? v : `/${v}`;
}

export async function GET(request: NextRequest) {
  try {
    const setting = await prisma.siteSetting.findUnique({where: {key: 'ogImage'}});
    const target = resolveToUrlPath(setting?.value || '') || '/og-image.png';

    const res = NextResponse.redirect(new URL(target, request.url), 307);
    // Keep un-cached so admin updates apply without redeploy.
    res.headers.set('Cache-Control', 'no-store');
    return res;
  } catch (error) {
    console.error('[api/og-image] Error:', error);
    return NextResponse.redirect(new URL('/og-image.png', request.url), 307);
  }
}
