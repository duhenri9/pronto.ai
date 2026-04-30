// ============================================
// PRONTO.IA — Intent Router
// ============================================
// Classifies inbound messages by intent using:
// 1. Regex patterns (fast, free, ~75% coverage)
// 2. Gemini Flash (for ambiguous messages, ~25%)
// 3. Fallback: 'question_general' handled by Haiku 4.5
//
// Canonical categories defined in prompts/router/intent-classifier.md

// ---- Intent Types ----

export type Intent =
  | 'greeting'
  | 'question_general'
  | 'question_vertical'
  | 'question_fundacao_digital'
  | 'command_admin'
  | 'command_lgpd_delete'
  | 'outcome_report'
  | 'pro_offer_response'
  | 'cancellation_request'
  | 'payment_response'
  | 'reactivation_request'
  | 'unclear'
  // Legacy aliases kept for backwards compat
  | 'pro_offer_accepted'
  | 'pro_offer_declined'
  | 'exercise_submitted'
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

  // Cancellation request
  {
    intent: 'cancellation_request',
    pattern: /(quero\s+)?cancelar(\s+o\s+pro|\s+plano|\s+assinatura)?/i,
  },
  {
    intent: 'cancellation_request',
    pattern: /cancela\s+(tudo|o\s+pro)/i,
  },

  // Payment response
  {
    intent: 'payment_response',
    pattern: /(já\s+paguei|fiz\s+o\s+pagamento|comprovante|pagamento\s+confirmado|vou\s+pagar)/i,
  },

  // Exercise submitted
  {
    intent: 'exercise_submitted',
    pattern: /(aqui\s+está|fiz\s+o\s+exerc|resposta\s+do\s+exerc|consegui\s+fazer|minha\s+resposta)/i,
  },

  // Outcome report
  {
    intent: 'outcome_report',
    pattern: /(resultado|consegui|aumentei|melhorei|cresceu|faturei|receita|lucro|dei\s+certo|fechei\s+venda)/i,
  },

  // Vertical questions
  {
    intent: 'question_vertical',
    pattern: /(salão|cabeleireiro|manicure|estética|restaurante|lanchonete|food|conserto|reparo)/i,
  },

  // Fundação digital questions → Zé da TI specialist
  {
    intent: 'question_fundacao_digital',
    pattern: /(google\s+meu\s+negócio|google\s+meu\s+negocio|gmb|perfil\s+google)/i,
  },
  {
    intent: 'question_fundacao_digital',
    pattern: /(whatsapp\s+business|whats\s+business|zap\s+business)/i,
  },
  {
    intent: 'question_fundacao_digital',
    pattern: /(avaliação|avaliacao|review|reviews|estrela|estrelas|nota\s+no\s+google)/i,
  },
  {
    intent: 'question_fundacao_digital',
    pattern: /(bio\s*\.?\s*site|link\s+na\s+bio|linktree|página\s+de\s+link)/i,
  },
  {
    intent: 'question_fundacao_digital',
    pattern: /(foto\s+profissional|foto\s+de\s+perfil|imagem\s+do\s+negócio)/i,
  },
  {
    intent: 'question_fundacao_digital',
    pattern: /(segurança\s+digital|senha\s+segura|golpe|phishing|autenticação\s+dupla|2fa|verificação\s+em\s+dois)/i,
  },
  {
    intent: 'question_fundacao_digital',
    pattern: /(fundação\s+digital|presença\s+digital|meu\s+negócio\s+online|como\s+aparecer\s+no\s+google)/i,
  },

  // Pro offer accepted
  {
    intent: 'pro_offer_response',
    pattern: /^(sim|quero|bora|pode\s+ser|com\s+certeza|claro|fechou|vamos\s+nisso)[\s!.,]*$/i,
  },
  {
    intent: 'pro_offer_response',
    pattern: /(quero\s+conhecer|quero\s+o\s+pro|assin|pagar)/i,
  },

  // Pro offer declined
  {
    intent: 'pro_offer_declined',
    pattern: /^(não|nao|depois|agora\s+não|nao\s+agora|talvez\s+depois|obrigad[oa])[\s!.,]*$/i,
  },

  // Pro reactivation (cancelled user wants back)
  {
    intent: 'reactivation_request',
    pattern: /(quero\s+voltar\s+pro|reativar|assinar\s+de\s+novo|quero\s+a\s+bia\s+de\s+volta|voltar\s+pro\s+pro|quero\s+o\s+pro\s+de\s+novo)/i,
  },
  {
    intent: 'reactivation_request',
    pattern: /(quero\s+voltar|voltar\s+pra\s+bia|quero\s+a\s+bia|assinar\s+novamente)/i,
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

// ---- Canonical intent list for Gemini ----

const CANONICAL_INTENTS = [
  'greeting',
  'question_general',
  'question_vertical',
  'question_fundacao_digital',
  'command_admin',
  'command_lgpd_delete',
  'outcome_report',
  'pro_offer_response',
  'cancellation_request',
  'payment_response',
  'reactivation_request',
  'unclear',
] as const;

// ---- Gemini Flash Classifier ----

async function geminiClassify(message: string, lifecycleState?: string): Promise<IntentResult> {
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
    const intentList = CANONICAL_INTENTS.join(', ');
    const stateInfo = lifecycleState ? `\nEstado do usuário: ${lifecycleState}` : '';

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Classifique a intenção desta mensagem de WhatsApp de um MEI brasileiro. Responda APENAS com um dos seguintes intents: ${intentList}

Mensagem: "${message}"${stateInfo}

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

    // Match against canonical intents + legacy aliases
    const allValidIntents: Intent[] = [
      ...CANONICAL_INTENTS,
      'pro_offer_accepted', 'pro_offer_declined', 'exercise_submitted', 'chat',
    ];

    const matched = allValidIntents.find((i) => text.includes(i));

    // Map pro_offer_response subtypes
    let finalIntent: Intent = matched ?? 'unclear';
    if (finalIntent === 'pro_offer_accepted') finalIntent = 'pro_offer_response';

    return {
      intent: finalIntent,
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
  const geminiResult = await geminiClassify(message, lifecycleState);
  if (geminiResult.confidence !== 'low') return geminiResult;

  // 3. Fallback: unclear
  return {
    intent: 'unclear',
    confidence: 'low',
    source: 'fallback',
  };
}
