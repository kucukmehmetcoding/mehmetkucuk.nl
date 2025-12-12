import {load} from 'cheerio';

export function cleanHtml(html: string) {
  const $ = load(html);
  $('script, style, noscript, iframe').remove();
  const text = $('body').text().replace(/\s+/g, ' ').trim();
  return {html: $('body').html() ?? '', text};
}
