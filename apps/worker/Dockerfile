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

# Limpar cache de build anterior (tsbuildinfo) para force rebuild
WORKDIR /app/apps/worker
RUN pnpm run clean && rm -f tsconfig.tsbuildinfo

# Build do worker (precisa de tsc, que está em devDependencies)
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

# Instalar dependências (apenas produção)
RUN pnpm install --frozen-lockfile --prod

# Definir diretório de trabalho do worker antes de copiar o dist
WORKDIR /app/apps/worker

# Copiar o código compilado da stage builder para o local correto
COPY --from=builder /app/apps/worker/dist ./dist

# Expor porta (se aplicável)
EXPOSE 3001

# Iniciar worker com o código compilado
CMD ["pnpm", "run", "start"]
