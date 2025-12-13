import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { scrapeByPriority, clearOldCache } from '@/bots/dbScraper';
import { writeDraftsFromScraped } from '@/bots/dbAiWriter';
import { publishDraftsWithCategory, getDailyStats } from '@/bots/dbPublisher';
import { FeedPriority } from '@prisma/client';

// POST /api/bot/trigger - Manually trigger a bot cycle
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const priority: FeedPriority = body.priority || 'high';
    
    // Check if bot is enabled
    const settings = await prisma.botSettings.findFirst({
      orderBy: { updatedAt: 'desc' },
    });
    if (!settings?.isEnabled) {
      return NextResponse.json({ error: 'Bot is disabled' }, { status: 400 });
    }
    
    // Create run log
    const runLog = await prisma.botRunLog.create({
      data: {
        priority,
        startedAt: new Date(),
      },
    });
    
    // Step 1: Scrape feeds
    const { items, stats: scrapeStats } = await scrapeByPriority(priority);
    
    if (items.length === 0) {
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
      
      return NextResponse.json({
        success: true,
        message: 'No new items found',
        stats: scrapeStats,
      });
    }
    
    // Limit items per cycle
    const maxItems = settings?.maxArticlesPerHour || 10;
    const limitedItems = items.slice(0, maxItems);
    
    // Step 2: AI rewrite and translate (with pre-filtering)
    const { drafts, stats: aiStats } = await writeDraftsFromScraped(limitedItems, settings?.minQaScore || 0.85);
    
    // Step 3: Publish
    const publishResults = await publishDraftsWithCategory(drafts, settings?.autoPublish ?? true);
    
    // Update run log
    await prisma.botRunLog.update({
      where: { id: runLog.id },
      data: {
        completedAt: new Date(),
        feedsChecked: scrapeStats.feedsChecked,
        itemsFetched: scrapeStats.itemsFetched,
        itemsProcessed: drafts.length,
        itemsPublished: publishResults.published,
        itemsSkipped: publishResults.skipped + aiStats.preFiltered + aiStats.qaRejected + (items.length - limitedItems.length),
        errors: [...scrapeStats.errors, ...publishResults.errors],
      },
    });
    
    // Clear old cache
    clearOldCache();
    
    return NextResponse.json({
      success: true,
      runLogId: runLog.id,
      stats: {
        feedsChecked: scrapeStats.feedsChecked,
        itemsFetched: scrapeStats.itemsFetched,
        itemsNew: scrapeStats.itemsNew,
        itemsCrossSourceDuplicate: scrapeStats.itemsCrossSourceDuplicate,
        draftsCreated: drafts.length,
        articlesPublished: publishResults.published,
        articlesSkipped: publishResults.skipped,
      },
    });
    
  } catch (error) {
    console.error('[Bot Trigger] Error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

// GET /api/bot/trigger - Get bot status
export async function GET() {
  try {
    const settings = await prisma.botSettings.findFirst({
      orderBy: { updatedAt: 'desc' },
    });
    const dailyStats = await getDailyStats();
    
    // Get recent run logs
    const recentRuns = await prisma.botRunLog.findMany({
      orderBy: { startedAt: 'desc' },
      take: 10,
    });
    
    // Get feed stats
    const feedStats = await prisma.rssFeed.aggregate({
      _count: { id: true },
      _sum: { totalFetched: true, totalPublished: true },
    });
    
    const activeFeedsCount = await prisma.rssFeed.count({
      where: { status: 'active' },
    });
    
    return NextResponse.json({
      isEnabled: settings?.isEnabled ?? false,
      settings: settings ? {
        highPriorityInterval: settings.highPriorityInterval,
        mediumPriorityInterval: settings.mediumPriorityInterval,
        lowPriorityInterval: settings.lowPriorityInterval,
        dailyArticleTarget: settings.dailyArticleTarget,
        maxArticlesPerHour: settings.maxArticlesPerHour,
        minQaScore: settings.minQaScore,
        autoPublish: settings.autoPublish,
      } : null,
      stats: {
        daily: dailyStats,
        feeds: {
          total: feedStats._count.id,
          active: activeFeedsCount,
          totalFetched: feedStats._sum.totalFetched || 0,
          totalPublished: feedStats._sum.totalPublished || 0,
        },
      },
      recentRuns,
    });
    
  } catch (error) {
    console.error('[Bot Status] Error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
