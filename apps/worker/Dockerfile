# ============================================
# STAGE 1: Builder - Compilar TypeScript
# ============================================
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

# Instalar TODAS as dependências (incluindo devDependencies para build)
RUN pnpm install --frozen-lockfile

# Build do worker (precisa de tsc, que está em devDependencies)
WORKDIR /app/apps/worker
RUN pnpm run build

# ============================================
# STAGE 2: Production - Runtime
# ============================================
FROM node:20-alpine

WORKDIR /app

# Instalar pnpm globalmente
RUN npm install -g pnpm

# Copiar arquivos de dependência do workspace
COPY pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./

# Copiar packages (bibliotecas compartilhadas)
COPY packages ./packages

# Copiar worker app (apenas os arquivos necessários)
COPY apps/worker ./apps/worker

# Copiar o código compilado da stage builder
COPY --from=builder /app/apps/worker/dist ./apps/worker/dist

# Instalar dependências (apenas produção)
RUN pnpm install --frozen-lockfile --prod

# Expor porta (se aplicável)
EXPOSE 3001

# Iniciar worker com o código compilado
WORKDIR /app/apps/worker
CMD ["pnpm", "run", "start"]
