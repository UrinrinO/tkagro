import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  const keysParam = request.nextUrl.searchParams.get('keys');
  if (!keysParam) {
    return NextResponse.json({ success: false, message: 'Provide ?keys= as a comma-separated list' }, { status: 400 });
  }

  const keys = keysParam.split(',').map((k) => k.trim()).filter(Boolean);
  const { data, error } = await supabase.from('content_blocks').select('key, value, updated_at').in('key', keys);
  if (error) return NextResponse.json({ success: false, message: error.message }, { status: 500 });

  const result: Record<string, unknown> = {};
  for (const row of data ?? []) result[row.key] = row.value;
  return NextResponse.json({ success: true, data: result });
}
