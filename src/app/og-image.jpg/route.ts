import {NextRequest, NextResponse} from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  // Keep a .jpg URL for legacy references, but serve the actual generated image at /og-image.png.
  const res = NextResponse.redirect(new URL('/og-image.png', request.url), 307);
  res.headers.set('Cache-Control', 'no-store');
  return res;
}
