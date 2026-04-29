// ============================================
// PRONTO.IA — Core Loop Integration Tests (Mock-based)
// ============================================
// Tests the full core loop logic using dependency injection:
// webhook → HMAC → parse → enqueue → inbound processor → LLM → outbound
// No real Redis, DB, Anthropic, or Z-API needed.

import { describe, it, expect, vi } from 'vitest';
import {
  processInboundMessage,
  handleWebhookPost,
  type InboundResult,
} from '../src/core-logic';
import type { InboundJobData, OutboundJobData } from '../src/queues';

// ---- Shared mock factories ----

const MOCK_PHONE = '5511999999999';
const MOCK_MESSAGE_ID = 'msg_abc123';
const MOCK_USER_ID = 'user-001';
const MOCK_SESSION_ID = 'session-001';

function makeInboundJobData(overrides?: Partial<InboundJobData>): InboundJobData {
  return {
    phone: MOCK_PHONE,
    messageText: 'Oi Maria!',
    messageId: MOCK_MESSAGE_ID,
    messageType: 'text',
    profileName: 'Ana Silva',
    waId: MOCK_PHONE,
    timestamp: '2026-04-28T10:00:00Z',
    ...overrides,
  };
}

function makeMockLLMResult(overrides?: Partial<any>) {
  return {
    text: 'Oi miga! Como posso te ajudar hoje?',
    model: 'claude-haiku-4-5-20251001',
    persona: 'maria',
    inputTokens: 150,
    outputTokens: 80,
    estimatedCostCents: 3,
    latencyMs: 1200,
    finishReason: 'end_turn',
    ...overrides,
  };
}

// ============================================================
// WEBHOOK POST HANDLER TESTS
// ============================================================

describe('handleWebhookPost — HMAC verification', () => {
  it('rejects request with invalid HMAC signature (401)', async () => {
    const result = await handleWebhookPost(
      '{"phone":"5511999999999"}',
      { 'x-zapi-hmac-sha256': 'bad_signature' },
      {
        verifyPayload: vi.fn().mockResolvedValue(false),
        parseWebhook: vi.fn(),
        enqueueJob: vi.fn(),
      },
    );

    expect(result.statusCode).toBe(401);
    expect(result.body.error).toBe('Invalid signature');
  });

  it('accepts request with valid HMAC signature', async () => {
    const zapiPayload = JSON.stringify({
      phone: MOCK_PHONE,
      message: { id: MOCK_MESSAGE_ID, body: 'Oi Maria', type: 'text' },
      timestamp: '2026-04-28T10:00:00Z',
      senderName: 'Ana Silva',
    });

    const enqueueJob = vi.fn().mockResolvedValue(undefined);
    const result = await handleWebhookPost(zapiPayload, { 'x-zapi-hmac-sha256': 'valid_sig' }, {
      verifyPayload: vi.fn().mockResolvedValue(true),
      parseWebhook: vi.fn().mockReturnValue([{
        eventType: 'message',
        phone: MOCK_PHONE,
        messageId: MOCK_MESSAGE_ID,
        text: 'Oi Maria',
        profileName: 'Ana Silva',
        timestamp: '2026-04-28T10:00:00Z',
      }]),
      enqueueJob,
    });

    expect(result.statusCode).toBe(202);
    expect(result.body.status).toBe('queued');
    expect(result.body.count).toBe(1);
    expect(enqueueJob).toHaveBeenCalledOnce();
  });

  it('skips HMAC verification when no signature header is present', async () => {
    const zapiPayload = JSON.stringify({
      phone: MOCK_PHONE,
      message: { id: MOCK_MESSAGE_ID, body: 'Oi Maria', type: 'text' },
    });

    const verifyPayload = vi.fn();
    const result = await handleWebhookPost(zapiPayload, {}, {
      verifyPayload,
      parseWebhook: vi.fn().mockReturnValue([{
        eventType: 'message',
        phone: MOCK_PHONE,
        messageId: MOCK_MESSAGE_ID,
        text: 'Oi Maria',
        timestamp: '2026-04-28T10:00:00Z',
      }]),
      enqueueJob: vi.fn().mockResolvedValue(undefined),
    });

    expect(result.statusCode).toBe(202);
    expect(verifyPayload).not.toHaveBeenCalled();
  });

  it('rejects invalid JSON body (400)', async () => {
    const result = await handleWebhookPost('not json at all', {}, {
      verifyPayload: vi.fn().mockResolvedValue(true),
      parseWebhook: vi.fn(),
      enqueueJob: vi.fn(),
    });

    expect(result.statusCode).toBe(400);
    expect(result.body.error).toBe('Invalid JSON body');
  });

  it('returns no_messages for status-only events', async () => {
    const result = await handleWebhookPost(JSON.stringify({}), {}, {
      verifyPayload: vi.fn().mockResolvedValue(true),
      parseWebhook: vi.fn().mockReturnValue([{
        eventType: 'status',
        phone: MOCK_PHONE,
        messageId: 'status_id',
        status: 'delivered',
        timestamp: '2026-04-28T10:00:00Z',
      }]),
      enqueueJob: vi.fn(),
    });

    expect(result.statusCode).toBe(200);
    expect(result.body.status).toBe('no_messages');
  });

  it('queues multiple message events', async () => {
    const events = [
      { eventType: 'message', phone: '5511aaa', messageId: 'msg1', text: 'Hello', timestamp: 't1' },
      { eventType: 'message', phone: '5511bbb', messageId: 'msg2', text: 'Hi', timestamp: 't2' },
    ];

    const enqueueJob = vi.fn().mockResolvedValue(undefined);
    const result = await handleWebhookPost(JSON.stringify({}), {}, {
      verifyPayload: vi.fn(),
      parseWebhook: vi.fn().mockReturnValue(events),
      enqueueJob,
    });

    expect(result.statusCode).toBe(202);
    expect(result.body.count).toBe(2);
    expect(enqueueJob).toHaveBeenCalledTimes(2);
  });
});

