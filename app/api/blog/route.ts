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

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const category = searchParams.get('category') ?? undefined;
  const pageNum = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const limitNum = Math.min(50, parseInt(searchParams.get('limit') ?? '9', 10));

  let query = supabase.from('blog_posts').select('*', { count: 'exact' })
    .eq('status', 'published').order('published_at', { ascending: false })
    .range((pageNum - 1) * limitNum, pageNum * limitNum - 1);
  if (category && category !== 'all') query = query.eq('category', category);

  const { data, error, count } = await query;
  if (error) return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  return NextResponse.json({
    data: (data ?? []).map(toDTO),
    pagination: { page: pageNum, limit: limitNum, total: count ?? 0, totalPages: Math.ceil((count ?? 0) / limitNum) },
  });
}
