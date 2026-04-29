// ============================================
// PRONTO.IA — Anthropic Claude Client
// ============================================

import Anthropic from '@anthropic-ai/sdk';
import type { LLMConfig, AnthropicModel } from '@pronto-ia/types';
import { loadPrompt, type LoadedPrompt } from './prompts';
import { validateInput, validateOutput, sanitizeUserMessage } from './guardrails';

// ---- Types ----

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface LLMCallOptions {
  persona: string;
  messages: ChatMessage[];
  config?: Partial<LLMConfig>;
  userId?: string;
  sessionId?: string;
  lessonId?: string;
}

export interface LLMCallResult {
  text: string;
  model: string;
  persona: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  estimatedCostCents: number;
  finishReason: string;
}

// ---- Client ----

const DEFAULT_CONFIG: LLMConfig = {
  model: 'claude-haiku-4-5-20251001',
  maxTokens: 800,
  temperature: 0.7,
};

// ---- Constants ----

/** Max characters for inbound user messages — longer texts are truncated */
const MAX_INBOUND_LENGTH = 2000;

export class ProntoLLMClient {
  private client: Anthropic;
  private defaultConfig: LLMConfig;

  constructor(config?: { apiKey?: string; defaultConfig?: Partial<LLMConfig> }) {
    this.client = new Anthropic({
      apiKey: config?.apiKey ?? process.env.ANTHROPIC_API_KEY,
      timeout: 25000, // 25s timeout per Anthropic request
    });

    this.defaultConfig = {
      ...DEFAULT_CONFIG,
      ...config?.defaultConfig,
    };
  }

  async chat(options: LLMCallOptions): Promise<LLMCallResult> {
    return this.callWithFallback(options);
  }

  /**
   * Calls the primary LLM provider. If it fails and
   * LLM_FALLBACK_ENABLED is true, falls back to the secondary provider.
   */
  private async callWithFallback(options: LLMCallOptions): Promise<LLMCallResult> {
    const primaryProvider = process.env.LLM_PROVIDER_PRIMARY ?? 'anthropic';

    try {
      if (primaryProvider === 'anthropic') {
        return await this.callAnthropic(options);
      }
      // Future: other primary providers
      return await this.callAnthropic(options);
    } catch (primaryError) {
      const fallbackEnabled = process.env.LLM_FALLBACK_ENABLED === 'true';
      const fallbackProvider = process.env.LLM_PROVIDER_FALLBACK ?? 'openai';

      if (!fallbackEnabled || fallbackProvider === primaryProvider) {
        throw primaryError;
      }

      console.warn(
        `[LLM] Primary provider (${primaryProvider}) failed, falling back to ${fallbackProvider}`,
        primaryError instanceof Error ? primaryError.message : primaryError,
      );

      // Future: implement OpenAI fallback client
      // For now, just re-throw the primary error
      throw primaryError;
    }
  }

  private async callAnthropic(options: LLMCallOptions): Promise<LLMCallResult> {
    const prompt = loadPrompt(options.persona);
    const callConfig = this.resolveConfig(prompt, options.config);
    const sanitizedMessages = this.sanitizeMessages(options.messages);

    // Build system prompt array with cache_control on basePrompt
    const system: Array<{ type: 'text'; text: string; cache_control?: { type: 'ephemeral' } }> = [
      {
        type: 'text',
        text: prompt.basePrompt,
        cache_control: { type: 'ephemeral' },
      },
    ];

    // Dynamic context is NOT cached (changes per user/session)
    if (prompt.dynamicContext) {
      system.push({
        type: 'text',
        text: prompt.dynamicContext,
      });
    }

    const startTime = Date.now();

    const response = await this.client.messages.create({
      model: callConfig.model,
      max_tokens: callConfig.maxTokens,
      temperature: callConfig.temperature,
      system,
      messages: sanitizedMessages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const latencyMs = Date.now() - startTime;

    // Extract text from response
    const textBlock = response.content.find((block) => block.type === 'text');
    const rawText = textBlock && textBlock.type === 'text' ? textBlock.text : '';

    // Validate output
    const outputCheck = validateOutput(rawText);
    if (!outputCheck.allowed) {
      throw new Error(`LLM output validation failed: ${outputCheck.reason}`);
    }

    const inputTokens = response.usage.input_tokens;
    const outputTokens = response.usage.output_tokens;
    const estimatedCostCents = this.calculateCost(callConfig.model, inputTokens, outputTokens);

    return {
      text: outputCheck.sanitized ?? rawText,
      model: callConfig.model,
      persona: options.persona,
      inputTokens,
      outputTokens,
      latencyMs,
      estimatedCostCents,
      finishReason: response.stop_reason ?? 'unknown',
    };
  }

  async evaluateExercise(
    studentResponse: string,
    exercisePrompt: string,
    persona: string = 'evaluator',
  ): Promise<LLMCallResult> {
    const prompt = loadPrompt(persona);
    const evalConfig: Partial<LLMConfig> = {
      model: 'claude-sonnet-4-5-20250514',
      maxTokens: 600,
      temperature: 0.3,
    };

    return this.chat({
      persona,
      messages: [
        {
          role: 'user',
          content: `Exercício: ${exercisePrompt}\n\nResposta da pessoa: ${studentResponse}`,
        },
      ],
      config: evalConfig,
    });
  }

  // ---- Private ----

  private resolveConfig(
    prompt: LoadedPrompt,
    overrides?: Partial<LLMConfig>,
  ): LLMConfig {
    return {
      model: (overrides?.model ?? prompt.meta.model ?? this.defaultConfig.model) as AnthropicModel,
      maxTokens: overrides?.maxTokens ?? this.defaultConfig.maxTokens,
      temperature: overrides?.temperature ?? this.defaultConfig.temperature,
    };
  }

  private sanitizeMessages(messages: ChatMessage[]): ChatMessage[] {
    return messages.map((m) => {
      const inputCheck = validateInput(m.content);
      let content = inputCheck.sanitized ?? sanitizeUserMessage(m.content);

      // Truncate inbound user messages that exceed MAX_INBOUND_LENGTH
      if (m.role === 'user' && content.length > MAX_INBOUND_LENGTH) {
        content = content.substring(0, MAX_INBOUND_LENGTH) + '... [truncado]';
      }

      return {
        role: m.role,
        content,
      };
    });
  }

  private calculateCost(
    model: string,
    inputTokens: number,
    outputTokens: number,
  ): number {
    // Costs in cents BRL (approximate)
    // Claude Haiku 4.5: $0.80/1M input, $4.00/1M output
    // Claude Sonnet 4.5: $3.00/1M input, $15.00/1M output
    // Using USD 1 ≈ BRL 5.5 for estimation
    const USD_TO_BRL_CENTS = parseInt(process.env.USD_TO_BRL_CENTS ?? '550', 10);

    const rates =
      model.includes('sonnet')
        ? { input: 3.0, output: 15.0 }
        : { input: 0.8, output: 4.0 };

    const inputCostCents = Math.ceil(
      (inputTokens / 1_000_000) * rates.input * USD_TO_BRL_CENTS,
    );
    const outputCostCents = Math.ceil(
      (outputTokens / 1_000_000) * rates.output * USD_TO_BRL_CENTS,
    );

    return Math.max(inputCostCents + outputCostCents, 1);
  }
}

// ---- Singleton ----

let _client: ProntoLLMClient | null = null;

export function getLLMClient(): ProntoLLMClient {
  if (!_client) {
    _client = new ProntoLLMClient();
  }
  return _client;
}

export function resetLLMClient(): void {
  _client = null;
}
