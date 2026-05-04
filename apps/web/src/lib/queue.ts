import { Queue } from 'bullmq';
import type { AbacateWebhookJob } from '@pronto-ia/types';
import { getRedisConnection } from './redis';

let paymentsWebhookQueue: Queue<AbacateWebhookJob> | null = null;

export function getPaymentsWebhookQueue(): Queue<AbacateWebhookJob> {
  if (!paymentsWebhookQueue) {
    paymentsWebhookQueue = new Queue<AbacateWebhookJob>('payments.webhooks', {
      connection: getRedisConnection(),
    });
  }

  return paymentsWebhookQueue;
}
