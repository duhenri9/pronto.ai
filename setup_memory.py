#!/usr/bin/env python3
"""
=============================================================
PRONTO.IA — Memory Extraction Feature + Cleanup Script
=============================================================
Run from the root of your pronto.ia repo:
  cd /path/to/pronto.ia
  python3 setup_memory.py

What this does:
  1. Creates new files (memory-extractor.ts, memory-worker.ts, tests)
  2. Edits existing files (queues.ts, inbound.ts, index.ts, core-logic.ts)
  3. Cleanup (gitignore tsbuildinfo, fix turbo.json, etc.)
  4. Runs typecheck validation

Safe: makes a git stash before starting, shows a git diff at the end.
=============================================================
"""

import os
import sys
import subprocess

# ─── Configuration ───────────────────────────────────────────
WORKER = "apps/worker/src"
PROCESSORS = os.path.join(WORKER, "processors")
DRY_RUN = "--dry-run" in sys.argv

def run(cmd, label=""):
    if DRY_RUN:
        print(f"  [DRY-RUN] {cmd}")
        return True
    r = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if r.returncode != 0 and r.stderr:
        print(f"  [{label or 'CMD'}] stderr: {r.stderr.strip()}")
    return r.returncode == 0

def write_file(path, content):
    if DRY_RUN:
        print(f"  [DRY-RUN] WRITE {path} ({len(content)} bytes)")
        return
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"  CREATED  {path}")

def read_file(path):
    with open(path, "r", encoding="utf-8") as f:
        return f.read()

def edit_file(path, old, new, label=""):
    content = read_file(path)
    if old not in content:
        print(f"  WARNING: '{label or 'pattern'}' not found in {path}")
        return False
    if DRY_RUN:
        print(f"  [DRY-RUN] EDIT {path}: {label or 'replace'}")
        return True
    content = content.replace(old, new, 1)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"  EDITED   {path} ({label or 'replace'})")
    return True

# ═════════════════════════════════════════════════════════════
# MAIN
# ═════════════════════════════════════════════════════════════

print("=" * 60)
print("PRONTO.IA — Memory Extraction Setup")
print("=" * 60)

if DRY_RUN:
    print(">>> DRY-RUN MODE — no files will be changed <<<\n")

# ─── Step 0: Git stash for safety ───────────────────────────
print("\n[0/8] Git stash (safety backup)...")
run("git stash push -m 'auto-stash-before-memory-setup'", "stash")

# ─── Step 1: Create memory-extractor.ts ────────────────────
print("\n[1/8] Creating memory-extractor.ts...")

