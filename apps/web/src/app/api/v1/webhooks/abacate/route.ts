// ============================================
// PRONTO.IA — AbacatePay Webhook API Route
// ============================================
// Receives payment events from AbacatePay,
// validates HMAC, and enqueues a job for the
// worker to process asynchronously.

import { NextRequest, NextResponse } from 'next/server';
import { Queue } from 'bullmq';
import { getRedisConnection } from '@/lib/redis';

export const dynamic = 'force-dynamic';

let abacateQueue: Queue | null = null;
function getAbacateQueue(): Queue {
  if (!abacateQueue) {
    abacateQueue = new Queue('whatsapp.outbound', {
      connection: getRedisConnection(),
    });
  }
  return abacateQueue;
}

export async function POST(request: NextRequest) {
  // 1. Get raw body for HMAC verification
  const bodyText = await request.text();

  // 2. Parse JSON
  let payload: unknown;
  try {
    payload = JSON.parse(bodyText);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // 3. Get HMAC signature
  const signature = request.headers.get('x-abacate-hmac-sha256') ?? '';

  // 4. Enqueue for worker processing (validation + business logic in worker)
  await getAbacateQueue().add('abacate_webhook', {
    type: 'abacate_webhook',
    rawBody: bodyText,
    signature,
    payload,
  }, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    jobId: `abacate-${(payload as any)?.id ?? Date.now()}`,
    removeOnComplete: { count: 1000 },
    removeOnFail: { age: 24 * 3600 },
  });

  // 5. Respond immediately
  return NextResponse.json({ status: 'queued' }, { status: 202 });
}
