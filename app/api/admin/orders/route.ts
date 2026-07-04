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

  const { searchParams } = request.nextUrl;
  const status = searchParams.get('status') ?? undefined;
  const search = searchParams.get('search') ?? undefined;
  const pageNum = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const limitNum = Math.min(100, parseInt(searchParams.get('limit') ?? '50', 10));

  let query = supabase.from('orders').select('*', { count: 'exact' })
    .order('created_at', { ascending: false }).range((pageNum - 1) * limitNum, pageNum * limitNum - 1);
  if (status && status !== 'All') query = query.eq('status', status);
  if (search) query = query.or(`order_number.ilike.%${search}%,customer_name.ilike.%${search}%,customer_email.ilike.%${search}%`);

  const { data, error, count } = await query;
  if (error) return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data: { orders: data ?? [] }, meta: { total: count ?? 0 } });
}
