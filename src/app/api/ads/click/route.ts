import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST - Track ad click
export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Ad ID required' }, { status: 400 });
  }

  try {
    await prisma.advertisement.update({
      where: { id },
      data: { clicks: { increment: 1 } },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking click:', error);
    return NextResponse.json({ error: 'Failed to track click' }, { status: 500 });
  }
}
