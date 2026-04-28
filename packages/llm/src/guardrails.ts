// ============================================
// PRONTO.IA — Guardrails
// ============================================
// Input/output validation for LLM calls.
// Prevents prompt injection, limits length, checks content.

const MAX_INPUT_LENGTH = 4000;
const MAX_OUTPUT_LENGTH = 2000;
const BLOCKED_PATTERNS: RegExp[] = [
  // English patterns
  /ignore\s+(all\s+)?(previous|prior|above|the\s+)?instructions?/i,
  /disregard\s+(all\s+)?(previous|prior|above|the\s+)?instructions?/i,
  /jailbreak/i,
  /reveal\s+(your|the)\s+(system\s+)?prompt/i,
  /you\s+are\s+now\s+(a\s+)?(new|different|another)/i,
  /pretend\s+(you\s+are|to\s+be)/i,
  /act\s+as\s+if/i,

  // Portuguese patterns — pt-BR jailbreak/injection
  /ignor(e|ar)\s+(todas\s+|as\s+|os\s+)?(instruç|instruc|orientaç)/i,
  /finja\s+que\s+(voc[êe]|és)/i,
  /a\s+partir\s+de\s+agora\s+(voc[êe]|és)/i,
  /revele\s+(seu|o)\s+(sistema|prompt|funcionamento)/i,
  /esqueça\s+(tudo|as\s+instruç|o\s+que\s+foi\s+dito)/i,
  /voc[êe]\s+agora\s+[ée]\s+(um|uma)\s+(novo|diferente|outro)/i,
  /haja\s+como\s+se\s+(voc[êe]|fosse)/i,
];

export interface GuardrailResult {
  allowed: boolean;
  reason?: string;
  sanitized?: string;
}

export function validateInput(text: string): GuardrailResult {
  if (!text || text.trim().length === 0) {
    return { allowed: false, reason: 'Empty input' };
  }

  if (text.length > MAX_INPUT_LENGTH) {
    return {
      allowed: false,
      reason: `Input exceeds maximum length (${text.length} > ${MAX_INPUT_LENGTH})`,
    };
  }

  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(text)) {
      return {
        allowed: false,
        reason: 'Input contains potentially harmful instruction',
      };
    }
  }

  return { allowed: true, sanitized: text.trim() };
}

export function validateOutput(text: string): GuardrailResult {
  if (!text || text.trim().length === 0) {
    return { allowed: false, reason: 'Empty output from LLM' };
  }

  if (text.length > MAX_OUTPUT_LENGTH) {
    // Truncate at last sentence boundary before limit
    const truncated = text.substring(0, MAX_OUTPUT_LENGTH);
    const lastPeriod = truncated.lastIndexOf('.');
    const lastNewline = truncated.lastIndexOf('\n');
    const cutPoint = Math.max(lastPeriod, lastNewline, MAX_OUTPUT_LENGTH - 200);
    return {
      allowed: true,
      sanitized: text.substring(0, cutPoint + 1).trim(),
    };
  }

  return { allowed: true, sanitized: text.trim() };
}

export function sanitizeUserMessage(text: string): string {
  return text
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/\0/g, '') // Remove null bytes
    .trim()
    .substring(0, MAX_INPUT_LENGTH);
}
