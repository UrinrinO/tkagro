import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-server';
import { getNotificationRecipient, sendLowStockAlert } from '@/lib/resend';

async function requireAdmin(request: NextRequest) {
  const token = request.headers.get('authorization')?.split(' ')[1];
  if (!token) return null;
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  const { data } = await supabase.from('admin_users').select('user_id').eq('user_id', user.id).single();
  return data ? user : null;
}

function toDTO(p: any) {
  return {
    id: p.id, slug: p.slug, name: p.name, tagline: p.tagline ?? '',
    shortDescription: p.short_description ?? '', description: p.description ?? '',
    price: parseFloat(p.price), compareAtPrice: p.compare_at_price ? parseFloat(p.compare_at_price) : null,
    imageUrl: p.image_url ?? '', category: p.category, concern: p.concern ?? [],
    weightGrams: p.weight_grams ?? null, stockCount: p.stock_count ?? null,
    inStock: p.in_stock, isNew: p.is_new, isBestSeller: p.is_best_seller,
    createdAt: p.created_at, updatedAt: p.updated_at,
  };
}

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export async function GET(request: NextRequest) {
  const user = await requireAdmin(request);
  if (!user) return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 });

  const { searchParams } = request.nextUrl;
  const search = searchParams.get('search') ?? undefined;
  const category = searchParams.get('category') ?? undefined;
  const pageNum = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const limitNum = Math.min(100, parseInt(searchParams.get('limit') ?? '50', 10));

  let query = supabase.from('products').select('*', { count: 'exact' })
    .order('created_at', { ascending: false }).range((pageNum - 1) * limitNum, pageNum * limitNum - 1);
  if (category && category !== 'All') query = query.eq('category', category);
  if (search) query = query.ilike('name', `%${search}%`);

  const { data, error, count } = await query;
  if (error) return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data: { products: (data ?? []).map(toDTO) }, meta: { total: count ?? 0 } });
}

export async function POST(request: NextRequest) {
  const user = await requireAdmin(request);
  if (!user) return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 });

  const body = await request.json();
  const { name, tagline, shortDescription, description, price, compareAtPrice, category, concern, imageUrl, weightGrams, inStock, isNew, isBestSeller } = body;
  if (!name || !price || !category) return NextResponse.json({ success: false, message: 'name, price and category are required' }, { status: 400 });

  const { data, error } = await supabase.from('products').insert({
    slug: slugify(name), name, tagline: tagline ?? null, short_description: shortDescription ?? null,
    description: description ?? null, price: parseFloat(price),
    compare_at_price: compareAtPrice ? parseFloat(compareAtPrice) : null,
    category, concern: Array.isArray(concern) ? concern : (concern ? [concern] : []),
    image_url: imageUrl ?? null, weight_grams: weightGrams ? parseInt(weightGrams, 10) : null,
    stock_count: body.stockCount !== undefined ? parseInt(body.stockCount, 10) : null,
    in_stock: inStock ?? true, is_new: isNew ?? false, is_best_seller: isBestSeller ?? false,
  }).select().single();
  if (error) return NextResponse.json({ success: false, message: error.message }, { status: 400 });

  if (body.stockCount !== undefined && parseInt(body.stockCount, 10) < 5) {
    const { data: notifSettings } = await supabase
      .from('content_blocks')
      .select('value')
      .eq('key', 'settings.notifications')
      .single();
    const lowStockEnabled = (notifSettings?.value as any)?.lowStock === true;

    if (lowStockEnabled) {
      getNotificationRecipient().then((recipientEmail) => {
        if (!recipientEmail) return;
        return sendLowStockAlert({
          recipientEmail,
          productName: data.name,
          stockCount: data.stock_count,
          productId: data.id,
        });
      }).catch((err) => console.error('[resend] low stock alert failed:', err));
    }
  }

  return NextResponse.json({ success: true, data: { product: toDTO(data) } }, { status: 201 });
}
