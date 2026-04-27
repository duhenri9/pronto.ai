# Pronto.IA

Plataforma Nacional de Treinamento em IA para MEIs brasileiros.

## Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Copy environment config
cp .env.example .env

# 3. Start PostgreSQL
docker compose -f docker-compose.dev.yml up -d

# 4. Generate Prisma client & run migrations
pnpm --filter @pronto-ia/database db:generate
pnpm --filter @pronto-ia/database db:migrate

# 5. Start dev servers
pnpm dev
```

## Architecture

- **WhatsApp-first**: Maria (AI mentor) delivers microlições via WhatsApp
- **Web**: Dashboard, certificates, progress tracking (repository, not entry point)
- **3 pilot verticals**: Salão, Food Service, Prestadores de Serviço

## Stack

- Fastify v5 + Prisma + PostgreSQL 16
- React 18 + Vite + Tailwind CSS
- OpenRouter (GLM-4.7-Flash / DeepSeek-Chat / Claude 3.5 Haiku)
- WhatsApp Business API / Z-API
