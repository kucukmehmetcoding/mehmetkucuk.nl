import { rewriteArticle } from '@/lib/aiRewrite';
import { translateAll } from '@/lib/translate';
import { toNewsSlug } from '@/lib/slugify';
import { callFalImage } from '@/lib/fal';
import { ScrapedItem } from './dbScraper';
import { RawNewsItem } from '@/lib/scraper';

export interface EnhancedDraft {
  slug: string;
  translations: Awaited<ReturnType<typeof translateAll>>;
  sourceFingerprint: string;
  qaScore: number;
  category: string;
  feedId: string;
  feedName: string;
  sourceUrl: string;
  sourceLanguage: string;
  originalTitle: string;
  imageUrl: string | null;
}

/**
 * Pre-filter configuration
 */
interface PreFilterConfig {
  minSourceWords: number;      // Minimum words in source content
  minTitleLength: number;      // Minimum title character length
  maxTitleLength: number;      // Maximum title length (spam detection)
  minBodyLength: number;       // Minimum body character length
  blockedPatterns: RegExp[];   // Patterns to reject
}

const DEFAULT_PRE_FILTER_CONFIG: PreFilterConfig = {
  minSourceWords: 50,          // At least 50 words to have meaningful content
  minTitleLength: 20,          // Titles should be descriptive
  maxTitleLength: 300,         // Extremely long titles are often spam
  minBodyLength: 200,          // Body should have substance
  blockedPatterns: [
    /^\[ad\]/i,                // Ad content
    /sponsored\s*content/i,    // Sponsored
    /press\s*release/i,        // Press releases (often low quality)
    /^re:\s/i,                 // Reply/forward patterns
    /\[removed\]/i,            // Removed content
    /\[deleted\]/i,            // Deleted content
    /^test\s/i,                // Test posts
    /lorem\s*ipsum/i,          // Placeholder text
  ],
};

/**
 * Pre-filter result with reason
 */
interface PreFilterResult {
  pass: boolean;
  reason?: string;
  stats?: {
    wordCount: number;
    titleLength: number;
    bodyLength: number;
  };
}

/**
 * Pre-filter content BEFORE sending to AI
 * This saves API costs by rejecting low-quality content early
 */
function preFilterContent(item: ScrapedItem, config: PreFilterConfig = DEFAULT_PRE_FILTER_CONFIG): PreFilterResult {
  const title = item.title || '';
  const body = item.body || '';
  const fullContent = `${title} ${body}`;
  
  // Calculate basic stats
  const wordCount = fullContent.split(/\s+/).filter(w => w.length > 0).length;
  const titleLength = title.length;
  const bodyLength = body.length;
  
  const stats = { wordCount, titleLength, bodyLength };
  
  // Check minimum word count
  if (wordCount < config.minSourceWords) {
    return {
      pass: false,
      reason: `too_short:${wordCount}/${config.minSourceWords}_words`,
      stats,
    };
  }
  
  // Check title length
  if (titleLength < config.minTitleLength) {
    return {
      pass: false,
      reason: `title_too_short:${titleLength}/${config.minTitleLength}_chars`,
      stats,
    };
  }
  
  if (titleLength > config.maxTitleLength) {
    return {
      pass: false,
      reason: `title_too_long:${titleLength}/${config.maxTitleLength}_chars`,
      stats,
    };
  }
  
  // Check body length
  if (bodyLength < config.minBodyLength) {
    return {
      pass: false,
      reason: `body_too_short:${bodyLength}/${config.minBodyLength}_chars`,
      stats,
    };
  }
  
  // Check blocked patterns
  for (const pattern of config.blockedPatterns) {
    if (pattern.test(fullContent)) {
      return {
        pass: false,
        reason: `blocked_pattern:${pattern.source}`,
        stats,
      };
    }
  }
  
  // Check for mostly non-text content (too many URLs, emails, etc.)
  const urlCount = (fullContent.match(/https?:\/\/[^\s]+/g) || []).length;
  const textWordRatio = wordCount / (urlCount + 1);
  if (textWordRatio < 5) {
    return {
      pass: false,
      reason: `too_many_urls:ratio_${textWordRatio.toFixed(1)}`,
      stats,
    };
  }
  
  // Check for repetitive content (spam detection)
  const words = fullContent.toLowerCase().split(/\s+/);
  const uniqueWords = new Set(words);
  const uniqueRatio = uniqueWords.size / words.length;
  if (uniqueRatio < 0.3 && words.length > 50) {
    return {
      pass: false,
      reason: `repetitive_content:${(uniqueRatio * 100).toFixed(0)}%_unique`,
      stats,
    };
  }
  
  return { pass: true, stats };
}

/**
 * Calculate readability score based on sentence length and structure
 */
function readabilityScore(text: string): number {
  const sentences = text.split(/[.!?]/).filter(Boolean).length || 1;
  const words = text.split(/\s+/).length || 1;
  const avgSentenceLength = words / sentences;
  
  // Ideal average sentence length is around 15-20 words
  const idealLength = 18;
  const score = Math.max(0, 1 - Math.abs(avgSentenceLength - idealLength) / idealLength);
  
  // Check for paragraph structure (news articles should have multiple paragraphs)
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 50).length;
  const paragraphBonus = Math.min(0.1, paragraphs * 0.02); // Up to 0.1 bonus for 5+ paragraphs
  
  return Math.min(1, score + paragraphBonus);
}

/**
 * Calculate overall QA score combining multiple factors
 * UPDATED: Now requires 500+ words for professional quality
 */
