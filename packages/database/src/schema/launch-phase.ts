// ============================================
// PRONTO.IA — Launch Phase Config
// ============================================
// Singleton table that tracks the founder launch phase.
// Cap of 1,000 founders with atomic counter (FOR UPDATE).
// Only 1 row ever exists (id=1, singleton constraint).

import {
  pgTable,
  integer,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';

export const launchPhaseConfig = pgTable(
  'launch_phase_config',
  {
    id: integer('id').primaryKey().default(1),
    founderCap: integer('founder_cap').default(1000).notNull(),
    founderCount: integer('founder_count').default(0).notNull(),
    manualFounderCount: integer('manual_founder_count').default(0).notNull(),
    startedAt: timestamp('started_at', { withTimezone: true }).defaultNow().notNull(),
    endedAt: timestamp('ended_at', { withTimezone: true }),
  },
  (table) => [
    index('idx_launch_phase_ended').on(table.endedAt),
  ],
);
