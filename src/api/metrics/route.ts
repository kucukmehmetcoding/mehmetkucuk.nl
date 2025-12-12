import {NextResponse} from 'next/server';
import client from 'prom-client';

export const register = new client.Registry();

export const articlesProcessedTotal = new client.Counter({
  name: 'articles_processed_total',
  help: 'Number of articles processed by bots'
});
export const falTokensUsed = new client.Counter({
  name: 'falai_tokens_used_total',
  help: 'Tokens billed by fal.ai operations'
});
export const jobsFailed = new client.Counter({
  name: 'jobs_failed_total',
  help: 'Failed bot jobs'
});

register.registerMetric(articlesProcessedTotal);
register.registerMetric(falTokensUsed);
register.registerMetric(jobsFailed);

client.collectDefaultMetrics({register});

export async function GET() {
  const body = await register.metrics();
  return new NextResponse(body, {
    headers: {'content-type': register.contentType}
  });
}
