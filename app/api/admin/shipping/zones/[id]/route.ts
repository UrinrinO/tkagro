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

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireAdmin(request);
  if (!user) return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 });

  const { name, countries, basePrice, pricePerGram, estimatedDays, freeAbove, active } = await request.json();
  const updates: Record<string, any> = { updated_at: new Date().toISOString() };
  if (name !== undefined) updates.name = name;
  if (countries !== undefined) updates.countries = Array.isArray(countries) ? countries : [];
  if (basePrice !== undefined) updates.base_price = parseFloat(basePrice) || 0;
  if (pricePerGram !== undefined) updates.price_per_gram = parseFloat(pricePerGram) || 0;
  if (estimatedDays !== undefined) updates.estimated_days = estimatedDays || null;
  if (freeAbove !== undefined) updates.free_above = freeAbove ? parseFloat(freeAbove) : null;
  if (active !== undefined) updates.active = active;

  const { data, error } = await supabase.from('shipping_zones').update(updates).eq('id', params.id).select().single();
  if (error) return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  return NextResponse.json({ success: true, data: { zone: data } });
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireAdmin(request);
  if (!user) return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 });
  const { error } = await supabase.from('shipping_zones').delete().eq('id', params.id);
  if (error) return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
