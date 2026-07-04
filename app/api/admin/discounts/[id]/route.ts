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

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireAdmin(request);
  if (!user) return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 });

  const { active, code, type, value, minOrder, useLimit, expiresAt } = await request.json();
  const updates: Record<string, any> = {};
  if (active !== undefined) updates.active = active;
  if (code !== undefined) updates.code = String(code).toUpperCase();
  if (type !== undefined) updates.type = type;
  if (value !== undefined) updates.value = parseFloat(value);
  if (minOrder !== undefined) updates.min_order = parseFloat(minOrder);
  if (useLimit !== undefined) updates.use_limit = useLimit ? parseInt(useLimit, 10) : null;
  if (expiresAt !== undefined) updates.expires_at = expiresAt || null;

  const { data, error } = await supabase.from('discounts').update(updates).eq('id', params.id).select().single();
  if (error) return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  return NextResponse.json({ success: true, data: { discount: data } });
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireAdmin(request);
  if (!user) return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 });
  const { error } = await supabase.from('discounts').delete().eq('id', params.id);
  if (error) return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
