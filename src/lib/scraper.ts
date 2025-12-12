import crypto from 'crypto';
import Parser from 'rss-parser';
import {load} from 'cheerio';
import {franc} from 'franc';
import {cleanHtml} from './htmlCleaner';

const parser = new Parser({timeout: 10000});

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
  const feed = await parser.parseURL(feedUrl);
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
