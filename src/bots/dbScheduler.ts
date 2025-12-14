import cron from 'node-cron';
import { prisma } from '@/lib/prisma';
import { FeedPriority } from '@prisma/client';
import { scrapeByPriority, scrapeByPriorityAndCategory, clearOldCache, ScrapedItem } from './dbScraper';
import { writeDraftsFromScraped } from './dbAiWriter';
import { publishDraftsWithCategory } from './dbPublisher';

interface BotSettings {
  isEnabled: boolean;
  highPriorityInterval: number;
  mediumPriorityInterval: number;
  lowPriorityInterval: number;
  dailyArticleTarget: number;
  maxArticlesPerHour: number;
  minQaScore: number;
  autoPublish: boolean;
}

// Round-robin category distribution for balanced feed scraping
const ALL_CATEGORIES = ['technology', 'ai', 'crypto', 'programming', 'security', 'science', 'gaming', 'gadgets', 'business', 'space', 'software', 'web', 'mobile', 'devops', 'database', 'cloud', 'startup', 'other'];
let currentCategoryIndex = 0;

function getNextCategory(): string {
  const category = ALL_CATEGORIES[currentCategoryIndex % ALL_CATEGORIES.length];
  currentCategoryIndex++;
  return category;
}

let settings: BotSettings | null = null;
let scheduledJobs: cron.ScheduledTask[] = [];
let articlesToday = 0;
let lastDayReset = new Date().getDate();

/**
 * Load bot settings from database
 */
