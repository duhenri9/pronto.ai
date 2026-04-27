import bcrypt from 'bcryptjs';
import type { FastifyInstance } from 'fastify';
import type { AuthPayload } from '@pronto-ia/types';

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(fastify: FastifyInstance, payload: AuthPayload): string {
  return fastify.jwt.sign(payload, { algorithm: 'HS256' });
}

export function verifyToken(fastify: FastifyInstance, token: string): AuthPayload {
  return fastify.jwt.verify<AuthPayload>(token, { algorithms: ['HS256'] });
}

export { AuthPayload };
