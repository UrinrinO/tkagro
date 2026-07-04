import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  const { code, subtotal } = await request.json();
  if (!code) return NextResponse.json({ success: false, message: 'code is required' }, { status: 400 });

  const normalised = String(code).trim().toUpperCase();
  const { data: discount, error } = await supabase.from('discounts').select('*')
    .eq('code', normalised).eq('active', true).single();

  if (error || !discount) {
    return NextResponse.json({ success: true, data: { result: { code: normalised, type: 'percentage', value: 0, discountAmount: 0, isValid: false, message: 'Invalid or inactive discount code.' } } });
  }

  if (discount.expires_at && new Date(discount.expires_at) < new Date()) {
    return NextResponse.json({ success: true, data: { result: { code: normalised, type: discount.type, value: discount.value, discountAmount: 0, isValid: false, message: 'This discount code has expired.' } } });
  }

  const sub = parseFloat(subtotal) || 0;
  if (discount.min_order && sub < discount.min_order) {
    return NextResponse.json({ success: true, data: { result: { code: normalised, type: discount.type, value: discount.value, discountAmount: 0, isValid: false, message: `Minimum order of £${discount.min_order.toFixed(2)} required.` } } });
  }

  const type = discount.type === '%' ? 'percentage' : 'fixed';
  const discountAmount = discount.type === '%'
    ? parseFloat(((sub * discount.value) / 100).toFixed(2))
    : Math.min(discount.value, sub);
  const label = discount.type === '%'
    ? `${discount.value}% off your order`
    : `£${discount.value.toFixed(2)} off your order`;

  return NextResponse.json({ success: true, data: { result: { code: normalised, type, value: discount.value, discountAmount, isValid: true, message: label } } });
}
