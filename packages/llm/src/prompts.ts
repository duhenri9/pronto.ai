// ============================================
// PRONTO.IA — Prompt Loader
// ============================================
// Reads versioned persona prompts from the prompts/ directory.
// Prompts are markdown files with YAML frontmatter.

import { readFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';

export interface LoadedPrompt {
  version: string;
  persona: string;
  name: string;
  role: string;
  vertical: string;
  model: string;
  language: string;
  fallbackMessage: string;
  systemPrompt: string;
}

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

export function loadPrompt(persona: string): LoadedPrompt {
  const cached = cache.get(persona);
  if (cached) return cached;

  const filename = `${persona}.md`;
  const filepath = join(getPromptsDir(), filename);

  if (!existsSync(filepath)) {
    throw new Error(`Prompt file not found: ${filepath}`);
  }

  const raw = readFileSync(filepath, 'utf-8');
  const { meta, body } = parseFrontmatter(raw);

  const prompt: LoadedPrompt = {
    version: meta.version ?? '0.0.0',
    persona: meta.persona ?? persona,
    name: meta.name ?? persona,
    role: meta.role ?? 'unknown',
    vertical: meta.vertical ?? 'all',
    model: meta.model ?? 'claude-haiku-4-5-20251001',
    language: meta.language ?? 'pt-BR',
    fallbackMessage: meta.fallback_message ?? 'Pode repetir, por favor? Deu um pequeno problema técnico aqui.',
    systemPrompt: body,
  };

  cache.set(persona, prompt);
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
