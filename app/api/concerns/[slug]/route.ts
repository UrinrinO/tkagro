import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-server';

function toDTO(c: any) {
  return {
    id: c.id, slug: c.slug, name: c.name, shortDescription: c.short_description ?? '',
    heroDescription: c.hero_description ?? '', metaDescription: c.meta_description ?? '',
    imageUrl: c.image_url ?? '', whyItWorks: c.why_it_works ?? [], stats: c.stats ?? [],
    icon: c.icon ?? '🌿', sortOrder: c.sort_order ?? 0,
  };
}

export async function GET(_request: NextRequest, { params }: { params: { slug: string } }) {
  const { data, error } = await supabase.from('concerns').select('*').eq('slug', params.slug).single();
  if (error || !data) return NextResponse.json({ success: false, message: 'Concern not found' }, { status: 404 });
  return NextResponse.json({ success: true, data: { concern: toDTO(data) } });
}
