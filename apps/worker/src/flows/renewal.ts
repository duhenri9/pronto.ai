// ============================================
// PRONTO.IA — Renewal Flow (1.5)
// ============================================
// Daily scheduler for expiring subscriptions,
// inbound intercept for renewal reminders,
// and overdue/cancellation lifecycle management.

import { db, eq, and, lt, gt, isNull, sql, users, subscriptions } from '@pronto-ia/database';
import { outboundQueue } from '../queues';
import type { OutboundJobData } from '../queues';
import { TEMPLATE } from './templates';

// ---- Daily Renewal Scheduler ----
// Marks users with expiring subscriptions for reminder
// on their next inbound message.

export async function dailyRenewalScheduler(): Promise<number> {
  const threeDaysFromNow = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  const now = new Date();

  // Find active subscriptions expiring within 3 days
  const expiring = await db
    .select({
      userId: subscriptions.userId,
      periodEnd: subscriptions.currentPeriodEnd,
    })
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.status, 'active'),
        gt(subscriptions.currentPeriodEnd, now),
        lt(subscriptions.currentPeriodEnd, threeDaysFromNow),
      ),
    );

  let marked = 0;
  for (const sub of expiring) {
    await db
      .update(users)
      .set({
        pendingAction: 'awaiting_renewal_reminder',
        updatedAt: new Date(),
      })
      .where(eq(users.id, sub.userId));

    marked++;
  }

  return marked;
}

// ---- Inbound Intercept for Renewal ----

export async function handleInboundWithPendingRenewal(
  userId: string,
): Promise<boolean> {
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user || user.pendingAction !== 'awaiting_renewal_reminder') return false;

  // Find active subscription
  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.userId, userId),
        eq(subscriptions.status, 'active'),
      ),
    )
    .limit(1);

  if (!sub?.currentPeriodEnd) {
    // No active subscription, clear pending action
    await db.update(users).set({
      pendingAction: null,
      updatedAt: new Date(),
    }).where(eq(users.id, userId));
    return false;
  }

  const daysUntilExpiry = Math.ceil(
    (sub.currentPeriodEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );

  // Send renewal reminder
  await outboundQueue.add('renewal_reminder', {
    userId,
    phone: user.phone,
    messageText: TEMPLATE.REN_01(user.displayName ?? user.name, daysUntilExpiry),
    messageType: 'text',
    persona: 'maria',
    sessionId: '',
  } as OutboundJobData, { attempts: 2, backoff: { type: 'exponential', delay: 2000 } });

  // Update state
  await db.update(users).set({
    pendingAction: 'awaiting_renewal_response',
    updatedAt: new Date(),
  }).where(eq(users.id, userId));

  return true; // Intercepted — do not process original message yet
}

// ---- Renewal Response Handler ----

type RenewalIntent = 'paid' | 'postponed' | 'declined';

function classifyRenewalResponse(message: string): RenewalIntent {
  const lower = message.toLowerCase().trim();

  // Paid / wants to pay
  const paidPatterns = [
    /^(sim|quero|bora|já\s+paguei|paguei|renovar|vamos)/i,
    /mandar?\s+o\s+link/i,
    /quero\s+renovar/i,
  ];
  for (const p of paidPatterns) {
    if (p.test(lower)) return 'paid';
  }

  // Declined
  const declinedPatterns = [
    /^(não|nao|não\s+quero|cancel)/i,
  ];
  for (const p of declinedPatterns) {
    if (p.test(lower)) return 'declined';
  }

  // Postponed (default for ambiguous)
  return 'postponed';
}

