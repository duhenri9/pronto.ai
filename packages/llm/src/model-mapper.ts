// ============================================
// PRONTO.IA — Intent → Model Mapper (Anexo B)
// ============================================
// Determines which model to use based on intent.
// Critical intents (LGPD, revenue, cancellation)
// use Sonnet 4.5 for nuance. Routine intents
// use Haiku 4.5 for cost efficiency.

import type { Intent } from './router';

const HAIKU = 'claude-haiku-4-5-20251001';
const SONNET = 'claude-sonnet-4-5-20250514';

// Intents that require Sonnet 4.5 (critical, irreversible, or revenue-sensitive)
const SONNET_INTENTS = new Set<Intent>([
  'command_lgpd_delete',   // Irreversible — needs nuance
  'pro_offer_response',    // Revenue decision — careful interpretation
  'cancellation_request',  // Retention without being pushy
  'payment_response',      // Critical — don't confuse
  'exercise_submitted',    // Technical evaluation via evaluator
]);

/**
 * Returns the model ID to use for a given intent.
 * Falls back to the persona's default model.
 */
export function getModelForIntent(
  intent: Intent | undefined,
  defaultModel: string = HAIKU,
): string {
  if (!intent) return defaultModel;

  // Onboarding always uses Sonnet — every word counts
  if (intent === 'greeting' || intent === 'chat') {
    // Could be onboarding — check handled by caller
    return defaultModel;
  }

  if (SONNET_INTENTS.has(intent)) {
    return SONNET;
  }

  return defaultModel;
}

/**
 * Checks whether an intent should escalate to Sonnet 4.5.
 */
export function shouldEscalate(intent: Intent | undefined): boolean {
  return !!intent && SONNET_INTENTS.has(intent);
}
