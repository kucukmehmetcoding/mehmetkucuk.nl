import {NextRequest, NextResponse} from 'next/server';
import {validateAdminToken} from '@/lib/auth';
import {prisma} from '@/lib/prisma';

/**
 * Get paginated posts list with filters
 * GET /api/admin/posts?page=1&status=all&search=...
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!validateAdminToken(authHeader || '')) {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  }

  const {searchParams} = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const status = searchParams.get('status') || 'all';
  const search = searchParams.get('search') || '';

  const pageSize = 20;
  const skip = (page - 1) * pageSize;

  try {
    const where: any = {};

    if (status !== 'all') {
      where.published = status === 'published';
    }

    if (search) {
      where.OR = [
        {slug: {contains: search, mode: 'insensitive'}},
        {translations: {some: {title: {contains: search, mode: 'insensitive'}}}},
      ];
    }

    const posts = await prisma.article.findMany({
      where,
      include: {translations: true},
      orderBy: {createdAt: 'desc'},
      skip,
      take: pageSize,
    });

    const total = await prisma.article.count({where});

    return NextResponse.json({
      posts,
      pagination: {page, pageSize, total, pages: Math.ceil(total / pageSize)},
    });
  } catch (error) {
    console.error('GET /api/admin/posts:', error);
    return NextResponse.json({error: 'Internal server error'}, {status: 500});
  }
}

/**
 * Create new post
 * POST /api/admin/posts
 */
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!validateAdminToken(authHeader || '')) {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  }

  try {
    const data = await request.json();

    // TODO: Validate with Zod PostSchema
    // TODO: Create article and translations
    // TODO: Save to database

    return NextResponse.json({message: 'Post created'}, {status: 201});
  } catch (error) {
    console.error('POST /api/admin/posts:', error);
    return NextResponse.json({error: 'Internal server error'}, {status: 500});
  }
}
