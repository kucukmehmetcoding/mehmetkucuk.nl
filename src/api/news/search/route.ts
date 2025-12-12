import {NextRequest, NextResponse} from 'next/server';
import {searchArticles} from '@/lib/db';
import {isLocale} from '@/lib/i18n';
import type {Language} from '@prisma/client';

export async function GET(request: NextRequest) {
  const {searchParams} = new URL(request.url);
  const q = searchParams.get('q');
  const lang = searchParams.get('lang') ?? 'tr';
  const take = Number(searchParams.get('take') ?? 20);
  const skip = Number(searchParams.get('skip') ?? 0);

  if (!q || q.length < 2) {
    return NextResponse.json({error: 'q param required'}, {status: 400});
  }
  if (!isLocale(lang)) {
    return NextResponse.json({error: 'unsupported lang'}, {status: 400});
  }

  const results = await searchArticles(q, lang as Language, take, skip);
  return NextResponse.json({results});
}
