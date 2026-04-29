# Pronto.IA — Produto Mestre

**Versão:** 2.0 (Sprint 1+2 completo)
**Fonte de verdade:** Este documento é a referência canônica. Quando algo mudar, muda primeiro aqui, depois no código.

---

## Parte 2 — Prompts operacionais

### 2.2 Prompt Maria — base + contextos dinâmicos

Arquivo: `prompts/personas/maria.md`
Modelo padrão: Haiku 4.5 | Escalação: Sonnet 4.5

**Vocabulário APROVADO:** bora, tá bom, manda ver, beleza, faz tempo, que orgulho, tá ligado, calma aí, vamo nessa, mandou bem, que isso, claro que sim, sem problema, tô aqui, caraca, pode crer, conta tudo, sumida, a gente, né?, aaah, tô passando rapidinho, olha só, demais, conseguiu!, faz parte, acontece, é simples.

**Vocabulário PROIBIDO:** parabéns!, incrível!, fantástico!, vamos lá!, jornada, experiência, plataforma, usuário, user, cliente (para falar do usuário), aluno, engagement, content, implementar, otimizar, maximizar, potencializar, cordialmente, prezada, conforme acordado, aproveite, não perca, acesse já, imperdível, exclusivo, premium, nível mestre, XP. **"Meu bem" PROIBIDO** — soa idoso/regional demais. Maria é prima jovem, não tia.

**Emojis aprovados (1 por mensagem):** 😊 👏 💚 ✨
**Emojis proibidos:** 🚀 🔥 😂🤣 🙏 💰💵 + qualquer emoji em erro/dor/consolo

**Handoff tag:** `<handoff persona="bia">contexto resumido</handoff>`
**Handback tag (Bia):** `<handback>resumo do que foi feito</handback>`

### 2.3 Prompt Bia

Arquivo: `prompts/personas/bia.md`
Modelo padrão: Haiku 4.5 | required_subscription: active_pro
Vertical: salão

**Vocabulário aprovado:** bora, manda ver, tá bombando, arrasou, tá lindo, vai dar certo, manja, sacou, tipo, tipo assim, é o seguinte, olha só, dica, segue o fio.
**Vocabulário proibido:** Mesmo léxico da Maria + "fofa", "querida", "linda" como vocativo.

### 2.4 Prompt Evaluator

Arquivo: `prompts/personas/evaluator.md`
Modelo: Sonnet 4.5 (sempre — avaliação técnica)
Saída: JSON com completed, score, strengths, improvements, feedback_for_persona

### 2.5 Intent Classifier

Arquivo: `prompts/router/intent-classifier.md`
Modelo: Gemini 2.0 Flash
10 categorias: greeting, question_general, question_vertical, command_admin, command_lgpd_delete, outcome_report, pro_offer_response, cancellation_request, payment_response, unclear

---

## Parte 3 — Templates de mensagem por gatilho

Códigos canônicos em `apps/worker/src/flows/templates.ts`.
Maria pode parafrasear, mas não pode mudar significado, tom ou estrutura.

### 3.1 Onboarding (OB-01 a OB-11)
### 3.2 Camada gratuita (FREE-01 a FREE-05)
### 3.3 Oferta Pro (PRO-01 a PRO-05)
### 3.4 Pagamento Abacate (PAY-01 a PAY-08)
### 3.5 Renovação (REN-01 a REN-05)
### 3.6 Cancelamento (CAN-01 a CAN-04)
### 3.7 LGPD (LGPD-01 a LGPD-03)
### 3.8 Outcome (OUT-01 a OUT-04)

*(Textos completos em `apps/worker/src/flows/templates.ts`)*

---

## Anexo A — Glossário de variáveis

| Variável | Tipo | Origem | Default se null |
|---|---|---|---|
| `{{display_name}}` ou `{name}` | string | `users.display_name` | "amiga" |
| `{{preferred_name}}` | string | `users.preferred_name` | display_name |
| `{{vertical}}` | string | `users.vertical` | "outro" |
| `{{business_context}}` | jsonb | `users.business_context` | {} |
| `{{lifecycle_state}}` | enum | `users.lifecycle_state` | "provisional" |
| `{{pending_action}}` | enum | `users.pending_action` | null |
| `{{preferred_contact_window}}` | string | `users.preferred_contact_window` | null |
| `{{last_active_at}}` | timestamp | `users.last_active_at` | created_at |
| `{{subscription_active}}` | boolean | derivado de `subscriptions` | false |
| `{{subscription_expires_at}}` | timestamp | `subscriptions.current_period_end` | null |
| `{{current_track}}` | string | `user_track_progress.track_id` | null |
| `{{current_lesson_position}}` | int | `user_track_progress.current_lesson_position` | null |
| `{{relevant_memories}}` | text | `user_memory` (top 5) | "" |
| `{{conversation_history}}` | text | últimas 20 messages | "" |
| `{{handoff_context}}` | text | passado pela Maria via tag handoff | "" |

## Anexo B — Mapa intent → prompt → modelo

| Intent | Prompt | Modelo | Justificativa |
|---|---|---|---|
| `greeting` | maria.md | Haiku 4.5 | Resposta simples, baixo risco |
| `question_general` | maria.md | Haiku 4.5 | Pergunta sobre produto/IA |
| `question_vertical` | maria.md | Haiku 4.5 | Maria responde, oferece Pro se elegível |
| `command_admin` | maria.md | Haiku 4.5 | Comando determinístico |
| `command_lgpd_delete` | maria.md | **Sonnet 4.5** | Irreversível, exige nuance |
| `outcome_report` | maria.md | Haiku 4.5 | Celebração + registro |
| `pro_offer_response` | maria.md | **Sonnet 4.5** | Decisão de receita |
| `cancellation_request` | maria.md | **Sonnet 4.5** | Retenção sem ser invasiva |
| `payment_response` | maria.md | **Sonnet 4.5** | Crítico não confundir |
| `exercise_submitted` | bia.md + evaluator.md | **Sonnet 4.5** | Avaliação técnica |
| `onboarding` | maria.md | **Sonnet 4.5** | Cada palavra conta |
| `unclear` | maria.md | Haiku 4.5 | Fallback seguro |

Implementação: `packages/llm/src/model-mapper.ts`

## Anexo C — Critérios de oferta Pro como código

7 critérios obrigatórios (TODOS devem bater):
1. Estado correto (não Pro, não onboarding/LGPD)
2. 7+ dias desde criação
3. 3+ perguntas verticais nos últimos 14 dias
4. 1+ outcome positivo
5. Não oferecido nos últimos 30 dias
6. Sem pending_action conflitante
7. Sem bloqueio temporário

Implementação: `apps/worker/src/flows/pro-eligibility.ts`
