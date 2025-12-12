import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    // Check auth
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    const expectedToken = process.env.ADMIN_JWT_SECRET;

    if (!expectedToken) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    if (token !== expectedToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Total posts
    const totalPosts = await prisma.article.count({
      where: { published: true },
    });

    // Published today
    const publishedToday = await prisma.article.count({
      where: {
        published: true,
        publishedAt: {
          gte: today,
        },
      },
    });

    // Pending approvals
    const pendingApprovals = await prisma.approvalQueue.count({
      where: { status: 'pending' },
    });

    // Daily average (last 30 days)
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const postsLast30Days = await prisma.article.count({
      where: {
        published: true,
        publishedAt: {
          gte: thirtyDaysAgo,
          lte: today,
        },
      },
    });

    const dailyAverage = Math.round(postsLast30Days / 30);

    return NextResponse.json({
      totalPosts,
      publishedToday,
      pendingApprovals,
      dailyAverage,
    });
  } catch (error) {
    console.error('KPIs error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
