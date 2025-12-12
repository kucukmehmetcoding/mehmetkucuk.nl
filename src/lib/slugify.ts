import slugifyBase from 'slugify';

// Locale mapping for different languages
const localeMap: Record<string, string> = {
  tr: 'tr',
  en: 'en',
  nl: 'nl',
};

/**
 * Creates SEO-friendly slug from title
 * - Converts characters properly based on language locale
 * - Turkish: ş→s, ğ→g, ü→u, ö→o, ç→c, ı→i
 * - Dutch: preserves most characters, handles ij, etc.
 * - English: standard ASCII conversion
 * - Limits to ~60 chars for SEO best practice
 * - Truncates at word boundary to avoid cut-off words
 */
export function toNewsSlug(input: string, lang: string = 'tr', maxLength: number = 60): string {
  const locale = localeMap[lang] || 'en';
  
  const fullSlug = slugifyBase(input, {
    lower: true,
    strict: true,
    locale: locale
  });
  
  // If slug is within limit, return as-is
  if (fullSlug.length <= maxLength) {
    return fullSlug;
  }
  
  // Truncate at word boundary (hyphen)
  const truncated = fullSlug.substring(0, maxLength);
  const lastHyphen = truncated.lastIndexOf('-');
  
  // If there's a hyphen, cut at word boundary; otherwise use the full truncated string
  return lastHyphen > 20 ? truncated.substring(0, lastHyphen) : truncated;
}

