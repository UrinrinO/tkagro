import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-server';

async function requireAdmin(request: NextRequest) {
  const token = request.headers.get('authorization')?.split(' ')[1];
  if (!token) return null;
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  const { data } = await supabase.from('admin_users').select('user_id').eq('user_id', user.id).single();
  return data ? user : null;
}

function toDTO(c: any) {
  return {
    id: c.id, slug: c.slug, name: c.name, shortDescription: c.short_description ?? '',
    heroDescription: c.hero_description ?? '', metaDescription: c.meta_description ?? '',
    imageUrl: c.image_url ?? '', whyItWorks: c.why_it_works ?? [], stats: c.stats ?? [],
    icon: c.icon ?? '🌿', sortOrder: c.sort_order ?? 0, createdAt: c.created_at, updatedAt: c.updated_at,
  };
}

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export async function GET(request: NextRequest) {
  const user = await requireAdmin(request);
  if (!user) return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 });
  const { data, error } = await supabase.from('concerns').select('*')
    .order('sort_order', { ascending: true }).order('name', { ascending: true });
  if (error) return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data: { concerns: (data ?? []).map(toDTO) } });
}

export async function POST(request: NextRequest) {
  const user = await requireAdmin(request);
  if (!user) return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 });

  const { name, slug, shortDescription, heroDescription, metaDescription, imageUrl, whyItWorks, stats, icon, sortOrder } = await request.json();
  if (!name) return NextResponse.json({ success: false, message: 'name is required' }, { status: 400 });

  const { data, error } = await supabase.from('concerns').insert({
    slug: slug || slugify(name), name, short_description: shortDescription ?? '',
    hero_description: heroDescription ?? '', meta_description: metaDescription ?? '',
    image_url: imageUrl || null, why_it_works: Array.isArray(whyItWorks) ? whyItWorks : [],
    stats: Array.isArray(stats) ? stats : [], icon: icon || '🌿', sort_order: sortOrder ?? 0,
  }).select().single();
  if (error) return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  return NextResponse.json({ success: true, data: { concern: toDTO(data) } }, { status: 201 });
}
