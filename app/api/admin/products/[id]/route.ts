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

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireAdmin(request);
  if (!user) return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 });
  const { data, error } = await supabase.from('products').select('*').eq('id', params.id).single();
  if (error || !data) return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
  return NextResponse.json({ success: true, data: { product: toDTO(data) } });
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireAdmin(request);
  if (!user) return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 });

  const body = await request.json();
  const { name, tagline, shortDescription, description, price, compareAtPrice, category, concern, imageUrl, weightGrams, inStock, isNew, isBestSeller } = body;

  const { data: existing } = await supabase.from('products').select('stock_count').eq('id', params.id).single();
  const previousStockCount = existing?.stock_count;

  const updates: Record<string, any> = {};
  if (name !== undefined) { updates.name = name; updates.slug = slugify(name); }
  if (tagline !== undefined) updates.tagline = tagline;
  if (shortDescription !== undefined) updates.short_description = shortDescription;
  if (description !== undefined) updates.description = description;
  if (price !== undefined) updates.price = parseFloat(price);
  if (compareAtPrice !== undefined) updates.compare_at_price = compareAtPrice ? parseFloat(compareAtPrice) : null;
  if (category !== undefined) updates.category = category;
  if (concern !== undefined) updates.concern = Array.isArray(concern) ? concern : (concern ? [concern] : []);
  if (imageUrl !== undefined) updates.image_url = imageUrl;
  if (weightGrams !== undefined) updates.weight_grams = weightGrams ? parseInt(weightGrams, 10) : null;
  if (body.stockCount !== undefined) updates.stock_count = body.stockCount !== null ? parseInt(body.stockCount, 10) : null;
  if (inStock !== undefined) updates.in_stock = inStock;
  if (isNew !== undefined) updates.is_new = isNew;
  if (isBestSeller !== undefined) updates.is_best_seller = isBestSeller;

  const { data, error } = await supabase.from('products').update(updates).eq('id', params.id).select().single();
  if (error) return NextResponse.json({ success: false, message: error.message }, { status: 400 });

  if (
    body.stockCount !== undefined &&
    body.stockCount !== null &&
    parseInt(body.stockCount, 10) < 5 &&
    (previousStockCount === null || previousStockCount === undefined || previousStockCount >= 5)
  ) {
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

  return NextResponse.json({ success: true, data: { product: toDTO(data) } });
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireAdmin(request);
  if (!user) return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 });
  const { error } = await supabase.from('products').delete().eq('id', params.id);
  if (error) return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
