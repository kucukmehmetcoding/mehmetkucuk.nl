import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Fetch all blog posts
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const published = searchParams.get('published');
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');

    const where: {
      published?: boolean;
      category?: string;
      featured?: boolean;
    } = {};
    
    if (published === 'true') {
      where.published = true;
    }
    
    if (category) {
      where.category = category;
    }
    
    if (featured === 'true') {
      where.featured = true;
    }

    const posts = await prisma.blogPost.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        content: true,
        coverImage: true,
        author: true,
        category: true,
        tags: true,
        published: true,
        featured: true,
        views: true,
        readingTime: true,
        metaTitle: true,
        metaDesc: true,
        createdAt: true,
        updatedAt: true,
        publishedAt: true,
      },
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    );
  }
}

// POST - Create new blog post
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    // Calculate reading time (average 200 words per minute)
    const wordCount = data.content_tr.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200);

    const post = await prisma.blogPost.create({
      data: {
        slug: data.slug,
        title: JSON.stringify({
          tr: data.title_tr,
          en: data.title_en,
        }),
        excerpt: JSON.stringify({
          tr: data.excerpt_tr,
          en: data.excerpt_en,
        }),
        content: JSON.stringify({
          tr: data.content_tr,
          en: data.content_en,
        }),
        coverImage: data.coverImage || null,
        author: data.author,
        category: data.category,
        tags: data.tags,
        published: data.published,
        featured: data.featured,
        readingTime,
        metaTitle: JSON.stringify({
          tr: data.metaTitle_tr || data.title_tr,
          en: data.metaTitle_en || data.title_en,
        }),
        metaDesc: JSON.stringify({
          tr: data.metaDesc_tr || data.excerpt_tr,
          en: data.metaDesc_en || data.excerpt_en,
        }),
        publishedAt: data.published ? new Date() : null,
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error('Error creating blog post:', error);
    return NextResponse.json(
      { error: 'Failed to create blog post' },
      { status: 500 }
    );
  }
}