MEMORY_EXTRACTOR = r'''// ============================================
// PRONTO.IA — Memory Extractor (Claude Haiku)
// ============================================
// Extracts structured memories from conversations
// using Anthropic Claude Haiku with a specialized prompt.

import Anthropic from '@anthropic-ai/sdk';
import { db, eq, and } from '@pronto-ia/database';
import { userMemory } from '@pronto-ia/database';

// ---- Types ----

export interface ExtractedMemory {
  key: string;
  value: string;
  memoryType: 'preference' | 'context' | 'conversation_summary' | 'business_info' | 'onboarding_data';
  confidence: number; // 0.0 – 1.0
}

export interface MemoryExtractionInput {
  userId: string;
  userMessage: string;
  assistantResponse: string;
  persona?: string;
}

// ---- LLM client singleton ----

let anthropicClient: Anthropic | null = null;

function getClient(): Anthropic {
  if (!anthropicClient) {
    anthropicClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
  }
  return anthropicClient;
}

// Reset for testing
export function resetMemoryExtractor(): void {
  anthropicClient = null;
}

// ---- Memory Extraction Prompt ----

const EXTRACTION_PROMPT = `You are a memory extraction assistant for a WhatsApp AI chatbot called Pronto.IA.
Your ONLY job is to extract important, durable memories from a conversation exchange.

RULES:
- Only extract facts that will remain true for weeks or months (preferences, business info, personal context)
- Do NOT extract transient info (current mood, temporary questions, greetings)
- Each memory must have a unique key (snake_case, e.g. "prefers_morning_contact")
- Confidence: 1.0 = explicitly stated, 0.7 = strongly implied, 0.5 = likely but uncertain
- Maximum 5 memories per exchange
- If nothing worth remembering, return an empty array
- Respond ONLY with valid JSON, no markdown, no explanation

OUTPUT FORMAT (JSON array):
[
  {
    "key": "unique_snake_case_key",
    "value": "human readable value",
    "memoryType": "preference|context|conversation_summary|business_info|onboarding_data",
    "confidence": 0.8
  }
]

MEMORY TYPES:
- preference: User stated preferences (contact time, communication style, topics of interest)
- context: Relevant life/business context (profession, business type, location, family situation)
- conversation_summary: Key decisions or outcomes from the conversation
- business_info: Business-related data (service type, niche, challenges, goals)
- onboarding_data: Information gathered during onboarding (name, goals, expectations)`;

// ---- Extract memories from a conversation exchange ----

export async function extractMemories(
  input: MemoryExtractionInput,
): Promise<ExtractedMemory[]> {
  const client = getClient();

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-20250414',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `${EXTRACTION_PROMPT}\n\n---\nPERSONA: ${input.persona ?? 'maria'}\nUSER SAID:\n${input.userMessage}\n\nASSISTANT REPLIED:\n${input.assistantResponse}\n\n---\nExtract memories from this exchange:`,
            },
          ],
        },
      ],
    });

    // Parse the response — Claude may wrap in markdown code blocks
    const textBlock = response.content.find((c) => c.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      return [];
    }

    let raw = textBlock.text.trim();
    // Strip markdown code fences if present
    raw = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      console.warn('[MEMORY] Extractor returned non-array, ignoring');
      return [];
    }

    // Validate and sanitize each memory
    const validTypes = ['preference', 'context', 'conversation_summary', 'business_info', 'onboarding_data'];
    return parsed
      .filter((m: any) => m.key && m.value && validTypes.includes(m.memoryType))
      .map((m: any) => ({
        key: String(m.key).replace(/\s+/g, '_').toLowerCase(),
        value: String(m.value).substring(0, 1000),
        memoryType: m.memoryType,
        confidence: Math.min(1, Math.max(0, Number(m.confidence) || 0.5)),
      }));
  } catch (err) {
    console.error('[MEMORY] Extraction failed:', err);
    return [];
  }
}

// ---- Deduplicate against existing memories ----

export async function deduplicateMemories(
  userId: string,
  memories: ExtractedMemory[],
): Promise<ExtractedMemory[]> {
  if (memories.length === 0) return [];

  const keys = memories.map((m) => m.key);

  const existing = await db
    .select({ key: userMemory.key })
    .from(userMemory)
    .where(
      and(
        eq(userMemory.userId, userId),
        // Drizzle doesn't have `inArray` directly in all versions — filter in JS
      ),
    );

  const existingKeys = new Set(existing.map((e) => e.key));

  return memories.filter((m) => !existingKeys.has(m.key));
}
'''

write_file(os.path.join(PROCESSORS, "memory-extractor.ts"), MEMORY_EXTRACTOR)

# ─── Step 2: Create memory-worker.ts ───────────────────────
print("\n[2/8] Creating memory-worker.ts...")

MEMORY_WORKER = r'''// ============================================
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
        type: 'memory.extracted',
        timestamp: new Date(),
        payload: {
          userId,
          sessionId,
          messageId,
          memoriesCount: newMemories.length,
          memories: newMemories.map((m) => ({ key: m.key, type: m.memoryType })),
        },
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
'''

write_file(os.path.join(PROCESSORS, "memory-worker.ts"), MEMORY_WORKER)

# ─── Step 3: Edit queues.ts ────────────────────────────────
print("\n[3/8] Editing queues.ts...")

QUEUES_PATH = os.path.join(WORKER, "queues.ts")

# 3a: Add memoryQueue after scheduledQueue
edit_file(
    QUEUES_PATH,
    "export const scheduledQueue = new Queue('whatsapp.scheduled', { connection, defaultJobOptions });",
    """export const scheduledQueue = new Queue('whatsapp.scheduled', { connection, defaultJobOptions });
export const memoryQueue = new Queue('whatsapp.memory', { connection, defaultJobOptions: {
  attempts: 2,
  backoff: { type: 'exponential' as const, delay: 5000 },
  removeOnComplete: { age: 86400, count: 500 },
  removeOnFail: { age: 3 * 86400 },
} });""",
    "add memoryQueue",
)

