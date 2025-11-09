// src/app/api/v1/payments/charge/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getIdempotency, createIdempotency, succeedIdempotency, failIdempotency } from '@/lib/idempotency';

type Body = {
  tripId: string;
  riderId?: string;
  amount: number;
  currency?: string;
  method: 'UPI' | 'CARD' | 'CASH' | 'WALLET';
  referenceId?: string | null;
  metadata?: any;
};

export async function POST(req: Request) {
  const idemp = req.headers.get('idempotency-key') ?? '451';
  if (!idemp) return NextResponse.json({ error: 'Idempotency-Key required' }, { status: 400 });

  const body = (await req.json().catch(() => ({}))) as Body;
  console.log(body)
  const { tripId, riderId, amount, currency = 'INR', method, referenceId, metadata } = body;

  if (!tripId || typeof amount !== 'number' || !method) {
    return NextResponse.json({ error: 'tripId, amount (number) and method required' }, { status: 400 });
  }

  const requestHash = JSON.stringify({ tripId, riderId, amount, currency, method, referenceId, metadata });
  const existing = await getIdempotency(idemp);

  if (existing) {
    if (existing.requestHash && existing.requestHash !== requestHash) {
      return NextResponse.json({ error: 'Idempotency key conflict (different payload)' }, { status: 409 });
    }
    if (existing.status === 'succeeded' && existing.response) return NextResponse.json(existing.response);
    if (existing.status === 'processing') return NextResponse.json({ status: 'processing' }, { status: 202 });
  } else {
    await createIdempotency(idemp, requestHash);
  }
 console.log("Before try block")
  try {
    const result = await prisma.$transaction(async (tx: any) => {
 
      const payment = await tx.payment.create({
        data: {
          tripId,
          riderId,
          amount,
          currency,
          status: 'SUCCEEDED',
          method,
          referenceId: referenceId ?? null,
        },
      });
      console.log({payment})

      return { paymentId: payment.id, status: 'SUCCESS' };
    });
    await succeedIdempotency(idemp, result);
    return NextResponse.json(result);
  } catch (err: any) {
    await failIdempotency(idemp, { error: err?.message ?? String(err) }).catch(() => {});
    return NextResponse.json({ error: err?.message ?? 'Charge failed' }, { status: 500 });
  }
}
