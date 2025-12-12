import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Fetch active ad for a placement
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const placement = searchParams.get('placement');
  const lang = searchParams.get('lang') || 'tr';

  if (!placement) {
    return NextResponse.json({ error: 'Placement required' }, { status: 400 });
  }

  try {
    // Find active slot for this placement
    const slot = await prisma.adSlot.findFirst({
      where: {
        placement: placement as any,
        isActive: true,
      },
      orderBy: {
        priority: 'desc',
      },
      include: {
        advertisements: {
          where: {
            isActive: true,
            OR: [
              { startDate: null },
              { startDate: { lte: new Date() } },
            ],
            AND: [
              {
                OR: [
                  { endDate: null },
                  { endDate: { gte: new Date() } },
                ],
              },
            ],
          },
        },
      },
    });

    if (!slot || slot.advertisements.length === 0) {
      return NextResponse.json({ slot: null, ad: null });
    }

    // Filter by language if targetLangs is set
    let eligibleAds = slot.advertisements.filter((ad) => {
      if (ad.targetLangs.length === 0) return true;
      return ad.targetLangs.includes(lang);
    });

    if (eligibleAds.length === 0) {
      return NextResponse.json({ slot: null, ad: null });
    }

    // Random selection among eligible ads
    const randomIndex = Math.floor(Math.random() * eligibleAds.length);
    const selectedAd = eligibleAds[randomIndex];

    // Track impression
    await prisma.advertisement.update({
      where: { id: selectedAd.id },
      data: { impressions: { increment: 1 } },
    });

    return NextResponse.json({
      slot: {
        id: slot.id,
        name: slot.name,
        placement: slot.placement,
        width: slot.width,
        height: slot.height,
        isActive: slot.isActive,
      },
      ad: selectedAd,
    });
  } catch (error) {
    console.error('Error fetching ad:', error);
    return NextResponse.json({ error: 'Failed to fetch ad' }, { status: 500 });
  }
}
