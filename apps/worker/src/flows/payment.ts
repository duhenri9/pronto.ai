// ============================================
// PRONTO.IA — AbacatePay Payment Flow (1.5)
// ============================================
// Handles checkout creation, webhook processing,
// email capture, receipt sending, and tier decision
// (founder vs pro_single with atomic counter).

import { db, eq, and, isNull, users, payments, subscriptions, processedEvents, launchPhaseConfig } from '@pronto-ia/database';
import { outboundQueue } from '../queues';
import type { OutboundJobData } from '../queues';
import { TEMPLATE } from './templates';

// ---- Constants ----

const PRO_MONTHLY_PRICE_CENTS = 2900; // R$ 29,00
const PIX_EXPIRATION_MINUTES = 60;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://prontoia.com.br';

// ---- Tier Decision (Sprint 3) ----

type TierDecision = {
  tier: 'founder' | 'pro_single';
  founderBenefitLocked: boolean;
  selectedSpecialist: string | null;  // NULL for founder, 'bia' default for pro_single
};

/**
 * Determines subscription tier at payment confirmation.
 * - If forced_tier in metadata (reactivation) → use it directly.
 * - Otherwise: atomic decision with FOR UPDATE on launch_phase_config.
 *   founder if under cap + phase active; pro_single otherwise.
 */
async function determineTier(
  userId: string,
  checkoutMetadata?: Record<string, string> | null,
): Promise<TierDecision> {
  // 1. Forced tier from reactivation or admin override
  if (checkoutMetadata?.forced_tier === 'founder') {
    return { tier: 'founder', founderBenefitLocked: true, selectedSpecialist: null };
  }
  if (checkoutMetadata?.forced_tier === 'pro_single') {
    return {
      tier: 'pro_single',
      founderBenefitLocked: false,
      selectedSpecialist: checkoutMetadata.selected_specialist ?? 'bia',
    };
  }

  // 2. Atomic tier decision with FOR UPDATE lock
  const result = await db.transaction(async (tx) => {
    const [config] = await tx
      .select()
      .from(launchPhaseConfig)
      .where(isNull(launchPhaseConfig.endedAt))
      .for('update');

    if (!config) {
      // No active launch phase → pro_single
      return { tier: 'pro_single' as const };
    }

    if (config.founderCount < config.founderCap) {
      // Still room for founders → increment counter atomically
      await tx
        .update(launchPhaseConfig)
        .set({ founderCount: config.founderCount + 1 })
        .where(eq(launchPhaseConfig.id, 1));

      return { tier: 'founder' as const };
    }

    // Cap reached → pro_single
    return { tier: 'pro_single' as const };
  });

  return {
    tier: result.tier,
    founderBenefitLocked: result.tier === 'founder',
    selectedSpecialist: result.tier === 'pro_single' ? 'bia' : null,
  };
}

// ---- AbacatePay Client ----

interface AbacateCheckout {
  id: string;
  url: string;
  status: string;
  amount: number;
}

