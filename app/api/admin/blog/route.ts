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

function toDTO(p: any) {
  return {
    id: p.id, slug: p.slug, title: p.title, excerpt: p.excerpt ?? '', body: p.content ?? '',
    featuredImage: p.image_url ?? '', category: p.category, author: { name: p.author ?? 'T.kays Agrocosmetics' },
    readTime: p.read_time ?? null, publishedAt: p.published_at ?? p.created_at,
    published: p.status === 'published', status: p.status, tags: p.tags ?? [],
    createdAt: p.created_at, updatedAt: p.updated_at,
  };
}

function slugify(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export async function GET(request: NextRequest) {
  const user = await requireAdmin(request);
  if (!user) return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 });

  const { searchParams } = request.nextUrl;
  const status = searchParams.get('status') ?? undefined;
  const pageNum = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const limitNum = Math.min(100, parseInt(searchParams.get('limit') ?? '50', 10));

  let query = supabase.from('blog_posts').select('*', { count: 'exact' })
    .order('created_at', { ascending: false }).range((pageNum - 1) * limitNum, pageNum * limitNum - 1);
  if (status && status !== 'All') query = query.eq('status', status.toLowerCase());

  const { data, error, count } = await query;
  if (error) return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data: { posts: (data ?? []).map(toDTO) }, meta: { total: count ?? 0 } });
}

export async function POST(request: NextRequest) {
  const user = await requireAdmin(request);
  if (!user) return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 });

  const { title, excerpt, body, imageUrl, category, author, readTime, status, tags } = await request.json();
  if (!title || !category) return NextResponse.json({ success: false, message: 'title and category are required' }, { status: 400 });

  const published = status === 'published';
  const { data, error } = await supabase.from('blog_posts').insert({
    slug: slugify(title), title, excerpt: excerpt ?? null, content: body ?? '',
    image_url: imageUrl ?? null, category, author: author ?? 'T.kays Agrocosmetics',
    read_time: readTime ? parseInt(String(readTime), 10) : null,
    status: published ? 'published' : 'draft',
    published_at: published ? new Date().toISOString() : null, tags: tags ?? [],
  }).select().single();
  if (error) return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  return NextResponse.json({ success: true, data: { post: toDTO(data) } }, { status: 201 });
}
