import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-server';

export async function GET(_request: NextRequest, { params }: { params: { key: string } }) {
  const { data, error } = await supabase.from('content_blocks')
    .select('key, value, updated_at').eq('key', params.key).single();
  if (error || !data) return NextResponse.json({ success: false, message: 'Content block not found' }, { status: 404 });
  return NextResponse.json({ success: true, data: { key: data.key, value: data.value, updatedAt: data.updated_at } });
}
