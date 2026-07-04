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

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireAdmin(request);
  if (!user) return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 });
  const { data, error } = await supabase.from('blog_posts').select('*').eq('id', params.id).single();
  if (error || !data) return NextResponse.json({ success: false, message: 'Post not found' }, { status: 404 });
  return NextResponse.json({ success: true, data: { post: toDTO(data) } });
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireAdmin(request);
  if (!user) return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 });

  const { title, excerpt, body, imageUrl, category, author, readTime, status, tags } = await request.json();
  const updates: Record<string, any> = {};
  if (title !== undefined) { updates.title = title; updates.slug = slugify(title); }
  if (excerpt !== undefined) updates.excerpt = excerpt;
  if (body !== undefined) updates.content = body;
  if (imageUrl !== undefined) updates.image_url = imageUrl;
  if (category !== undefined) updates.category = category;
  if (author !== undefined) updates.author = author;
  if (readTime !== undefined) updates.read_time = parseInt(String(readTime), 10);
  if (tags !== undefined) updates.tags = tags;
  if (status !== undefined) {
    const published = status === 'published';
    updates.status = published ? 'published' : 'draft';
    if (published) updates.published_at = new Date().toISOString();
  }

  const { data, error } = await supabase.from('blog_posts').update(updates).eq('id', params.id).select().single();
  if (error) return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  return NextResponse.json({ success: true, data: { post: toDTO(data) } });
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireAdmin(request);
  if (!user) return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 });
  const { error } = await supabase.from('blog_posts').delete().eq('id', params.id);
  if (error) return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
