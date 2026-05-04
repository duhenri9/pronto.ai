// ============================================
// PRONTO.IA — Memory Extractor (Claude Haiku)
// ============================================
// Extracts structured memories from conversations
// using Anthropic Claude Haiku with a specialized prompt.

import Anthropic from '@anthropic-ai/sdk';
import { db, eq, and } from '@pronto-ia/database';
import { userMemory } from '@pronto-ia/database';

// ---- Types ----

export interface ExtractedMemory {
  key: string;
  value: string;
  memoryType: 'preference' | 'context' | 'conversation_summary' | 'business_info' | 'onboarding_data';
  confidence: number; // 0.0 – 1.0
}

export interface MemoryExtractionInput {
  userId: string;
  userMessage: string;
  assistantResponse: string;
  persona?: string;
}

// ---- LLM client singleton ----

let anthropicClient: Anthropic | null = null;

function getClient(): Anthropic {
  if (!anthropicClient) {
    anthropicClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
  }
  return anthropicClient;
}

// Reset for testing
export function resetMemoryExtractor(): void {
  anthropicClient = null;
}

// ---- Memory Extraction Prompt ----

const EXTRACTION_PROMPT = `You are a memory extraction assistant for a WhatsApp AI chatbot called Pronto.IA.
Your ONLY job is to extract important, durable memories from a conversation exchange.

RULES:
- Only extract facts that will remain true for weeks or months (preferences, business info, personal context)
- Do NOT extract transient info (current mood, temporary questions, greetings)
- Each memory must have a unique key (snake_case, e.g. "prefers_morning_contact")
- Confidence: 1.0 = explicitly stated, 0.7 = strongly implied, 0.5 = likely but uncertain
- Maximum 5 memories per exchange
- If nothing worth remembering, return an empty array
- Respond ONLY with valid JSON, no markdown, no explanation

OUTPUT FORMAT (JSON array):
[
  {
    "key": "unique_snake_case_key",
    "value": "human readable value",
    "memoryType": "preference|context|conversation_summary|business_info|onboarding_data",
    "confidence": 0.8
  }
]

MEMORY TYPES:
- preference: User stated preferences (contact time, communication style, topics of interest)
- context: Relevant life/business context (profession, business type, location, family situation)
- conversation_summary: Key decisions or outcomes from the conversation
- business_info: Business-related data (service type, niche, challenges, goals)
- onboarding_data: Information gathered during onboarding (name, goals, expectations)`;

// ---- Extract memories from a conversation exchange ----

export async function extractMemories(
  input: MemoryExtractionInput,
): Promise<ExtractedMemory[]> {
  const client = getClient();

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-20250414',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `${EXTRACTION_PROMPT}\n\n---\nPERSONA: ${input.persona ?? 'maria'}\nUSER SAID:\n${input.userMessage}\n\nASSISTANT REPLIED:\n${input.assistantResponse}\n\n---\nExtract memories from this exchange:`,
            },
          ],
        },
      ],
    });

    // Parse the response — Claude may wrap in markdown code blocks
    const textBlock = response.content.find((c: any) => c.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      return [];
    }

    let raw = textBlock.text.trim();
    // Strip markdown code fences if present
    raw = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      console.warn('[MEMORY] Extractor returned non-array, ignoring');
      return [];
    }

    // Validate and sanitize each memory
    const validTypes = ['preference', 'context', 'conversation_summary', 'business_info', 'onboarding_data'];
    return parsed
      .filter((m: any) => m.key && m.value && validTypes.includes(m.memoryType))
      .map((m: any) => ({
        key: String(m.key).replace(/\s+/g, '_').toLowerCase(),
        value: String(m.value).substring(0, 1000),
        memoryType: m.memoryType,
        confidence: Math.min(1, Math.max(0, Number(m.confidence) || 0.5)),
      }));
  } catch (err) {
    console.error('[MEMORY] Extraction failed:', err);
    return [];
  }
}

// ---- Deduplicate against existing memories ----

export async function deduplicateMemories(
  userId: string,
  memories: ExtractedMemory[],
): Promise<ExtractedMemory[]> {
  if (memories.length === 0) return [];

  const keys = memories.map((m) => m.key);

  const existing = await db
    .select({ key: userMemory.key })
    .from(userMemory)
    .where(
      and(
        eq(userMemory.userId, userId),
        // Drizzle doesn't have `inArray` directly in all versions — filter in JS
      ),
    );

  const existingKeys = new Set(existing.map((e) => e.key));

  return memories.filter((m) => !existingKeys.has(m.key));
}
