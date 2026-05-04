// ============================================
// PRONTO.IA — Memory Worker (BullMQ)
// ============================================
// Processes memory extraction jobs from the whatsapp.memory queue.
// Extracts memories via Claude Haiku, deduplicates, and stores in DB.

import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import * as Sentry from '@sentry/node';
import { recordFailure } from './failure-tracker';
import { extractMemories, deduplicateMemories } from './memory-extractor';
import { db } from '@pronto-ia/database';
import { userMemory } from '@pronto-ia/database';
import { eventBus } from '@pronto-ia/events';
import type { MemoryExtractionJobData } from '../queues';

const connection = new IORedis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
});

export const memoryWorker = new Worker<MemoryExtractionJobData>(
  'whatsapp.memory',
  async (job: Job<MemoryExtractionJobData>) => {
    const { userId, userMessage, assistantResponse, persona, messageId, sessionId } = job.data;

    console.log(`[MEMORY] Extracting memories for user ${userId}`);

    try {
      // Step 1: Extract memories from conversation
      const extracted = await extractMemories({
        userId,
        userMessage,
        assistantResponse,
        persona,
      });

      if (extracted.length === 0) {
        console.log(`[MEMORY] No memories extracted for user ${userId}`);
        return;
      }

      // Step 2: Deduplicate against existing memories
      const newMemories = await deduplicateMemories(userId, extracted);

      if (newMemories.length === 0) {
        console.log(`[MEMORY] All ${extracted.length} memories already exist for user ${userId}`);
        return;
      }

      // Step 3: Insert new memories with 90-day expiry
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 90);

      for (const memory of newMemories) {
        await db.insert(userMemory).values({
          userId,
          key: memory.key,
          value: memory.value,
          memoryType: memory.memoryType,
          confidence: memory.confidence,
          source: 'conversation',
          expiresAt,
        });
      }

      console.log(`[MEMORY] Stored ${newMemories.length} new memories for user ${userId} (${extracted.length - newMemories.length} duplicates skipped)`);

      // Step 4: Emit event for analytics/webhooks
      eventBus.emit({
        type: 'llm.call' as any,
        timestamp: new Date(),
        payload: {
          userId,
          sessionId: sessionId ?? "",
          messageId: messageId ?? "",
          // memoriesCount: newMemories.length,
          // memories: newMemories.map((m) => ({ key: m.key, type: m.memoryType })),
        } as any,
      });
    } catch (err) {
      console.error(`[MEMORY] Job ${job.id} failed for user ${userId}:`, err);
      throw err; // Re-throw so BullMQ handles retries
    }
  },
  {
    connection,
    concurrency: 3,
  },
);

// ---- Graceful shutdown + error handling ----

memoryWorker.on('failed', (job, err) => {
  console.error(`[MEMORY] Job ${job?.id} failed:`, err.message);
  Sentry.captureException(err, {
    extra: { jobId: job?.id, jobData: job?.data },
  });
  recordFailure('whatsapp.memory', job?.id, err.message);
});

memoryWorker.on('completed', (job) => {
  console.log(`[MEMORY] Job ${job.id} completed`);
});

export async function closeMemoryWorker(): Promise<void> {
  await memoryWorker.close();
}
