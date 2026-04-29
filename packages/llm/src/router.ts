// ============================================
// PRONTO.IA — Intent Router
// ============================================
// Classifies inbound messages by intent using:
// 1. Regex patterns (fast, free, ~75% coverage)
// 2. Gemini Flash (for ambiguous messages, ~25%)
// 3. Fallback: 'question_general' handled by Haiku 4.5

// ---- Intent Types ----

export type Intent =
  | 'command_lgpd_delete'
  | 'greeting'
  | 'command_admin'
  | 'exercise_submitted'
  | 'outcome_report'
  | 'pro_offer_accepted'
  | 'pro_offer_declined'
  | 'question_general'
  | 'chat';

export interface IntentResult {
  intent: Intent;
  confidence: 'high' | 'medium' | 'low';
  source: 'regex' | 'gemini' | 'fallback';
}

// ---- Regex Patterns ----

interface PatternRule {
  intent: Intent;
  pattern: RegExp;
}

const PATTERNS: PatternRule[] = [
  // LGPD deletion
  {
    intent: 'command_lgpd_delete',
    pattern: /\/(apaga|exclui|deleta|esquece)\s+(tudo|meus?\s+dados|minha\s+conta)/i,
  },
  {
    intent: 'command_lgpd_delete',
    pattern: /(quero\s+)?(apagar|excluir|deletar)\s+(tudo|meus?\s+dados|minha\s+conta)/i,
  },
  {
    intent: 'command_lgpd_delete',
    pattern: /\/esquecer\s+tudo/i,
  },
  {
    intent: 'command_lgpd_delete',
    pattern: /lgpd|lei\s+geral\s+de\s+proteção/i,
  },

  // Greeting
  {
    intent: 'greeting',
    pattern: /^(oi|olá|ola|bom\s+dia|boa\s+tarde|boa\s+noite|eai|e\s+ai|fala|salve|opa|alô|alo)[\s\W]*$/i,
  },
  {
    intent: 'greeting',
    pattern: /^(oi|olá|ola|bom\s+dia|boa\s+tarde|boa\s+noite)[!.,\s]*$/i,
  },

  // Admin commands
  {
    intent: 'command_admin',
    pattern: /^#(progresso|certificado|conta|ajuda|menu|parar)/i,
  },
  {
    intent: 'command_admin',
    pattern: /^\/(progresso|certificado|conta|ajuda|menu|parar)/i,
  },

  // Exercise submitted
  {
    intent: 'exercise_submitted',
    pattern: /(aqui\s+está|fiz\s+o\s+exerc|resposta\s+do\s+exerc|consegui\s+fazer|minha\s+resposta)/i,
  },

  // Outcome report
  {
    intent: 'outcome_report',
    pattern: /(resultado|consegui|aumentei|melhorei|cresceu|faturei|receita|lucro)/i,
  },

  // Pro offer accepted
  {
    intent: 'pro_offer_accepted',
    pattern: /^(sim|quero|bora|pode\s+ser|com\s+certeza|claro|fechou|vamos\s+nisso)[\s!.,]*$/i,
  },
  {
    intent: 'pro_offer_accepted',
    pattern: /(quero\s+conhecer|quero\s+o\s+pro|assin|pagar)/i,
  },

  // Pro offer declined
  {
    intent: 'pro_offer_declined',
    pattern: /^(não|nao|depois|agora\s+não|nao\s+agora|talvez\s+depois|obrigad[oa])[\s!.,]*$/i,
  },
];

// ---- Lifecycle states that skip intent classification ----

const SKIP_CLASSIFICATION_STATES = new Set([
  'onboarding',
  'pro_offer_pending',
  'awaiting_lgpd_confirmation',
]);

// ---- Regex Classifier ----

export function tryRegexClassify(message: string): IntentResult | null {
  const trimmed = message.trim();

  for (const rule of PATTERNS) {
    if (rule.pattern.test(trimmed)) {
      return {
        intent: rule.intent,
        confidence: 'high',
        source: 'regex',
      };
    }
  }

  return null;
}

// ---- Gemini Flash Classifier ----

async function geminiClassify(message: string): Promise<IntentResult> {
  const apiKey = process.env.GOOGLE_AI_API_KEY;

  if (!apiKey) {
    // No Gemini key — fall through to general
    return {
      intent: 'question_general',
      confidence: 'low',
      source: 'fallback',
    };
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Classifique a intenção desta mensagem de WhatsApp de um MEI brasileiro. Responda APENAS com um dos seguintes intents: command_lgpd_delete, greeting, command_admin, exercise_submitted, outcome_report, pro_offer_accepted, pro_offer_declined, question_general, chat

Mensagem: "${message}"

Intent:`,
            }],
          }],
          generationConfig: {
            maxOutputTokens: 10,
            temperature: 0,
          },
        }),
      },
    );

    if (!response.ok) {
      return { intent: 'question_general', confidence: 'low', source: 'fallback' };
    }

    const data: any = await response.json();
    const text: string = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';

    const validIntents: Intent[] = [
      'command_lgpd_delete', 'greeting', 'command_admin', 'exercise_submitted',
      'outcome_report', 'pro_offer_accepted', 'pro_offer_declined',
      'question_general', 'chat',
    ];

    const matched = validIntents.find((i) => text.includes(i));

    return {
      intent: matched ?? 'question_general',
      confidence: matched ? 'medium' : 'low',
      source: 'gemini',
    };
  } catch {
    return { intent: 'question_general', confidence: 'low', source: 'fallback' };
  }
}

// ---- Main Router ----

export async function classifyIntent(
  message: string,
  lifecycleState?: string,
): Promise<IntentResult> {
  // Skip classification for certain lifecycle states
  if (lifecycleState && SKIP_CLASSIFICATION_STATES.has(lifecycleState)) {
    return {
      intent: 'chat',
      confidence: 'high',
      source: 'fallback',
    };
  }

  // 1. Try regex first (fast, free)
  const regexResult = tryRegexClassify(message);
  if (regexResult) return regexResult;

  // 2. Try Gemini Flash for ambiguous messages
  const geminiResult = await geminiClassify(message);
  if (geminiResult.confidence !== 'low') return geminiResult;

  // 3. Fallback: question_general (handled by Haiku 4.5)
  return {
    intent: 'question_general',
    confidence: 'low',
    source: 'fallback',
  };
}
