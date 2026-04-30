// ============================================
// PRONTO.IA — LLM Package Entry
// ============================================

export { ProntoLLMClient, getLLMClient, resetLLMClient, setLLMKillSwitch, getLLMKillSwitchStatus, type LLMCallOptions, type LLMCallResult, type ChatMessage } from './client';
export { loadPrompt, clearPromptCache, listAvailablePersonas, type LoadedPrompt, type PromptMeta, type UserContext } from './prompts';
export { validateInput, validateOutput, sanitizeUserMessage, type GuardrailResult } from './guardrails';
export { classifyIntent, tryRegexClassify, type Intent, type IntentResult } from './router';
export { getModelForIntent, shouldEscalate } from './model-mapper';
export { canAccessSpecialist, type Specialist } from './access';
