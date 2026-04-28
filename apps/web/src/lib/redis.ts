// ============================================
// PRONTO.IA — Redis Connection for Web API
// ============================================
// Shared Redis connection used by webhook API Route
// to publish jobs to BullMQ queues.
// Same Redis instance as the worker on Railway.

import IORedis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL ?? 'redis://localhost:6379';

export const redis = new IORedis(REDIS_URL, {
  maxRetriesPerRequest: null, // BullMQ requirement
  lazyConnect: true, // Don't connect until first command (Vercel cold starts)
});