import {RawNewsItem} from './scraper';
import {callFalRewrite} from './fal';
import {cacheValue, getCachedValue} from './cache';

const CACHE_TTL = 60 * 60 * 24; // 24h reuse for identical fingerprints

export type RewriteResult = {
  title: string;
  lead: string;
  body: string;
  tags: string[];
  seo_title: string;
  meta_description: string;
};

export async function rewriteArticle(item: RawNewsItem): Promise<RewriteResult> {
  const cacheKey = `fal:rewrite:${item.fingerprint}`;
  const cached = await getCachedValue<RewriteResult>(cacheKey);
  if (cached) return cached;

  const payload = {
    source_title: item.title,
    source_url: item.url,
    short_extract: item.summary.slice(0, 1200)
  };

  const output = await callFalRewrite(payload);
  const parsed: RewriteResult = {
    title: output.title,
    lead: output.lead,
    body: output.body,
    tags: output.tags ?? [],
    seo_title: output.seo_title,
    meta_description: output.meta_description
  };

  await cacheValue(cacheKey, parsed, CACHE_TTL);
  return parsed;
}

export async function rewriteBatch(items: RawNewsItem[], batchSize = 3) {
  const slices: RewriteResult[] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const payload = batch.map((b) => ({
      source_title: b.title,
      source_url: b.url,
      short_extract: b.summary.slice(0, 800)
    }));
    const cacheableResults: RewriteResult[] = [];
    for (const single of batch) {
      cacheableResults.push(await rewriteArticle(single));
    }
    slices.push(...cacheableResults);
  }
  return slices;
}
