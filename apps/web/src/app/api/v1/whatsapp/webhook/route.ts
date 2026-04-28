// ============================================
// PRONTO.IA — WhatsApp Webhook API Route
// ============================================
// Receives inbound messages from Z-API or Meta Cloud API,
// validates the request, parses the message, and enqueues
// a BullMQ job for the worker to process asynchronously.
//
// Architecture: Vercel (this route) → Redis → Railway (worker)
// The webhook responds immediately (200/202) to avoid Z-API timeout.

import { NextRequest, NextResponse } from 'next/server';
import { Queue } from 'bullmq';
import { createWhatsAppProvider } from '@pronto-ia/whatsapp';
import type { ParsedWebhookEvent } from '@pronto-ia/whatsapp';
import { redis } from '@/lib/redis';

// BullMQ queue — same name as worker's inboundQueue
const inboundQueue = new Queue('whatsapp.inbound', { connection: redis });

// ---- GET: Webhook Verification (Meta Cloud API) ----

export async function GET(request: NextRequest) {
  const provider = createWhatsAppProvider();

  const mode = request.nextUrl.searchParams.get('hub.mode');
  const token = request.nextUrl.searchParams.get('hub.verify_token');
  const challenge = request.nextUrl.searchParams.get('hub.challenge');

  if (!mode || !token) {
    return NextResponse.json({ error: 'Missing verification parameters' }, { status: 400 });
  }

  const isValid = await provider.verifyWebhook(mode, token);

  if (!isValid) {
    return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
  }

  // Meta expects the challenge to be returned as plain text
  return new NextResponse(challenge ?? 'verified', { status: 200 });
}

// ---- POST: Inbound Message Handler ----

export async function POST(request: NextRequest) {
  const provider = createWhatsAppProvider();

  // 1. Parse raw body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // 2. Parse webhook events using provider
  const events: ParsedWebhookEvent[] = provider.parseWebhook(body);

  if (events.length === 0) {
    // No actionable events (e.g. status update only)
    return NextResponse.json({ status: 'no_message' }, { status: 200 });
  }

  // 3. Filter only message events (ignore status updates)
  const messageEvents = events.filter((e) => e.eventType === 'message');

  // 4. Enqueue each message as a BullMQ job
  for (const event of messageEvents) {
    await inboundQueue.add(
      `inbound-${event.phone}-${event.messageId}`,
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
  }

  // 5. Respond immediately — do NOT wait for LLM processing
  return NextResponse.json(
    { status: 'queued', count: messageEvents.length },
    { status: 202 },
  );
}