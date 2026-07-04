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

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [revenueRes, ordersMonthRes, productsRes, recentOrdersRes, bestSellersRes, allOrderEmailsRes] = await Promise.all([
    supabase.from('orders').select('total').neq('payment_status', 'Refunded').neq('status', 'Cancelled'),
    supabase.from('orders').select('id', { count: 'exact', head: true }).gte('created_at', monthStart),
    supabase.from('products').select('id, in_stock', { count: 'exact' }),
    supabase.from('orders').select('id, order_number, customer_name, total, status, created_at').order('created_at', { ascending: false }).limit(5),
    supabase.from('products').select('id, name').eq('is_best_seller', true).limit(4),
    supabase.from('orders').select('customer_email').neq('status', 'Cancelled'),
  ]);

  const totalRevenue = (revenueRes.data ?? []).reduce((sum, o) => sum + parseFloat(o.total), 0);
  const activeProducts = (productsRes.data ?? []).filter((p) => p.in_stock).length;
  const uniqueCustomers = new Set((allOrderEmailsRes.data ?? []).map((o) => o.customer_email)).size;

  return NextResponse.json({
    success: true,
    data: {
      stats: { totalRevenue: parseFloat(totalRevenue.toFixed(2)), ordersThisMonth: ordersMonthRes.count ?? 0, activeProducts, totalProducts: productsRes.count ?? 0, totalCustomers: uniqueCustomers },
      recentOrders: recentOrdersRes.data ?? [],
      topProducts: bestSellersRes.data ?? [],
    },
  });
}
