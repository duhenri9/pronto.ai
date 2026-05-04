// ============================================
// PRONTO.IA — Worker: Inbound Message Processor
// ============================================
// Receives a WhatsApp inbound message from the queue,
// resolves the user's session/context, calls the LLM,
// saves to database, and enqueues an outbound job.

import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import * as Sentry from '@sentry/node';
import { recordFailure } from './failure-tracker';
import { db, eq, desc } from '@pronto-ia/database';
import {
  users,
  whatsappSessions,
  whatsappMessages,
  llmCalls,
  enrollments,
  processedEvents,
} from '@pronto-ia/database';
import { getLLMClient, loadPrompt, classifyIntent, getModelForIntent, canAccessSpecialist } from '@pronto-ia/llm';
import type { ChatMessage, LLMCallResult, Intent } from '@pronto-ia/llm';
import { eventBus } from '@pronto-ia/events';

import type { InboundJobData, OutboundJobData, MemoryExtractionJobData } from '../queues';
import { outboundQueue, memoryQueue } from '../queues';
import {
  handleLgpdDeleteRequest,
  handleLgpdConfirmation,
  handleCancellationRequest,
  handleCancellationConfirmation,
  handleCancellationReason,
  handlePaymentInquiry,
  handleEmailCapture,
  handleProResponse,
  handleReactivationRequest,
} from '../flows';

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

    // ---- Step 2: Deduplicate by messageId ----

    const existingEvent = await db
      .select()
      .from(processedEvents)
      .where(eq(processedEvents.eventId, messageId))
      .limit(1);

    if (existingEvent.length > 0) {
      console.log(`[INBOUND] Duplicate message ${messageId}, skipping`);
      return;
    }

    // Mark as processed immediately to prevent concurrent workers from duplicating
    await db.insert(processedEvents).values({
      provider: 'whatsapp',
      eventId: messageId,
      eventType: 'whatsapp.inbound',
    });

    // ---- Step 3: Save inbound message to DB ----

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

    // ---- Step 4: Resolve persona + enrollment context ----

    const persona = session.currentPersona;
    let enrollmentId: string | undefined;
    let lessonId: string | undefined;

    const enrollment = await resolveActiveEnrollment(userId);
    if (enrollment) {
      enrollmentId = enrollment.id;
      lessonId = enrollment.currentLessonId ?? undefined;
    }

    // ---- Step 4.5: Classify intent + route to specific handlers ----

    const [userRow] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    const lifecycleState = userRow?.lifecycleState ?? 'provisional';
    const pendingAction = userRow?.pendingAction ?? null;

    const intentResult = await classifyIntent(messageText, lifecycleState);
    const intent = intentResult.intent;

    console.log(`[INBOUND] Intent: ${intent} (confidence: ${intentResult.confidence}, source: ${intentResult.source}) for phone ${phone}`);

    // Route to specific flow handlers based on intent + pending_action + lifecycle_state
    const handled = await routeToHandler(intent, userId, messageText, pendingAction, lifecycleState);
    if (handled) {
      // Handler took over — no LLM call needed, just emit event and return
      eventBus.emit({
        type: 'whatsapp.inbound',
        timestamp: new Date(),
        payload: { userId, phone, messageText, messageId, messageType, sessionId, intent },
      });
      console.log(`[INBOUND] Handled by flow: ${intent} for ${phone}`);
      return;
    }

    // ---- Step 4.6: Specialist routing (Zé da TI) ----
    // If intent is fundação digital and user has Pro access, switch to Zé da TI persona

    let activePersona = persona;

    if (intent === 'question_fundacao_digital' && persona !== 'ze-da-ti') {
      const hasAccess = await canAccessSpecialist(userId, 'ze-da-ti');
      if (hasAccess) {
        activePersona = 'ze-da-ti';
        // Update session so subsequent messages also go to Zé until handback
        await db
          .update(whatsappSessions)
          .set({ currentPersona: 'ze-da-ti', updatedAt: new Date() })
          .where(eq(whatsappSessions.id, sessionId));
        console.log(`[INBOUND] Routing to Zé da TI for user ${userId}`);
      }
      // If no access, Maria handles it — she may mention Zé in a Pro offer
    }

    // ---- Step 4b: Build conversation history ----

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

    // ---- Step 5: Call LLM (with model escalation based on intent) ----

    const llm = getLLMClient();
    let llmResult: LLMCallResult;

    // Resolve model based on intent classification (Anexo B)
    const prompt = loadPrompt(activePersona);
    const escalationModel = getModelForIntent(intent, prompt.meta.model);

    try {
      llmResult = await llm.chat({
        persona: activePersona,
        messages: chatHistory,
        userId,
        sessionId,
        lessonId,
        config: escalationModel !== prompt.meta.model
          ? { model: escalationModel as import('@pronto-ia/types').AnthropicModel }
          : undefined,
      });
    } catch (err) {
      console.error(`[INBOUND] LLM call failed for ${phone}:`, err);
      // Enqueue fallback outbound message using persona's fallback_message
      const fallbackMsg = loadPrompt(activePersona).meta.fallbackMessage;
      await outboundQueue.add('fallback', {
        userId,
        phone,
        messageText: fallbackMsg,
        messageType: 'text',
        persona: activePersona,
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
      persona: activePersona,
      sessionId,
      lessonId,
      llmCallId,
    } as OutboundJobData, { attempts: 3, backoff: { type: 'exponential', delay: 2000 } });

    // ---- Step 10: Fire-and-forget memory extraction ----
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
);

