import { Worker, type Job } from 'bullmq';
import IORedis from 'ioredis';
import type { AbacateWebhookJob } from '@pronto-ia/types';
import { handleAbacateWebhook } from '../flows/payment';

const connection = new IORedis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
});

export const paymentsWebhookWorker = new Worker<AbacateWebhookJob>(
  'payments.webhooks',
  async (job: Job<AbacateWebhookJob>) => {
    const { rawBody, signature, payload } = job.data;
    const result = await handleAbacateWebhook(rawBody, signature, payload as never);

    if (result.statusCode >= 500) {
      throw new Error(`abacate webhook failed: ${JSON.stringify(result.body)}`);
    }

    return result;
  },
  { connection, concurrency: 4 },
);

paymentsWebhookWorker.on('completed', (job) => {
  console.log('[payments-webhook] job completed', { id: job.id });
});

paymentsWebhookWorker.on('failed', (job, err) => {
  console.error('[payments-webhook] job failed', { id: job?.id, err: err.message });
});

export async function closePaymentsWebhookWorker(): Promise<void> {
  await paymentsWebhookWorker.close();
}
