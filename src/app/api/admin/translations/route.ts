import {prisma} from '@/lib/prisma';
import {NextRequest, NextResponse} from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const lang = request.nextUrl.searchParams.get('lang') || 'tr';

    const translations = await prisma.translation.findMany({
      orderBy: {createdAt: 'desc'},
      take: 100,
    });

    return NextResponse.json({translations}, {status: 200});
  } catch (error) {
    return NextResponse.json({error: String(error)}, {status: 500});
  }
}
