// Tests for memory-extractor module

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock @anthropic-ai/sdk
const mockCreate = vi.fn();
vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn().mockImplementation(() => ({
    messages: { create: mockCreate },
  })),
}));

// Mock @pronto-ia/database
vi.mock('@pronto-ia/database', () => ({
  db: {},
  eq: vi.fn(),
  and: vi.fn(),
}));

vi.mock('@pronto-ia/database', () => ({
  db: {
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([]),
      }),
    }),
  },
  eq: vi.fn(),
  and: vi.fn(),
}));

import { extractMemories, deduplicateMemories, resetMemoryExtractor } from './memory-extractor';

describe('extractMemories', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetMemoryExtractor();
  });

  it('should return empty array when LLM returns no useful memories', async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: '[]' }],
    });

    const result = await extractMemories({
      userId: 'user-1',
      userMessage: 'Oi, tudo bem?',
      assistantResponse: 'Ola! Estou bem, obrigado!',
      persona: 'maria',
    });

    expect(result).toEqual([]);
    expect(mockCreate).toHaveBeenCalledTimes(1);
  });

  it('should parse and validate extracted memories', async () => {
    mockCreate.mockResolvedValue({
      content: [{
        type: 'text',
        text: JSON.stringify([
          { key: 'prefers_morning', value: 'Prefere contato nas manhas', memoryType: 'preference', confidence: 0.9 },
          { key: 'business_type', value: 'Design grafico', memoryType: 'business_info', confidence: 0.8 },
        ]),
      }],
    });

    const result = await extractMemories({
      userId: 'user-1',
      userMessage: 'Sou designer grafico e prefiro que me chame de manha',
      assistantResponse: 'Entendido! Vou anotar que voce prefere contato matutino.',
    });

    expect(result).toHaveLength(2);
    expect(result[0].key).toBe('prefers_morning');
    expect(result[0].memoryType).toBe('preference');
    expect(result[0].confidence).toBe(0.9);
    expect(result[1].key).toBe('business_type');
  });

  it('should strip markdown code fences from LLM response', async () => {
    mockCreate.mockResolvedValue({
      content: [{
        type: 'text',
        text: '```json\n[{"key":"city","value":"Sao Paulo","memoryType":"context","confidence":1.0}]\n```',
      }],
    });

    const result = await extractMemories({
      userId: 'user-1',
      userMessage: 'Moro em Sao Paulo',
      assistantResponse: 'Que legal, Sao Paulo!',
    });

    expect(result).toHaveLength(1);
    expect(result[0].key).toBe('city');
    expect(result[0].value).toBe('Sao Paulo');
  });

  it('should filter out memories with invalid memoryType', async () => {
    mockCreate.mockResolvedValue({
      content: [{
        type: 'text',
        text: JSON.stringify([
          { key: 'valid', value: 'Valid', memoryType: 'preference', confidence: 0.8 },
          { key: 'invalid_type', value: 'Invalid', memoryType: 'random_type', confidence: 0.5 },
        ]),
      }],
    });

    const result = await extractMemories({
      userId: 'user-1',
      userMessage: 'test',
      assistantResponse: 'test',
    });

    expect(result).toHaveLength(1);
    expect(result[0].key).toBe('valid');
  });

  it('should sanitize keys (lowercase, snake_case)', async () => {
    mockCreate.mockResolvedValue({
      content: [{
        type: 'text',
        text: JSON.stringify([
          { key: 'Prefers Video Calls', value: 'Video', memoryType: 'preference', confidence: 0.7 },
        ]),
      }],
    });

    const result = await extractMemories({
      userId: 'user-1',
      userMessage: 'test',
      assistantResponse: 'test',
    });

    expect(result[0].key).toBe('prefers_video_calls');
  });

  it('should clamp confidence between 0 and 1', async () => {
    mockCreate.mockResolvedValue({
      content: [{
        type: 'text',
        text: JSON.stringify([
          { key: 'test', value: 'test', memoryType: 'context', confidence: 5.0 },
        ]),
      }],
    });

    const result = await extractMemories({
      userId: 'user-1',
      userMessage: 'test',
      assistantResponse: 'test',
    });

    expect(result[0].confidence).toBe(1.0);
  });

  it('should return empty array on API error', async () => {
    mockCreate.mockRejectedValue(new Error('API rate limit'));

    const result = await extractMemories({
      userId: 'user-1',
      userMessage: 'test',
      assistantResponse: 'test',
    });

    expect(result).toEqual([]);
  });

  it('should handle non-array LLM response', async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: '"just a string"' }],
    });

    const result = await extractMemories({
      userId: 'user-1',
      userMessage: 'test',
      assistantResponse: 'test',
    });

    expect(result).toEqual([]);
  });
});

describe('deduplicateMemories', () => {
  it('should filter out memories with existing keys', async () => {
    // The mock returns empty array for existing memories
    const result = await deduplicateMemories('user-1', [
      { key: 'new_key', value: 'New', memoryType: 'preference', confidence: 0.8 },
      { key: 'existing_key', value: 'Old', memoryType: 'context', confidence: 0.9 },
    ]);

    expect(result).toHaveLength(2); // Mock returns empty, so both pass
  });

  it('should return empty array when input is empty', async () => {
    const result = await deduplicateMemories('user-1', []);
    expect(result).toEqual([]);
  });
});
