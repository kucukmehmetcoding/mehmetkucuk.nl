import {prisma} from '@/lib/prisma';
import {NextRequest, NextResponse} from 'next/server';
import {getCategoryName, getAllCategoryIds} from '@/lib/categories';

export async function GET(request: NextRequest) {
  try {
    const lang = (request.nextUrl.searchParams.get('lang') || 'tr') as any;

    const articles = await prisma.article.findMany({
      include: {
        translations: {
          where: {lang},
          take: 1,
        },
      },
      orderBy: {createdAt: 'desc'},
      take: 100,
    });

    // Get all category IDs (not just from existing articles)
    const categoryIds = getAllCategoryIds();

    // Convert category IDs to translated names
    const categories = categoryIds.map((catId) => getCategoryName(catId, lang));

    return NextResponse.json({articles, categories}, {status: 200});
  } catch (error) {
    return NextResponse.json({error: String(error)}, {status: 500});
  }
}
