import {NextRequest, NextResponse} from 'next/server';
import {prisma} from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (!body.translationId) {
    return NextResponse.json({error: 'translationId required'}, {status: 400});
  }
  await prisma.approvalQueue.update({
    where: {translationId: body.translationId},
    data: {
      status: 'rejected',
      reviewerId: body.reviewerId ?? 'admin',
      notes: body.notes
    }
  });
  return NextResponse.json({status: 'rejected'});
}
