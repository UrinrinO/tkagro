import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-server';

function toDTO(p: any) {
  return {
    id: p.id, slug: p.slug, name: p.name, tagline: p.tagline ?? '',
    shortDescription: p.short_description ?? '', description: p.description ?? '',
    price: parseFloat(p.price),
    compareAtPrice: p.compare_at_price ? parseFloat(p.compare_at_price) : undefined,
    imageUrl: p.image_url ?? '', category: p.category, concern: p.concern ?? [],
    stockCount: p.stock_count ?? null, inStock: p.in_stock, isNew: p.is_new, isBestSeller: p.is_best_seller,
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const category = searchParams.get('category') ?? undefined;
  const concern = searchParams.get('concern') ?? undefined;
  const sort = searchParams.get('sort') ?? undefined;
  const bestSeller = searchParams.get('bestSeller');
  const pageNum = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const limitNum = Math.min(50, parseInt(searchParams.get('limit') ?? '20', 10));

  let query = supabase.from('products').select('*', { count: 'exact' }).eq('in_stock', true);
  if (category) query = query.eq('category', category);
  if (concern) query = query.contains('concern', [concern]);
  if (bestSeller === 'true') query = query.eq('is_best_seller', true);
  if (sort === 'price_asc') query = query.order('price', { ascending: true });
  else if (sort === 'price_desc') query = query.order('price', { ascending: false });
  else if (sort === 'newest') query = query.order('created_at', { ascending: false });
  else query = query.order('is_best_seller', { ascending: false });
  query = query.range((pageNum - 1) * limitNum, pageNum * limitNum - 1);

  let data_result: Awaited<typeof query>;
  try {
    data_result = await query;
  } catch (e: any) {
    console.error('[products] thrown:', e.message, 'cause:', e.cause?.message, e.cause?.code);
    return NextResponse.json({ success: false, message: e.message, cause: e.cause?.message, causeCode: e.cause?.code }, { status: 500 });
  }
  const { data: products, error, count } = data_result;
  if (error) {
    console.error('[products] supabase error:', error.message, (error as any).cause?.message);
    return NextResponse.json({ success: false, message: error.message, code: error.code, cause: (error as any).cause?.message }, { status: 500 });
  }
  return NextResponse.json({
    success: true,
    data: { products: (products ?? []).map(toDTO) },
    meta: { page: pageNum, limit: limitNum, total: count ?? 0 },
  });
}