// ============================================================
// INBOUND PROCESSOR TESTS
// ============================================================

describe('processInboundMessage — happy path', () => {
  it('processes a message end-to-end and enqueues outbound', async () => {
    const mockLLMResult = makeMockLLMResult();
    const enqueueOutbound = vi.fn().mockResolvedValue(undefined);
    const emitEvent = vi.fn();

    const result = await processInboundMessage(makeInboundJobData(), {
      findProcessedEvent: vi.fn().mockResolvedValue([]),
      markProcessed: vi.fn().mockResolvedValue(undefined),
      findSessionByPhone: vi.fn().mockResolvedValue({
        id: MOCK_SESSION_ID,
        userId: MOCK_USER_ID,
        currentPersona: 'maria',
        messageCount: 5,
      }),
      createUser: vi.fn(),
      createSession: vi.fn(),
      findEnrollment: vi.fn().mockResolvedValue(null),
      saveInboundMessage: vi.fn().mockResolvedValue(undefined),
      getConversationHistory: vi.fn().mockResolvedValue([
        { direction: 'inbound', textContent: 'Oi' },
        { direction: 'outbound', textContent: 'Oi miga!' },
      ]),
      llmChat: vi.fn().mockResolvedValue(mockLLMResult),
      saveLLMCall: vi.fn().mockResolvedValue({ id: 'llm-001' }),
      updateSession: vi.fn().mockResolvedValue(undefined),
      enqueueOutbound,
      emitEvent,
      loadFallbackMessage: vi.fn().mockReturnValue('Pode repetir?'),
    });

    expect(result.status).toBe('processed');
    expect(result.userId).toBe(MOCK_USER_ID);
    expect(result.sessionId).toBe(MOCK_SESSION_ID);
    expect(result.persona).toBe('maria');
    expect(result.llmResult?.text).toBe('Oi miga! Como posso te ajudar hoje?');

    // Verify outbound job was enqueued with LLM response
    expect(enqueueOutbound).toHaveBeenCalledOnce();
    const outboundData = enqueueOutbound.mock.calls[0][1] as OutboundJobData;
    expect(outboundData.messageText).toBe(mockLLMResult.text);
    expect(outboundData.phone).toBe(MOCK_PHONE);
    expect(outboundData.persona).toBe('maria');
    expect(outboundData.llmCallId).toBe('llm-001');

    // Verify events were emitted
    expect(emitEvent).toHaveBeenCalledTimes(2);
    expect(emitEvent.mock.calls[0][0]).toBe('whatsapp.inbound');
    expect(emitEvent.mock.calls[1][0]).toBe('llm.call');
  });
});

