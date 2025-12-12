import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

// Force dynamic rendering - database required at runtime
export const dynamic = 'force-dynamic';

// Cache for 5 minutes
export const revalidate = 300;

export async function GET() {
  try {
    const settings = await prisma.siteSetting.findMany({
      where: {
        key: {
          in: ['siteLogo', 'siteName'],
        },
      },
    });

    const result = settings.reduce((acc, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {} as Record<string, string>);

    return NextResponse.json({
      success: true,
      logo: result.siteLogo || null,
      siteName: result.siteName || 'MK News',
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('[Branding API] Error:', error);
    return NextResponse.json({
      success: false,
      logo: null,
      siteName: 'MK News',
    });
  }
}
