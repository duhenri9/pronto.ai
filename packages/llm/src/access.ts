// ============================================
// PRONTO.IA — Access Control (Sprint 3)
// ============================================
// Determines whether a user can access a specialist persona.
// Founder tier = all specialists; pro_single = chosen specialist only.

import { db, eq, and, subscriptions } from '@pronto-ia/database';

export type Specialist = 'bia' | 'ze-da-ti' | 'leo' | 'tiao';

/**
 * Checks if a user has access to a given specialist.
 * Founder tier → access to all.
 * pro_single → access only to selectedSpecialist.
 * No active subscription or NULL planTier → no access.
 */
export async function canAccessSpecialist(
  userId: string,
  specialist: Specialist,
): Promise<boolean> {
  const [sub] = await db
    .select({
      planTier: subscriptions.planTier,
      selectedSpecialist: subscriptions.selectedSpecialist,
    })
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.userId, userId),
        eq(subscriptions.status, 'active'),
      ),
    )
    .limit(1);

  if (!sub || !sub.planTier) return false;

  if (sub.planTier === 'founder') {
    return true; // founder has access to everything
  }

  if (sub.planTier === 'pro_single') {
    return sub.selectedSpecialist === specialist;
  }

  return false;
}
