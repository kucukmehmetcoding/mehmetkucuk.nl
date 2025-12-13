import crypto from 'crypto';
import Parser from 'rss-parser';
import {load} from 'cheerio';
import {franc} from 'franc';
import {cleanHtml} from './htmlCleaner';

const parser = new Parser({timeout: 10000});

const DEFAULT_RSS_UA =
  process.env.RSS_FETCH_USER_AGENT ||
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

async function fetchWithTimeout(
  url: string,
  {
    timeoutMs,
    headers,
  }: {
    timeoutMs: number;
    headers: Record<string, string>;
  }
) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      redirect: 'follow',
      headers,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(id);
  }
}

async function fetchRssXml(feedUrl: string): Promise<string> {
  const baseHeaders = {
    'user-agent': DEFAULT_RSS_UA,
    accept: 'application/rss+xml, application/atom+xml, application/xml;q=0.9, text/xml;q=0.8, */*;q=0.7',
    'accept-language': 'en-US,en;q=0.9,tr;q=0.8,nl;q=0.7',
    'cache-control': 'no-cache',
    pragma: 'no-cache',
  };

  const res = await fetchWithTimeout(feedUrl, {timeoutMs: 15000, headers: baseHeaders});
  if (!res.ok) {
    // Some providers block unknown UAs. Retry once with a more explicit bot UA.
    if (res.status === 403 || res.status === 429) {
      const retry = await fetchWithTimeout(feedUrl, {
        timeoutMs: 15000,
        headers: {
          ...baseHeaders,
          'user-agent': 'MKNewsBot/1.0 (+https://mehmetkucuk.nl)',
        },
      });
      if (!retry.ok) {
        throw new Error(`HTTP ${retry.status} fetching RSS`);
      }
      return await retry.text();
    }
    throw new Error(`HTTP ${res.status} fetching RSS`);
  }

  const contentType = res.headers.get('content-type') || '';
  // Many feeds return text/plain; don't over-reject.
  if (contentType && !/(xml|rss|atom|text\/plain)/i.test(contentType)) {
    // Still read body so errors show useful details.
    const body = await res.text();
    throw new Error(`Unexpected content-type: ${contentType}. Body starts: ${body.slice(0, 120)}`);
  }
  return await res.text();
}

export type RawNewsItem = {
  title: string;
  url: string;
  source: string;
  publishedAt?: Date;
  summary: string;
  body: string;
  language: string;
  fingerprint: string;
};

async function summarize(title: string, content: string) {
  const normalized = content.replace(/\s+/g, ' ').trim();
  if (!normalized) {
    return title;
  }
  const sentences = normalized.split(/(?<=[.!?])\s+/).filter(Boolean);
  const selection = sentences.slice(0, 3).join(' ');
  const fallback = normalized.slice(0, 400);
  return (selection || fallback || title).slice(0, 400);
}

export async function fetchRssItems(feedUrl: string): Promise<RawNewsItem[]> {
  const xml = await fetchRssXml(feedUrl);
  const feed = await parser.parseString(xml);
  const items: RawNewsItem[] = [];
  for (const entry of feed.items) {
    if (!entry.link || !entry.title) continue;
    const html = entry['content:encoded'] || entry.content || '';
    const {text} = cleanHtml(html);
    const summary = await summarize(entry.title, text);
    const language = franc(text || entry.title, {minLength: 3});
    const fingerprint = crypto
      .createHash('sha256')
      .update(`${entry.title}|${feed.title}|${entry.isoDate ?? ''}`)
      .digest('hex');
    items.push({
      title: entry.title,
      url: entry.link,
      source: feed.title ?? feedUrl,
      publishedAt: entry.isoDate ? new Date(entry.isoDate) : undefined,
      summary,
      body: text,
      language,
      fingerprint
    });
  }
  return items;
}

export async function fetchHtmlFallback(url: string): Promise<RawNewsItem | null> {
  const res = await fetch(url, {
    headers: {'user-agent': 'MKNewsBot/1.0 (+https://mehmetkucuk.nl)'}
  });
  if (!res.ok) {
    return null;
  }
  const html = await res.text();
  const $ = load(html);
  const title = $('meta[property="og:title"]').attr('content') || $('title').text();
  const dateStr = $('meta[property="article:published_time"]').attr('content');
  const {text, html: cleaned} = cleanHtml(html);
  const summary = await summarize(title, text);
  const fingerprint = crypto
    .createHash('sha256')
    .update(`${title}|${url}`)
    .digest('hex');
  return {
    title,
    url,
    source: new URL(url).hostname,
    publishedAt: dateStr ? new Date(dateStr) : undefined,
    summary,
    body: cleaned,
    language: franc(text, {minLength: 3}),
    fingerprint
  };
}
