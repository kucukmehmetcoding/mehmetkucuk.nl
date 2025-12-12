import {NextRequest, NextResponse} from 'next/server';
import {validateAdminToken} from '@/lib/auth';

/**
 * AI Translate endpoint
 * POST /api/admin/ai/translate
 * Body: {content: string, sourceLang: string, targetLangs: string[]}
 */
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!validateAdminToken(authHeader || '')) {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  }

  try {
    const {content, sourceLang, targetLangs} = await request.json();

    if (!content || !sourceLang || !targetLangs) {
      return NextResponse.json({error: 'Missing parameters'}, {status: 400});
    }

    // TODO: Call Fal.ai translate API
    // For now, return mock response
    const translations: {[key: string]: string} = {};
    targetLangs.forEach((lang: string) => {
      translations[lang] = `[Translated to ${lang}]\n${content}`;
    });

    return NextResponse.json({translations});
  } catch (error) {
    console.error('POST /api/admin/ai/translate:', error);
    return NextResponse.json({error: 'Internal server error'}, {status: 500});
  }
}
