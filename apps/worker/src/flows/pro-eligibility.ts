// ============================================
// PRONTO.IA — Pro Eligibility Checker (Anexo C)
// ============================================
// Canonical Pro offer eligibility criteria.
// All 7 criteria must pass for a user to be eligible.

import { db, eq, and, gte, users, whatsappMessages, outcomeReports } from '@pronto-ia/database';
import { sql } from 'drizzle-orm';

export interface ProEligibilityResult {
  eligible: boolean;
  reasons: string[]; // reasons why NOT eligible, empty if eligible=true
}

function daysSince(date: Date): number {
  return Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
}

export async function checkProEligibility(userId: string): Promise<ProEligibilityResult> {
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) {
    return { eligible: false, reasons: ['user_not_found'] };
  }

  const reasons: string[] = [];

  // 1. Correct state (not already Pro, not in onboarding/LGPD/etc)
  if (user.isPro) {
    reasons.push('already_pro');
  }
  if (user.lifecycleState === 'onboarding' || user.lifecycleState === 'awaiting_lgpd_confirmation') {
    reasons.push(`wrong_state:${user.lifecycleState}`);
  }

  // 2. 7+ days since creation
  const daysActive = daysSince(user.createdAt);
  if (daysActive < 7) {
    reasons.push(`too_recent:${daysActive}d`);
  }

  // 3. 3+ vertical questions in last 14 days
  //    Since whatsapp_messages doesn't have an intent column,
  //    we count inbound messages that mention vertical keywords.
  const verticalKeywords = ['salão', 'cabeleireiro', 'manicure', 'estética', 'instagram',
    'agendamento', 'cliente', 'preço', 'serviço', 'post', 'legenda'];
  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

  const recentInbound = await db
    .select({ textContent: whatsappMessages.textContent })
    .from(whatsappMessages)
    .where(
      and(
        eq(whatsappMessages.userId, userId),
        eq(whatsappMessages.direction, 'inbound'),
        gte(whatsappMessages.createdAt, fourteenDaysAgo),
      ),
    );

  const verticalCount = recentInbound.filter(m => {
    const text = (m.textContent ?? '').toLowerCase();
    return verticalKeywords.some(kw => text.includes(kw));
  }).length;

  if (verticalCount < 3) {
    reasons.push(`few_vertical_questions:${verticalCount}`);
  }

  // 4. 1+ positive outcome
  const outcomeRows = await db
    .select({ count: sql<number>`count(*)` })
    .from(outcomeReports)
    .where(eq(outcomeReports.userId, userId));
  const oCount = Number(outcomeRows[0]?.count ?? 0);
  if (oCount < 1) {
    reasons.push('no_outcomes');
  }

  // 5. Not offered in last 30 days
  if (user.proOfferedAt && daysSince(user.proOfferedAt) < 30) {
    reasons.push(`offered_recently:${daysSince(user.proOfferedAt)}d`);
  }

  // 6. No conflicting pending_action
  if (user.pendingAction !== null && user.pendingAction !== 'awaiting_pro_response') {
    reasons.push(`pending_action:${user.pendingAction}`);
  }

  // 7. No temporary block (after negative events)
  if (user.proOfferBlockedUntil && new Date(user.proOfferBlockedUntil) > new Date()) {
    reasons.push(`blocked_until:${user.proOfferBlockedUntil.toISOString()}`);
  }

  return {
    eligible: reasons.length === 0,
    reasons,
  };
}
