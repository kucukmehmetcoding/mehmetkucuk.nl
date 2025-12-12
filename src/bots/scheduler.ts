import cron from 'node-cron';
import {scrape} from './newsScraper';
import {writeDrafts} from './aiWriter';
import {publishDrafts} from './multilingualPublisher';

async function runCycle(priority: 'high' | 'low') {
  const items = await scrape(priority);
  if (!items.length) return;
  const drafts = await writeDrafts(items);
  await publishDrafts(drafts);
}

export async function runOnce() {
  await runCycle('high');
}

export function startScheduler() {
  cron.schedule('*/5 * * * *', () => runCycle('high'));
  cron.schedule('*/15 * * * *', () => runCycle('low'));
  console.log('Scheduler armed (5m high priority, 15m low priority)');
}

if (typeof module !== 'undefined' && module?.parent == null) {
  const runOnceFlag = process.argv.includes('--runOnce');
  if (runOnceFlag) {
    runOnce().then(() => {
      console.log('Scheduler runOnce completed');
      process.exit(0);
    });
  } else {
    startScheduler();
  }
}
