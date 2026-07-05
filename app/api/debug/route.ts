import { NextResponse } from 'next/server';

export async function GET() {
  const url = process.env.TKAYS_SUPABASE_URL!;
  const key = process.env.TKAYS_SERVICE_ROLE_KEY!;

  // Test 1: bare fetch, no cache option
  try {
    const r1 = await fetch(`${url}/rest/v1/products?select=id&limit=1`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    const t1 = await r1.text();
    return NextResponse.json({ test: 'bare-fetch', status: r1.status, body: t1.slice(0, 200) });
  } catch (e: any) {
    return NextResponse.json({
      test: 'bare-fetch',
      error: e.message,
      cause: e.cause?.message,
      causeCode: e.cause?.code,
      causeErrno: e.cause?.errno,
      causeSyscall: e.cause?.syscall,
    });
  }
}
