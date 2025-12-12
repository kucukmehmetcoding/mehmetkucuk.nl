import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const defaultFeeds = [
    // Technology - High Priority
    {name: 'TechCrunch', url: 'https://techcrunch.com/feed/', category: 'technology', priority: 'high', language: 'en'},
    {name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml', category: 'technology', priority: 'high', language: 'en'},
    {name: 'Ars Technica', url: 'https://feeds.arstechnica.com/arstechnica/index', category: 'technology', priority: 'high', language: 'en'},
    
    // AI & Machine Learning
    {name: 'OpenAI Blog', url: 'https://openai.com/news/rss.xml', category: 'ai', priority: 'high', language: 'en'},
    {name: 'Hugging Face Blog', url: 'https://huggingface.co/blog/feed.xml', category: 'ai', priority: 'medium', language: 'en'},
    
    // Programming
    {name: 'Hacker News', url: 'https://news.ycombinator.com/rss', category: 'programming', priority: 'high', language: 'en'},
    {name: 'Dev.to', url: 'https://dev.to/feed', category: 'programming', priority: 'medium', language: 'en'},
    
    // Crypto
    {name: 'CoinDesk', url: 'https://www.coindesk.com/arc/outboundfeeds/rss/', category: 'crypto', priority: 'high', language: 'en'},
    
    // Security
    {name: 'Dark Reading', url: 'https://www.darkreading.com/rss.xml', category: 'security', priority: 'high', language: 'en'},
    
    // Science
    {name: 'Space.com', url: 'https://www.space.com/feeds/all', category: 'science', priority: 'high', language: 'en'},
    {name: 'NASA', url: 'https://www.nasa.gov/rss/dyn/breaking_news.rss', category: 'science', priority: 'medium', language: 'en'},
    
    // Gaming
    {name: 'IGN', url: 'https://feeds.feedburner.com/ign/all', category: 'gaming', priority: 'medium', language: 'en'},
  ];
  
  let created = 0;
  let skipped = 0;
  
  for (const feed of defaultFeeds) {
    try {
      const existing = await prisma.rssFeed.findUnique({where: {url: feed.url}});
      if (!existing) {
        await prisma.rssFeed.create({data: feed as any});
        console.log(`✅ Created: ${feed.name}`);
        created++;
      } else {
        console.log(`⏭️ Skipped: ${feed.name} (already exists)`);
        skipped++;
      }
    } catch (error) {
      console.error(`❌ Error creating ${feed.name}:`, error);
    }
  }
  
  console.log(`\n📊 Summary: ${created} created, ${skipped} skipped`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
