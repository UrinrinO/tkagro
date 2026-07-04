import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-server';

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const { data: order, error } = await supabase
    .from('orders').select('*').eq('id', params.id).single();
  if (error || !order) return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
  return NextResponse.json({ success: true, data: { order } });
}
