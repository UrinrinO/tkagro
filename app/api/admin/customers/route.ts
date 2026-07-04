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

  const search = request.nextUrl.searchParams.get('search') ?? undefined;
  const { data, error } = await supabase.from('orders')
    .select('customer_name, customer_email, customer_phone, total, created_at')
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ success: false, message: error.message }, { status: 500 });

  const map = new Map<string, any>();
  for (const row of data ?? []) {
    const existing = map.get(row.customer_email);
    if (existing) { existing.orders += 1; existing.spend += parseFloat(row.total); }
    else map.set(row.customer_email, { name: row.customer_name, email: row.customer_email, phone: row.customer_phone ?? null, orders: 1, spend: parseFloat(row.total), joined: row.created_at });
  }

  let customers = Array.from(map.values())
    .map((c) => ({ ...c, spend: parseFloat(c.spend.toFixed(2)) }))
    .sort((a, b) => b.spend - a.spend);

  if (search) {
    const q = search.toLowerCase();
    customers = customers.filter((c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q));
  }

  return NextResponse.json({ success: true, data: { customers, total: customers.length } });
}