async function loadSettings(): Promise<BotSettings> {
  const dbSettings = await prisma.botSettings.findFirst({
    orderBy: { updatedAt: 'desc' },
  });
  
  if (!dbSettings) {
    // Create default settings
    const created = await prisma.botSettings.create({
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
    return created;
  }
  
  return dbSettings;
}

/**
 * Check daily limits
 */
function checkDailyLimit(): boolean {
  // Reset counter on new day
  const today = new Date().getDate();
  if (today !== lastDayReset) {
    articlesToday = 0;
    lastDayReset = today;
  }
  
  if (!settings) return false;
  return articlesToday < settings.dailyArticleTarget;
}

/**
 * Run a scraping cycle for a specific priority
 */
async function runCycle(priority: FeedPriority): Promise<void> {
  console.log(`\n[Scheduler] Starting ${priority} priority cycle at ${new Date().toISOString()}`);
  
  // Reload settings each cycle to pick up changes
  settings = await loadSettings();
  
  if (!settings.isEnabled) {
    console.log('[Scheduler] Bot is disabled, skipping cycle');
    return;
  }
  
  if (!checkDailyLimit()) {
    console.log(`[Scheduler] Daily article limit reached (${articlesToday}/${settings.dailyArticleTarget})`);
    return;
  }
  
  // Create run log
  const runLog = await prisma.botRunLog.create({
    data: {
      priority,
      startedAt: new Date(),
    },
  });
  
  try {
    // Step 1: Scrape feeds with round-robin category distribution
    const preferredCategory = getNextCategory();
    const { items, stats: scrapeStats } = await scrapeByPriorityAndCategory(priority, preferredCategory);
    
    if (items.length === 0) {
      console.log(`[Scheduler] No new items found in ${priority} priority feeds (category: ${preferredCategory})`);
      await prisma.botRunLog.update({
        where: { id: runLog.id },
        data: {
          completedAt: new Date(),
          feedsChecked: scrapeStats.feedsChecked,
          itemsFetched: scrapeStats.itemsFetched,
          itemsSkipped: scrapeStats.itemsDuplicate + scrapeStats.itemsCrossSourceDuplicate,
          errors: scrapeStats.errors,
        },
      });
      return;
    }
    
    // Limit items per cycle based on hourly limit
    const remainingDaily = settings.dailyArticleTarget - articlesToday;
    const limitedItems = items.slice(0, Math.min(settings.maxArticlesPerHour, remainingDaily));
    
    console.log(`[Scheduler] Processing ${limitedItems.length} items (${items.length} available, ${remainingDaily} remaining today)`);
    
    // Step 2: AI rewrite and translate (with pre-filtering)
    const { drafts, stats: aiStats } = await writeDraftsFromScraped(limitedItems, settings.minQaScore);
    
    console.log(`[Scheduler] AI Stats: ${aiStats.preFiltered} pre-filtered, ${aiStats.qaRejected} QA rejected, ${aiStats.success} success`);
    
    if (drafts.length === 0) {
      console.log('[Scheduler] No drafts passed filters');
      await prisma.botRunLog.update({
        where: { id: runLog.id },
        data: {
          completedAt: new Date(),
          feedsChecked: scrapeStats.feedsChecked,
          itemsFetched: scrapeStats.itemsFetched,
          itemsProcessed: limitedItems.length,
          itemsSkipped: limitedItems.length,
          errors: scrapeStats.errors,
        },
      });
      return;
    }
    
    // Step 3: Publish
    const publishResults = await publishDraftsWithCategory(drafts, settings.autoPublish);
    
    // Update article counter
    articlesToday += publishResults.published;
    
    // Update feed stats
    for (const draft of drafts) {
      if (draft.feedId) {
        await prisma.rssFeed.update({
          where: { id: draft.feedId },
          data: {
            totalPublished: { increment: 1 },
          },
        });
      }
    }
    
    // Update run log
    await prisma.botRunLog.update({
      where: { id: runLog.id },
      data: {
        completedAt: new Date(),
        feedsChecked: scrapeStats.feedsChecked,
        itemsFetched: scrapeStats.itemsFetched,
        itemsProcessed: drafts.length,
        itemsPublished: publishResults.published,
        itemsSkipped: publishResults.skipped,
        errors: [...scrapeStats.errors, ...publishResults.errors],
      },
    });
    
    console.log(`[Scheduler] Cycle complete: ${publishResults.published} published, ${publishResults.skipped} skipped`);
    console.log(`[Scheduler] Daily progress: ${articlesToday}/${settings.dailyArticleTarget}`);
    
    // Clear old cache periodically
    clearOldCache();
    
  } catch (error) {
    console.error(`[Scheduler] Cycle error:`, error);
    await prisma.botRunLog.update({
      where: { id: runLog.id },
      data: {
        completedAt: new Date(),
        errors: [String(error)],
      },
    });
  }
}

/**
 * Stop all scheduled jobs
 */
export function stopScheduler(): void {
  console.log('[Scheduler] Stopping all scheduled jobs...');
  for (const job of scheduledJobs) {
    job.stop();
  }
  scheduledJobs = [];
}

/**
 * Start the scheduler with database-driven intervals
 */
export async function startScheduler(): Promise<void> {
  console.log('[Scheduler] Initializing database-driven scheduler...');
  
  // Stop any existing jobs
  stopScheduler();
  
  // Load settings
  settings = await loadSettings();
  
  if (!settings.isEnabled) {
    console.log('[Scheduler] Bot is disabled in settings. Not starting scheduler.');
    return;
  }
  
  // Schedule high priority (e.g., every 5 minutes)
  const highJob = cron.schedule(`*/${settings.highPriorityInterval} * * * *`, () => {
    runCycle(FeedPriority.high);
  });
  scheduledJobs.push(highJob);
  
  // Schedule medium priority (e.g., every 15 minutes)
  const mediumJob = cron.schedule(`*/${settings.mediumPriorityInterval} * * * *`, () => {
    runCycle(FeedPriority.medium);
  });
  scheduledJobs.push(mediumJob);
  
  // Schedule low priority (e.g., every 30 minutes)
  const lowJob = cron.schedule(`*/${settings.lowPriorityInterval} * * * *`, () => {
    runCycle(FeedPriority.low);
  });
  scheduledJobs.push(lowJob);
  
  console.log(`[Scheduler] Armed with intervals: high=${settings.highPriorityInterval}m, medium=${settings.mediumPriorityInterval}m, low=${settings.lowPriorityInterval}m`);
  console.log(`[Scheduler] Daily target: ${settings.dailyArticleTarget} articles, max ${settings.maxArticlesPerHour}/hour`);
}

/**
 * Run a single cycle manually (for testing or admin trigger)
 */
export async function runOnce(priority: FeedPriority = FeedPriority.high): Promise<void> {
  console.log(`[Scheduler] Running single ${priority} priority cycle...`);
  await runCycle(priority);
}

/**
 * Get current bot status
 */
export async function getBotStatus(): Promise<{
  isEnabled: boolean;
  articlesToday: number;
  dailyTarget: number;
  lastRuns: Array<{
    priority: FeedPriority;
    startedAt: Date;
    itemsPublished: number;
  }>;
}> {
  const currentSettings = await loadSettings();
  
  const lastRuns = await prisma.botRunLog.findMany({
    orderBy: { startedAt: 'desc' },
    take: 10,
    select: {
      priority: true,
      startedAt: true,
      itemsPublished: true,
    },
  });
  
  return {
    isEnabled: currentSettings.isEnabled,
    articlesToday,
    dailyTarget: currentSettings.dailyArticleTarget,
    lastRuns,
  };
}

/**
 * Reload settings and restart scheduler if needed
 */
export async function reloadSettings(): Promise<void> {
  const newSettings = await loadSettings();
  
  // Check if intervals changed
  if (
    settings &&
    (settings.highPriorityInterval !== newSettings.highPriorityInterval ||
     settings.mediumPriorityInterval !== newSettings.mediumPriorityInterval ||
     settings.lowPriorityInterval !== newSettings.lowPriorityInterval ||
     settings.isEnabled !== newSettings.isEnabled)
  ) {
    console.log('[Scheduler] Settings changed, restarting scheduler...');
    await startScheduler();
  }
  
  settings = newSettings;
}

// Entry point for running as standalone script
if (typeof module !== 'undefined' && module?.parent == null) {
  const runOnceFlag = process.argv.includes('--runOnce');
  const priority = process.argv.includes('--low') 
    ? FeedPriority.low 
    : process.argv.includes('--medium')
    ? FeedPriority.medium
    : FeedPriority.high;
  
  if (runOnceFlag) {
    runOnce(priority).then(() => {
      console.log('[Scheduler] RunOnce completed');
      process.exit(0);
    }).catch(err => {
      console.error('[Scheduler] RunOnce failed:', err);
      process.exit(1);
    });
  } else {
    startScheduler().catch(err => {
      console.error('[Scheduler] Failed to start:', err);
      process.exit(1);
    });
  }
}
