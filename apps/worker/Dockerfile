# ============================================
# STAGE 1: Builder — compile packages + worker
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm

COPY pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY packages ./packages
COPY apps/worker ./apps/worker
COPY prompts ./prompts

RUN pnpm install --frozen-lockfile

# Build shared packages in dependency order
RUN pnpm --filter=@pronto-ia/types run build
RUN pnpm --filter=@pronto-ia/database run build
RUN pnpm --filter=@pronto-ia/events run build
RUN pnpm --filter=@pronto-ia/whatsapp run build
RUN pnpm --filter=@pronto-ia/auth run build
RUN pnpm --filter=@pronto-ia/llm run build

# Build worker (tsc + copyfiles for prompts)
WORKDIR /app/apps/worker
RUN rm -f tsconfig.tsbuildinfo && pnpm run build

# ============================================
# STAGE 2: Production — runtime only
# ============================================
FROM node:20-alpine

WORKDIR /app

RUN npm install -g pnpm

COPY pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./

# Copy package sources (needed for pnpm workspace resolution)
COPY packages ./packages

# Copy compiled package outputs from builder
COPY --from=builder /app/packages/types/dist     ./packages/types/dist
COPY --from=builder /app/packages/database/dist  ./packages/database/dist
COPY --from=builder /app/packages/events/dist    ./packages/events/dist
COPY --from=builder /app/packages/whatsapp/dist  ./packages/whatsapp/dist
COPY --from=builder /app/packages/auth/dist      ./packages/auth/dist
COPY --from=builder /app/packages/llm/dist       ./packages/llm/dist

# Copy worker source + compiled output
COPY apps/worker ./apps/worker
COPY --from=builder /app/apps/worker/dist ./apps/worker/dist

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

WORKDIR /app/apps/worker
CMD ["node", "dist/index.js"]
