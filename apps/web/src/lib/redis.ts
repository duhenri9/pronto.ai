// ============================================
// PRONTO.IA — Redis Connection for Web API
// ============================================
// Singleton Redis connection used by webhook API Route
// to publish jobs to BullMQ queues.
// Same Redis instance as the worker on Railway.

import IORedis from 'ioredis';

let redis: IORedis | null = null;

export function getRedisConnection(): IORedis {
  if (!redis) {
    const url = process.env.REDIS_URL ?? 'redis://localhost:6379';
    redis = new IORedis(url, {
      maxRetriesPerRequest: null, // BullMQ requirement
      lazyConnect: true, // Don't connect until first command (Vercel cold starts)
      ...(url.startsWith('rediss://') && { tls: {} }),
    });
  }
  return redis;
}