describe('processInboundMessage — dedup', () => {
  it('skips duplicate messages (returns status: duplicate)', async () => {
    const result = await processInboundMessage(makeInboundJobData(), {
      findProcessedEvent: vi.fn().mockResolvedValue([{ eventId: MOCK_MESSAGE_ID }]),
      markProcessed: vi.fn(),
      findSessionByPhone: vi.fn().mockResolvedValue({
        id: MOCK_SESSION_ID,
        userId: MOCK_USER_ID,
        currentPersona: 'maria',
        messageCount: 3,
      }),
      createUser: vi.fn(),
      createSession: vi.fn(),
      findEnrollment: vi.fn(),
      saveInboundMessage: vi.fn(),
      getConversationHistory: vi.fn(),
      llmChat: vi.fn(),
      saveLLMCall: vi.fn(),
      updateSession: vi.fn(),
      enqueueOutbound: vi.fn(),
      emitEvent: vi.fn(),
      loadFallbackMessage: vi.fn(),
    });

    expect(result.status).toBe('duplicate');
    expect(result.userId).toBe(MOCK_USER_ID);

    // No LLM call or outbound should happen
    // (we can verify by checking that llmChat and enqueueOutbound were never called)
  });
});

describe('processInboundMessage — new user/session creation', () => {
  it('creates a new user and session when phone is unknown', async () => {
    const mockLLMResult = makeMockLLMResult();

    const result = await processInboundMessage(makeInboundJobData(), {
      findProcessedEvent: vi.fn().mockResolvedValue([]),
      markProcessed: vi.fn().mockResolvedValue(undefined),
      findSessionByPhone: vi.fn().mockResolvedValue(null), // No existing session
      createUser: vi.fn().mockResolvedValue({ id: 'new-user-001' }),
      createSession: vi.fn().mockResolvedValue({
        id: 'new-session-001',
        userId: 'new-user-001',
        currentPersona: 'maria',
        messageCount: 0,
      }),
      findEnrollment: vi.fn().mockResolvedValue(null),
      saveInboundMessage: vi.fn().mockResolvedValue(undefined),
      getConversationHistory: vi.fn().mockResolvedValue([]), // No history for new session
      llmChat: vi.fn().mockResolvedValue(mockLLMResult),
      saveLLMCall: vi.fn().mockResolvedValue({ id: 'llm-new-001' }),
      updateSession: vi.fn().mockResolvedValue(undefined),
      enqueueOutbound: vi.fn().mockResolvedValue(undefined),
      emitEvent: vi.fn(),
      loadFallbackMessage: vi.fn().mockReturnValue('Pode repetir?'),
    });

    expect(result.status).toBe('processed');
    expect(result.userId).toBe('new-user-001');
    expect(result.sessionId).toBe('new-session-001');
    expect(result.persona).toBe('maria'); // Default persona
  });
});

describe('processInboundMessage — LLM failure → fallback', () => {
  it('enqueues fallback message when LLM call fails', async () => {
    const enqueueOutbound = vi.fn().mockResolvedValue(undefined);
    const fallbackMessage = 'Deu um probleminha técnico aqui. Pode mandar de novo?';

    const result = await processInboundMessage(makeInboundJobData(), {
      findProcessedEvent: vi.fn().mockResolvedValue([]),
      markProcessed: vi.fn().mockResolvedValue(undefined),
      findSessionByPhone: vi.fn().mockResolvedValue({
        id: MOCK_SESSION_ID,
        userId: MOCK_USER_ID,
        currentPersona: 'maria',
        messageCount: 2,
      }),
      createUser: vi.fn(),
      createSession: vi.fn(),
      findEnrollment: vi.fn().mockResolvedValue(null),
      saveInboundMessage: vi.fn().mockResolvedValue(undefined),
      getConversationHistory: vi.fn().mockResolvedValue([]),
      llmChat: vi.fn().mockRejectedValue(new Error('Anthropic API timeout')),
      saveLLMCall: vi.fn(),
      updateSession: vi.fn(),
      enqueueOutbound,
      emitEvent: vi.fn(),
      loadFallbackMessage: vi.fn().mockReturnValue(fallbackMessage),
    });

    expect(result.status).toBe('fallback');
    expect(result.fallbackMessage).toBe(fallbackMessage);

    // Verify fallback outbound was enqueued
    expect(enqueueOutbound).toHaveBeenCalledOnce();
    const outboundData = enqueueOutbound.mock.calls[0][1] as OutboundJobData;
    expect(outboundData.messageText).toBe(fallbackMessage);
    expect(outboundData.phone).toBe(MOCK_PHONE);
  });
});

