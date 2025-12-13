import { prisma } from '@/lib/prisma';
import { fetchRssItems, RawNewsItem } from '@/lib/scraper';
import { computeSimHash, hammingDistance } from './dedupe';
import { FeedPriority, FeedStatus } from '@prisma/client';

// In-memory simhash cache for cross-source deduplication
const globalSimHashCache: Map<string, { simHash: string; feedId: string; title: string }> = new Map();

// Paywall/clickbait keywords to filter out
const PAYWALL_KEYWORDS = [
  // English paywall terms
  'subscribe', 'subscription', 'premium', 'members only', 'member only',
  'exclusive access', 'paywall', 'sign in to read', 'login to read',
  'create account', 'subscription required', 'subscriber only',
  'unlock full', 'unlock this', 'read more with', 'continue reading with',
  'join to read', 'become a member', 'start your free trial',
  // Dutch paywall terms
  'abonnee', 'abonnement', 'inloggen om', 'word lid', 'premium artikel',
  'alleen voor leden', 'maak een account', 'registreer', 'toegang voor leden',
  // Turkish paywall terms
  'abone ol', 'üyelik', 'premium içerik', 'giriş yap', 'kayıt ol',
  'sadece üyelere', 'üye girişi', 'devamını oku için',
  // Common clickbait patterns
  'you won\'t believe', 'shocking', 'click here to', '[sponsored]',
  '[advertisement]', '[advertorial]', 'this one trick',
];

/**
 * Check if content appears to be paywalled or clickbait
 */
function isPaywallContent(title: string, body: string, enableFilter: boolean = true): { isPaywall: boolean; matchedKeyword?: string } {
  if (!enableFilter) {
    return { isPaywall: false };
  }
  
  const content = `${title || ''} ${body || ''}`.toLowerCase();
  
  // Check for paywall keywords
  for (const keyword of PAYWALL_KEYWORDS) {
    if (content.includes(keyword.toLowerCase())) {
      return { isPaywall: true, matchedKeyword: keyword };
    }
  }
  
  // Check for very short content that might indicate truncated/paywalled content
  // Only flag if body is suspiciously short and contains ellipsis or "..."
  const bodyLength = (body || '').trim().length;
  if (bodyLength < 100 && (body?.includes('...') || body?.includes('…'))) {
    return { isPaywall: true, matchedKeyword: 'truncated_content' };
  }
  
  return { isPaywall: false };
}

export interface ScrapedItem {
  guid: string;
  title: string;
  link: string;
  body: string;
  pubDate: Date | null;
  contentHash: string;
  simHash: string;
  feedId: string;
  feedName: string;
  category: string;
  language: string;
  fingerprint: string;
  summary: string;
}

/**
 * Get bot settings from database
 */
async function getBotSettings() {
  let settings = await prisma.botSettings.findFirst({
    orderBy: { updatedAt: 'desc' },
  });
  if (!settings) {
    settings = await prisma.botSettings.create({
      data: {
        isEnabled: true,
        highPriorityInterval: 5,
        mediumPriorityInterval: 15,
        lowPriorityInterval: 30,
        dailyArticleTarget: 50,
        maxArticlesPerHour: 10,
        minQaScore: 0.85,
        autoPublish: true,
        simHashThreshold: 3,
        crossSourceDedup: true,
      },
    });
  }
  return settings;
}

/**
 * Check if we've already processed this item (incremental fetching)
 */
async function isAlreadyFetched(feedId: string, guid: string): Promise<boolean> {
  const existing = await prisma.fetchedItem.findUnique({
    where: { feedId_guid: { feedId, guid } },
  });
  return !!existing;
}

/**
 * Check for cross-source duplicates using SimHash
 */
async function isCrossSourceDuplicate(
  simHash: string,
  feedId: string,
  title: string,
  threshold: number,
  enableCrossSource: boolean
): Promise<{ isDuplicate: boolean; matchedTitle?: string; matchedFeed?: string }> {
  if (!enableCrossSource) {
    return { isDuplicate: false };
  }

  // Check in-memory cache first
  for (const [_, cached] of globalSimHashCache) {
    if (cached.feedId !== feedId) {
      const distance = hammingDistance(simHash, cached.simHash);
      if (distance <= threshold) {
        return {
          isDuplicate: true,
          matchedTitle: cached.title,
          matchedFeed: cached.feedId,
        };
      }
    }
  }

  // Check database for recent items (last 7 days)
  const recentItems = await prisma.fetchedItem.findMany({
    where: {
      feedId: { not: feedId },
      processed: true,
      createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    },
    select: { simHash: true, title: true, feedId: true },
    take: 1000,
  });

  for (const item of recentItems) {
    const distance = hammingDistance(simHash, item.simHash);
    if (distance <= threshold) {
      return {
        isDuplicate: true,
        matchedTitle: item.title,
        matchedFeed: item.feedId,
      };
    }
  }

  return { isDuplicate: false };
}

