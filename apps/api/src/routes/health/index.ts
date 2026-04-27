import type { FastifyPluginAsync } from 'fastify';

export const healthRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/health', async () => {
    return {
      status: 'ok',
      service: 'pronto-ia-api',
      version: '0.1.0',
      timestamp: new Date().toISOString(),
    };
  });
};