describe('processInboundMessage — conversation history ordering', () => {
  it('builds chat history in chronological order (oldest first)', async () => {
    const mockLLMResult = makeMockLLMResult();
    const llmChat = vi.fn().mockResolvedValue(mockLLMResult);

    // Simulate DB returning messages in DESC order (most recent first)
    // The processor should reverse them to chronological order
    const dbMessages = [
      { direction: 'outbound', textContent: 'Como posso te ajudar?', createdAt: 't4' },
      { direction: 'inbound', textContent: 'Quero saber sobre IA', createdAt: 't3' },
      { direction: 'outbound', textContent: 'Oi miga!', createdAt: 't2' },
      { direction: 'inbound', textContent: 'Oi', createdAt: 't1' },
    ];

    await processInboundMessage(makeInboundJobData(), {
      findProcessedEvent: vi.fn().mockResolvedValue([]),
      markProcessed: vi.fn().mockResolvedValue(undefined),
      findSessionByPhone: vi.fn().mockResolvedValue({
        id: MOCK_SESSION_ID,
        userId: MOCK_USER_ID,
        currentPersona: 'maria',
        messageCount: 4,
      }),
      createUser: vi.fn(),
      createSession: vi.fn(),
      findEnrollment: vi.fn().mockResolvedValue(null),
      saveInboundMessage: vi.fn().mockResolvedValue(undefined),
      getConversationHistory: vi.fn().mockResolvedValue(dbMessages),
      llmChat,
      saveLLMCall: vi.fn().mockResolvedValue({ id: 'llm-001' }),
      updateSession: vi.fn().mockResolvedValue(undefined),
      enqueueOutbound: vi.fn().mockResolvedValue(undefined),
      emitEvent: vi.fn(),
      loadFallbackMessage: vi.fn().mockReturnValue('Pode repetir?'),
    });

    // Verify the LLM was called with chronologically ordered messages
    const callArgs = llmChat.mock.calls[0][0];
    const messages = callArgs.messages;

    // History should be chronological (oldest first) + current message at end
    expect(messages[0].role).toBe('user');      // "Oi" (oldest)
    expect(messages[0].content).toBe('Oi');
    expect(messages[1].role).toBe('assistant');  // "Oi miga!"
    expect(messages[2].role).toBe('user');       // "Quero saber sobre IA"
    expect(messages[3].role).toBe('assistant');  // "Como posso te ajudar?"
    expect(messages[4].role).toBe('user');       // "Oi Maria!" (current)
    expect(messages[4].content).toBe('Oi Maria!');
  });

  it('filters out messages with null textContent', async () => {
    const mockLLMResult = makeMockLLMResult();
    const llmChat = vi.fn().mockResolvedValue(mockLLMResult);

    const dbMessages = [
      { direction: 'inbound', textContent: 'Oi', createdAt: 't1' },
      { direction: 'outbound', textContent: null, createdAt: 't2' }, // Should be filtered
      { direction: 'inbound', textContent: 'Tudo bem?', createdAt: 't3' },
    ];

    await processInboundMessage(makeInboundJobData(), {
      findProcessedEvent: vi.fn().mockResolvedValue([]),
      markProcessed: vi.fn().mockResolvedValue(undefined),
      findSessionByPhone: vi.fn().mockResolvedValue({
        id: MOCK_SESSION_ID,
        userId: MOCK_USER_ID,
        currentPersona: 'maria',
        messageCount: 2,
      }),
      createUser: vi.fn(),
      createSession: vi.fn(),
      findEnrollment: vi.fn().mockResolvedValue(null),
      saveInboundMessage: vi.fn().mockResolvedValue(undefined),
      getConversationHistory: vi.fn().mockResolvedValue(dbMessages),
      llmChat,
      saveLLMCall: vi.fn().mockResolvedValue({ id: 'llm-001' }),
      updateSession: vi.fn().mockResolvedValue(undefined),
      enqueueOutbound: vi.fn().mockResolvedValue(undefined),
      emitEvent: vi.fn(),
      loadFallbackMessage: vi.fn().mockReturnValue('Pode repetir?'),
    });

    const callArgs = llmChat.mock.calls[0][0];
    // Only 2 history messages + 1 current = 3 total
    expect(callArgs.messages.length).toBe(3);
  });
});

// ============================================================
// FULL CORE LOOP INTEGRATION TEST
// ============================================================

