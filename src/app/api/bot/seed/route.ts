import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { FeedPriority } from '@prisma/client';

// Default RSS feeds for various categories
const defaultFeeds = [
  // Technology - High Priority
  { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml', category: 'technology', priority: FeedPriority.high },
  { name: 'Ars Technica', url: 'https://feeds.arstechnica.com/arstechnica/index', category: 'technology', priority: FeedPriority.high },
  { name: 'TechCrunch', url: 'https://techcrunch.com/feed/', category: 'technology', priority: FeedPriority.high },
  { name: 'Wired', url: 'https://www.wired.com/feed/rss', category: 'technology', priority: FeedPriority.medium },
  { name: 'Engadget', url: 'https://www.engadget.com/rss.xml', category: 'technology', priority: FeedPriority.medium },
  
  // AI & Machine Learning - High Priority
  { name: 'OpenAI Blog', url: 'https://openai.com/blog/rss/', category: 'ai', priority: FeedPriority.high },
  { name: 'Google AI Blog', url: 'https://blog.google/technology/ai/rss/', category: 'ai', priority: FeedPriority.high },
  { name: 'MIT News - AI', url: 'https://news.mit.edu/topic/mitartificial-intelligence2-rss.xml', category: 'ai', priority: FeedPriority.medium },
  { name: 'Hugging Face Blog', url: 'https://huggingface.co/blog/feed.xml', category: 'ai', priority: FeedPriority.medium },
  { name: 'DeepMind Blog', url: 'https://www.deepmind.com/blog/rss.xml', category: 'ai', priority: FeedPriority.medium },
  
  // Crypto & Blockchain
  { name: 'CoinDesk', url: 'https://www.coindesk.com/arc/outboundfeeds/rss/', category: 'crypto', priority: FeedPriority.high },
  { name: 'CoinTelegraph', url: 'https://cointelegraph.com/rss', category: 'crypto', priority: FeedPriority.high },
  { name: 'Bitcoin Magazine', url: 'https://bitcoinmagazine.com/.rss/full/', category: 'crypto', priority: FeedPriority.medium },
  { name: 'Decrypt', url: 'https://decrypt.co/feed', category: 'crypto', priority: FeedPriority.medium },
  
  // Programming & Development
  { name: 'Hacker News', url: 'https://hnrss.org/frontpage', category: 'programming', priority: FeedPriority.high },
  { name: 'Dev.to', url: 'https://dev.to/feed', category: 'programming', priority: FeedPriority.medium },
  { name: 'CSS-Tricks', url: 'https://css-tricks.com/feed/', category: 'programming', priority: FeedPriority.low },
  { name: 'Smashing Magazine', url: 'https://www.smashingmagazine.com/feed/', category: 'programming', priority: FeedPriority.low },
  
  // Gaming
  { name: 'IGN', url: 'https://feeds.feedburner.com/ign/all', category: 'gaming', priority: FeedPriority.medium },
  { name: 'Kotaku', url: 'https://kotaku.com/rss', category: 'gaming', priority: FeedPriority.medium },
  { name: 'PC Gamer', url: 'https://www.pcgamer.com/rss/', category: 'gaming', priority: FeedPriority.low },
  { name: 'Polygon', url: 'https://www.polygon.com/rss/index.xml', category: 'gaming', priority: FeedPriority.low },
  
  // Security
  { name: 'Krebs on Security', url: 'https://krebsonsecurity.com/feed/', category: 'security', priority: FeedPriority.high },
  { name: 'The Hacker News', url: 'https://feeds.feedburner.com/TheHackersNews', category: 'security', priority: FeedPriority.high },
  { name: 'Dark Reading', url: 'https://www.darkreading.com/rss.xml', category: 'security', priority: FeedPriority.medium },
  
  // Science
  { name: 'Nature News', url: 'https://www.nature.com/nature.rss', category: 'science', priority: FeedPriority.medium },
  { name: 'Science Daily', url: 'https://www.sciencedaily.com/rss/all.xml', category: 'science', priority: FeedPriority.low },
  { name: 'Phys.org', url: 'https://phys.org/rss-feed/', category: 'science', priority: FeedPriority.low },
  
  // Business & Startups
  { name: 'TechCrunch Startups', url: 'https://techcrunch.com/category/startups/feed/', category: 'business', priority: FeedPriority.medium },
  { name: 'VentureBeat', url: 'https://venturebeat.com/feed/', category: 'business', priority: FeedPriority.medium },
  { name: 'Fast Company', url: 'https://www.fastcompany.com/latest/rss', category: 'business', priority: FeedPriority.low },
  
  // Gadgets
  { name: 'Gizmodo', url: 'https://gizmodo.com/rss', category: 'gadgets', priority: FeedPriority.medium },
  { name: 'Android Authority', url: 'https://www.androidauthority.com/feed/', category: 'gadgets', priority: FeedPriority.low },
  { name: '9to5Mac', url: 'https://9to5mac.com/feed/', category: 'gadgets', priority: FeedPriority.low },
];

// POST /api/bot/seed - Seed default RSS feeds
export async function POST() {
  try {
    const results = {
      created: 0,
      skipped: 0,
      errors: [] as string[],
    };
    
    for (const feed of defaultFeeds) {
      try {
        // Check if feed already exists
        const existing = await prisma.rssFeed.findUnique({
          where: { url: feed.url },
        });
        
        if (existing) {
          results.skipped++;
          continue;
        }
        
        // Create new feed
        await prisma.rssFeed.create({
          data: {
            name: feed.name,
            url: feed.url,
            category: feed.category,
            priority: feed.priority,
            status: 'active',
            maxItemsPerFetch: 10,
            language: 'en',
          },
        });
        
        results.created++;
      } catch (error) {
        results.errors.push(`Error creating ${feed.name}: ${error}`);
      }
    }
    
    // Also ensure bot settings exist
    const settingsExist = await prisma.botSettings.findFirst({
      orderBy: { updatedAt: 'desc' },
    });
    if (!settingsExist) {
      await prisma.botSettings.create({
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
    
    return NextResponse.json({
      success: true,
      message: `Created ${results.created} feeds, skipped ${results.skipped} existing`,
      results,
      totalFeeds: defaultFeeds.length,
    });
    
  } catch (error) {
    console.error('[Seed Feeds] Error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

// GET /api/bot/seed - Get seed status
export async function GET() {
  try {
    const feedCount = await prisma.rssFeed.count();
    const settingsExist = await prisma.botSettings.findFirst({
      orderBy: { updatedAt: 'desc' },
    });
    
    return NextResponse.json({
      feedsInDatabase: feedCount,
      defaultFeedsCount: defaultFeeds.length,
      settingsConfigured: !!settingsExist,
      needsSeeding: feedCount === 0,
    });
    
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
