// ============================================
// PRONTO.IA — Prompt Loader
// ============================================
// Reads versioned persona prompts from the prompts/ directory.
// Prompts are markdown files with YAML frontmatter.
// Structure: basePrompt (cacheable) + dynamicContext (not cacheable)
// separated by ---DYNAMIC--- marker.

import { readFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';

// ---- Types ----

export interface PromptMeta {
  version: string;
  persona: string;
  name: string;
  role: string;
  vertical: string;
  model: string;
  escalationModel: string;
  language: string;
  fallbackMessage: string;
  requiredSubscription?: string;
}

export interface LoadedPrompt {
  meta: PromptMeta;
  /** Cacheable part of the system prompt (sent with cache_control: ephemeral) */
  basePrompt: string;
  /** Dynamic per-user context (NOT cached — changes per conversation) */
  dynamicContext: string;
  /** Full system prompt (basePrompt + dynamicContext) — kept for backwards compat */
  systemPrompt: string;
}

export interface UserContext {
  preferred_name?: string;
  lifecycle_state?: string;
  pending_action?: string;
  vertical?: string;
  business_context?: string;
  preferred_contact_window?: string;
  subscription_active?: string;
  subscription_expires_at?: string;
  last_active_at?: string;
  relevant_memories?: string;
  conversation_history?: string;
  // Legacy fields kept for backwards compat with other persona prompts
  display_name?: string;
  current_track?: string;
  current_lesson?: string;
  [key: string]: string | undefined;
}

// ---- Loader ----

function getPromptsDir(): string {
  return process.env.PROMPTS_DIR ?? join(process.cwd(), 'prompts', 'personas');
}

const cache = new Map<string, LoadedPrompt>();

function parseFrontmatter(raw: string): { meta: Record<string, string>; body: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    return { meta: {}, body: raw };
  }

  const meta: Record<string, string> = {};
  for (const line of match[1].split('\n')) {
    const [key, ...rest] = line.split(':');
    if (key && rest.length) {
      meta[key.trim()] = rest.join(':').trim();
    }
  }

  return { meta, body: match[2].trim() };
}

function fillTemplate(template: string, ctx: UserContext): string {
  let result = template;

  // Process {{#if key}}...{{/if}} conditional blocks
  result = result.replace(/\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (_match, key: string, content: string) => {
    const value = ctx[key];
    // Truthy = non-empty string that's not "false" or "0"
    if (value && value !== 'false' && value !== '0') {
      // Also fill any placeholders within the conditional content
      let filled = content;
      for (const [k, v] of Object.entries(ctx)) {
        if (v !== undefined) {
          filled = filled.replaceAll(`{{${k}}}`, v);
        }
      }
      return filled;
    }
    return ''; // Remove entire block if condition is falsy
  });

  // Fill simple {{key}} placeholders
  for (const [key, value] of Object.entries(ctx)) {
    if (value !== undefined) {
      result = result.replaceAll(`{{${key}}}`, value);
    }
  }
  // Remove unfilled placeholders (optional — keeps template clean)
  result = result.replace(/\{\{[a-z_]+\}\}/g, '');
  return result;
}

export function loadPrompt(persona: string, userContext?: UserContext): LoadedPrompt {
  const cached = cache.get(persona);
  if (cached && !userContext) return cached;

  const filename = `${persona}.md`;
  const filepath = join(getPromptsDir(), filename);

  if (!existsSync(filepath)) {
    throw new Error(`Prompt file not found: ${filepath}`);
  }

  const raw = readFileSync(filepath, 'utf-8');
  const { meta, body } = parseFrontmatter(raw);

  // Split by ---DYNAMIC--- marker for prompt caching
  const DYNAMIC_MARKER = '---DYNAMIC---';
  let basePrompt: string;
  let dynamicContext: string;

  if (body.includes(DYNAMIC_MARKER)) {
    const parts = body.split(DYNAMIC_MARKER);
    basePrompt = parts[0].trim();
    dynamicContext = parts.slice(1).join(DYNAMIC_MARKER).trim();
  } else {
    // No marker — entire body is base (cacheable)
    basePrompt = body;
    dynamicContext = '';
  }

  // Fill template placeholders in dynamicContext with userContext
  if (userContext && dynamicContext) {
    dynamicContext = fillTemplate(dynamicContext, userContext);
  }

  const prompt: LoadedPrompt = {
    meta: {
      version: meta.version ?? '0.0.0',
      persona: meta.persona ?? persona,
      name: meta.name ?? persona,
      role: meta.role ?? 'unknown',
      vertical: meta.vertical ?? 'all',
      model: meta.default_model ?? meta.model ?? 'claude-haiku-4-5-20251001',
      escalationModel: meta.escalation_model ?? 'claude-sonnet-4-5-20250514',
      language: meta.language ?? 'pt-BR',
      fallbackMessage: meta.fallback_message ?? 'Pode repetir, por favor? Deu um pequeno problema técnico aqui.',
      requiredSubscription: meta.required_subscription ?? undefined,
    },
    basePrompt,
    dynamicContext,
    systemPrompt: dynamicContext ? `${basePrompt}\n\n${dynamicContext}` : basePrompt,
  };

  // Cache only the base prompt (without user-specific context)
  if (!userContext) {
    cache.set(persona, prompt);
  }

  return prompt;
}

export function clearPromptCache(): void {
  cache.clear();
}

export function listAvailablePersonas(): string[] {
  const promptsDir = getPromptsDir();
  if (!existsSync(promptsDir)) return [];
  const files = readdirSync(promptsDir);
  return files
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace('.md', ''));
}