describe('Core Loop — full flow (webhook → inbound → outbound)', () => {
  it('completes full flow: webhook receives message → processes → enqueues outbound', async () => {
    // ---- Phase 1: Webhook receives Z-API message ----

    const zapiPayload = JSON.stringify({
      phone: MOCK_PHONE,
      message: { id: MOCK_MESSAGE_ID, body: 'Oi Maria', type: 'text' },
      timestamp: '2026-04-28T10:00:00Z',
      senderName: 'Ana Silva',
    });

    // Compute HMAC for the payload
    const crypto = await import('crypto');
    const securityToken = 'test-security-token';
    const validSignature = crypto
      .createHmac('sha256', securityToken)
      .update(zapiPayload)
      .digest('hex');

    const enqueueJob = vi.fn().mockResolvedValue(undefined);

    const webhookResult = await handleWebhookPost(zapiPayload, {
      'x-zapi-hmac-sha256': validSignature,
    }, {
      verifyPayload: vi.fn().mockResolvedValue(true),
      parseWebhook: vi.fn().mockReturnValue([{
        eventType: 'message',
        phone: MOCK_PHONE,
        messageId: MOCK_MESSAGE_ID,
        text: 'Oi Maria',
        profileName: 'Ana Silva',
        mediaType: undefined,
        timestamp: '2026-04-28T10:00:00Z',
      }]),
      enqueueJob,
    });

    expect(webhookResult.statusCode).toBe(202);
    expect(webhookResult.body.count).toBe(1);

    // Verify the inbound job data was correctly constructed
    const jobData = enqueueJob.mock.calls[0][1];
    expect(jobData.phone).toBe(MOCK_PHONE);
    expect(jobData.messageText).toBe('Oi Maria');
    expect(jobData.messageId).toBe(MOCK_MESSAGE_ID);
    expect(jobData.profileName).toBe('Ana Silva');

    // ---- Phase 2: Inbound processor processes the job ----

    const mockLLMResult = makeMockLLMResult();
    const enqueueOutbound = vi.fn().mockResolvedValue(undefined);

    const inboundResult = await processInboundMessage(jobData, {
      findProcessedEvent: vi.fn().mockResolvedValue([]),
      markProcessed: vi.fn().mockResolvedValue(undefined),
      findSessionByPhone: vi.fn().mockResolvedValue({
        id: MOCK_SESSION_ID,
        userId: MOCK_USER_ID,
        currentPersona: 'maria',
        messageCount: 0,
      }),
      createUser: vi.fn(),
      createSession: vi.fn(),
      findEnrollment: vi.fn().mockResolvedValue(null),
      saveInboundMessage: vi.fn().mockResolvedValue(undefined),
      getConversationHistory: vi.fn().mockResolvedValue([]),
      llmChat: vi.fn().mockResolvedValue(mockLLMResult),
      saveLLMCall: vi.fn().mockResolvedValue({ id: 'llm-001' }),
      updateSession: vi.fn().mockResolvedValue(undefined),
      enqueueOutbound,
      emitEvent: vi.fn(),
      loadFallbackMessage: vi.fn().mockReturnValue('Pode repetir?'),
    });

    expect(inboundResult.status).toBe('processed');
    expect(inboundResult.llmResult?.text).toBe('Oi miga! Como posso te ajudar hoje?');

    // ---- Phase 3: Outbound data is ready ----

    const outboundData = enqueueOutbound.mock.calls[0][1] as OutboundJobData;
    expect(outboundData.messageText).toBe(mockLLMResult.text);
    expect(outboundData.phone).toBe(MOCK_PHONE);
    expect(outboundData.persona).toBe('maria');
  });

  it('full flow with LLM failure → fallback message', async () => {
    // Webhook phase
    const enqueueJob = vi.fn().mockResolvedValue(undefined);

    const webhookResult = await handleWebhookPost(
      JSON.stringify({ phone: MOCK_PHONE, message: { id: MOCK_MESSAGE_ID, body: 'Oi' } }),
      {},
      {
        verifyPayload: vi.fn(),
        parseWebhook: vi.fn().mockReturnValue([{
          eventType: 'message',
          phone: MOCK_PHONE,
          messageId: MOCK_MESSAGE_ID,
          text: 'Oi',
          timestamp: 't',
        }]),
        enqueueJob,
      },
    );

    const jobData = enqueueJob.mock.calls[0][1];

    // Inbound phase with LLM failure
    const enqueueOutbound = vi.fn().mockResolvedValue(undefined);
    const fallbackMessage = 'Deu um probleminha técnico aqui. Pode mandar de novo?';

    const inboundResult = await processInboundMessage(jobData, {
      findProcessedEvent: vi.fn().mockResolvedValue([]),
      markProcessed: vi.fn().mockResolvedValue(undefined),
      findSessionByPhone: vi.fn().mockResolvedValue({
        id: MOCK_SESSION_ID,
        userId: MOCK_USER_ID,
        currentPersona: 'maria',
        messageCount: 1,
      }),
      createUser: vi.fn(),
      createSession: vi.fn(),
      findEnrollment: vi.fn().mockResolvedValue(null),
      saveInboundMessage: vi.fn().mockResolvedValue(undefined),
      getConversationHistory: vi.fn().mockResolvedValue([]),
      llmChat: vi.fn().mockRejectedValue(new Error('API overloaded')),
      saveLLMCall: vi.fn(),
      updateSession: vi.fn(),
      enqueueOutbound,
      emitEvent: vi.fn(),
      loadFallbackMessage: vi.fn().mockReturnValue(fallbackMessage),
    });

    expect(inboundResult.status).toBe('fallback');
    expect(inboundResult.fallbackMessage).toBe(fallbackMessage);

    // The outbound fallback should have Maria's specific tone
    const outboundData = enqueueOutbound.mock.calls[0][1] as OutboundJobData;
    expect(outboundData.messageText).toContain('Pode mandar de novo?');
  });
});

