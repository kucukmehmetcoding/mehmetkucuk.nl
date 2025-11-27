import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { enabled } = await request.json();
    
    const response = NextResponse.json({ message: 'Maintenance mode updated' });
    
    if (enabled) {
      response.cookies.set('maintenance-mode', 'true', {
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 24 * 7 // 1 week
      });
    } else {
      response.cookies.delete('maintenance-mode');
    }
    
    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update maintenance mode' }, { status: 500 });
  }
}