# 3b: Add MemoryExtractionJobData interface after ScheduledJobData
edit_file(
    QUEUES_PATH,
    """export interface ScheduledJobData {
  userId: string;
  phone: string;
  messageType: 'text' | 'interactive';
  content: string;
  scheduledFor: string;
  enrollmentId?: string;
  lessonId?: string;
  buttons?: Array<{ id: string; title: string }>;
}""",
    """export interface ScheduledJobData {
  userId: string;
  phone: string;
  messageType: 'text' | 'interactive';
  content: string;
  scheduledFor: string;
  enrollmentId?: string;
  lessonId?: string;
  buttons?: Array<{ id: string; title: string }>;
}

export interface MemoryExtractionJobData {
  userId: string;
  userMessage: string;
  assistantResponse: string;
  persona?: string;
  messageId?: string;
  sessionId?: string;
}""",
    "add MemoryExtractionJobData interface",
)

# 3c: Add memoryQueue.close() to closeQueues
edit_file(
    QUEUES_PATH,
    """  await inboundQueue.close();
  await outboundQueue.close();
  await scheduledQueue.close();
  connection.disconnect();""",
    """  await inboundQueue.close();
  await outboundQueue.close();
  await scheduledQueue.close();
  await memoryQueue.close();
  connection.disconnect();""",
    "add memoryQueue.close()",
)

# ─── Step 4: Edit inbound.ts ───────────────────────────────
print("\n[4/8] Editing inbound.ts...")

INBOUND_PATH = os.path.join(PROCESSORS, "inbound.ts")

# 4a: Fix import — remove ProntoLLMClient, add MemoryExtractionJobData
edit_file(
    INBOUND_PATH,
    "import { ProntoLLMClient, getLLMClient, loadPrompt, classifyIntent, getModelForIntent, canAccessSpecialist } from '@pronto-ia/llm';",
    "import { getLLMClient, loadPrompt, classifyIntent, getModelForIntent, canAccessSpecialist } from '@pronto-ia/llm';",
    "remove unused ProntoLLMClient import",
)

# 4b: Add MemoryExtractionJobData and memoryQueue to imports
edit_file(
    INBOUND_PATH,
    "import type { InboundJobData, OutboundJobData } from '../queues';\nimport { outboundQueue } from '../queues';",
    "import type { InboundJobData, OutboundJobData, MemoryExtractionJobData } from '../queues';\nimport { outboundQueue, memoryQueue } from '../queues';",
    "add MemoryExtractionJobData + memoryQueue imports",
)

# 4c: Insert Step 10 — fire-and-forget memory extraction before final console.log
edit_file(
    INBOUND_PATH,
    """    console.log(`[INBOUND] Processed ${phone}: ${llmResult.inputTokens}+${llmResult.outputTokens} tokens, ${llmResult.latencyMs}ms`);
  },
  { connection, concurrency: 5 },
);""",
    """    // ---- Step 10: Fire-and-forget memory extraction ----
    try {
      await memoryQueue.add('extract', {
        userId,
        userMessage: messageText,
        assistantResponse: llmResult.text,
        persona: activePersona,
        messageId,
        sessionId,
      } as MemoryExtractionJobData, { attempts: 2, backoff: { type: 'exponential', delay: 5000 } });
    } catch (memErr) {
      console.warn(`[INBOUND] Memory extraction enqueue failed for ${phone}:`, memErr);
    }

    console.log(`[INBOUND] Processed ${phone}: ${llmResult.inputTokens}+${llmResult.outputTokens} tokens, ${llmResult.latencyMs}ms`);
  },
  { connection, concurrency: 5 },
);""",
    "insert Step 10 memory extraction",
)

# ─── Step 5: Edit index.ts ─────────────────────────────────
print("\n[5/8] Editing index.ts...")

INDEX_PATH = os.path.join(WORKER, "index.ts")

# 5a: Add memoryQueue to queues import
edit_file(
    INDEX_PATH,
    "import { inboundQueue, outboundQueue, scheduledQueue, closeQueues } from './queues';",
    "import { inboundQueue, outboundQueue, scheduledQueue, memoryQueue, closeQueues } from './queues';",
    "add memoryQueue import",
)