// ============================================================
// ADDITIONAL COVERAGE TESTS
// ============================================================

describe('processInboundMessage — fallback uses persona-specific message', () => {
  it('uses Bia fallback when persona is bia', async () => {
    const biaFallback = 'Aqui deu uma travada rápida, meu bem. Me fala de novo, por favor?';
    const enqueueOutbound = vi.fn().mockResolvedValue(undefined);

    const result = await processInboundMessage(makeInboundJobData(), {
      findProcessedEvent: vi.fn().mockResolvedValue([]),
      markProcessed: vi.fn().mockResolvedValue(undefined),
      findSessionByPhone: vi.fn().mockResolvedValue({
        id: MOCK_SESSION_ID,
        userId: MOCK_USER_ID,
        currentPersona: 'bia',
        messageCount: 5,
      }),
      createUser: vi.fn(),
      createSession: vi.fn(),
      findEnrollment: vi.fn().mockResolvedValue(null),
      saveInboundMessage: vi.fn().mockResolvedValue(undefined),
      getConversationHistory: vi.fn().mockResolvedValue([]),
      llmChat: vi.fn().mockRejectedValue(new Error('timeout')),
      saveLLMCall: vi.fn(),
      updateSession: vi.fn(),
      enqueueOutbound,
      emitEvent: vi.fn(),
      loadFallbackMessage: vi.fn().mockReturnValue(biaFallback),
    });

    expect(result.status).toBe('fallback');
    expect(result.fallbackMessage).toBe(biaFallback);
    expect(result.persona).toBe('bia');
  });
});