async function createAbacateCheckout(params: {
  userId: string;
  displayName: string | null;
  phone: string;
  metadataOverrides?: Record<string, string>;
}): Promise<AbacateCheckout> {
  const apiKey = process.env.ABACATE_PAY_API_KEY;
  if (!apiKey) throw new Error('ABACATE_PAY_API_KEY not configured');

  const response = await fetch('https://api.abacatepay.com/v1/checkout/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      amount: PRO_MONTHLY_PRICE_CENTS,
      currency: 'BRL',
      methods: ['pix'],
      customer: {
        name: params.displayName ?? params.phone,
        phone: params.phone,
      },
      metadata: {
        user_id: params.userId,
        product: 'prontoia_pro_monthly',
        version: 'v1.0',
        ...params.metadataOverrides,
      },
      callback_url: `${BASE_URL}/api/v1/webhooks/abacate`,
      expiration_minutes: PIX_EXPIRATION_MINUTES,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AbacatePay checkout failed: ${response.status} ${errorText}`);
  }

  const data: any = await response.json();
  return {
    id: data.id ?? data.data?.id,
    url: data.url ?? data.data?.url ?? data.checkout_url,
    status: data.status ?? data.data?.status ?? 'pending',
    amount: data.amount ?? data.data?.amount ?? PRO_MONTHLY_PRICE_CENTS,
  };
}

// ---- Initiate Checkout ----

export async function initiateCheckout(userId: string, type: 'initial' | 'renewal' = 'initial', metadataOverrides?: Record<string, string>): Promise<void> {
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) return;

  try {
    const checkout = await createAbacateCheckout({
      userId: user.id,
      displayName: user.displayName ?? user.name,
      phone: user.phone,
      metadataOverrides,
    });

    // Create payment record (metadata stored for tier decision on webhook)
    await db.insert(payments).values({
      userId: user.id,
      amountCents: PRO_MONTHLY_PRICE_CENTS,
      status: 'PENDING',
      type: 'B2C_PRO_MONTHLY',
      provider: 'ABACATE',
      abacateCheckoutId: checkout.id,
      method: 'pix',
      isSubscription: true,
      planType: 'pro_monthly',
      expiresAt: new Date(Date.now() + PIX_EXPIRATION_MINUTES * 60 * 1000),
      metadata: metadataOverrides ?? null,
    });

    // Send payment link
    await outboundQueue.add('payment_link', {
      userId: user.id,
      phone: user.phone,
      messageText: TEMPLATE.PAY_01(checkout.url),
      messageType: 'text',
      persona: 'maria',
      sessionId: '',
    } as OutboundJobData, { attempts: 2, backoff: { type: 'exponential', delay: 2000 } });

    // Update state
    await db
      .update(users)
      .set({
        pendingAction: 'awaiting_payment',
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  } catch (err) {
    console.error('[PAYMENT] Failed to initiate checkout:', err);

    // Notify user of failure
    await outboundQueue.add('payment_error', {
      userId: user.id,
      phone: user.phone,
      messageText: TEMPLATE.PAY_08,
      messageType: 'text',
      persona: 'maria',
      sessionId: '',
    } as OutboundJobData, { attempts: 2, backoff: { type: 'exponential', delay: 2000 } });
  }
}

// ---- Handle Abacate Webhook ----

interface AbacateWebhookEvent {
  id: string;
  type: string;
  checkout_id: string;
  subscription_id?: string;
  amount?: number;
}

function validateAbacateHmac(body: string, signature: string): boolean {
  // AbacatePay uses HMAC-SHA256 with the API key as secret
  const crypto = require('crypto');
  const apiKey = process.env.ABACATE_PAY_API_KEY ?? '';
  const expected = crypto
    .createHmac('sha256', apiKey)
    .update(body)
    .digest('hex');
  return signature === expected || signature === `sha256=${expected}`;
}

export async function handleAbacateWebhook(
  rawBody: string,
  signature: string | null,
  event: AbacateWebhookEvent,
): Promise<{ statusCode: number; body: Record<string, unknown> }> {
  // 1. HMAC validation
  if (signature && !validateAbacateHmac(rawBody, signature)) {
    return { statusCode: 401, body: { error: 'Invalid signature' } };
  }

  // 2. Idempotency
  const existingEvent = await db
    .select()
    .from(processedEvents)
    .where(eq(processedEvents.eventId, event.id))
    .limit(1);

  if (existingEvent.length > 0) {
    return { statusCode: 200, body: { status: 'already_processed' } };
  }

  await db.insert(processedEvents).values({
    provider: 'abacate',
    eventId: event.id,
    eventType: event.type,
  });

  // 3. Find payment by checkout ID
  const [payment] = await db
    .select()
    .from(payments)
    .where(eq(payments.abacateCheckoutId, event.checkout_id))
    .limit(1);

  if (!payment || !payment.userId) {
    console.error('[ABACATE] Payment not found for checkout:', event.checkout_id);
    return { statusCode: 404, body: { error: 'Payment not found' } };
  }

  const userId = payment.userId;
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) {
    return { statusCode: 404, body: { error: 'User not found' } };
  }

  // 4. Process event
  switch (event.type) {
    case 'checkout.paid': {
      // Determine tier (founder vs pro_single) based on launch phase
      const tierDecision = await determineTier(
        userId,
        payment.metadata as Record<string, string> | null | undefined,
      );

      // Transactional update
      await db.update(payments).set({
        status: 'PAID',
        paidAt: new Date(),
        updatedAt: new Date(),
      }).where(eq(payments.id, payment.id));

      await db.insert(subscriptions).values({
        userId,
        status: 'active',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        abacateSubscriptionId: event.subscription_id ?? null,
        planTier: tierDecision.tier,
        founderBenefitLocked: tierDecision.founderBenefitLocked,
        selectedSpecialist: tierDecision.selectedSpecialist,
      });

      await db.update(users).set({
        isPro: true,
        lifecycleState: 'active_pro',
        pendingAction: 'awaiting_email',
        proExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      }).where(eq(users.id, userId));

      // Select template based on tier
      const confirmationMessage = tierDecision.tier === 'founder'
        ? TEMPLATE.PAY_02_FOUNDER
        : TEMPLATE.PAY_02_PRO_SINGLE;

      // Confirm payment
      await outboundQueue.add('payment_confirmed', {
        userId,
        phone: user.phone,
        messageText: confirmationMessage,
        messageType: 'text',
        persona: 'maria',
        sessionId: '',
      } as OutboundJobData, { attempts: 2, backoff: { type: 'exponential', delay: 2000 } });

      // Ask email (1.5s delay)
      await outboundQueue.add('ask_email', {
        userId,
        phone: user.phone,
        messageText: TEMPLATE.PAY_03,
        messageType: 'text',
        persona: 'maria',
        sessionId: '',
      } as OutboundJobData, {
        attempts: 2,
        backoff: { type: 'exponential', delay: 2000 },
        delay: 1500,
      });

      break;
    }

    case 'checkout.expired': {
      await db.update(payments).set({
        status: 'FAILED',
        updatedAt: new Date(),
      }).where(eq(payments.id, payment.id));

      await outboundQueue.add('payment_expired', {
        userId,
        phone: user.phone,
        messageText: TEMPLATE.PAY_07,
        messageType: 'text',
        persona: 'maria',
        sessionId: '',
      } as OutboundJobData, { attempts: 2, backoff: { type: 'exponential', delay: 2000 } });

      await db.update(users).set({
        pendingAction: null,
        updatedAt: new Date(),
      }).where(eq(users.id, userId));

      break;
    }

    case 'checkout.failed': {
      await db.update(payments).set({
        status: 'FAILED',
        updatedAt: new Date(),
      }).where(eq(payments.id, payment.id));

      await outboundQueue.add('payment_failed_notify', {
        userId,
        phone: user.phone,
        messageText: TEMPLATE.PAY_08,
        messageType: 'text',
        persona: 'maria',
        sessionId: '',
      } as OutboundJobData, { attempts: 2, backoff: { type: 'exponential', delay: 2000 } });

      await db.update(users).set({
        pendingAction: null,
        updatedAt: new Date(),
      }).where(eq(users.id, userId));

      break;
    }
  }

  return { statusCode: 200, body: { status: 'processed' } };
}

// ---- Email Capture ----

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;

export async function handleEmailCapture(userId: string, message: string): Promise<boolean> {
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user || user.pendingAction !== 'awaiting_email') return false;

  const match = message.match(EMAIL_REGEX);
  if (!match) {
    await outboundQueue.add('email_invalid', {
      userId,
      phone: user.phone,
      messageText: TEMPLATE.PAY_04,
      messageType: 'text',
      persona: 'maria',
      sessionId: '',
    } as OutboundJobData, { attempts: 2, backoff: { type: 'exponential', delay: 2000 } });
    return false;
  }

  const email = match[0];

  await db.update(users).set({
    email,
    pendingAction: null,
    updatedAt: new Date(),
  }).where(eq(users.id, userId));

  // Handoff to Bia
  await outboundQueue.add('email_handoff', {
    userId,
    phone: user.phone,
    messageText: TEMPLATE.PAY_05(user.displayName ?? user.name),
    messageType: 'text',
    persona: 'maria',
    sessionId: '',
  } as OutboundJobData, { attempts: 2, backoff: { type: 'exponential', delay: 2000 } });

  // Bia first introduction (2s delay)
  await outboundQueue.add('bia_intro', {
    userId,
    phone: user.phone,
    messageText: TEMPLATE.PAY_06(user.displayName ?? user.name),
    messageType: 'text',
    persona: 'bia',
    sessionId: '',
  } as OutboundJobData, {
    attempts: 2,
    backoff: { type: 'exponential', delay: 2000 },
    delay: 2000,
  });

  return true;
}

// ---- Gap 2: Abacate Reconciliation (24h check) ----

/**
 * Checks AbacatePay API directly for payment status.
 * Used when user says "paguei, e agora?" but webhook didn't arrive.
 */
export async function checkAbacatePaymentStatus(checkoutId: string): Promise<'confirmed' | 'pending' | 'expired' | 'unknown'> {
  const apiKey = process.env.ABACATE_PAY_API_KEY;
  if (!apiKey) return 'unknown';

  try {
    const response = await fetch(`https://api.abacatepay.com/v1/checkout/${checkoutId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) return 'unknown';

    const data: any = await response.json();
    const status: string = data.status ?? data.data?.status ?? '';

    if (status === 'paid' || status === 'completed') return 'confirmed';
    if (status === 'expired' || status === 'cancelled') return 'expired';
    if (status === 'pending' || status === 'waiting_payment') return 'pending';
    return 'unknown';
  } catch {
    return 'unknown';
  }
}

