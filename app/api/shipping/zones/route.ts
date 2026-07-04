import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-server';

export async function GET() {
  const { data, error } = await supabase
    .from('shipping_zones')
    .select('id, name, countries, estimated_days, free_above, base_price, price_per_gram')
    .eq('active', true).order('created_at');
  if (error) return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data: { zones: data ?? [] } });
}