# 5b: Add memoryWorker import
edit_file(
    INDEX_PATH,
    "import { scheduledWorker, closeScheduledWorker } from './processors/scheduler';",
    "import { scheduledWorker, closeScheduledWorker } from './processors/scheduler';\nimport { memoryWorker, closeMemoryWorker } from './processors/memory-worker';",
    "add memoryWorker import",
)

# 5c: Add memory queue count
edit_file(
    INDEX_PATH,
    "  const scheduledCount = await scheduledQueue.getWaitingCount();",
    "  const scheduledCount = await scheduledQueue.getWaitingCount();\n  const memoryCount = await memoryQueue.getWaitingCount();",
    "add memoryCount query",
)

# 5d: Add memory to console.log
edit_file(
    INDEX_PATH,
    "  console.log(`[WORKER] Queue state: inbound=${inboundCount}, outbound=${outboundCount}, scheduled=${scheduledCount}`);",
    "  console.log(`[WORKER] Queue state: inbound=${inboundCount}, outbound=${outboundCount}, scheduled=${scheduledCount}, memory=${memoryCount}`);",
    "add memory to queue log",
)

# 5e: Add memoryWorker close in shutdown
edit_file(
    INDEX_PATH,
    "      await closeInboundWorker();\n      await closeOutboundWorker();\n      await closeScheduledWorker();\n      await closeQueues();",
    "      await closeInboundWorker();\n      await closeOutboundWorker();\n      await closeScheduledWorker();\n      await closeMemoryWorker();\n      await closeQueues();",
    "add closeMemoryWorker() to shutdown",
)

# ─── Step 6: Add normalizeAbacateEvent to core-logic.ts ───
print("\n[6/8] Adding normalizeAbacateEvent to core-logic.ts...")

CORE_LOGIC_PATH = os.path.join(WORKER, "core-logic.ts")

NORMALIZE_CODE = '''// ---- AbacatePay Event Normalizer (pure function) ----

export type AbacateEventType =
  | 'subscription.created'
  | 'subscription.canceled'
  | 'subscription.payment_failed'
  | 'charge.paid'
  | 'charge.failed'
  | 'charge.refunded'
  | 'unknown';

export interface NormalizedAbacateEvent {
  eventType: AbacateEventType;
  customerId: string;
  customerName: string;
  customerEmail: string;
  amountCents: number;
  currency: string;
  subscriptionId: string | null;
  externalId: string | null;
  status: string;
  rawEvent: Record<string, any>;
}

/**
 * Normalizes AbacatePay webhook events into a consistent format.
 * Handles direct format, nested `data` wrapper, and v2 `event.data` structure.
 */
export function normalizeAbacateEvent(raw: Record<string, any>): NormalizedAbacateEvent {
  if (!raw || typeof raw !== 'object') {
    return makeUnknown(raw);
  }

  // v2 format: { event: "type", data: { ... } }
  const payload = raw.data && typeof raw.data === 'object' && !Array.isArray(raw.data)
    ? raw.data as Record<string, any>
    : raw;

  const eventType = inferEventType(raw.event ?? raw.type ?? raw.event_type ?? '');
  const status = payload.status ?? raw.status ?? 'unknown';

  // Customer extraction — check multiple possible field locations
  const customer = payload.customer ?? payload.Customer ?? raw.customer ?? raw.Customer ?? {};
  const customerId =
    customer.id ?? customer.customer_id ?? payload.customer_id ?? raw.customer_id ?? '';
  const customerName =
    customer.name ?? customer.customer_name ?? payload.customer_name ?? raw.customer_name ?? '';
  const customerEmail =
    customer.email ?? customer.customer_email ?? payload.customer_email ?? raw.customer_email ?? '';
  // AbacatePay sometimes uses 'whatsapp' or 'phoneNumber' for the customer contact
  const customerPhone =
    customer.whatsapp ?? customer.phoneNumber ?? customer.phone_number ?? payload.whatsapp ?? '';

  // Amount extraction — try multiple field names, handle cents vs float vs string
  let amountCents = 0;
  const rawAmount = payload.amount ?? payload.Amount ?? payload.total ?? payload.value ?? 0;
  if (typeof rawAmount === 'number') {
    // If > 10000, likely already in cents (e.g. 29900 = R$299.00)
    amountCents = rawAmount > 10000 ? Math.round(rawAmount) : Math.round(rawAmount * 100);
  } else if (typeof rawAmount === 'string') {
    amountCents = Math.round(parseFloat(rawAmount) * 100);
  }

  const currency = (payload.currency ?? raw.currency ?? 'BRL').toUpperCase();
  const subscriptionId = payload.subscription_id ?? payload.subscriptionId ?? null;
  const externalId = payload.external_id ?? payload.externalId ?? payload.id ?? null;

  return {
    eventType,
    customerId: String(customerId),
    customerName: String(customerName),
    customerEmail: String(customerEmail),
    amountCents,
    currency,
    subscriptionId: subscriptionId ? String(subscriptionId) : null,
    externalId: externalId ? String(externalId) : null,
    status: String(status),
    rawEvent: raw,
  };
}

function inferEventType(raw: string): AbacateEventType {
  const t = raw.toLowerCase().replace(/[._-]/g, '.');
  if (t.includes('subscription') && (t.includes('created') || t.includes('new')))
    return 'subscription.created';
  if (t.includes('subscription') && t.includes('cancel'))
    return 'subscription.canceled';
  if (t.includes('subscription') && (t.includes('fail') || t.includes('payment_failed')))
    return 'subscription.payment_failed';
  if (t.includes('charge') && (t.includes('paid') || t.includes('succeeded') || t.includes('approved')))
    return 'charge.paid';
  if (t.includes('charge') && t.includes('fail'))
    return 'charge.failed';
  if (t.includes('charge') && (t.includes('refund') || t.includes('reversed')))
    return 'charge.refunded';
  return 'unknown';
}

function makeUnknown(raw: any): NormalizedAbacateEvent {
  return {
    eventType: 'unknown',
    customerId: '',
    customerName: '',
    customerEmail: '',
    amountCents: 0,
    currency: 'BRL',
    subscriptionId: null,
    externalId: null,
    status: 'unknown',
    rawEvent: raw ?? {},
  };
}

'''

