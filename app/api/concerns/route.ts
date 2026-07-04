import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-server';

function toDTO(c: any) {
  return {
    id: c.id, slug: c.slug, name: c.name, shortDescription: c.short_description ?? '',
    heroDescription: c.hero_description ?? '', metaDescription: c.meta_description ?? '',
    imageUrl: c.image_url ?? '', whyItWorks: c.why_it_works ?? [], stats: c.stats ?? [],
    icon: c.icon ?? '🌿', sortOrder: c.sort_order ?? 0,
  };
}

export async function GET() {
  const { data, error } = await supabase.from('concerns').select('*')
    .order('sort_order', { ascending: true }).order('name', { ascending: true });
  if (error) return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data: { concerns: (data ?? []).map(toDTO) } });
}
