import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-server';
import { getNotificationRecipient, sendWeeklySalesReport } from '@/lib/resend';

async function requireAdmin(request: NextRequest) {
  const token = request.headers.get('authorization')?.split(' ')[1];
  if (!token) return null;
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  const { data } = await supabase.from('admin_users').select('user_id').eq('user_id', user.id).single();
  return data ? user : null;
}

interface OrderRow {
  total: string;
  customer_email: string;
  items: unknown;
  created_at: string;
}

interface TopProduct {
  name: string;
  unitsSold: number;
  revenue: number;
}

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get('authorization');
  const bearerToken = authHeader?.split(' ')[1];

  const isCronRequest = !!cronSecret && bearerToken === cronSecret;
  const isAdminRequest = !isCronRequest && (await requireAdmin(request)) !== null;

  if (!isCronRequest && !isAdminRequest) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const windowEnd = new Date();
  const windowStart = new Date(windowEnd.getTime() - 7 * 24 * 60 * 60 * 1000);

  const { data: notifSettings } = await supabase
    .from('content_blocks')
    .select('value')
    .eq('key', 'settings.notifications')
    .single();
  const weeklyReportEnabled = (notifSettings?.value as any)?.weeklyReport === true;

  if (!weeklyReportEnabled) {
    return NextResponse.json({ success: true, data: { sent: false, reason: 'disabled' } });
  }

  const recipientEmail = await getNotificationRecipient();
  if (!recipientEmail) {
    return NextResponse.json({ success: true, data: { sent: false, reason: 'no_recipient' } });
  }

  const { data: orders, error } = await supabase
    .from('orders')
    .select('total, customer_email, items, created_at')
    .gte('created_at', windowStart.toISOString())
    .lt('created_at', windowEnd.toISOString())
    .neq('status', 'Cancelled')
    .neq('payment_status', 'Refunded');

  if (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }

  const orderRows = (orders ?? []) as OrderRow[];

  const ordersCount = orderRows.length;
  const totalRevenue = orderRows.reduce((sum, o) => sum + parseFloat(o.total), 0);
  const averageOrderValue = ordersCount > 0 ? totalRevenue / ordersCount : 0;

  const emails = [...new Set(orderRows.map((o) => o.customer_email))];
  let newCustomers = 0;
  if (emails.length > 0) {
    const { data: firstOrders, error: firstOrdersError } = await supabase
      .from('orders')
      .select('customer_email, created_at')
      .in('customer_email', emails)
      .order('created_at', { ascending: true });

    if (firstOrdersError) {
      return NextResponse.json({ success: false, message: firstOrdersError.message }, { status: 500 });
    }

    const firstOrderByEmail = new Map<string, string>();
    for (const o of firstOrders ?? []) {
      if (!firstOrderByEmail.has(o.customer_email)) firstOrderByEmail.set(o.customer_email, o.created_at);
    }

    newCustomers = emails.filter((e) => {
      const first = firstOrderByEmail.get(e);
      if (!first) return false;
      const firstDate = new Date(first);
      return firstDate >= windowStart && firstDate < windowEnd;
    }).length;
  }

  const productTotals = new Map<string, TopProduct>();
  for (const order of orderRows) {
    if (!Array.isArray(order.items)) continue;
    for (const item of order.items as any[]) {
      if (!item || typeof item !== 'object') continue;
      const id = item.id;
      const name = item.name;
      const qty = item.qty;
      const subtotal = item.subtotal;
      if (typeof id !== 'string' || typeof name !== 'string' || typeof qty !== 'number' || typeof subtotal !== 'number') continue;

      const existing = productTotals.get(id);
      if (existing) {
        existing.unitsSold += qty;
        existing.revenue += subtotal;
      } else {
        productTotals.set(id, { name, unitsSold: qty, revenue: subtotal });
      }
    }
  }

  const topProducts = [...productTotals.values()]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const reportData = {
    ordersCount,
    totalRevenue: parseFloat(totalRevenue.toFixed(2)),
    averageOrderValue: parseFloat(averageOrderValue.toFixed(2)),
    newCustomers,
    topProducts,
  };

  try {
    await sendWeeklySalesReport({
      recipientEmail,
      windowStart: windowStart.toISOString(),
      windowEnd: windowEnd.toISOString(),
      ...reportData,
    });
    return NextResponse.json({ success: true, data: { sent: true, ...reportData } });
  } catch (err) {
    console.error('[cron] weekly sales report send failed:', err);
    return NextResponse.json({ success: false, message: 'Failed to send report email' }, { status: 500 });
  }
}
