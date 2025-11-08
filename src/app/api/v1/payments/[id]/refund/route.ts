// // src/app/api/v1/payments/[id]/refund/route.ts
// import { NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
// import { getIdempotency, createIdempotency, succeedIdempotency, failIdempotency } from '@/lib/idempotency';


// export async function POST(req: Request, { params }: { params: { id: string } }) {
//   const paymentId = params.id;
//   const idemp = req.headers.get('idempotency-key') ?? '';
//   if (!idemp) return NextResponse.json({ error: 'Idempotency-Key required' }, { status: 400 });

//   const body = await req.json().catch(() => ({}));
//   const { amount } = body;

//   const requestHash = JSON.stringify({ paymentId, amount });
//   const existing = await getIdempotency(idemp);

//   if (existing) {
//     if (existing.requestHash && existing.requestHash !== requestHash) {
//       return NextResponse.json({ error: 'Idempotency key conflict' }, { status: 409 });
//     }
//     if (existing.status === 'succeeded' && existing.response) return NextResponse.json(existing.response);
//     if (existing.status === 'processing') return NextResponse.json({ status: 'processing' }, { status: 202 });
//   } else {
//     await createIdempotency(idemp, requestHash);
//   }

//   try {
//     const result = await prisma.$transaction(async (tx:any) => {
//       const payment = await tx.payment.findUnique({ where: { id: paymentId } });
//       if (!payment) throw { status: 404, message: 'Payment not found' };

//       const refundAmount = typeof amount === 'number' ? amount : Number(payment.amount);

//       // call provider refund (simulated)
//       if (!payment.referenceId) {
//         // If we don't have a provider reference we can still create a refund record (offline)
//       }

     

//       const refundRow = await tx.refund.create({
//         data: {
//           paymentId: payment.id,
//           providerRefundId: provRefund.providerRefundId,
//           amount: refundAmount,
//           currency: payment.currency,
//           status: provRefund.status === 'succeeded' ? 'SUCCEEDED' : 'PENDING',
//         },
//       });

//       // update payment status to RECONCILING (or handle partial refund logic)
//       await tx.payment.update({
//         where: { id: payment.id },
//         data: { status: 'RECONCILING' },
//       });

//       return { refundId: refundRow.id, providerRefundId: provRefund.providerRefundId, status: provRefund.status };
//     });

//     await succeedIdempotency(idemp, result);
//     return NextResponse.json(result);
//   } catch (err: any) {
//     await failIdempotency(idemp, { error: err?.message ?? String(err) }).catch(() => {});
//     const code = err?.status ?? 500;
//     return NextResponse.json({ error: err?.message ?? 'Refund failed' }, { status: code });
//   }
// }
