import {NextRequest, NextResponse} from 'next/server';
import {validateAdminToken} from '@/lib/auth';

/**
 * Admin auth verification endpoint
 * POST /api/admin/auth
 * Body: {token: string}
 */
export async function POST(request: NextRequest) {
  try {
    const {token} = await request.json();

    const secret = process.env.ADMIN_JWT_SECRET;
    if (!secret || token !== secret) {
      return NextResponse.json({error: 'Invalid token'}, {status: 401});
    }

    return NextResponse.json({success: true});
  } catch (error) {
    return NextResponse.json({error: 'Internal server error'}, {status: 500});
  }
}
