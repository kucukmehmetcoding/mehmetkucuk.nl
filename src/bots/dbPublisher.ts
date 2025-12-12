import { Language } from '@prisma/client';
import { EnhancedDraft } from './dbAiWriter';
import { persistArticle, type TranslationPayload } from '@/api/news/create/route';
import { prisma } from '@/lib/prisma';
import { markItemsProcessed } from './dbScraper';

interface PublishResult {
  published: number;
  skipped: number;
  errors: string[];
  articleIds: string[];
}

// Cache for valid categories
let validCategoriesCache: Set<string> | null = null;
let categoryCacheTime: number = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get valid categories from database (with caching)
 */
async function getValidCategories(): Promise<Set<string>> {
  const now = Date.now();
  
  // Return cached if valid
  if (validCategoriesCache && (now - categoryCacheTime) < CACHE_TTL) {
    return validCategoriesCache;
  }
  
  // Fetch from database
  const categories = await prisma.category.findMany({
    select: { slug: true },
  });
  
  validCategoriesCache = new Set(categories.map(c => c.slug));
  categoryCacheTime = now;
  
  console.log(`[Publisher] Loaded ${validCategoriesCache.size} valid categories: ${Array.from(validCategoriesCache).join(', ')}`);
  
  return validCategoriesCache;
}

/**
 * Validate and normalize category
 * Returns the category slug if valid, or 'technology' as fallback
 */
async function validateCategory(category: string): Promise<{ valid: boolean; category: string }> {
  const validCategories = await getValidCategories();
  
  // Direct match
  if (validCategories.has(category)) {
    return { valid: true, category };
  }
  
  // Try lowercase
  const lowerCategory = category.toLowerCase();
  if (validCategories.has(lowerCategory)) {
    return { valid: true, category: lowerCategory };
  }
  
  // Category mapping for common variations
  const categoryMapping: Record<string, string> = {
    'tech': 'technology',
    'artificial-intelligence': 'ai',
    'machine-learning': 'ai',
    'ml': 'ai',
    'cryptocurrency': 'crypto',
    'blockchain': 'crypto',
    'bitcoin': 'crypto',
    'cybersecurity': 'security',
    'infosec': 'security',
    'hacking': 'security',
    'dev': 'programming',
    'development': 'programming',
    'coding': 'programming',
    'games': 'gaming',
    'game': 'gaming',
    'esports': 'gaming',
    'space-tech': 'space',
    'astronomy': 'space',
    'nasa': 'space',
    'smartphones': 'mobile',
    'apps': 'mobile',
    'ios': 'mobile',
    'android': 'mobile',
    'hardware': 'gadgets',
    'devices': 'gadgets',
    'startups': 'business',
    'finance': 'business',
    'enterprise': 'business',
  };
  
  // Check mapping
  const mappedCategory = categoryMapping[lowerCategory];
  if (mappedCategory && validCategories.has(mappedCategory)) {
    console.log(`[Publisher] Mapped category "${category}" → "${mappedCategory}"`);
    return { valid: true, category: mappedCategory };
  }
  
  // Fallback to technology
  console.warn(`[Publisher] Unknown category "${category}", using fallback "technology"`);
  return { valid: false, category: 'technology' };
}

/**
 * Publish drafts with category from RSS feed
 */
export async function publishDraftsWithCategory(
  drafts: EnhancedDraft[],
  autoPublish: boolean = true
): Promise<PublishResult> {
  const result: PublishResult = {
    published: 0,
    skipped: 0,
    errors: [],
    articleIds: [],
  };
  
  const processedGuids: string[] = [];
  const articleIds: string[] = [];
  
  for (const draft of drafts) {
    try {
      // Validate category before publishing
      const { valid, category } = await validateCategory(draft.category);
      if (!valid) {
        console.log(`[Publisher] Category corrected: "${draft.category}" → "${category}" for "${draft.slug}"`);
      }
      
      console.log(`[Publisher] Publishing: "${draft.slug}" (Category: ${category})`);
      
      // Convert translations to payload format
      const translations = Object.entries(draft.translations).reduce(
        (acc, [lang, value]) => {
          if (value && ['tr', 'en', 'nl'].includes(lang)) {
            acc[lang as Language] = {
              title: value.title,
              summary: value.lead,
              body: value.body,
              seoTitle: value.seo_title,
              metaDescription: value.meta_description,
              author: 'MK News Bot',
            } satisfies TranslationPayload;
          }
          return acc;
        },
        {} as Record<Language, TranslationPayload>
      );
      
      // Ensure we have at least Turkish translation
      if (!translations.tr) {
        console.warn(`[Publisher] Skipping "${draft.slug}" - no Turkish translation`);
        result.skipped++;
        continue;
      }
      
      // Extract tags from translations
      const tags = draft.translations.tr?.tags || [category];
      
      // Persist the article with validated category
      const article = await persistArticle({
        slug: draft.slug,
        category, // Use validated category
        tags,
        imageUrl: draft.imageUrl || undefined, // Use AI-generated image
        translations,
        source: {
          originalSource: draft.feedName,
          url: draft.sourceUrl,
          fingerprint: draft.sourceFingerprint,
          language: draft.sourceLanguage,
          wordCount: draft.translations.tr?.body?.split(/\s+/).length || 0,
        },
        publishNow: autoPublish, // Publish all drafts that pass QA threshold
      });
      
      if (article) {
        result.published++;
        result.articleIds.push(article.articleId);
        processedGuids.push(draft.sourceFingerprint);
        articleIds.push(article.articleId);
        
        console.log(`[Publisher] ✓ Published: "${draft.slug}" (ID: ${article.articleId})`);
      } else {
        result.skipped++;
        console.warn(`[Publisher] ✗ Failed to persist: "${draft.slug}"`);
      }
      
    } catch (error) {
      const errorMsg = `Error publishing "${draft.slug}": ${error}`;
      console.error(`[Publisher] ${errorMsg}`);
      result.errors.push(errorMsg);
      result.skipped++;
    }
  }
  
  // Mark items as processed in FetchedItem table
  if (processedGuids.length > 0) {
    await markItemsProcessed(processedGuids, articleIds);
  }
  
  console.log(`[Publisher] Complete: ${result.published} published, ${result.skipped} skipped`);
  
  return result;
}

/**
 * Get daily publishing statistics
 */
export async function getDailyStats(): Promise<{
  today: number;
  thisWeek: number;
  thisMonth: number;
  byCategory: Record<string, number>;
}> {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfDay);
  startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const [today, thisWeek, thisMonth, byCategory] = await Promise.all([
    prisma.article.count({
      where: { createdAt: { gte: startOfDay } },
    }),
    prisma.article.count({
      where: { createdAt: { gte: startOfWeek } },
    }),
    prisma.article.count({
      where: { createdAt: { gte: startOfMonth } },
    }),
    prisma.article.groupBy({
      by: ['category'],
      _count: { id: true },
      where: { createdAt: { gte: startOfDay } },
    }),
  ]);
  
  return {
    today,
    thisWeek,
    thisMonth,
    byCategory: byCategory.reduce((acc, item) => {
      acc[item.category] = item._count.id;
      return acc;
    }, {} as Record<string, number>),
  };
}
