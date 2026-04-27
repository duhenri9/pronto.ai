import type { FastifyPluginAsync } from 'fastify';

export const trilhaRoutes: FastifyPluginAsync = async (fastify) => {
  // List all trilhas (optionally filtered by vertical)
  fastify.get('/', async (request) => {
    const { vertical, level } = request.query as { vertical?: string; level?: string };

    const where: Record<string, string> = {};
    if (vertical) where.vertical = vertical;
    if (level) where.level = level;

    const trilhas = await fastify.prisma.trilha.findMany({
      where,
      include: { _count: { select: { lessons: true, enrollments: true } } },
      orderBy: [{ vertical: 'asc', order: 'asc' }],
    });

    return { success: true, data: trilhas };
  });

  // Get single trilha with lessons
  fastify.get('/:slug', async (request) => {
    const { slug } = request.params as { slug: string };

    const trilha = await fastify.prisma.trilha.findUnique({
      where: { slug },
      include: { lessons: { orderBy: { order: 'asc' } } },
    });

    if (!trilha) {
      return { success: false, error: 'Trilha não encontrada' };
    }

    return { success: true, data: trilha };
  });

  // Enroll in a trilha (requires auth)
  fastify.post('/:slug/enroll', async (request, reply) => {
    try {
      const payload = await request.jwtVerify();
      const { slug } = request.params as { slug: string };

      const trilha = await fastify.prisma.trilha.findUnique({ where: { slug } });
      if (!trilha) {
        return reply.status(404).send({ success: false, error: 'Trilha não encontrada' });
      }

      if (trilha.isPro) {
        // TODO: Check if user has active Pro subscription
      }

      const existing = await fastify.prisma.enrollment.findUnique({
        where: { userId_trilhaId: { userId: payload.userId, trilhaId: trilha.id } },
      });

      if (existing) {
        return reply.status(409).send({ success: false, error: 'Já inscrito nesta trilha' });
      }

      const enrollment = await fastify.prisma.enrollment.create({
        data: {
          userId: payload.userId,
          trilhaId: trilha.id,
          source: 'ORGANIC',
        },
      });

      return reply.status(201).send({ success: true, data: enrollment });
    } catch {
      return reply.status(401).send({ success: false, error: 'Não autorizado' });
    }
  });
};
