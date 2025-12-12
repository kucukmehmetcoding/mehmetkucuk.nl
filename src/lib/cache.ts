import Redis from 'ioredis';

let client: Redis | null = null;

// In-memory cache fallback when Redis is not available
const memoryCache = new Map<string, { value: string; expires: number }>();

export function getRedis(): Redis | null {
  if (!process.env.REDIS_URL) {
    // Return null instead of throwing - allows graceful fallback
    return null;
  }
  if (!client) {
    client = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 5,
      enableReadyCheck: false
    });
  }
  return client;
}

export async function cacheValue<T>(key: string, value: T, ttlSeconds = 3600) {
  const redis = getRedis();
  
  if (redis) {
    // Use Redis if available
    await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  } else {
    // Fallback to in-memory cache
    const expires = Date.now() + (ttlSeconds * 1000);
    memoryCache.set(key, { value: JSON.stringify(value), expires });
    
    // Cleanup expired entries periodically (every 100 writes)
    if (memoryCache.size % 100 === 0) {
      const now = Date.now();
      for (const [k, v] of memoryCache.entries()) {
        if (v.expires < now) memoryCache.delete(k);
      }
    }
  }
}

export async function getCachedValue<T>(key: string): Promise<T | null> {
  const redis = getRedis();
  
  if (redis) {
    // Use Redis if available
    const raw = await redis.get(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } else {
    // Fallback to in-memory cache
    const entry = memoryCache.get(key);
    if (!entry) return null;
    
    // Check if expired
    if (entry.expires < Date.now()) {
      memoryCache.delete(key);
      return null;
    }
    
    return JSON.parse(entry.value) as T;
  }
}
