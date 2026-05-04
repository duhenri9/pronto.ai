# Prompt Persona Notes

This document records why the main personas were adjusted before live conversational testing,
what was changed, and what to watch during validation.

## Why These Adjustments Were Made

The prompts were already directionally strong, especially Maria. The main risk was no longer
"missing persona", but inconsistency at runtime:

- too many rules competing inside a single prompt
- uneven operational maturity across specialists
- weak handling of human edge cases like confusion, insecurity, irritation, and low digital literacy
- inconsistent handoff and handback discipline
- risk of generic answers in vertical specialists without enough subvertical nuance
- evaluator drift outside strict JSON output

The changes were intended to improve production behavior, not to redesign the personalities.

## Maria

File:

- [prompts/personas/maria.md](/Users/edu/Desktop/Pronto.IA/pronto.ia/prompts/personas/maria.md:1)

Why adjust:

- Maria is the operational center of the system
- she already had strong identity and business rules
- the remaining gap was edge-case behavior under stress or ambiguity

What changed:

- added explicit rules for confusion, irritation, and lack of context
- clarified decision priority: honesty > clarity > utility > warmth > speed
- added edge-case examples
- reinforced a mental order for response generation before handoff or offer logic
- added "when not to offer Pro" situations
- reinforced that emotional alignment comes before conversion logic
- reorganized the prompt into clearer sections:
  - priority
  - honesty
  - style
  - operation
  - edge cases
  - offer logic
  - handoff logic

Expected gain:

- less brittle tone under messy real user inputs
- less chance of over-answering or jumping to offer logic too early
- less risk of sounding scripted when the user is frustrated or lost
- lower internal prompt conflict from mixed instruction types

## Bia

File:

- [prompts/personas/bia.md](/Users/edu/Desktop/Pronto.IA/pronto.ia/prompts/personas/bia.md:1)

Why adjust:

- Bia was already strong structurally
- the gap was emotional nuance for users who freeze, feel embarrassed, or avoid showing themselves

What changed:

- added rules for insecurity, shame, and low confidence
- reinforced that Bia is practical, not influencer-like
- added examples for low-friction alternatives such as no-face content
- added response-shape preferences for practical delivery
- reinforced single-adjustment feedback behavior

Expected gain:

- better conversion from advice into action
- less drop-off from users who feel exposed or "not good enough"
- less chance of Bia sounding aspirational instead of useful

## Zé da TI

File:

- [prompts/personas/ze-da-ti.md](/Users/edu/Desktop/Pronto.IA/pronto.ia/prompts/personas/ze-da-ti.md:1)

Why adjust:

- Zé had good scope and tone
- the missing piece was more explicit handling of fear, frustration, and low technical confidence

What changed:

- added rules for step safety and fear of "clicking the wrong thing"
- clarified that Zé is a practical technical guide, not a classroom instructor
- added examples for cautious, one-step-at-a-time support
- added preferred response formats for low-literacy navigation help
- reinforced screenshot/text-on-screen driven support instead of guessing

Expected gain:

- better support for digitally insecure users
- more practical movement and less tutorial-like abstraction
- lower chance of overwhelming the user with too many instructions at once

## Léo

File:

- [prompts/personas/leo.md](/Users/edu/Desktop/Pronto.IA/pronto.ia/prompts/personas/leo.md:1)

Why adjust:

- Léo had good domain identity but was less mature operationally than Maria, Bia, and Zé
- high risk of generic food-service answers across very different business models

What changed:

- added Maria relationship and handback discipline
- added WhatsApp-style response constraints
- added explicit subvertical awareness:
  - marmita
  - bolos/doces
  - hamburgueria/lanchonete
  - delivery sem salão
  - restaurante pequeno
- added more practical examples
- added common human cases such as fear of price increases
- reinforced non-gourmet, neighborhood-business positioning

Expected gain:

- less generic advice
- better fit between answer and actual business model
- stronger specialist consistency
- better usefulness for micro-operators with messy real numbers

## Tião

File:

- [prompts/personas/tiao.md](/Users/edu/Desktop/Pronto.IA/pronto.ia/prompts/personas/tiao.md:1)

Why adjust:

- Tião had the right identity but lacked the same specialist discipline as the more mature prompts
- service businesses vary a lot by subvertical and pricing structure

What changed:

- added Maria relationship and handback discipline
- added WhatsApp-style constraints
- added explicit subvertical awareness:
  - eletricista
  - encanador
  - instalador
  - manutenção geral
  - ar-condicionado
  - marido de aluguel / montador
- added examples showing why pricing logic changes by service type
- added common human cases like "cliente achou caro" and informal quoting
- reinforced practical budget structure over abstract advice

Expected gain:

- better pricing realism
- less generic "prestador" advice
- stronger applicability to real field work
- lower chance of fake-confidence answers in the wrong subvertical

## Evaluator

File:

- [prompts/personas/evaluator.md](/Users/edu/Desktop/Pronto.IA/pronto.ia/prompts/personas/evaluator.md:1)

Why adjust:

- evaluator prompts often fail in boring but expensive ways:
  - malformed JSON
  - invented certainty
  - fake completion judgments from weak submissions

What changed:

- made ambiguity handling explicit
- required `completed=false` when the submission cannot be responsibly evaluated
- reinforced strict JSON-only output
- added a concrete schema reminder
- added score band guidance
- added output-shape limits for strengths, improvements, and feedback

Expected gain:

- safer automation
- lower risk of invalid structured output
- better downstream feedback quality
- less evaluator drift under poor or incomplete submissions

## What To Watch In Testing

During live testing, pay attention to:

- whether Maria stays concise under emotional or messy user inputs
- whether Bia helps insecure users act instead of just "feeling inspired"
- whether Zé remains practical and non-technical
- whether Léo adapts by food subvertical
- whether Tião adapts by service subvertical
- whether handoffs feel natural and not robotic
- whether evaluator output stays valid JSON in every case
- whether any persona starts sounding over-instructed or overly constrained
- whether the dynamic context supplied by the system is strong enough to unlock the prompt quality

## Remaining Non-Prompt Risks

The following risks still remain even after prompt hardening:

- weak or incomplete dynamic context injection
- poor handoff orchestration between Maria and specialists
- missing runtime validation for evaluator JSON
- inadequate memory retrieval quality
- business-rule drift between prompt text and actual application logic

These are not primarily prompt problems anymore. They belong to orchestration, validation, and product runtime.

## Final Intent

These prompt changes were not about making the personas louder or more complex.
They were about making them more stable, more useful, and more trustworthy under real-world user behavior.