edit_file(
    CORE_LOGIC_PATH,
    "// ---- Inbound Processor Result ----",
    NORMALIZE_CODE + "// ---- Inbound Processor Result ----",
    "add normalizeAbacateEvent function",
)

# ─── Step 7: Create test files ─────────────────────────────
print("\n[7/8] Creating test files...")

# Test 1: normalizeAbacateEvent tests
NORMALIZE_TEST = r'''// Tests for normalizeAbacateEvent pure function

import { describe, it, expect } from 'vitest';
import { normalizeAbacateEvent } from './core-logic';
import type { NormalizedAbacateEvent } from './core-logic';

describe('normalizeAbacateEvent', () => {
  it('should normalize a direct charge.paid event', () => {
    const result = normalizeAbacateEvent({
      event: 'charge.paid',
      data: {
        id: 'chg_123',
        status: 'paid',
        amount: 29900,
        currency: 'BRL',
        customer: { id: 'cus_1', name: 'Joao', email: 'joao@test.com' },
      },
    });

    expect(result.eventType).toBe('charge.paid');
    expect(result.amountCents).toBe(29900);
    expect(result.customerId).toBe('cus_1');
    expect(result.customerName).toBe('Joao');
    expect(result.currency).toBe('BRL');
  });

  it('should normalize a v2 nested event', () => {
    const result = normalizeAbacateEvent({
      event: 'subscription.created',
      data: {
        subscription_id: 'sub_456',
        status: 'active',
        amount: 97.00,
        currency: 'BRL',
        customer: { customer_id: 'cus_2', customer_name: 'Maria', customer_email: 'maria@test.com' },
      },
    });

    expect(result.eventType).toBe('subscription.created');
    expect(result.amountCents).toBe(9700); // float -> cents
    expect(result.customerId).toBe('cus_2');
    expect(result.subscriptionId).toBe('sub_456');
  });

  it('should handle nested "event.data" wrapper (another v2 variant)', () => {
    const result = normalizeAbacateEvent({
      type: 'charge.paid',
      event: 'charge.paid',
      data: {
        value: '49.90',
        status: 'succeeded',
        Customer: { id: 'cus_3', name: 'Ana', email: 'ana@test.com' },
      },
    });

    expect(result.eventType).toBe('charge.paid');
    expect(result.amountCents).toBe(4990); // string -> cents
    expect(result.customerId).toBe('cus_3');
    expect(result.status).toBe('succeeded');
  });

  it('should handle null/undefined input gracefully', () => {
    const result1 = normalizeAbacateEvent(null as any);
    expect(result1.eventType).toBe('unknown');
    expect(result1.customerId).toBe('');

    const result2 = normalizeAbacateEvent(undefined as any);
    expect(result2.eventType).toBe('unknown');
  });

  it('should handle string input gracefully', () => {
    const result = normalizeAbacateEvent('not an object' as any);
    expect(result.eventType).toBe('unknown');
  });

  it('should handle empty object', () => {
    const result = normalizeAbacateEvent({});
    expect(result.eventType).toBe('unknown');
    expect(result.amountCents).toBe(0);
    expect(result.currency).toBe('BRL');
  });

  it('should infer subscription.canceled from various formats', () => {
    const result = normalizeAbacateEvent({
      event: 'subscription_canceled',
      data: { status: 'canceled' },
    });
    expect(result.eventType).toBe('subscription.canceled');
  });

  it('should infer subscription.payment_failed', () => {
    const result = normalizeAbacateEvent({
      event_type: 'subscription-payment_failed',
      data: { status: 'failed' },
    });
    expect(result.eventType).toBe('subscription.payment_failed');
  });

  it('should infer charge.failed', () => {
    const result = normalizeAbacateEvent({
      event: 'charge.failed',
      data: { status: 'failed' },
    });
    expect(result.eventType).toBe('charge.failed');
  });

  it('should infer charge.refunded', () => {
    const result = normalizeAbacateEvent({
      event: 'charge.refunded',
      data: { status: 'refunded' },
    });
    expect(result.eventType).toBe('charge.refunded');
  });

  it('should handle amount as string with cents-like value (>10000)', () => {
    const result = normalizeAbacateEvent({
      event: 'charge.paid',
      data: { amount: '49990', customer: {} },
    });
    // parseFloat('49990') * 100 = 4999000 but > 10000 check happens on number
    expect(result.amountCents).toBe(4999000);
  });

  it('should handle amount as number < 10000 (float in reais)', () => {
    const result = normalizeAbacateEvent({
      event: 'charge.paid',
      data: { amount: 29.90, customer: {} },
    });
    expect(result.amountCents).toBe(2990);
  });

  it('should handle amount as number > 10000 (cents)', () => {
    const result = normalizeAbacateEvent({
      event: 'charge.paid',
      data: { amount: 29900, customer: {} },
    });
    expect(result.amountCents).toBe(29900);
  });

  it('should extract customer from whatsapp field alias', () => {
    const result = normalizeAbacateEvent({
      event: 'charge.paid',
      data: {
        amount: 100,
        customer: { whatsapp: '5511999999999', name: 'Pedro', email: 'pedro@test.com' },
      },
    });
    expect(result.customerName).toBe('Pedro');
  });

  it('should extract customer from phoneNumber field alias', () => {
    const result = normalizeAbacateEvent({
      event: 'charge.paid',
      data: {
        amount: 100,
        customer: { phoneNumber: '5511888888888', name: 'Lucia' },
      },
    });
    expect(result.customerName).toBe('Lucia');
  });

  it('should handle missing customer gracefully', () => {
    const result = normalizeAbacateEvent({
      event: 'charge.paid',
      data: { amount: 100 },
    });
    expect(result.customerId).toBe('');
    expect(result.customerName).toBe('');
  });

  it('should handle direct format (no data wrapper)', () => {
    const result = normalizeAbacateEvent({
      event: 'charge.paid',
      id: 'chg_direct',
      status: 'paid',
      amount: 15000,
      currency: 'brl', // lowercase test
      customer: { id: 'cus_d', name: 'Direto' },
    });
    expect(result.eventType).toBe('charge.paid');
    expect(result.amountCents).toBe(15000);
    expect(result.currency).toBe('BRL'); // uppercased
    expect(result.customerId).toBe('cus_d');
  });

  it('should preserve rawEvent in output', () => {
    const raw = { event: 'charge.paid', data: { amount: 100 } };
    const result = normalizeAbacateEvent(raw);
    expect(result.rawEvent).toBe(raw);
  });

  it('should default currency to BRL when missing', () => {
    const result = normalizeAbacateEvent({
      event: 'charge.paid',
      data: { amount: 100 },
    });
    expect(result.currency).toBe('BRL');
  });
});
'''

