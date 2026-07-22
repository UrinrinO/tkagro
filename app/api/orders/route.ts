import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-server';
import { stripe } from '@/lib/stripe-server';
import { sendOrderConfirmation } from '@/lib/resend';

function generateOrderNumber() {
  return `TK-${Date.now().toString(36).toUpperCase()}`;
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { paymentIntentId, customer, shippingAddress, items } = body;

  if (!paymentIntentId || !customer?.email || !shippingAddress || !items?.length) {
    return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
  }

  try {
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (intent.status !== 'succeeded') {
      return NextResponse.json({ success: false, message: 'Payment not confirmed by Stripe' }, { status: 400 });
    }

    const { data: products } = await supabase.from('products').select('id, name, price')
      .in('id', items.map((i: any) => i.id));

    const lineItems = items.map((item: any) => {
      const product = products?.find((p: any) => p.id === item.id);
      const price = product?.price ?? 0;
      return { id: item.id, name: product?.name ?? item.name, qty: item.quantity, price, subtotal: price * item.quantity };
    });

    const subtotal = lineItems.reduce((sum: number, i: any) => sum + i.subtotal, 0);
    const shipping = subtotal >= 50 ? 0 : 3.99;
    const total = intent.amount / 100;
    const orderNumber = generateOrderNumber();

    const { data: order, error } = await supabase.from('orders').insert({
      order_number: orderNumber, customer_name: customer.name, customer_email: customer.email,
      customer_phone: customer.phone ?? null, shipping_address: shippingAddress, items: lineItems,
      subtotal, shipping_cost: shipping, total, status: 'Processing',
      payment_method: 'Stripe', payment_reference: paymentIntentId, payment_status: 'Paid',
    }).select().single();

    if (error) {
      console.error('[orders] insert error:', error);
      return NextResponse.json({ success: false, message: 'Failed to save order' }, { status: 500 });
    }

    const { data: notifSettings } = await supabase
      .from('content_blocks')
      .select('value')
      .eq('key', 'settings.notifications')
      .single();
    const orderConfirmEnabled = (notifSettings?.value as any)?.orderConfirm !== false;

    if (orderConfirmEnabled) {
      sendOrderConfirmation({
        orderNumber, customerName: customer.name, customerEmail: customer.email,
        items: lineItems.map((i: any) => ({ name: i.name, qty: i.qty, price: `£${i.price.toFixed(2)}` })),
        total: `£${total.toFixed(2)}`, shippingAddress,
      }).catch((err) => console.error('[resend] confirmation email failed:', err));
    }

    return NextResponse.json({ success: true, data: { order } }, { status: 201 });
  } catch (err: any) {
    console.error('[orders]', err);
    return NextResponse.json({ success: false, message: 'Order creation failed' }, { status: 500 });
  }
}
