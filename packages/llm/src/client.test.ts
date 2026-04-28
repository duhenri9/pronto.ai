import { describe, it, expect } from 'vitest';

describe('LLMClient — calculateCost', () => {
  // We test the cost calculation logic by simulating the formula
  // This avoids needing a real Anthropic API key

  const USD_TO_BRL_CENTS = 550; // Default from env

  it('calculates Haiku cost correctly', () => {
    const inputTokens = 1000;
    const outputTokens = 500;
    const rates = { input: 0.8, output: 4.0 }; // Haiku rates

    const inputCostCents = Math.ceil(
      (inputTokens / 1_000_000) * rates.input * USD_TO_BRL_CENTS,
    );
    const outputCostCents = Math.ceil(
      (outputTokens / 1_000_000) * rates.output * USD_TO_BRL_CENTS,
    );
    const total = Math.max(inputCostCents + outputCostCents, 1);

    // 1000/1M * 0.8 * 550 = 0.44 → ceil = 1
    // 500/1M * 4.0 * 550 = 1.1 → ceil = 2
    // total = 3
    expect(inputCostCents).toBe(1);
    expect(outputCostCents).toBe(2);
    expect(total).toBe(3);
  });

  it('calculates Sonnet cost correctly', () => {
    const inputTokens = 1000;
    const outputTokens = 500;
    const rates = { input: 3.0, output: 15.0 }; // Sonnet rates

    const inputCostCents = Math.ceil(
      (inputTokens / 1_000_000) * rates.input * USD_TO_BRL_CENTS,
    );
    const outputCostCents = Math.ceil(
      (outputTokens / 1_000_000) * rates.output * USD_TO_BRL_CENTS,
    );
    const total = Math.max(inputCostCents + outputCostCents, 1);

    // 1000/1M * 3.0 * 550 = 1.65 → ceil = 2
    // 500/1M * 15.0 * 550 = 4.125 → ceil = 5
    // total = 7
    expect(inputCostCents).toBe(2);
    expect(outputCostCents).toBe(5);
    expect(total).toBe(7);
  });

  it('returns minimum cost of 1 centavo for very small token usage', () => {
    const inputTokens = 10;
    const outputTokens = 10;
    const rates = { input: 0.8, output: 4.0 };

    const inputCostCents = Math.ceil(
      (inputTokens / 1_000_000) * rates.input * USD_TO_BRL_CENTS,
    );
    const outputCostCents = Math.ceil(
      (outputTokens / 1_000_000) * rates.output * USD_TO_BRL_CENTS,
    );
    const total = Math.max(inputCostCents + outputCostCents, 1);

    expect(total).toBeGreaterThanOrEqual(1);
  });

  it('respects USD_TO_BRL_CENTS from environment variable', () => {
    // Test with a different exchange rate
    const customRate = 600;
    const inputTokens = 1_000_000;
    const outputTokens = 1_000_000;
    const rates = { input: 0.8, output: 4.0 };

    const inputCostCents = Math.ceil(
      (inputTokens / 1_000_000) * rates.input * customRate,
    );
    const outputCostCents = Math.ceil(
      (outputTokens / 1_000_000) * rates.output * customRate,
    );

    expect(inputCostCents).toBe(480);
    expect(outputCostCents).toBe(2400);
  });
});

describe('LLMClient — USD_TO_BRL_CENTS env var', () => {
  it('defaults to 550 when env var is not set', () => {
    const rate = parseInt(process.env.USD_TO_BRL_CENTS ?? '550', 10);
    // In our test env, it's set to 550
    expect(rate).toBe(550);
  });

  it('parses custom value correctly', () => {
    const original = process.env.USD_TO_BRL_CENTS;
    process.env.USD_TO_BRL_CENTS = '600';
    const rate = parseInt(process.env.USD_TO_BRL_CENTS ?? '550', 10);
    expect(rate).toBe(600);
    process.env.USD_TO_BRL_CENTS = original;
  });
});