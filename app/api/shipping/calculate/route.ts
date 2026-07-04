import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  const { country, items } = await request.json();
  if (!country || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ success: false, message: 'country and items are required' }, { status: 400 });
  }

  const ids = items.map((i: any) => i.id);
  const { data: products, error: prodErr } = await supabase
    .from('products').select('id, weight_grams').in('id', ids);
  if (prodErr) return NextResponse.json({ success: false, message: prodErr.message }, { status: 500 });

  const weightMap: Record<string, number> = {};
  for (const p of products ?? []) weightMap[p.id] = p.weight_grams ?? 0;
  const totalWeightGrams = items.reduce((sum: number, item: any) => sum + (weightMap[item.id] ?? 0) * item.quantity, 0);

  const { data: zones, error: zoneErr } = await supabase.from('shipping_zones').select('*').eq('active', true);
  if (zoneErr) return NextResponse.json({ success: false, message: zoneErr.message }, { status: 500 });

  const code = String(country).toUpperCase();
  let zone = (zones ?? []).find((z) => Array.isArray(z.countries) && z.countries.includes(code));
  if (!zone) zone = (zones ?? []).find((z) => !z.countries || z.countries.length === 0);
  if (!zone) return NextResponse.json({ success: false, message: 'No shipping zone found for this country' }, { status: 404 });

  const base = parseFloat(zone.base_price);
  const perGram = parseFloat(zone.price_per_gram);
  const shippingCost = parseFloat((base + totalWeightGrams * perGram).toFixed(2));

  return NextResponse.json({
    success: true,
    data: {
      rate: { zoneId: zone.id, zoneName: zone.name, basePrice: base, pricePerGram: perGram, estimatedDays: zone.estimated_days ?? '', totalWeightGrams, shippingCost, isFree: false },
      freeAbove: zone.free_above ?? null,
    },
  });
}
