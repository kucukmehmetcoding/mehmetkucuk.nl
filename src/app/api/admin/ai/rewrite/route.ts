import {NextRequest, NextResponse} from 'next/server';
import {validateAdminToken} from '@/lib/auth';

/**
 * AI Rewrite endpoint
 * POST /api/admin/ai/rewrite
 * Body: {content: string}
 */
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!validateAdminToken(authHeader || '')) {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  }

  try {
    const {content} = await request.json();

    if (!content) {
      return NextResponse.json({error: 'Missing content'}, {status: 400});
    }

    // TODO: Call Fal.ai rewrite API
    // For now, return mock response
    const rewrittenContent = `[Rewritten by AI]\n${content}`;

    return NextResponse.json({content: rewrittenContent});
  } catch (error) {
    console.error('POST /api/admin/ai/rewrite:', error);
    return NextResponse.json({error: 'Internal server error'}, {status: 500});
  }
}