/**
 * Compute content hash for exact duplicate detection
 */
function computeContentHash(title: string, body: string): string {
  const content = `${title}::${body}`.toLowerCase().replace(/\s+/g, ' ').trim();
  // Simple hash - in production use crypto.createHash('sha256')
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

/**
 * Scrape feeds by priority level
 */
export async function scrapeByPriority(priority: FeedPriority): Promise<{
  items: ScrapedItem[];
  stats: {
    feedsChecked: number;
    itemsFetched: number;
    itemsNew: number;
    itemsDuplicate: number;
    itemsCrossSourceDuplicate: number;
    itemsPaywallFiltered: number;
    errors: string[];
  };
}> {
  const settings = await getBotSettings();
  
  if (!settings.isEnabled) {
    return {
      items: [],
      stats: {
        feedsChecked: 0,
        itemsFetched: 0,
        itemsNew: 0,
        itemsDuplicate: 0,
        itemsCrossSourceDuplicate: 0,
        itemsPaywallFiltered: 0,
        errors: ['Bot is disabled'],
      },
    };
  }

  // Get active feeds for this priority
  const feeds = await prisma.rssFeed.findMany({
    where: {
      priority,
      status: FeedStatus.active,
    },
  });

  const items: ScrapedItem[] = [];
  const stats = {
    feedsChecked: feeds.length,
    itemsFetched: 0,
    itemsNew: 0,
    itemsDuplicate: 0,
    itemsCrossSourceDuplicate: 0,
    itemsPaywallFiltered: 0,
    errors: [] as string[],
  };

  for (const feed of feeds) {
    try {
      console.log(`[Scraper] Fetching ${feed.name} (${feed.url})`);
      
      const rssItems = await fetchRssItems(feed.url);
      stats.itemsFetched += rssItems.length;

      // Limit items per fetch
      const limitedItems = rssItems.slice(0, feed.maxItemsPerFetch);

      for (const rssItem of limitedItems) {
        const guid = rssItem.fingerprint || rssItem.url || rssItem.title;
        
        // Skip if already fetched (incremental)
        if (await isAlreadyFetched(feed.id, guid)) {
          stats.itemsDuplicate++;
          continue;
        }

        // Check if newer than last fetch
        if (feed.lastItemDate && rssItem.publishedAt) {
          const itemDate = new Date(rssItem.publishedAt);
          if (itemDate <= feed.lastItemDate) {
            stats.itemsDuplicate++;
            continue;
          }
        }

        const contentHash = computeContentHash(rssItem.title, rssItem.body);
        const simHash = computeSimHash(rssItem.body);

        // Check for cross-source duplicates
        const crossCheck = await isCrossSourceDuplicate(
          simHash,
          feed.id,
          rssItem.title,
          settings.simHashThreshold,
          settings.crossSourceDedup
        );

        if (crossCheck.isDuplicate) {
          console.log(`[Scraper] Cross-source duplicate: "${rssItem.title}" matches "${crossCheck.matchedTitle}"`);
          stats.itemsCrossSourceDuplicate++;
          
          // Store as fetched but skipped
          await prisma.fetchedItem.create({
            data: {
              feedId: feed.id,
              guid,
              title: rssItem.title,
              link: rssItem.url,
              pubDate: rssItem.publishedAt ? new Date(rssItem.publishedAt) : null,
              contentHash,
              simHash,
              processed: true,
              skippedReason: `cross_source_duplicate:${crossCheck.matchedFeed}`,
            },
          });
          continue;
        }

        // Check for paywall/clickbait content
        const paywallCheck = isPaywallContent(rssItem.title, rssItem.body, settings.enablePaywallFilter ?? true);
        if (paywallCheck.isPaywall) {
          console.log(`[Scraper] Paywall/clickbait filtered: "${rssItem.title}" (matched: ${paywallCheck.matchedKeyword})`);
          stats.itemsPaywallFiltered = (stats.itemsPaywallFiltered || 0) + 1;
          
          // Store as fetched but skipped
          await prisma.fetchedItem.create({
            data: {
              feedId: feed.id,
              guid,
              title: rssItem.title,
              link: rssItem.url,
              pubDate: rssItem.publishedAt ? new Date(rssItem.publishedAt) : null,
              contentHash,
              simHash,
              processed: true,
              skippedReason: `paywall:${paywallCheck.matchedKeyword}`,
            },
          });
          continue;
        }

        // Add to global cache
        globalSimHashCache.set(guid, {
          simHash,
          feedId: feed.id,
          title: rssItem.title,
        });

        // Store fetched item (including body and summary for later processing)
        // Use upsert to handle race conditions with parallel scheduler runs
        await prisma.fetchedItem.upsert({
          where: {
            feedId_guid: {
              feedId: feed.id,
              guid,
            },
          },
          create: {
            feedId: feed.id,
            guid,
            title: rssItem.title,
            link: rssItem.url,
            pubDate: rssItem.publishedAt ? new Date(rssItem.publishedAt) : null,
            contentHash,
            simHash,
            body: rssItem.body,
            summary: rssItem.summary,
            processed: false,
          },
          update: {
            // Don't update if already exists - just skip
          },
        });

        items.push({
          guid,
          title: rssItem.title,
          link: rssItem.url,
          body: rssItem.body,
          pubDate: rssItem.publishedAt ? new Date(rssItem.publishedAt) : null,
          contentHash,
          simHash,
          feedId: feed.id,
          feedName: feed.name,
          category: feed.category,
          language: rssItem.language || feed.language,
          fingerprint: rssItem.fingerprint,
          summary: rssItem.summary,
        });

        stats.itemsNew++;
      }

      // Update feed stats
      await prisma.rssFeed.update({
        where: { id: feed.id },
        data: {
          lastFetchedAt: new Date(),
          lastItemGuid: limitedItems[0]?.fingerprint || limitedItems[0]?.url,
          lastItemDate: limitedItems[0]?.publishedAt ? new Date(limitedItems[0].publishedAt) : undefined,
          totalFetched: { increment: limitedItems.length },
          errorCount: 0,
          lastError: null,
        },
      });

    } catch (error) {
      const errorMsg = `Error fetching ${feed.name}: ${error}`;
      console.error(`[Scraper] ${errorMsg}`);
      stats.errors.push(errorMsg);

      // Update feed error status
      await prisma.rssFeed.update({
        where: { id: feed.id },
        data: {
          errorCount: { increment: 1 },
          lastError: String(error),
          status: feed.errorCount >= 3 ? FeedStatus.error : undefined,
        },
      });
    }
  }

  console.log(`[Scraper] Priority ${priority}: ${stats.feedsChecked} feeds, ${stats.itemsNew} new items, ${stats.itemsCrossSourceDuplicate} cross-source duplicates, ${stats.itemsPaywallFiltered} paywall filtered`);
  
  return { items, stats };
}

/**
 * Mark items as processed
 */
export async function markItemsProcessed(guids: string[], articleIds: string[]) {
  for (let i = 0; i < guids.length; i++) {
    await prisma.fetchedItem.updateMany({
      where: { guid: guids[i] },
      data: {
        processed: true,
        articleId: articleIds[i] || null,
      },
    });
  }
}

/**
 * Mark a single item as skipped with reason
 */
export async function markItemSkipped(guid: string, reason: string) {
  await prisma.fetchedItem.updateMany({
    where: { guid },
    data: {
      processed: true,
      skippedReason: reason,
    },
  });
}

/**
 * Get pending (unprocessed) items from database
 */
export async function getPendingItems(limit: number = 20): Promise<ScrapedItem[]> {
  const pendingItems = await prisma.fetchedItem.findMany({
    where: {
      processed: false,
      skippedReason: null,
    },
    include: {
      feed: true,
    },
    orderBy: { createdAt: 'asc' },
    take: limit,
  });

  return pendingItems.map((item) => ({
    guid: item.guid,
    title: item.title,
    link: item.link,
    body: item.body || '', // Stored body content
    pubDate: item.pubDate,
    contentHash: item.contentHash,
    simHash: item.simHash,
    feedId: item.feedId,
    feedName: item.feed.name,
    category: item.feed.category,
    language: item.feed.language,
    fingerprint: item.contentHash,
    summary: item.summary || '', // Stored summary content
  }));
}

/**
 * Clear old cached simhashes (memory management)
 */
export function clearOldCache() {
  if (globalSimHashCache.size > 10000) {
    // Keep only the most recent 5000
    const entries = Array.from(globalSimHashCache.entries());
    globalSimHashCache.clear();
    entries.slice(-5000).forEach(([k, v]) => globalSimHashCache.set(k, v));
  }
}
