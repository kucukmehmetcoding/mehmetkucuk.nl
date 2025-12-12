import {NextRequest, NextResponse} from 'next/server';
import {Language} from '@prisma/client';
import {prisma} from '@/lib/prisma';
import {rewriteArticle} from '@/lib/aiRewrite';
import {translateAll} from '@/lib/translate';
import {fetchHtmlFallback, fetchRssItems} from '@/lib/scraper';
import {toNewsSlug} from '@/lib/slugify';
import {enqueueApproval} from '@/lib/db';
import Joi from 'joi';

export const runtime = 'nodejs';

export type TranslationPayload = {
  title: string;
  summary: string;
  body: string;
  seoTitle: string;
  metaDescription: string;
  author: string;
};

type NormalizedPayload = {
  slug: string;
  category: string;
  tags: string[];
  imageUrl?: string;
  translations: Partial<Record<Language, TranslationPayload>>;
  source?: {
    originalSource: string;
    url: string;
    fingerprint: string;
    language: string;
    wordCount: number;
  };
};

const schema = Joi.object({
  source_url: Joi.string().uri(),
  rss_url: Joi.string().uri(),
  title_tr: Joi.string(),
  summary_tr: Joi.string().allow(''),
  body_tr: Joi.string(),
  category: Joi.string().required(),
  tags: Joi.array().items(Joi.string()).default([]),
  mode: Joi.string().valid('auto', 'manual').default('manual')
}).xor('source_url', 'title_tr');

export type CreateNewsResponse = {
  articleId: string;
  translationIds: Record<string, string>;
  status: 'pending' | 'published';
};

export async function persistArticle(input: {
  slug: string;
  category: string;
  tags: string[];
  imageUrl?: string;
  translations: Record<Language, TranslationPayload>;
  source?: {originalSource: string; url: string; fingerprint: string; language: string; wordCount: number};
  publishNow: boolean;
}): Promise<CreateNewsResponse> {
  const result = await prisma.$transaction(async (tx) => {
    const article = await tx.article.create({
      data: {
        slug: input.slug,
        category: input.category,
        tags: input.tags,
        imageUrl: input.imageUrl,
        published: input.publishNow,
        publishedAt: input.publishNow ? new Date() : null
      }
    });

    const translationRecords = await Promise.all(
      (Object.keys(input.translations) as Language[]).map((lang) => {
        const payload = input.translations[lang];
        // Generate language-specific slug from the title of each translation
        const translationSlug = toNewsSlug(payload.title, lang);
        return tx.translation.create({
          data: {
            lang,
            slug: translationSlug, // SEO-friendly slug for this language
            title: payload.title,
            summary: payload.summary,
            body: payload.body,
            seoTitle: payload.seoTitle,
            metaDescription: payload.metaDescription,
            author: payload.author,
            article: {connect: {id: article.id}}
          }
        });
      })
    );

    if (input.source) {
      await tx.source.create({
        data: {
          articleId: article.id,
          originalSource: input.source.originalSource,
          sourceUrl: input.source.url,
          sourceFingerprint: input.source.fingerprint,
          language: input.source.language,
          wordCount: input.source.wordCount
        }
      });
    }

    return {article, translations: translationRecords};
  });

  const translationIds = result.translations.reduce<Record<string, string>>((acc: Record<string, string>, translation) => {
    acc[translation.lang] = translation.id;
    return acc;
  }, {});

  if (!input.publishNow) {
    await Promise.all(Object.values(translationIds).map((id) => enqueueApproval(id)));
  }

  return {
    articleId: result.article.id,
    translationIds,
    status: input.publishNow ? 'published' : 'pending'
  };
}

export async function buildFromSource(sourceUrl: string, tags: string[], category: string): Promise<NormalizedPayload> {
  const rssItems = await fetchRssItems(sourceUrl).catch(() => []);
  const fallback = rssItems[0] ?? (await fetchHtmlFallback(sourceUrl));
  if (!fallback) {
    throw new Error('Unable to fetch content');
  }
  const rewrite = await rewriteArticle(fallback);
  const translations = await translateAll(rewrite);

  return {
    slug: toNewsSlug(rewrite.title),
    translations: {
      tr: {
        title: translations.tr.title,
        summary: translations.tr.lead,
        body: translations.tr.body,
        seoTitle: translations.tr.seo_title,
        metaDescription: translations.tr.meta_description,
        author: 'MK News Desk'
      },
      en: {
        title: translations.en.title,
        summary: translations.en.lead,
        body: translations.en.body,
        seoTitle: translations.en.seo_title,
        metaDescription: translations.en.meta_description,
        author: 'MK News Desk'
      },
      nl: {
        title: translations.nl.title,
        summary: translations.nl.lead,
        body: translations.nl.body,
        seoTitle: translations.nl.seo_title,
        metaDescription: translations.nl.meta_description,
        author: 'MK News Desk'
      }
    },
    source: {
      originalSource: fallback.source,
      url: fallback.url,
      fingerprint: fallback.fingerprint,
      language: fallback.language,
      wordCount: fallback.body.split(' ').length
    },
    tags,
    category
  };
}

export async function buildManual(body: {
  title_tr: string;
  summary_tr?: string;
  body_tr: string;
  category: string;
  tags: string[];
}): Promise<NormalizedPayload> {
  const translation = {
    title: body.title_tr,
    lead: body.summary_tr ?? body.body_tr.slice(0, 120),
    body: body.body_tr,
    tags: body.tags,
    seo_title: body.title_tr,
    meta_description: body.summary_tr ?? body.body_tr.slice(0, 160)
  };

  return {
    slug: toNewsSlug(body.title_tr),
    translations: {
      tr: {
        title: translation.title,
        summary: translation.lead,
        body: translation.body,
        seoTitle: translation.seo_title,
        metaDescription: translation.meta_description,
        author: 'MK News Desk'
      }
    },
    category: body.category,
    tags: body.tags
  };
}

export async function handleCreateNews(request: NextRequest) {
  const json = await request.json();
  const {value, error} = schema.validate(json, {stripUnknown: true});
  if (error) {
    return NextResponse.json({error: error.message}, {status: 400});
  }

  let payload: NormalizedPayload;

  if (value.source_url) {
    payload = await buildFromSource(value.source_url, value.tags, value.category);
  } else {
    payload = await buildManual(value);
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
    publishNow: value.mode === 'auto'
  });

  return NextResponse.json(response, {status: 201});
}

export async function POST(request: NextRequest) {
  try {
    return await handleCreateNews(request);
  } catch (err) {
    console.error(err);
    return NextResponse.json({error: 'Failed to create news'}, {status: 500});
  }
}
