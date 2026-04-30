---
version: 1.1.0
purpose: intent_classifier
language: pt-BR
default_model: gemini-2.0-flash-exp
---

# TAREFA

Classifique a mensagem do usuário em UMA das categorias abaixo. Responda APENAS com o nome da categoria, sem explicação, sem pontuação.

# CATEGORIAS

- `greeting`: saudação ("oi", "bom dia", "e aí")
- `question_general`: pergunta geral sobre IA, sobre o produto, sobre como funciona
- `question_vertical`: pergunta específica sobre o negócio (salão, food, conserto)
- `question_fundacao_digital`: pergunta sobre presença digital, Google Meu Negócio, WhatsApp Business, avaliações/reviews, segurança digital, foto profissional, bio.site ("como aparecer no Google", "WhatsApp Business", "quero reviews", "golpe no WhatsApp")
- `command_admin`: comando começando com # (#progresso, #certificado, #ajuda)
- `command_lgpd_delete`: pedido de apagar conta ("apaga tudo", "deletar dados")
- `outcome_report`: relato de resultado positivo ("deu certo", "fechei venda", "ganhei R$ X")
- `pro_offer_response`: resposta a uma oferta de Pro (sim/não/talvez)
- `cancellation_request`: pedido pra cancelar Pro
- `payment_response`: resposta sobre pagamento (já paguei, vou pagar, etc)
- `reactivation_request`: ex-assinante quer voltar ao Pro ("quero voltar", "reativar", "assinar de novo", "quero a Bia")
- `unclear`: não dá pra classificar com segurança

# REGRAS

1. Se a mensagem tem múltiplas categorias possíveis, escolha a mais específica.
2. Se a mensagem é curtíssima ("ok", "tá"), classifique como `unclear` (vai cair no fallback).
3. Não tente "ler" intenção que não está clara no texto.
4. `question_fundacao_digital` tem prioridade sobre `question_general` quando o tema é presença digital do negócio.

# EXEMPLOS

"oi" → greeting
"como funciona isso?" → question_general
"meu salão tá vazio, o que fazer?" → question_vertical
"como colocar meu negócio no Google?" → question_fundacao_digital
"WhatsApp Business vale a pena?" → question_fundacao_digital
"recebi uma mensagem estranha, é golpe?" → question_fundacao_digital
"quero mais avaliações no Google" → question_fundacao_digital
"#progresso" → command_admin
"apaga tudo" → command_lgpd_delete
"fiz o post e deu 8 likes" → outcome_report
"sim, quero o Pro" → pro_offer_response
"não obrigada" → pro_offer_response
"quero cancelar" → cancellation_request
"já paguei" → payment_response
"quero voltar pro Pro" → reactivation_request
"ok" → unclear

---DYNAMIC---

# MENSAGEM
{{user_message}}

# ESTADO DO USUÁRIO
{{lifecycle_state}}

# INSTRUÇÃO

Classifique a mensagem. Responda APENAS com a categoria.
