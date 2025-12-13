import {NextRequest, NextResponse} from 'next/server';
import {prisma} from '@/lib/prisma';
import {ensureCategoryExists} from '@/lib/categorySync';

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (!body.translationId) {
    return NextResponse.json({error: 'translationId required'}, {status: 400});
  }
  const queue = await prisma.approvalQueue.update({
    where: {translationId: body.translationId},
    data: {
      status: 'approved',
      reviewerId: body.reviewerId ?? 'admin',
      notes: body.notes
    },
    include: {
      translation: {include: {article: true}}
    }
  });

  const normalizedCategory = await ensureCategoryExists(queue.translation.article.category);

  await prisma.article.update({
    where: {id: queue.translation.articleId},
    data: {published: true, publishedAt: new Date(), category: normalizedCategory}
  });

  return NextResponse.json({status: 'approved'});
}
