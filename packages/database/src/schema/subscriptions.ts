// ============================================
// PRONTO.IA — Subscriptions
// ============================================
// Tracks AbacatePay subscription lifecycle for Pro users.

import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

import { subscriptionStatusEnum } from './enums';
import { users } from './users';

export const subscriptions = pgTable(
  'subscriptions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    // Subscription state
    status: subscriptionStatusEnum('status').default('active').notNull(),
    currentPeriodStart: timestamp('current_period_start', { withTimezone: true }),
    currentPeriodEnd: timestamp('current_period_end', { withTimezone: true }),

    // AbacatePay integration
    abacateSubscriptionId: text('abacate_subscription_id'),

    // Founder Benefit — Sprint 3
    // planTier is NULL by default; webhook decides explicitly.
    // 'founder' = access to all specialists; 'pro_single' = 1 chosen specialist
    planTier: text('plan_tier'),
    founderBenefitLocked: boolean('founder_benefit_locked').default(false),
    selectedSpecialist: text('selected_specialist'),  // only when planTier='pro_single'

    // Cancellation
    canceledAt: timestamp('canceled_at', { withTimezone: true }),
    cancellationReason: text('cancellation_reason'),

    // Track first message after cancellation (Maria explains)
    lastMessageAfterCancellation: timestamp('last_message_after_cancellation', { withTimezone: true }),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_subscriptions_user').on(table.userId),
    index('idx_subscriptions_status').on(table.status),
    index('idx_subscriptions_abacate_id').on(table.abacateSubscriptionId),
    index('idx_subscriptions_plan_tier').on(table.planTier),
  ],
);

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
}));
