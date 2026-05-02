FROM node:20-alpine AS builder

WORKDIR /app

# Instalar pnpm globalmente
RUN npm install -g pnpm

# Copiar arquivos de dependência do workspace
COPY pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./

# Copiar packages (bibliotecas compartilhadas)
COPY packages ./packages

# Copiar worker app
COPY apps/worker ./apps/worker

# Instalar todas as dependências (incluindo dev para build)
RUN pnpm install --frozen-lockfile

# Build do worker
WORKDIR /app/apps/worker
RUN pnpm run build

# Estágio de produção
FROM node:20-alpine

WORKDIR /app

RUN npm install -g pnpm

COPY pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages ./packages
COPY apps/worker ./apps/worker

RUN pnpm install --frozen-lockfile --prod

WORKDIR /app/apps/worker
COPY --from=builder /app/apps/worker/dist ./dist

# Expor porta (se aplicável)
EXPOSE 3001

# Iniciar worker
CMD ["pnpm", "run", "start"]