export async function handleRenewalResponse(
  userId: string,
  message: string,
): Promise<void> {
  const intent = classifyRenewalResponse(message);
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) return;

  // Fetch active subscription for expiry date
  const [sub] = await db.select().from(subscriptions)
    .where(and(eq(subscriptions.userId, userId), eq(subscriptions.status, 'active')))
    .limit(1);
  const expiryDate = sub?.currentPeriodEnd?.toLocaleDateString('pt-BR') ?? '';

  switch (intent) {
    case 'paid': {
      await outboundQueue.add('renewal_link', {
        userId,
        phone: user.phone,
        messageText: TEMPLATE.REN_02,
        messageType: 'text',
        persona: 'maria',
        sessionId: '',
      } as OutboundJobData, { attempts: 2, backoff: { type: 'exponential', delay: 2000 } });

      const { initiateCheckout } = await import('./payment');
      await initiateCheckout(userId, 'renewal');
      break;
    }

    case 'postponed': {
      await outboundQueue.add('renewal_postponed', {
        userId,
        phone: user.phone,
        messageText: TEMPLATE.REN_03,
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

    case 'declined': {
      await outboundQueue.add('renewal_declined', {
        userId,
        phone: user.phone,
        messageText: TEMPLATE.REN_04(expiryDate),
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
}

// ---- Daily Overdue Scheduler ----

export async function dailyOverdueScheduler(): Promise<{ pastDue: number; cancelled: number }> {
  const now = new Date();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // Past due: subscription expired but within 7-day tolerance
  const pastDueSubs = await db
    .select({ userId: subscriptions.userId })
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.status, 'active'),
        lt(subscriptions.currentPeriodEnd, now),
        gt(subscriptions.currentPeriodEnd, sevenDaysAgo),
      ),
    );

  for (const sub of pastDueSubs) {
    await db.update(users).set({
      lifecycleState: 'past_due',
      updatedAt: new Date(),
    }).where(eq(users.id, sub.userId));

    await db.update(subscriptions).set({
      status: 'past_due',
    }).where(eq(subscriptions.userId, sub.userId));
  }

  // Cancelled: expired more than 7 days ago
  const cancelledSubs = await db
    .select({ userId: subscriptions.userId })
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.status, 'past_due'),
        lt(subscriptions.currentPeriodEnd, sevenDaysAgo),
      ),
    );

  for (const sub of cancelledSubs) {
    await db.update(users).set({
      lifecycleState: 'cancelled',
      isPro: false,
      updatedAt: new Date(),
    }).where(eq(users.id, sub.userId));

    await db.update(subscriptions).set({
      status: 'canceled',
      canceledAt: now,
    }).where(eq(subscriptions.userId, sub.userId));
  }

  return { pastDue: pastDueSubs.length, cancelled: cancelledSubs.length };
}

// ---- Handle First Inbound After Cancellation ----

export async function handleInboundWhenCancelled(
  userId: string,
): Promise<boolean> {
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user || user.lifecycleState !== 'cancelled') return false;

  // Find subscription to check if we already notified
  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1);

  if (sub?.lastMessageAfterCancellation) {
    return false; // Already notified before
  }

  // First message after cancellation — Maria explains
  await outboundQueue.add('cancelled_first_contact', {
    userId,
    phone: user.phone,
    messageText: TEMPLATE.REN_05,
    messageType: 'text',
    persona: 'maria',
    sessionId: '',
  } as OutboundJobData, { attempts: 2, backoff: { type: 'exponential', delay: 2000 } });

  // Mark as notified
  if (sub) {
    await db.update(subscriptions).set({
      lastMessageAfterCancellation: new Date(),
    }).where(eq(subscriptions.id, sub.id));
  }

  return true;
}

// ---- Gap 3: Pro Reactivation (1.5.C) ----

/**
 * Handles a cancelled user who wants to reactivate Pro.
 * Per spec: sends REA_01 acknowledgement, then initiates checkout.
 * Only triggers for users with lifecycle_state = "cancelled" or "churned".
 */
export async function handleReactivationRequest(
  userId: string,
): Promise<boolean> {
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) return false;

  // Only allow reactivation for cancelled/churned users
  if (user.lifecycleState !== 'cancelled' && user.lifecycleState !== 'churned') {
    return false;
  }

  const displayName = user.displayName ?? user.name ?? 'amiga';

  // Check if user had founder benefit locked (persists across cancel/reactivate)
  const [prevSub] = await db
    .select({
      founderBenefitLocked: subscriptions.founderBenefitLocked,
      planTier: subscriptions.planTier,
    })
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1);

  const isFounder = prevSub?.founderBenefitLocked === true;

  // Send reactivation acknowledgement (founder gets preserved message)
  const reactivationMessage = isFounder
    ? TEMPLATE.REA_01_FOUNDER_PRESERVED(displayName)
    : TEMPLATE.REA_01(displayName);

  await outboundQueue.add('reactivation_acknowledge', {
    userId,
    phone: user.phone,
    messageText: reactivationMessage,
    messageType: 'text',
    persona: 'maria',
    sessionId: '',
  } as OutboundJobData, { attempts: 2, backoff: { type: 'exponential', delay: 2000 } });

  // Initiate checkout — pass forced_tier if founder so webhook preserves tier
  const { initiateCheckout } = await import('./payment');
  const metadataOverrides = isFounder
    ? { forced_tier: 'founder' }
    : undefined;
  await initiateCheckout(userId, 'initial', metadataOverrides);

  return true;
}
