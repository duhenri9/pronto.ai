// ============================================
// PRONTO.IA — WhatsApp Webhook API Route
// ============================================
// Receives inbound messages from Z-API or Meta Cloud API,
// validates HMAC signature, parses the message, and enqueues
// a BullMQ job for the worker to process asynchronously.
//
// Architecture: Vercel (this route) → Redis → Railway (worker)
// The webhook responds immediately (200/202) to avoid Z-API timeout.

import { NextRequest, NextResponse } from 'next/server';
import { Queue } from 'bullmq';
import { createWhatsAppProvider } from '@pronto-ia/whatsapp';
import type { ParsedWebhookEvent } from '@pronto-ia/whatsapp';
import { getRedisConnection } from '@/lib/redis';
import { checkRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

// BullMQ queue — same name as worker's inboundQueue (lazy-init to avoid build-time Redis connection)
let inboundQueue: Queue | null = null;
function getInboundQueue(): Queue {
  if (!inboundQueue) {
    inboundQueue = new Queue('whatsapp.inbound', {
      connection: getRedisConnection(),
    });
  }
  return inboundQueue;
}

// ---- GET: Webhook Verification (Meta Cloud API) ----

export async function GET(request: NextRequest) {
  const provider = createWhatsAppProvider();
  const { searchParams } = new URL(request.url);

  const mode = searchParams.get('hub.mode') ?? searchParams.get('mode');
  const token = searchParams.get('hub.verify_token') ?? searchParams.get('token');
  const challenge = searchParams.get('hub.challenge');

  if (!mode || !token) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  const isValid = await provider.verifyWebhook(mode, token);

  if (!isValid) {
    return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
  }

  // Meta expects the challenge to be returned as plain text
  return new NextResponse(challenge ?? 'ok', { status: 200 });
}

// ---- POST: Inbound Message Handler ----

export async function POST(request: NextRequest) {
  const provider = createWhatsAppProvider();

  // 1. Get raw body text (needed for HMAC verification)
  const bodyText = await request.text();

  // 2. Verify HMAC signature
  // Z-API: X-ZAPI-HMAC-SHA256 header
  // Meta Cloud API: X-Hub-Signature-256 header
  const signature =
    request.headers.get('x-zapi-hmac-sha256') ?? // Z-API
    request.headers.get('x-hub-signature-256') ?? // Meta Cloud API
    '';

  if (signature) {
    const isValid = await provider.verifyPayload(bodyText, signature);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
  }

  // 3. Parse JSON payload
  let payload: unknown;
  try {
    payload = JSON.parse(bodyText);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // 4. Parse webhook events using provider
  const events: ParsedWebhookEvent[] = provider.parseWebhook(payload);

  // 5. Filter only message events (ignore status updates)
  const messageEvents = events.filter((e) => e.eventType === 'message');

  if (messageEvents.length === 0) {
    return NextResponse.json({ status: 'no_messages' });
  }

  // 6. Rate limit + enqueue each message
  let queued = 0;
  let rateLimited = 0;

  for (const event of messageEvents) {
    // Rate limit check per phone
    const allowed = await checkRateLimit(event.phone);
    if (!allowed) {
      rateLimited++;
      continue;
    }

    await getInboundQueue().add(
      'inbound-message',
      {
        phone: event.phone,
        messageText: event.text ?? '',
        messageId: event.messageId ?? '',
        messageType: (event.mediaType ?? 'text') as 'text' | 'audio' | 'image' | 'document',
        profileName: event.profileName,
        waId: event.waId,
        timestamp: event.timestamp,
      },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        // Dedup: use messageId as job ID so retries don't create duplicates
        jobId: `msg-${event.messageId ?? `${event.phone}-${Date.now()}`}`,
        removeOnComplete: { count: 1000 },
        removeOnFail: { age: 24 * 3600 },
      },
    );
    queued++;
  }

  // 7. Respond immediately — do NOT wait for LLM processing
  return NextResponse.json(
    { status: 'queued', count: queued, rateLimited },
    { status: rateLimited > 0 && queued === 0 ? 429 : 202 },
  );
}