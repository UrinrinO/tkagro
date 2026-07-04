import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-server';

async function requireAdmin(request: NextRequest) {
  const token = request.headers.get('authorization')?.split(' ')[1];
  if (!token) return null;
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  const { data } = await supabase.from('admin_users').select('user_id').eq('user_id', user.id).single();
  return data ? user : null;
}

export async function GET(request: NextRequest) {
  const user = await requireAdmin(request);
  if (!user) return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 });
  const { data, error } = await supabase.from('shipping_zones').select('*').order('created_at');
  if (error) return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data: { zones: data ?? [] } });
}

export async function POST(request: NextRequest) {
  const user = await requireAdmin(request);
  if (!user) return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 });

  const { name, countries, basePrice, pricePerGram, estimatedDays, freeAbove, active } = await request.json();
  if (!name) return NextResponse.json({ success: false, message: 'name is required' }, { status: 400 });

  const { data, error } = await supabase.from('shipping_zones').insert({
    name, countries: Array.isArray(countries) ? countries : [],
    base_price: parseFloat(basePrice) || 0, price_per_gram: parseFloat(pricePerGram) || 0,
    estimated_days: estimatedDays || null, free_above: freeAbove ? parseFloat(freeAbove) : null,
    active: active ?? true,
  }).select().single();
  if (error) return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  return NextResponse.json({ success: true, data: { zone: data } }, { status: 201 });
}
