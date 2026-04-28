// ============================================
// PRONTO.IA — Worker: Inbound Message Processor
// ============================================
// Receives a WhatsApp inbound message from the queue,
// resolves the user's session/context, calls the LLM,
// saves to database, and enqueues an outbound job.

import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { db, eq, desc } from '@pronto-ia/database';
import {
  users,
  whatsappSessions,
  whatsappMessages,
  llmCalls,
  enrollments,
  processedEvents,
} from '@pronto-ia/database';
import { ProntoLLMClient } from '@pronto-ia/llm';
import { getLLMClient } from '@pronto-ia/llm';
import type { ChatMessage, LLMCallResult } from '@pronto-ia/llm';
import { eventBus } from '@pronto-ia/events';

import type { InboundJobData, OutboundJobData } from '../queues';
import { outboundQueue } from '../queues';

const connection = new IORedis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
});

export const inboundWorker = new Worker<InboundJobData>(
  'whatsapp.inbound',
  async (job: Job<InboundJobData>) => {
    const { phone, messageText, messageId, messageType, profileName } = job.data;

    console.log(`[INBOUND] Processing message from ${phone}: "${messageText?.substring(0, 50)}..."`);

    // ---- Step 1: Resolve or create user + session ----

    const session = await resolveSession(phone, profileName);
    if (!session) {
      console.error(`[INBOUND] Could not resolve session for phone ${phone}`);
      return;
    }

    const userId = session.userId;
    const sessionId = session.id;

    // ---- Step 2: Save inbound message to DB ----

    await db.insert(whatsappMessages).values({
      sessionId,
      userId,
      waMessageId: messageId,
      direction: 'inbound',
      messageType: messageType,
      textContent: messageText,
      personaUsed: session.currentPersona,
      status: 'delivered',
    });

    // ---- Step 3: Resolve persona + enrollment context ----

    const persona = session.currentPersona;
    let enrollmentId: string | undefined;
    let lessonId: string | undefined;

    const enrollment = await resolveActiveEnrollment(userId);
    if (enrollment) {
      enrollmentId = enrollment.id;
      lessonId = enrollment.currentLessonId ?? undefined;
    }

    // ---- Step 4: Build conversation history ----

    const recentMessages = await db
      .select()
      .from(whatsappMessages)
      .where(eq(whatsappMessages.sessionId, sessionId))
      .orderBy(desc(whatsappMessages.createdAt))
      .limit(10);

    // Reverse to chronological order (oldest first) for LLM context
    const chatHistory: ChatMessage[] = recentMessages
      .reverse()
      .filter((m) => m.textContent != null)
      .map((m) => ({
        role: m.direction === 'inbound' ? 'user' : 'assistant',
        content: m.textContent!,
      }));

    // Add current message
    chatHistory.push({ role: 'user', content: messageText });

    // ---- Step 5: Call LLM ----

    const llm = getLLMClient();
    let llmResult: LLMCallResult;

    try {
      llmResult = await llm.chat({
        persona,
        messages: chatHistory,
        userId,
        sessionId,
        lessonId,
      });
    } catch (err) {
      console.error(`[INBOUND] LLM call failed for ${phone}:`, err);
      // Enqueue fallback outbound message
      await outboundQueue.add('fallback', {
        userId,
        phone,
        messageText: 'Ops! Tive um pequeno problema técnico. Pode repetir? 😊',
        messageType: 'text',
        persona,
        sessionId,
      } as OutboundJobData, { attempts: 2, backoff: { type: 'exponential', delay: 5000 } });
      return;
    }

    // ---- Step 6: Save LLM call to DB ----

    const llmCallRecord = await db.insert(llmCalls).values({
      userId,
      model: llmResult.model,
      persona: llmResult.persona,
      inputTokens: llmResult.inputTokens,
      outputTokens: llmResult.outputTokens,
      finishReason: llmResult.finishReason,
      estimatedCostCents: llmResult.estimatedCostCents,
      latencyMs: llmResult.latencyMs,
      sessionId,
      lessonId,
    }).returning({ id: llmCalls.id });

    const llmCallId = llmCallRecord[0]?.id;

    // ---- Step 7: Update session state ----

    await db
      .update(whatsappSessions)
      .set({
        lastMessageAt: new Date(),
        messageCount: session.messageCount + 1,
        updatedAt: new Date(),
      })
      .where(eq(whatsappSessions.id, sessionId));

    // ---- Step 8: Emit event ----

    eventBus.emit({
      type: 'whatsapp.inbound',
      timestamp: new Date(),
      payload: {
        userId,
        phone,
        messageText,
        messageId,
        messageType,
        sessionId,
      },
    });

    eventBus.emit({
      type: 'llm.call',
      timestamp: new Date(),
      payload: {
        userId,
        model: llmResult.model,
        persona: llmResult.persona,
        inputTokens: llmResult.inputTokens,
        outputTokens: llmResult.outputTokens,
        costCents: llmResult.estimatedCostCents,
        latencyMs: llmResult.latencyMs,
      },
    });

    // ---- Step 9: Enqueue outbound response ----

    await outboundQueue.add('response', {
      userId,
      phone,
      messageText: llmResult.text,
      messageType: 'text',
      persona,
      sessionId,
      lessonId,
      llmCallId,
    } as OutboundJobData, { attempts: 3, backoff: { type: 'exponential', delay: 2000 } });

    console.log(`[INBOUND] Processed ${phone}: ${llmResult.inputTokens}+${llmResult.outputTokens} tokens, ${llmResult.latencyMs}ms`);
  },
  { connection, concurrency: 5 },
);

// ---- Graceful shutdown ----

inboundWorker.on('failed', (job, err) => {
  console.error(`[INBOUND] Job ${job?.id} failed:`, err.message);
});

inboundWorker.on('completed', (job) => {
  console.log(`[INBOUND] Job ${job.id} completed`);
});

export async function closeInboundWorker(): Promise<void> {
  await inboundWorker.close();
}

// ---- Helpers ----

async function resolveSession(
  phone: string,
  profileName?: string,
) {
  // Find existing session
  const existing = await db
    .select()
    .from(whatsappSessions)
    .where(eq(whatsappSessions.phoneNumber, phone))
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  // No session — need user first. Find by phone or create.
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.phone, phone))
    .limit(1);

  let userId: string;

  if (existingUser.length > 0) {
    userId = existingUser[0].id;
  } else {
    // Create new user (student by default, minimal onboarding)
    const newUser = await db.insert(users).values({
      phone,
      name: profileName ?? phone,
      passwordHash: '', // WhatsApp users don't have passwords initially
      role: 'STUDENT',
      onboardingData: {},
    }).returning({ id: users.id });

    userId = newUser[0]?.id;
    if (!userId) return null;
  }

  // Create session
  const newSession = await db.insert(whatsappSessions).values({
    userId,
    phoneNumber: phone,
    currentPersona: 'maria',
    currentFlow: 'onboarding',
    flowState: {},
    isInSessionWindow: true,
    sessionWindowStart: new Date(),
    messageCount: 0,
  }).returning({
    id: whatsappSessions.id,
    userId: whatsappSessions.userId,
    currentPersona: whatsappSessions.currentPersona,
    currentFlow: whatsappSessions.currentFlow,
    messageCount: whatsappSessions.messageCount,
  });

  return newSession[0] ?? null;
}

async function resolveActiveEnrollment(userId: string) {
  const result = await db
    .select()
    .from(enrollments)
    .where(eq(enrollments.userId, userId))
    .limit(1);

  // Return first ACTIVE enrollment, if any
  return result.find((e) => e.status === 'ACTIVE') ?? null;
}