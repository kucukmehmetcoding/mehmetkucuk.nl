import {rewriteArticle} from '@/lib/aiRewrite';
import {translateAll} from '@/lib/translate';
import {RawNewsItem} from '@/lib/scraper';
import {toNewsSlug} from '@/lib/slugify';

export type Draft = {
  slug: string;
  translations: Awaited<ReturnType<typeof translateAll>>;
  sourceFingerprint: string;
  qaScore: number;
};

function readabilityScore(text: string) {
  const sentences = text.split(/[.!?]/).filter(Boolean).length || 1;
  const words = text.split(/\s+/).length || 1;
  const avgSentence = words / sentences;
  return Math.max(0, 1 - Math.abs(avgSentence - 18) / 18);
}

export async function writeDrafts(rawItems: RawNewsItem[]): Promise<Draft[]> {
  const drafts: Draft[] = [];
  for (const item of rawItems) {
    const rewrite = await rewriteArticle(item);
    const translations = await translateAll(rewrite);
    const qaScore = readabilityScore(rewrite.body);
    drafts.push({
      slug: toNewsSlug(rewrite.title),
      translations,
      sourceFingerprint: item.fingerprint,
      qaScore
    });
  }
  return drafts;
}
