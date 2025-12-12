import {cacheValue, getCachedValue} from './cache';
import {callFalTranslate, TranslateOutput} from './fal';
import {RewriteResult} from './aiRewrite';

const SUPPORTED_TARGETS = ['tr', 'nl'] as const;

export type TranslationMap = Record<'tr' | 'en' | 'nl', RewriteResult>;

/**
 * Translate from English (base) to target language
 */
export async function translateFromEnglish(
  base: RewriteResult,
  target: 'tr' | 'nl'
): Promise<RewriteResult> {
  const cacheKey = `groq:translate:${target}:${base.title.slice(0, 50)}`;
  const cached = await getCachedValue<RewriteResult>(cacheKey);
  if (cached) return cached;

  const output = await callFalTranslate(target, base as unknown as Record<string, unknown>);
  
  const result: RewriteResult = {
    title: output.title,
    lead: output.lead,
    body: output.body,
    tags: base.tags, // Keep original tags
    seo_title: output.seo_title,
    meta_description: output.meta_description,
  };
  
  await cacheValue(cacheKey, result, 86400);
  return result;
}

/**
 * Translate base content (English) to all supported languages
 * AI rewrite produces English, we translate to Turkish and Dutch
 */
export async function translateAll(base: RewriteResult): Promise<TranslationMap> {
  // Base is in English (from AI rewrite)
  // Translate to Turkish and Dutch in parallel
  const [tr, nl] = await Promise.all([
    translateFromEnglish(base, 'tr'),
    translateFromEnglish(base, 'nl'),
  ]);
  
  return {
    en: base,  // English is the original
    tr,        // Turkish translation
    nl,        // Dutch translation
  };
}
