// ============================================
// PRONTO.IA — Vertical Interest Signups
// ============================================
// Captures leads interested in verticals not yet available.
// When a specialist launches (e.g. Léo for food service),
// query this table to notify opted-in users via WhatsApp.

import {
  pgTable,
  uuid,
  text,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { verticalEnum } from './enums';

export const verticalInterestSignups = pgTable(
  'vertical_interest_signups',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    // Phone is the primary identifier (WhatsApp-first product)
    phone: text('phone').notNull(),

    // Which vertical they're interested in
    vertical: verticalEnum('vertical').notNull(),

    // Optional: specific niche within the vertical
    niche: text('niche'), // e.g. "marmita", "food truck", "lanchonete"

    // Lifecycle
    signedUpAt: timestamp('signed_up_at', { withTimezone: true }).defaultNow().notNull(),
    notifiedAt: timestamp('notified_at', { withTimezone: true }),
    convertedAt: timestamp('converted_at', { withTimezone: true }),
  },
  (table) => [
    index('idx_vertical_interest_phone').on(table.phone),
    index('idx_vertical_interest_vertical').on(table.vertical),
    index('idx_vertical_interest_notified').on(table.notifiedAt),
  ],
);