function calculateQaScore(originalText: string, rewrittenText: string): number {
  const readability = readabilityScore(rewrittenText);
  
  // Word count analysis
  const originalWords = originalText.split(/\s+/).length;
  const rewrittenWords = rewrittenText.split(/\s+/).length;
  
  // MINIMUM WORD COUNT: 500 words required for professional quality
  // Scale: 0 at 0 words, 0.5 at 250 words, 1.0 at 500+ words
  const MIN_WORDS = 500;
  const wordCountScore = Math.min(1, rewrittenWords / MIN_WORDS);
  
  // Content expansion: Article should be expanded, not just rewritten
  // Good articles typically expand by 1.5x-3x from original
  const expansionRatio = rewrittenWords / Math.max(1, originalWords);
  let expansionScore: number;
  if (expansionRatio >= 1.5 && expansionRatio <= 4) {
    expansionScore = 1;
  } else if (expansionRatio >= 1 && expansionRatio < 1.5) {
    expansionScore = 0.7;
  } else if (expansionRatio > 4) {
    expansionScore = 0.8; // Slight penalty for excessive expansion
  } else {
    expansionScore = 0.5; // Article got shorter - not ideal
  }
  
  // Structure score: Check for proper journalistic structure
  const hasProperLength = rewrittenWords >= MIN_WORDS;
  const hasParagraphs = rewrittenText.split(/\n\n+/).length >= 4;
  const structureScore = (hasProperLength ? 0.5 : 0) + (hasParagraphs ? 0.5 : 0);
  
  // Weighted average - heavily weight word count
  const totalScore = (
    wordCountScore * 0.40 +    // 40% - Word count is critical
    readability * 0.25 +       // 25% - Readability
    expansionScore * 0.20 +    // 20% - Content expansion
    structureScore * 0.15      // 15% - Article structure
  );
  
  console.log(`[QA] Words: ${rewrittenWords}/${MIN_WORDS}, Readability: ${readability.toFixed(2)}, Expansion: ${expansionRatio.toFixed(1)}x, Structure: ${structureScore.toFixed(2)}, Total: ${totalScore.toFixed(2)}`);
  
  return Math.min(1, Math.max(0, totalScore));
}

/**
 * Process scraped items through AI rewriting, image generation, and translation
 * Now includes PRE-FILTERING to save AI costs
 */
export async function writeDraftsFromScraped(
  items: ScrapedItem[],
  minQaScore: number = 0.85
): Promise<{ drafts: EnhancedDraft[]; stats: { total: number; preFiltered: number; qaRejected: number; success: number } }> {
  const drafts: EnhancedDraft[] = [];
  const stats = {
    total: items.length,
    preFiltered: 0,
    qaRejected: 0,
    success: 0,
  };
  
  for (const item of items) {
    try {
      // === PRE-FILTER: Check content quality BEFORE AI processing ===
      const preFilter = preFilterContent(item);
      
      if (!preFilter.pass) {
        console.log(`[AIWriter] ⏭️ Pre-filtered: "${item.title.substring(0, 40)}..." - ${preFilter.reason}`);
        stats.preFiltered++;
        continue;
      }
      
      console.log(`[AIWriter] Processing: "${item.title.substring(0, 50)}..." (${preFilter.stats?.wordCount} words)`);
      
      // Convert ScrapedItem to RawNewsItem format for rewriting
      const rawItem: RawNewsItem = {
        title: item.title,
        body: item.body,
        url: item.link,
        source: item.feedName,
        summary: item.summary,
        publishedAt: item.pubDate || undefined,
        language: item.language,
        fingerprint: item.fingerprint,
      };
      
      // AI rewrite - now expects 500-700 words professional content
      const rewrite = await rewriteArticle(rawItem);
      
      // Calculate QA score with new 500+ word requirement
      const qaScore = calculateQaScore(item.body, rewrite.body);
      
      if (qaScore < minQaScore) {
        console.log(`[AIWriter] ✗ QA rejected: "${item.title.substring(0, 30)}..." - Score ${qaScore.toFixed(2)} < ${minQaScore}`);
        stats.qaRejected++;
        continue;
      }
      
      // Generate AI image for the article
      console.log(`[AIWriter] Generating image for: "${rewrite.title.substring(0, 40)}..."`);
      const imageUrl = await callFalImage({
        title: rewrite.title,
        category: item.category,
        tags: rewrite.tags,
      });
      
      if (imageUrl) {
        console.log(`[AIWriter] ✓ Image generated successfully`);
      } else {
        console.log(`[AIWriter] ⚠ Image generation failed, continuing without image`);
      }
      
      // Translate to all languages
      const translations = await translateAll(rewrite);
      
      // Generate slug from Turkish title (primary language)
      const slug = toNewsSlug(translations.tr?.title || rewrite.title);
      
      drafts.push({
        slug,
        translations,
        sourceFingerprint: item.fingerprint,
        qaScore,
        category: item.category,
        feedId: item.feedId,
        feedName: item.feedName,
        sourceUrl: item.link,
        sourceLanguage: item.language,
        originalTitle: item.title,
        imageUrl,
      });
      
      stats.success++;
      console.log(`[AIWriter] ✓ Draft created: "${slug}" (QA: ${qaScore.toFixed(2)}, Category: ${item.category}, Image: ${imageUrl ? 'Yes' : 'No'})`);
      
    } catch (error) {
      console.error(`[AIWriter] ✗ Error processing item "${item.title}":`, error);
    }
  }
  
  console.log(`[AIWriter] Summary: ${stats.success} success, ${stats.preFiltered} pre-filtered, ${stats.qaRejected} QA rejected (total: ${stats.total})`);
  
  return { drafts, stats };
}
