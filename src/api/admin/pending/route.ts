import {NextRequest, NextResponse} from 'next/server';
import {prisma} from '@/lib/prisma';

export async function GET(_request: NextRequest) {
  const pending = await prisma.approvalQueue.findMany({
    where: {status: 'pending'},
    include: {
      translation: {include: {article: true}}
    },
    orderBy: {createdAt: 'asc'}
  });
  return NextResponse.json({pending});
}
