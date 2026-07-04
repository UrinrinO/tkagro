import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-server';

async function getAuthUser(request: NextRequest) {
  const token = request.headers.get('authorization')?.split(' ')[1];
  if (!token) return null;
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });

  const { data: orders, error } = await supabase.from('orders').select('*')
    .eq('customer_email', user.email).order('created_at', { ascending: false });
  if (error) return NextResponse.json({ success: false, message: error.message }, { status: 500 });

  const mapped = (orders ?? []).map((o) => ({
    id: o.id, orderNumber: o.order_number, status: o.status,
    total: parseFloat(o.total), items: o.items,
    shippingAddress: o.shipping_address, createdAt: o.created_at,
  }));
  return NextResponse.json({ success: true, data: { orders: mapped } });
}
