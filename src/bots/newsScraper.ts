import {fetchHtmlFallback, fetchRssItems} from '@/lib/scraper';
import {computeSimHash, looksDuplicate} from './dedupe';
import {articlesProcessedTotal} from '@/api/metrics/route';

const highPrioritySources = [
  'https://www.theverge.com/rss/index.xml',
  'https://news.ycombinator.com/rss'
];

const lowPrioritySources = [
  'https://techcrunch.com/feed/',
  'https://www.wired.com/feed/rss'
];

const simhashCache: string[] = [];

export async function scrape(priority: 'high' | 'low') {
  const sources = priority === 'high' ? highPrioritySources : lowPrioritySources;
  const items = [];
  for (const url of sources) {
    try {
      const rssItems = await fetchRssItems(url);
      for (const item of rssItems) {
        const simhash = computeSimHash(item.body);
        if (looksDuplicate(simhashCache, simhash)) {
          continue;
        }
        simhashCache.push(simhash);
        items.push(item);
      }
    } catch (err) {
      console.warn('RSS failed, falling back to HTML', url, err);
      const fallback = await fetchHtmlFallback(url);
      if (fallback) {
        const simhash = computeSimHash(fallback.body);
        if (!looksDuplicate(simhashCache, simhash)) {
          simhashCache.push(simhash);
          items.push(fallback);
        }
      }
    }
  }
  articlesProcessedTotal.inc(items.length);
  return items;
}
