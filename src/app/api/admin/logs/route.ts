import { NextRequest, NextResponse } from 'next/server';

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

    const limit = Math.min(Number(req.nextUrl.searchParams.get('limit')) || 10, 100);

    // Mock logs data
    const mockLogs = [
      {
        id: '1',
        timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
        action: 'Post Published',
        user: 'admin',
        status: 'success',
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
        action: 'Post Created',
        user: 'admin',
        status: 'success',
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
        action: 'AI Rewrite',
        user: 'admin',
        status: 'success',
      },
      {
        id: '4',
        timestamp: new Date(Date.now() - 4 * 3600000).toISOString(),
        action: 'Category Created',
        user: 'admin',
        status: 'success',
      },
      {
        id: '5',
        timestamp: new Date(Date.now() - 6 * 3600000).toISOString(),
        action: 'Media Uploaded',
        user: 'admin',
        status: 'success',
      },
    ];

    return NextResponse.json(mockLogs.slice(0, limit));
  } catch (error) {
    console.error('Logs error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