// ---- Graceful shutdown ----

inboundWorker.on('failed', (job, err) => {
  console.error(`[INBOUND] Job ${job?.id} failed:`, err.message);
  Sentry.captureException(err, {
    extra: { jobId: job?.id, jobData: job?.data },
  });
  recordFailure('whatsapp.inbound', job?.id, err.message);
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

// ---- Intent-based routing ----

/**
 * Routes inbound messages to specific flow handlers based on intent + state.
 * Returns true if a handler took over (no LLM call needed).
 * Returns false if normal LLM conversation should proceed.
 */
async function routeToHandler(
  intent: Intent,
  userId: string,
  messageText: string,
  pendingAction: string | null,
  lifecycleState: string,
): Promise<boolean> {
  try {
    // LGPD deletion — highest priority (irreversible action)
    if (intent === 'command_lgpd_delete') {
      if (pendingAction === 'awaiting_lgpd_confirmation') {
        await handleLgpdConfirmation(userId, messageText);
      } else {
        await handleLgpdDeleteRequest(userId);
      }
      return true;
    }

    // Cancellation flow
    if (intent === 'cancellation_request') {
      if (pendingAction === 'awaiting_cancellation_confirmation') {
        await handleCancellationConfirmation(userId, messageText);
        return true;
      }
      // Fresh cancellation request
      await handleCancellationRequest(userId);
      return true;
    }

    if (pendingAction === 'awaiting_cancellation_reason') {
      await handleCancellationReason(userId, messageText);
      return true;
    }

    // Payment response — user says "paguei" or similar
    if (intent === 'payment_response') {
      if (pendingAction === 'awaiting_payment') {
        await handlePaymentInquiry(userId);
        return true;
      }
      if (pendingAction === 'awaiting_email') {
        const captured = await handleEmailCapture(userId, messageText);
        if (captured) return true;
        // Email didn't match — fall through to LLM for retry
      }
    }

    // Pro offer response
    if (intent === 'pro_offer_response' && pendingAction === 'pro_offer_pending') {
      await handleProResponse(userId, messageText);
      return true;
    }

    // Pro reactivation — cancelled/churned user wants back
    if (intent === 'reactivation_request' &&
        (lifecycleState === 'cancelled' || lifecycleState === 'churned')) {
      const handled = await handleReactivationRequest(userId);
      if (handled) return true;
    }

    // No specific handler — LLM handles it
    return false;
  } catch (err) {
    console.error(`[INBOUND] Handler error for intent ${intent}:`, err);
    Sentry.captureException(err, { extra: { intent, userId } });
    // Don't block — let LLM handle as fallback
    return false;
  }
}
