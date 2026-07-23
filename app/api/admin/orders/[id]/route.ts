import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-server';
import { sendShippingUpdate } from '@/lib/resend';

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
  const { status, trackingNumber } = await request.json();
  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ success: false, message: `Status must be one of: ${VALID_STATUSES.join(', ')}` }, { status: 400 });
  }

  const { data: existing } = await supabase.from('orders').select('status').eq('id', params.id).single();
  const previousStatus = existing?.status;

  const updatePayload: Record<string, unknown> = { status };
  if (trackingNumber !== undefined) updatePayload.tracking_number = trackingNumber || null;

  const { data, error } = await supabase.from('orders').update(updatePayload).eq('id', params.id).select().single();
  if (error) return NextResponse.json({ success: false, message: error.message }, { status: 400 });

  if (status === 'Shipped' && previousStatus !== 'Shipped') {
    const { data: notifSettings } = await supabase
      .from('content_blocks')
      .select('value')
      .eq('key', 'settings.notifications')
      .single();
    const shipUpdateEnabled = (notifSettings?.value as any)?.shipUpdate !== false;

    if (shipUpdateEnabled) {
      sendShippingUpdate({
        orderNumber: data.order_number,
        customerName: data.customer_name,
        customerEmail: data.customer_email,
        trackingNumber: data.tracking_number,
      }).catch((err) => console.error('[resend] shipping update email failed:', err));
    }
  }

  return NextResponse.json({ success: true, data: { order: data } });
}
