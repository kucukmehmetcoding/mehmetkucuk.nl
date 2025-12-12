import {NextRequest, NextResponse} from 'next/server';
import Joi from 'joi';
import type {Language} from '@prisma/client';
import {buildFromSource, buildManual, persistArticle, type TranslationPayload} from '@/api/news/create/route';

export const runtime = 'nodejs';

const itemSchema = Joi.object({
  source_url: Joi.string().uri(),
  title_tr: Joi.string(),
  summary_tr: Joi.string().allow(''),
  body_tr: Joi.string(),
  category: Joi.string().required(),
  tags: Joi.array().items(Joi.string()).default([]),
  mode: Joi.string().valid('auto', 'manual').default('manual')
}).xor('source_url', 'title_tr');

const schema = Joi.object({
  dry_run: Joi.boolean().default(false),
  items: Joi.array().items(itemSchema).min(1).max(20).required()
});

export async function POST(request: NextRequest) {
  try {
    const {value, error} = schema.validate(await request.json(), {stripUnknown: true});
    if (error) {
      return NextResponse.json({error: error.message}, {status: 400});
    }

    const results = [] as Array<{status: string; slug?: string; articleId?: string}>;
    for (const item of value.items) {
      const payload = item.source_url
        ? await buildFromSource(item.source_url, item.tags, item.category)
        : await buildManual(item);

      if (value.dry_run) {
        results.push({status: 'preview', slug: payload.slug});
        continue;
      }

      const translations = ['tr', 'en', 'nl'].reduce((acc, lang) => {
        const existing = payload.translations[lang as Language] ?? payload.translations.tr;
        if (!existing) {
          throw new Error('Translation missing');
        }
        acc[lang as Language] = existing;
        return acc;
      }, {} as Record<Language, TranslationPayload>);

      const response = await persistArticle({
        slug: payload.slug,
        category: payload.category,
        tags: payload.tags,
        imageUrl: undefined,
        translations,
        source: payload.source,
        publishNow: item.mode === 'auto'
      });

      results.push({status: response.status, slug: payload.slug, articleId: response.articleId});
    }

    return NextResponse.json({results, dry_run: value.dry_run});
  } catch (err) {
    console.error(err);
    return NextResponse.json({error: 'Bulk creation failed'}, {status: 500});
  }
}
