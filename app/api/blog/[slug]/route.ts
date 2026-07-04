import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-server';

function toDTO(p: any) {
  return {
    id: p.id, slug: p.slug, title: p.title, excerpt: p.excerpt ?? '', body: p.content ?? '',
    featuredImage: p.image_url ?? '', category: p.category,
    author: { name: p.author ?? 'T.kays Agrocosmetics' },
    publishedAt: p.published_at ?? p.created_at, published: true, tags: p.tags ?? [],
  };
}

export async function GET(_request: NextRequest, { params }: { params: { slug: string } }) {
  const { data, error } = await supabase.from('blog_posts').select('*')
    .eq('slug', params.slug).eq('status', 'published').single();
  if (error || !data) return NextResponse.json({ success: false, message: 'Post not found' }, { status: 404 });
  return NextResponse.json({ data: toDTO(data) });
}
