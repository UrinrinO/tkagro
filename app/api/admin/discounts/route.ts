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
  const { data, error } = await supabase.from('discounts').select('*').order('created_at', { ascending: false });
  if (error) return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data: { discounts: data ?? [] } });
}

export async function POST(request: NextRequest) {
  const user = await requireAdmin(request);
  if (!user) return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 });

  const { code, type, value, minOrder, useLimit, expiresAt, active } = await request.json();
  if (!code || !type || value == null) return NextResponse.json({ success: false, message: 'code, type and value are required' }, { status: 400 });
  if (!['%', 'fixed'].includes(type)) return NextResponse.json({ success: false, message: "type must be '%' or 'fixed'" }, { status: 400 });

  const { data, error } = await supabase.from('discounts').insert({
    code: String(code).toUpperCase(), type, value: parseFloat(value),
    min_order: minOrder ? parseFloat(minOrder) : 0,
    use_limit: useLimit ? parseInt(useLimit, 10) : null,
    expires_at: expiresAt || null, active: active ?? true,
  }).select().single();
  if (error) return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  return NextResponse.json({ success: true, data: { discount: data } }, { status: 201 });
}