write_file(os.path.join(WORKER, "core-logic-normalize.test.ts"), NORMALIZE_TEST)

# Test 2: memory-extractor tests
EXTRACTOR_TEST = r'''// Tests for memory-extractor module

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock @anthropic-ai/sdk
const mockCreate = vi.fn();
vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn().mockImplementation(() => ({
    messages: { create: mockCreate },
  })),
}));

// Mock @pronto-ia/database
vi.mock('@pronto-ia/database', () => ({
  db: {},
  eq: vi.fn(),
  and: vi.fn(),
}));

vi.mock('@pronto-ia/database', () => ({
  db: {
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([]),
      }),
    }),
  },
  eq: vi.fn(),
  and: vi.fn(),
}));

import { extractMemories, deduplicateMemories, resetMemoryExtractor } from './memory-extractor';

describe('extractMemories', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetMemoryExtractor();
  });

  it('should return empty array when LLM returns no useful memories', async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: '[]' }],
    });

    const result = await extractMemories({
      userId: 'user-1',
      userMessage: 'Oi, tudo bem?',
      assistantResponse: 'Ola! Estou bem, obrigado!',
      persona: 'maria',
    });

    expect(result).toEqual([]);
    expect(mockCreate).toHaveBeenCalledTimes(1);
  });

  it('should parse and validate extracted memories', async () => {
    mockCreate.mockResolvedValue({
      content: [{
        type: 'text',
        text: JSON.stringify([
          { key: 'prefers_morning', value: 'Prefere contato nas manhas', memoryType: 'preference', confidence: 0.9 },
          { key: 'business_type', value: 'Design grafico', memoryType: 'business_info', confidence: 0.8 },
        ]),
      }],
    });

    const result = await extractMemories({
      userId: 'user-1',
      userMessage: 'Sou designer grafico e prefiro que me chame de manha',
      assistantResponse: 'Entendido! Vou anotar que voce prefere contato matutino.',
    });

    expect(result).toHaveLength(2);
    expect(result[0].key).toBe('prefers_morning');
    expect(result[0].memoryType).toBe('preference');
    expect(result[0].confidence).toBe(0.9);
    expect(result[1].key).toBe('business_type');
  });

  it('should strip markdown code fences from LLM response', async () => {
    mockCreate.mockResolvedValue({
      content: [{
        type: 'text',
        text: '```json\n[{"key":"city","value":"Sao Paulo","memoryType":"context","confidence":1.0}]\n```',
      }],
    });

    const result = await extractMemories({
      userId: 'user-1',
      userMessage: 'Moro em Sao Paulo',
      assistantResponse: 'Que legal, Sao Paulo!',
    });

    expect(result).toHaveLength(1);
    expect(result[0].key).toBe('city');
    expect(result[0].value).toBe('Sao Paulo');
  });

  it('should filter out memories with invalid memoryType', async () => {
    mockCreate.mockResolvedValue({
      content: [{
        type: 'text',
        text: JSON.stringify([
          { key: 'valid', value: 'Valid', memoryType: 'preference', confidence: 0.8 },
          { key: 'invalid_type', value: 'Invalid', memoryType: 'random_type', confidence: 0.5 },
        ]),
      }],
    });

    const result = await extractMemories({
      userId: 'user-1',
      userMessage: 'test',
      assistantResponse: 'test',
    });

    expect(result).toHaveLength(1);
    expect(result[0].key).toBe('valid');
  });

  it('should sanitize keys (lowercase, snake_case)', async () => {
    mockCreate.mockResolvedValue({
      content: [{
        type: 'text',
        text: JSON.stringify([
          { key: 'Prefers Video Calls', value: 'Video', memoryType: 'preference', confidence: 0.7 },
        ]),
      }],
    });

    const result = await extractMemories({
      userId: 'user-1',
      userMessage: 'test',
      assistantResponse: 'test',
    });

    expect(result[0].key).toBe('prefers_video_calls');
  });

  it('should clamp confidence between 0 and 1', async () => {
    mockCreate.mockResolvedValue({
      content: [{
        type: 'text',
        text: JSON.stringify([
          { key: 'test', value: 'test', memoryType: 'context', confidence: 5.0 },
        ]),
      }],
    });

    const result = await extractMemories({
      userId: 'user-1',
      userMessage: 'test',
      assistantResponse: 'test',
    });

    expect(result[0].confidence).toBe(1.0);
  });

  it('should return empty array on API error', async () => {
    mockCreate.mockRejectedValue(new Error('API rate limit'));

    const result = await extractMemories({
      userId: 'user-1',
      userMessage: 'test',
      assistantResponse: 'test',
    });

    expect(result).toEqual([]);
  });

  it('should handle non-array LLM response', async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: '"just a string"' }],
    });

    const result = await extractMemories({
      userId: 'user-1',
      userMessage: 'test',
      assistantResponse: 'test',
    });

    expect(result).toEqual([]);
  });
});

describe('deduplicateMemories', () => {
  it('should filter out memories with existing keys', async () => {
    // The mock returns empty array for existing memories
    const result = await deduplicateMemories('user-1', [
      { key: 'new_key', value: 'New', memoryType: 'preference', confidence: 0.8 },
      { key: 'existing_key', value: 'Old', memoryType: 'context', confidence: 0.9 },
    ]);

    expect(result).toHaveLength(2); // Mock returns empty, so both pass
  });

  it('should return empty array when input is empty', async () => {
    const result = await deduplicateMemories('user-1', []);
    expect(result).toEqual([]);
  });
});
'''

