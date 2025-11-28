import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

// GET - Fetch single blog post (public)
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const post = await prisma.blogPost.findUnique({
      where: { id },
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    // Increment view count
    await prisma.blogPost.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog post' },
      { status: 500 }
    );
  }
}

// PUT - Update blog post
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const data = await request.json();

    // Calculate reading time
    const wordCount = data.content_tr.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200);

    const existingPost = await prisma.blogPost.findUnique({
      where: { id },
    });

    const post = await prisma.blogPost.update({
      where: { id },
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
        publishedAt: data.published && !existingPost?.published ? new Date() : existingPost?.publishedAt,
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error updating blog post:', error);
    return NextResponse.json(
      { error: 'Failed to update blog post' },
      { status: 500 }
    );
  }
}

// PATCH - Partial update (e.g., toggle publish)
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const data = await request.json();
    
    const existingPost = await prisma.blogPost.findUnique({
      where: { id },
    });

    const updateData: Record<string, unknown> = { ...data };
    
    // Set publishedAt when publishing for the first time
    if (data.published && !existingPost?.published) {
      updateData.publishedAt = new Date();
    }

    const post = await prisma.blogPost.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error updating blog post:', error);
    return NextResponse.json(
      { error: 'Failed to update blog post' },
      { status: 500 }
    );
  }
}

// DELETE - Delete blog post
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await prisma.blogPost.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    return NextResponse.json(
      { error: 'Failed to delete blog post' },
      { status: 500 }
    );
  }
}
