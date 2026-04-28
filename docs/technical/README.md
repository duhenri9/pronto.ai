# Pronto.IA — Documentação Técnica

## Visão Geral

O Pronto.IA é uma plataforma de capacitação em IA para MEIs brasileiros, operando via WhatsApp. O usuário envia uma mensagem, recebe treinamento personalizado da mentora IA, e acompanha seu progresso — tudo em português, 5 minutos por dia.

## Arquitetura

```
WhatsApp (Z-API)
       │
       ▼
  Webhook Inbound ─── HMAC Verification
       │
       ▼
  BullMQ Inbound Queue (Redis)
       │
       ▼
  Worker (Anthropic Claude)
       │  ├── Roteamento por vertical (maria/bia/leo/tiao/ze)
       │  ├── Persona carregada de prompts/personas/*.md
       │  └── Avaliador (Sonnet) para qualidade
       │
       ▼
  BullMQ Outbound Queue (Redis)
       │
       ▼
  Z-API Outbound ─── WhatsApp
```

## Stack

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Framework | Next.js (App Router) | 15 |
| Runtime | Node.js | >=20 |
| LLM | Anthropic Claude | Haiku 4.5 (treino), Sonnet 4.5 (avaliação) |
| Filas | BullMQ + Redis | - |
| ORM | Drizzle | - |
| Banco | PostgreSQL (Neon) | - |
| Deploy | Vercel (web) + Railway (worker) | - |
| Monorepo | Turborepo + pnpm | - |
| Tipos | TypeScript strict | 5.7+ |
| Testes | Vitest | - |

## Monorepo

```
pronto-ia/
├── apps/
│   ├── web/          # Next.js — LP, SEO, API routes
│   ├── worker/       # BullMQ worker — inbound/outbound/scheduled
│   ├── api/          # REST API (legacy)
│   └── orchestrator/ # Orquestração de filas
├── packages/
│   ├── types/        # Tipos compartilhados (Vertical, DonationRequest, etc.)
│   ├── database/     # Drizzle schema + migrations
│   ├── llm/          # Anthropic client + prompt loader
│   ├── auth/         # Better Auth
│   ├── events/       # Event bus
│   └── ui/           # Componentes compartilhados
├── prompts/
│   ├── personas/     # maria.md, bia.md, leo.md, tiao.md, ze.md, evaluator.md
│   └── system/       # Prompts de sistema
└── docs/
    ├── adr/          # Architecture Decision Records
    ├── technical/    # Documentação técnica
    ├── business/     # Documentos de negócio
    └── legal/        # Templates legais
```

## Verticais

| Slug | Nome | Persona | Ícone | Accent |
|------|------|---------|-------|--------|
| `salao` | Salão de Beleza & Estética | Bia | Scissors | green |
| `food-service` | Food Service Local | Léo | ChefHat | gold |
| `home-service` | Prestadores de Serviço | Tião | Wrench | night |
| `tech-service` | TI & Tecnologia | Zé | Laptop | blue |

## Fluxo Core

1. **Inbound**: WhatsApp → Z-API webhook → HMAC verify → BullMQ inbound queue
2. **Processamento**: Worker consome fila → carrega persona → Anthropic Haiku 4.5 → Avaliador Sonnet 4.5
3. **Outbound**: Worker → BullMQ outbound queue → Z-API → WhatsApp

## API Endpoints

| Rota | Método | Descrição |
|------|--------|-----------|
| `/api/v1/donate` | POST | Cria doação Pix (placeholder Abacate Pay) |
| `/api/v1/webhook/z-api` | POST | Recebe mensagens WhatsApp |

## Variáveis de Ambiente

```
# Obrigatórias
ANTHROPIC_API_KEY=
REDIS_URL=
DATABASE_URL=
ZAPI_INSTANCE=
ZAPI_TOKEN=
ZAPI_WEBHOOK_TOKEN=

# Opcionais
SENTRY_DSN=
NEXT_PUBLIC_SITE_URL=
```

## Testes

```bash
pnpm test          # Todos os testes
pnpm typecheck     # TypeScript strict
pnpm lint          # ESLint
```

## ADRs

- [ADR-0011: Worker hosting no Railway](../adr/0011-worker-hosting-railway.md)
- [ADR-0012: Pagamento via Abacate Pay + Stripe](../adr/0012-pagamento-abacate-stripe.md)
- [ADR-0013: Migração auth de jose para better-auth](../adr/0013-auth-migration-jose-to-better-auth.md)
