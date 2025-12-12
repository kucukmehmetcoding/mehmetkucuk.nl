import {NextResponse} from 'next/server';
import {prisma} from '@/lib/prisma';
import {getRedis} from '@/lib/cache';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface HealthCheck {
  name: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  latency?: number;
  message?: string;
}

interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  checks: HealthCheck[];
}

const startTime = Date.now();

export async function GET() {
  const checks: HealthCheck[] = [];
  let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

  // Check Database
  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    checks.push({
      name: 'database',
      status: 'healthy',
      latency: Date.now() - dbStart,
    });
  } catch (error) {
    checks.push({
      name: 'database',
      status: 'unhealthy',
      message: error instanceof Error ? error.message : 'Database connection failed',
    });
    overallStatus = 'unhealthy';
  }

  // Check Redis (optional - degraded if unavailable)
  try {
    const redis = getRedis();
    if (redis) {
      const redisStart = Date.now();
      await redis.ping();
      checks.push({
        name: 'redis',
        status: 'healthy',
        latency: Date.now() - redisStart,
      });
    } else {
      checks.push({
        name: 'redis',
        status: 'degraded',
        message: 'Redis not configured, using in-memory cache',
      });
      if (overallStatus === 'healthy') {
        overallStatus = 'degraded';
      }
    }
  } catch (error) {
    checks.push({
      name: 'redis',
      status: 'unhealthy',
      message: error instanceof Error ? error.message : 'Redis connection failed',
    });
    if (overallStatus === 'healthy') {
      overallStatus = 'degraded';
    }
  }

  // Check file system (for uploads)
  try {
    const fs = await import('fs/promises');
    await fs.access('./public/uploads');
    checks.push({
      name: 'filesystem',
      status: 'healthy',
    });
  } catch {
    checks.push({
      name: 'filesystem',
      status: 'degraded',
      message: 'Uploads directory not accessible',
    });
  }

  const response: HealthResponse = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: Math.floor((Date.now() - startTime) / 1000),
    version: process.env.npm_package_version || '1.0.0',
    checks,
  };

  return NextResponse.json(response, {
    status: overallStatus === 'unhealthy' ? 503 : 200,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}
