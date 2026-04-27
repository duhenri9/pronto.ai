import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { hashPassword, verifyPassword, signToken } from '@pronto-ia/auth';

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(8),
  vertical: z.enum(['SALAO', 'FOOD_SERVICE', 'HOME_SERVICE']).optional(),
  businessName: z.string().optional(),
  businessType: z.string().optional(),
  city: z.string().optional(),
  state: z.string().max(2).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const authRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post('/register', async (request, reply) => {
    const body = registerSchema.parse(request.body);
    const { password, ...userData } = body;

    const existing = await fastify.prisma.user.findUnique({
      where: { email: body.email },
    });
    if (existing) {
      return reply.status(409).send({ success: false, error: 'Email já cadastrado' });
    }

    const passwordHash = await hashPassword(password);
    const user = await fastify.prisma.user.create({
      data: { ...userData, passwordHash },
    });

    const token = signToken(fastify, {
      userId: user.id,
      email: user.email,
      role: user.role as 'STUDENT',
    });

    return reply.status(201).send({
      success: true,
      data: {
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
        token,
      },
    });
  });

  fastify.post('/login', async (request, reply) => {
    const { email, password } = loginSchema.parse(request.body);

    const user = await fastify.prisma.user.findUnique({ where: { email } });
    if (!user) {
      return reply.status(401).send({ success: false, error: 'Credenciais inválidas' });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return reply.status(401).send({ success: false, error: 'Credenciais inválidas' });
    }

    const token = signToken(fastify, {
      userId: user.id,
      email: user.email,
      role: user.role as 'STUDENT',
    });

    return {
      success: true,
      data: {
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
        token,
      },
    };
  });
};
