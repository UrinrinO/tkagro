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

const VALID_STATUSES = ['Processing', 'Shipped', 'Delivered', 'Cancelled'];

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireAdmin(request);
  if (!user) return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 });
  const { data, error } = await supabase.from('orders').select('*').eq('id', params.id).single();
  if (error || !data) return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
  return NextResponse.json({ success: true, data: { order: data } });
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireAdmin(request);
  if (!user) return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 });
  const { status } = await request.json();
  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ success: false, message: `Status must be one of: ${VALID_STATUSES.join(', ')}` }, { status: 400 });
  }
  const { data, error } = await supabase.from('orders').update({ status }).eq('id', params.id).select().single();
  if (error) return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  return NextResponse.json({ success: true, data: { order: data } });
}
