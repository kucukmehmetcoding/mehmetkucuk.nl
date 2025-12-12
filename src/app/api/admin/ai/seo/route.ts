import {NextRequest, NextResponse} from 'next/server';
import {validateAdminToken} from '@/lib/auth';

/**
 * AI SEO optimization endpoint
 * POST /api/admin/ai/seo
 * Body: {title: string, body: string}
 */
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!validateAdminToken(authHeader || '')) {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  }

  try {
    const {title, body} = await request.json();

    if (!title || !body) {
      return NextResponse.json({error: 'Missing title or body'}, {status: 400});
    }

    // TODO: Call Fal.ai or external SEO API
    // For now, return mock response
    const seoTitle = `${title} | MK News`;
    const metaDescription = body.substring(0, 160);

    return NextResponse.json({seoTitle, metaDescription});
  } catch (error) {
    console.error('POST /api/admin/ai/seo:', error);
    return NextResponse.json({error: 'Internal server error'}, {status: 500});
  }
}
