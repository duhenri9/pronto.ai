// ============================================
// PRONTO.IA — Worker Environment Validation
// ============================================
// Validates all required environment variables at startup.
// Crashes immediately if any critical variable is missing.

import { config as dotenvConfig } from 'dotenv';
import { existsSync } from 'fs';
import { dirname, join } from 'path';

function findDotenvPath(base: string): string | undefined {
  let current = base;

  for (let i = 0; i < 6; i += 1) {
    const candidate = join(current, '.env');
    if (existsSync(candidate)) {
      return candidate;
    }
    const parent = dirname(current);
    if (parent === current) break;
    current = parent;
  }

  return undefined;
}

const envPath = findDotenvPath(__dirname) ?? findDotenvPath(process.cwd());
console.log(`[ENV] current cwd=${process.cwd()}`);
console.log(`[ENV] searching for .env from __dirname=${__dirname}`);
console.log(`[ENV] found dotenv path=${envPath ?? 'none'}`);
if (envPath) {
  dotenvConfig({ path: envPath });
} else {
  dotenvConfig();
}

interface EnvConfig {
  DATABASE_URL: string;
  REDIS_URL: string;
  ANTHROPIC_API_KEY: string;
  WHATSAPP_PROVIDER: 'zapi' | 'cloud_api';
  PROMPTS_DIR: string;
  ZAPI_INSTANCE_ID?: string;
  ZAPI_TOKEN?: string;
  ZAPI_SECURITY_TOKEN?: string;
  WHATSAPP_API_TOKEN?: string;
  WHATSAPP_PHONE_NUMBER_ID?: string;
  WHATSAPP_WEBHOOK_VERIFY_TOKEN?: string;
  AI_DEFAULT_MODEL: string;
  AI_EVALUATION_MODEL: string;
  AI_DEFAULT_MAX_TOKENS: number;
}

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`[ENV] Missing required variable: ${name}`);
    console.error(`[ENV] TIP: Set ${name} in the host environment or add it to the root .env file.`);
    process.exit(1);
  }
  return value;
}

function optional(name: string): string | undefined {
  return process.env[name];
}

function optionalAny(...names: string[]): string | undefined {
  for (const name of names) {
    const value = process.env[name];
    if (value) {
      return value;
    }
  }

  return undefined;
}

function resolvePromptsDir(): string {
  const envDir = optional('PROMPTS_DIR');
  if (envDir) return envDir;

  // In dev mode (tsx), use the monorepo prompts directory
  // Relative to this file's location: apps/worker/src/ → ../../prompts/personas
  const { join } = require('path');
  return join(__dirname, '..', '..', '..', 'prompts', 'personas');
}

export const env: EnvConfig = {
  DATABASE_URL: required('DATABASE_URL'),
  REDIS_URL: required('REDIS_URL'),
  ANTHROPIC_API_KEY: required('ANTHROPIC_API_KEY'),
  WHATSAPP_PROVIDER: (optional('WHATSAPP_PROVIDER') ?? 'zapi') as 'zapi' | 'cloud_api',
  PROMPTS_DIR: resolvePromptsDir(),

  // Z-API (pilot)
  ZAPI_INSTANCE_ID: optional('ZAPI_INSTANCE_ID'),
  ZAPI_TOKEN: optional('ZAPI_TOKEN'),
  ZAPI_SECURITY_TOKEN: optional('ZAPI_SECURITY_TOKEN'),

  // Cloud API (production)
  WHATSAPP_API_TOKEN: optionalAny('WHATSAPP_API_TOKEN', 'META_WHATSAPP_ACCESS_TOKEN'),
  WHATSAPP_PHONE_NUMBER_ID: optionalAny('WHATSAPP_PHONE_NUMBER_ID', 'META_WHATSAPP_PHONE_NUMBER_ID'),
  WHATSAPP_WEBHOOK_VERIFY_TOKEN: optional('WHATSAPP_WEBHOOK_VERIFY_TOKEN'),

  // LLM defaults
  AI_DEFAULT_MODEL: optional('AI_DEFAULT_MODEL') ?? 'claude-haiku-4-5-20251001',
  AI_EVALUATION_MODEL: optional('AI_EVALUATION_MODEL') ?? 'claude-sonnet-4-5-20250514',
  AI_DEFAULT_MAX_TOKENS: parseInt(optional('AI_DEFAULT_MAX_TOKENS') ?? '800', 10),
};

console.log('[ENV] Configuration validated');
console.log(`[ENV] WHATSAPP_PROVIDER=${env.WHATSAPP_PROVIDER}`);
console.log(`[ENV] PROMPTS_DIR=${env.PROMPTS_DIR}`);