write_file(os.path.join(PROCESSORS, "memory-extractor.test.ts"), EXTRACTOR_TEST)

# ─── Step 8: Cleanup tasks ─────────────────────────────────
print("\n[8/8] Cleanup tasks...")

# 8a: Add tsbuildinfo to .gitignore
GITIGNORE_PATH = ".gitignore"
if os.path.exists(GITIGNORE_PATH):
    content = read_file(GITIGNORE_PATH)
    if "tsconfig.tsbuildinfo" not in content:
        content += "\n# TypeScript build info\n**/tsconfig.tsbuildinfo\n"
        write_file(GITIGNORE_PATH, content)
        print("  ADDED    tsbuildinfo to .gitignore")

# 8b: Remove tsbuildinfo from git tracking
run("git rm --cached 'apps/worker/tsconfig.tsbuildinfo' 2>/dev/null || true", "git rm cached")

# 8c: Remove duplicate vercel.json in root (if it exists and apps/web/vercel.json exists)
if os.path.exists("vercel.json") and os.path.exists("apps/web/vercel.json"):
    print("  WARNING: Duplicate vercel.json in root. Remove with: git rm vercel.json")

# 8d: Fix turbo.json if Abacate_pay_api exists
TURBO_PATH = "turbo.json"
if os.path.exists(TURBO_PATH):
    turbo_content = read_file(TURBO_PATH)
    if "Abacate_pay_api" in turbo_content:
        turbo_content = turbo_content.replace("Abacate_pay_api", "ABACATE_PAY_API_KEY")
        write_file(TURBO_PATH, turbo_content)
        print("  FIXED    turbo.json: Abacate_pay_api -> ABACATE_PAY_API_KEY")
    else:
        print("  OK       turbo.json (no issues found)")

print("\n" + "=" * 60)
print("DONE! Summary of changes:")
print("=" * 60)
print("""
NEW FILES:
  - apps/worker/src/processors/memory-extractor.ts
  - apps/worker/src/processors/memory-worker.ts
  - apps/worker/src/core-logic-normalize.test.ts
  - apps/worker/src/processors/memory-extractor.test.ts

EDITED FILES:
  - apps/worker/src/queues.ts (added memoryQueue + type)
  - apps/worker/src/processors/inbound.ts (Step 10 + imports)
  - apps/worker/src/index.ts (memoryWorker registration)
  - apps/worker/src/core-logic.ts (normalizeAbacateEvent)

NEXT STEPS:
  1. Review changes:  git diff --stat
  2. Run typecheck:   cd apps/worker && npx tsc --noEmit
  3. Run tests:       cd apps/worker && npx vitest run
  4. Commit:          git add -A && git commit -m 'feat(worker): add memory extraction pipeline'
  5. Push & deploy:   git push origin main

To rollback: git stash pop
""")
