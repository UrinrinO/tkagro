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

export async function GET(_request: NextRequest, { params }: { params: { slug: string } }) {
  const { data: product, error } = await supabase
    .from('products').select('*').eq('slug', params.slug).single();
  if (error || !product) return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
  return NextResponse.json({ success: true, data: { product: toDTO(product) } });
}
