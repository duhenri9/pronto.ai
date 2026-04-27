import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import rateLimit from '@fastify/rate-limit';
import { PrismaClient } from '@pronto-ia/database';

import { healthRoutes } from './routes/health/index.js';
import { authRoutes } from './routes/auth/index.js';
import { trilhaRoutes } from './routes/trilhas/index.js';

const PORT = parseInt(process.env.PORT || '3001', 10);
const HOST = process.env.HOST || '0.0.0.0';

const prisma = new PrismaClient();

async function main() {
  const fastify = Fastify({ logger: true });

  // Plugins
  await fastify.register(helmet, { global: true });
  await fastify.register(cors, {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  });
  await fastify.register(jwt, {
    secret: process.env.JWT_SECRET || 'pronto-ia-dev-secret-change-in-production',
    sign: { algorithm: 'HS256' },
  });
  await fastify.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  // Decorate prisma
  fastify.decorate('prisma', prisma);

  // Routes
  await fastify.register(healthRoutes, { prefix: '/api/v1' });
  await fastify.register(authRoutes, { prefix: '/api/v1/auth' });
  await fastify.register(trilhaRoutes, { prefix: '/api/v1/trilhas' });

  // Graceful shutdown
  const shutdown = async () => {
    fastify.log.info('Shutting down...');
    await prisma.$disconnect();
    await fastify.close();
    process.exit(0);
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

  try {
    await fastify.listen({ port: PORT, host: HOST });
    fastify.log.info(`Pronto.IA API running on ${HOST}:${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

main();