/**
 * Handles user asking about payment when webhook didn't arrive.
 * Per spec Gap 2: Maria checks API directly.
 */
export async function handlePaymentInquiry(userId: string): Promise<void> {
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) return;

  // Find the most recent PENDING payment
  const pendingPayments = await db
    .select()
    .from(payments)
    .where(eq(payments.userId, userId))
    .limit(5);

  const pending = pendingPayments.find(p => p.status === 'PENDING' && p.abacateCheckoutId);

  if (!pending || !pending.abacateCheckoutId) {
    // No pending payment found — let Maria handle naturally
    return;
  }

  const status = await checkAbacatePaymentStatus(pending.abacateCheckoutId);

  switch (status) {
    case 'confirmed': {
      // Determine tier (founder vs pro_single) for manual confirmation
      const tierDecision = await determineTier(
        userId,
        pending.metadata as Record<string, string> | null | undefined,
      );

      // Payment confirmed via API — process it manually
      await db.update(payments).set({
        status: 'PAID',
        paidAt: new Date(),
        updatedAt: new Date(),
      }).where(eq(payments.id, pending.id));

      await db.insert(subscriptions).values({
        userId,
        status: 'active',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        planTier: tierDecision.tier,
        founderBenefitLocked: tierDecision.founderBenefitLocked,
        selectedSpecialist: tierDecision.selectedSpecialist,
      });

      await db.update(users).set({
        isPro: true,
        lifecycleState: 'active_pro',
        pendingAction: 'awaiting_email',
        proExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      }).where(eq(users.id, userId));

      // Select template based on tier
      const confirmationMessage = tierDecision.tier === 'founder'
        ? TEMPLATE.PAY_02_FOUNDER
        : TEMPLATE.PAY_02_PRO_SINGLE;

      await outboundQueue.add('payment_confirmed_late', {
        userId,
        phone: user.phone,
        messageText: confirmationMessage,
        messageType: 'text',
        persona: 'maria',
        sessionId: '',
      } as OutboundJobData, { attempts: 2, backoff: { type: 'exponential', delay: 2000 } });
      break;
    }

    case 'expired': {
      await outboundQueue.add('payment_expired_inquiry', {
        userId,
        phone: user.phone,
        messageText: TEMPLATE.PAY_09,
        messageType: 'text',
        persona: 'maria',
        sessionId: '',
      } as OutboundJobData, { attempts: 2, backoff: { type: 'exponential', delay: 2000 } });
      break;
    }

    case 'pending': {
      await outboundQueue.add('payment_still_pending', {
        userId,
        phone: user.phone,
        messageText: 'Ainda não recebi a confirmação. Me manda o comprovante que eu verifico aqui.',
        messageType: 'text',
        persona: 'maria',
        sessionId: '',
      } as OutboundJobData, { attempts: 2, backoff: { type: 'exponential', delay: 2000 } });
      break;
    }

    default: {
      await outboundQueue.add('payment_inquiry_unknown', {
        userId,
        phone: user.phone,
        messageText: TEMPLATE.PAY_08,
        messageType: 'text',
        persona: 'maria',
        sessionId: '',
      } as OutboundJobData, { attempts: 2, backoff: { type: 'exponential', delay: 2000 } });
    }
  }
}

const PAYMENT_STALE_HOURS = 24;

/**
 * Scheduled job: alerts on payments PENDING for more than 24h.
 * Per spec Gap 2: generates internal Sentry alert for manual investigation.
 */
export async function alertStalePayments(): Promise<number> {
  const staleThreshold = new Date(Date.now() - PAYMENT_STALE_HOURS * 60 * 60 * 1000);

  const stalePayments = await db
    .select()
    .from(payments)
    .where(eq(payments.status, 'PENDING'))
    .limit(100);

  const actuallyStale = stalePayments.filter(p =>
    p.createdAt && new Date(p.createdAt) < staleThreshold,
  );

  for (const payment of actuallyStale) {
    // Log to Sentry as alert for manual investigation
    console.warn(`[PAYMENT-ALERT] Payment ${payment.id} has been PENDING for over 24h. User: ${payment.userId}, Checkout: ${payment.abacateCheckoutId}`);

    // Sentry capture if available
    try {
      const Sentry = await import('@sentry/node');
      Sentry.captureMessage(`Stale payment: ${payment.id} (PENDING > 24h)`, 'warning');
    } catch {
      // Sentry not available — console.warn above is sufficient
    }
  }

  return actuallyStale.length;
}
