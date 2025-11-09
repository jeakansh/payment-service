// app/api/v1/payments/failed/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Adjust the import path based on your prisma client location

export async function GET(req: Request) {
  try {
    const payments = await prisma.payment.findMany({
      where: {
        status: 'FAILED',
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        refunds: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: payments,
      total: payments.length,
    });
  } catch (err: any) {
    console.error('Failed to fetch failed payments:', err);
    return NextResponse.json(
      { 
        success: false,
        error: err?.message ?? 'Failed to fetch failed payments' 
      },
      { status: 500 }
    );
  }
}