import {Language} from '@prisma/client';
import {Draft} from './aiWriter';
import {persistArticle, type TranslationPayload} from '@/api/news/create/route';

export async function publishDrafts(drafts: Draft[]) {
  for (const draft of drafts) {
    const translations = Object.entries(draft.translations).reduce(
      (acc, [lang, value]) => {
        acc[lang as Language] = {
          title: value.title,
          summary: value.lead,
          body: value.body,
          seoTitle: value.seo_title,
          metaDescription: value.meta_description,
          author: 'MK News Bot'
        } satisfies TranslationPayload;
        return acc;
      },
      {} as Record<Language, TranslationPayload>
    );

    await persistArticle({
      slug: draft.slug,
      category: 'ai',
      tags: draft.translations.tr.tags ?? ['ai'],
      imageUrl: undefined,
      translations,
      source: undefined,
      publishNow: draft.qaScore >= 0.85
    });
  }
}
