import { NextResponse } from 'next/server';

export async function GET() {
  const healthData = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  };

  return NextResponse.json(healthData, { status: 200 });
}

// Optional: Add POST support if needed
export async function POST() {
  return NextResponse.json(
    { message: 'Health check endpoint only supports GET requests' },
    { status: 405 }
  );
}