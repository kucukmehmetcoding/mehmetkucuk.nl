import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();
    const expectedToken = process.env.ADMIN_JWT_SECRET;

    if (!expectedToken) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    if (token === expectedToken) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
