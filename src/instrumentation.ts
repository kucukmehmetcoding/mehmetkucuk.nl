/**
 * Next.js Instrumentation Hook
 * This file runs when the Next.js server starts.
 * It initializes the news bot scheduler for automatic article fetching.
 */

export async function register() {
  // Only run on the Node.js runtime (not Edge)
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Check if bot should be enabled (can be disabled via env var)
    const botEnabled = process.env.NEWS_BOT_ENABLED !== 'false';
    
    if (botEnabled) {
      console.log('[Instrumentation] 🤖 Initializing News Bot Scheduler...');
      
      try {
        const { startScheduler } = await import('./bots/dbScheduler');
        await startScheduler();
        console.log('[Instrumentation] ✅ News Bot Scheduler started successfully');
      } catch (error) {
        console.error('[Instrumentation] ❌ Failed to start News Bot Scheduler:', error);
      }
    } else {
      console.log('[Instrumentation] ⏸️ News Bot is disabled via NEWS_BOT_ENABLED=false');
    }
  }
}
