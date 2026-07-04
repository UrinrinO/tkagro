import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-server';
import { stripe } from '@/lib/stripe-server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, customerEmail, discountCode, shippingCost } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, message: 'Cart must not be empty' }, { status: 400 });
    }
    if (!customerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      return NextResponse.json({ success: false, message: 'Valid email required' }, { status: 400 });
    }

    const { data: products, error: prodErr } = await supabase
      .from('products').select('id, name, price, in_stock, stock_count')
      .in('id', items.map((i: any) => i.id));

    if (prodErr || !products?.length) {
      return NextResponse.json({ success: false, message: 'One or more products not found' }, { status: 400 });
    }

    let subtotalPence = 0;
    for (const item of items) {
      const product = products.find((p: any) => p.id === item.id);
      if (!product) return NextResponse.json({ success: false, message: `Product ${item.id} not found` }, { status: 400 });
      if (!product.in_stock) return NextResponse.json({ success: false, message: `"${product.name}" is out of stock` }, { status: 400 });
      if (product.stock_count !== null && product.stock_count !== undefined && item.quantity > product.stock_count) {
        return NextResponse.json({ success: false, message: `Only ${product.stock_count} of "${product.name}" available. Please reduce your quantity.` }, { status: 400 });
      }
      subtotalPence += Math.round(product.price * 100) * item.quantity;
    }

    let discountPence = 0;
    if (discountCode) {
      const { data: discount } = await supabase.from('discounts').select('*')
        .eq('code', String(discountCode).toUpperCase()).eq('active', true).single();
      if (discount) {
        const minPence = Math.round((discount.min_order ?? 0) * 100);
        if (subtotalPence >= minPence) {
          discountPence = discount.type === '%'
            ? Math.round(subtotalPence * (discount.value / 100))
            : Math.round(discount.value * 100);
        }
      }
    }

    const shippingPence = shippingCost != null
      ? Math.round(parseFloat(shippingCost) * 100)
      : (subtotalPence >= 5000 ? 0 : 399);
    const totalPence = subtotalPence - discountPence + shippingPence;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalPence, currency: 'gbp', receipt_email: customerEmail,
      metadata: { items: JSON.stringify(items), discountCode: discountCode ?? '' },
    });

    return NextResponse.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        breakdown: {
          subtotal: (subtotalPence / 100).toFixed(2),
          discount: (discountPence / 100).toFixed(2),
          shipping: (shippingPence / 100).toFixed(2),
          total: (totalPence / 100).toFixed(2),
        },
      },
    });
  } catch (err: any) {
    console.error('[create-intent]', err);
    return NextResponse.json({ success: false, message: 'Payment setup failed' }, { status: 500 });
  }
}
