// ============================================
// PRONTO.IA — Worker Entrypoint
// ============================================
// Connects to Redis, initializes prompts dir,
// starts BullMQ workers for inbound/outbound/scheduled queues.

import './env';
import './instrumentation';
import { initPromptsDir } from './prompts-loader';
import { inboundQueue, outboundQueue, scheduledQueue, memoryQueue, closeQueues } from './queues';
import { inboundWorker, closeInboundWorker } from './processors/inbound';
import { outboundWorker, closeOutboundWorker } from './processors/outbound';
import { scheduledWorker, closeScheduledWorker } from './processors/scheduler';
import { memoryWorker, closeMemoryWorker } from './processors/memory-worker';

async function main() {
  console.log('[WORKER] Starting Pronto.IA worker...');

  // ---- Initialize prompts directory ----
  const promptsDir = initPromptsDir();
  console.log(`[WORKER] Prompts loaded from: ${promptsDir}`);

  // ---- Verify Redis connection ----
  try {
    const redisUrl = process.env.REDIS_URL!;
    const IORedis = await import('ioredis');
    const testConn = new IORedis.default(redisUrl, { maxRetriesPerRequest: null });
    await testConn.ping();
    testConn.disconnect();
    console.log('[WORKER] Redis connection verified');
  } catch (err) {
    console.error('[WORKER] Redis connection failed. Is Redis running?', err);
    process.exit(1);
  }

  // ---- Verify queue state ----
  const inboundCount = await inboundQueue.getWaitingCount();
  const outboundCount = await outboundQueue.getWaitingCount();
  const scheduledCount = await scheduledQueue.getWaitingCount();
  const memoryCount = await memoryQueue.getWaitingCount();

  console.log(`[WORKER] Queue state: inbound=${inboundCount}, outbound=${outboundCount}, scheduled=${scheduledCount}, memory=${memoryCount}`);

  // ---- Workers are already started by module imports ----
  console.log('[WORKER] Inbound worker started (concurrency: 5)');
  console.log('[WORKER] Outbound worker started (concurrency: 10)');
  console.log('[WORKER] Scheduled worker started (concurrency: 3)');

  console.log('[WORKER] Pronto.IA worker is ready ✓');

  // ---- Graceful shutdown ----

  const shutdown = async (signal: string) => {
    console.log(`[WORKER] Received ${signal}, shutting down...`);

    try {
      await closeInboundWorker();
      await closeOutboundWorker();
      await closeScheduledWorker();
      await closeMemoryWorker();
      await closeQueues();
    } catch (err) {
      console.error('[WORKER] Error during shutdown:', err);
    }

    console.log('[WORKER] Shutdown complete');
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

main().catch((err) => {
  console.error('[WORKER] Fatal error:', err);
  process.exit(1);
});