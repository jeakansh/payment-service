// src/lib/idempotency.ts
import { prisma } from './prisma';

export async function getIdempotency(key: string) {
  return prisma.idempotencyKey.findUnique({ where: { key } });
}

export async function createIdempotency(key: string, requestHash?: string) {
  return prisma.idempotencyKey.create({ data: { key, status: 'processing', requestHash } });
}

export async function succeedIdempotency(key: string, response: any) {
  return prisma.idempotencyKey.update({ where: { key }, data: { status: 'succeeded', response } });
}

export async function failIdempotency(key: string, response: any) {
  return prisma.idempotencyKey.update({ where: { key }, data: { status: 'failed', response } });
}
