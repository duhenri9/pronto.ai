// ============================================
// PRONTO.IA — Admin: Founder Grant Override
// ============================================
// POST /api/v1/admin/founders/grant
// Allows Ed to manually grant founder tier to a user
// (strategic partners, journalists, beta testers).
// Does NOT count toward the public 1,000 cap.

import { NextRequest, NextResponse } from 'next/server';
import { db, eq, and, users, subscriptions, launchPhaseConfig } from '@pronto-ia/database';

const ADMIN_SECRET = process.env.ADMIN_SECRET;

export async function POST(request: NextRequest) {
  // Auth check
  const authHeader = request.headers.get('authorization');
  if (!ADMIN_SECRET || authHeader !== `Bearer ${ADMIN_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { user_id, reason, granted_by } = body;

    if (!user_id || !reason || !granted_by) {
      return NextResponse.json(
        { error: 'Missing required fields: user_id, reason, granted_by' },
        { status: 400 },
      );
    }

    // Find or create active subscription for the user
    const [existingSub] = await db
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.userId, user_id),
          eq(subscriptions.status, 'active'),
        ),
      )
      .limit(1);

    if (existingSub) {
      // Update existing subscription to founder
      await db
        .update(subscriptions)
        .set({
          planTier: 'founder',
          founderBenefitLocked: true,
          selectedSpecialist: null,
        })
        .where(eq(subscriptions.id, existingSub.id));
    } else {
      // Create a new founder subscription
      const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      await db.insert(subscriptions).values({
        userId: user_id,
        status: 'active',
        planTier: 'founder',
        founderBenefitLocked: true,
        selectedSpecialist: null,
        currentPeriodStart: new Date(),
        currentPeriodEnd: periodEnd,
      });
    }

    // Increment manual founder counter (separate from public cap)
    await db
      .update(launchPhaseConfig)
      .set({
        manualFounderCount: sql`${launchPhaseConfig.manualFounderCount} + 1`,
      })
      .where(eq(launchPhaseConfig.id, 1));

    // Update user lifecycle state
    await db
      .update(users)
      .set({
        lifecycleState: 'active_pro',
        isPro: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user_id));

    return NextResponse.json({
      ok: true,
      user_id,
      tier: 'founder',
      note: 'Manual grant — does not count toward public 1,000 cap',
    });
  } catch (error) {
    console.error('[admin/founders/grant] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Import sql for the increment expression
import { sql } from 'drizzle-orm';