describe('processInboundMessage — different messages are not deduplicated', () => {
  it('processes second message with different messageId', async () => {
    const mockLLMResult = makeMockLLMResult();

    // First message — no prior event
    const result1 = await processInboundMessage(
      makeInboundJobData({ messageId: 'msg_001' }),
      {
        findProcessedEvent: vi.fn().mockResolvedValue([]),
        markProcessed: vi.fn().mockResolvedValue(undefined),
        findSessionByPhone: vi.fn().mockResolvedValue({
          id: MOCK_SESSION_ID,
          userId: MOCK_USER_ID,
          currentPersona: 'maria',
          messageCount: 3,
        }),
        createUser: vi.fn(),
        createSession: vi.fn(),
        findEnrollment: vi.fn().mockResolvedValue(null),
        saveInboundMessage: vi.fn().mockResolvedValue(undefined),
        getConversationHistory: vi.fn().mockResolvedValue([]),
        llmChat: vi.fn().mockResolvedValue(mockLLMResult),
        saveLLMCall: vi.fn().mockResolvedValue({ id: 'llm-001' }),
        updateSession: vi.fn().mockResolvedValue(undefined),
        enqueueOutbound: vi.fn().mockResolvedValue(undefined),
        emitEvent: vi.fn(),
        loadFallbackMessage: vi.fn().mockReturnValue('Pode repetir?'),
      },
    );
    expect(result1.status).toBe('processed');

    // Second message — different ID, not a duplicate
    const result2 = await processInboundMessage(
      makeInboundJobData({ messageId: 'msg_002', messageText: 'Como usar IA?' }),
      {
        findProcessedEvent: vi.fn().mockResolvedValue([]),
        markProcessed: vi.fn().mockResolvedValue(undefined),
        findSessionByPhone: vi.fn().mockResolvedValue({
          id: MOCK_SESSION_ID,
          userId: MOCK_USER_ID,
          currentPersona: 'maria',
          messageCount: 4,
        }),
        createUser: vi.fn(),
        createSession: vi.fn(),
        findEnrollment: vi.fn().mockResolvedValue(null),
        saveInboundMessage: vi.fn().mockResolvedValue(undefined),
        getConversationHistory: vi.fn().mockResolvedValue([]),
        llmChat: vi.fn().mockResolvedValue(mockLLMResult),
        saveLLMCall: vi.fn().mockResolvedValue({ id: 'llm-002' }),
        updateSession: vi.fn().mockResolvedValue(undefined),
        enqueueOutbound: vi.fn().mockResolvedValue(undefined),
        emitEvent: vi.fn(),
        loadFallbackMessage: vi.fn().mockReturnValue('Pode repetir?'),
      },
    );
    expect(result2.status).toBe('processed');
  });
});

describe('processInboundMessage — enrollment context passed to LLM', () => {
  it('includes lessonId when user has active enrollment', async () => {
    const mockLLMResult = makeMockLLMResult();
    const llmChat = vi.fn().mockResolvedValue(mockLLMResult);

    await processInboundMessage(makeInboundJobData(), {
      findProcessedEvent: vi.fn().mockResolvedValue([]),
      markProcessed: vi.fn().mockResolvedValue(undefined),
      findSessionByPhone: vi.fn().mockResolvedValue({
        id: MOCK_SESSION_ID,
        userId: MOCK_USER_ID,
        currentPersona: 'maria',
        messageCount: 2,
      }),
      createUser: vi.fn(),
      createSession: vi.fn(),
      findEnrollment: vi.fn().mockResolvedValue({ currentLessonId: 'lesson-42' }),
      saveInboundMessage: vi.fn().mockResolvedValue(undefined),
      getConversationHistory: vi.fn().mockResolvedValue([]),
      llmChat,
      saveLLMCall: vi.fn().mockResolvedValue({ id: 'llm-001' }),
      updateSession: vi.fn().mockResolvedValue(undefined),
      enqueueOutbound: vi.fn().mockResolvedValue(undefined),
      emitEvent: vi.fn(),
      loadFallbackMessage: vi.fn().mockReturnValue('Pode repetir?'),
    });

    const callArgs = llmChat.mock.calls[0][0];
    expect(callArgs.lessonId).toBe('lesson-42');
  });

  it('passes undefined lessonId when no enrollment', async () => {
    const mockLLMResult = makeMockLLMResult();
    const llmChat = vi.fn().mockResolvedValue(mockLLMResult);

    await processInboundMessage(makeInboundJobData(), {
      findProcessedEvent: vi.fn().mockResolvedValue([]),
      markProcessed: vi.fn().mockResolvedValue(undefined),
      findSessionByPhone: vi.fn().mockResolvedValue({
        id: MOCK_SESSION_ID,
        userId: MOCK_USER_ID,
        currentPersona: 'maria',
        messageCount: 2,
      }),
      createUser: vi.fn(),
      createSession: vi.fn(),
      findEnrollment: vi.fn().mockResolvedValue(null),
      saveInboundMessage: vi.fn().mockResolvedValue(undefined),
      getConversationHistory: vi.fn().mockResolvedValue([]),
      llmChat,
      saveLLMCall: vi.fn().mockResolvedValue({ id: 'llm-001' }),
      updateSession: vi.fn().mockResolvedValue(undefined),
      enqueueOutbound: vi.fn().mockResolvedValue(undefined),
      emitEvent: vi.fn(),
      loadFallbackMessage: vi.fn().mockReturnValue('Pode repetir?'),
    });

    const callArgs = llmChat.mock.calls[0][0];
    expect(callArgs.lessonId).toBeUndefined();
  });
});