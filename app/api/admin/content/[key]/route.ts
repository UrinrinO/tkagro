import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-server';

const ALLOWED_KEYS = new Set([
  'homepage.hero', 'homepage.trust_strip', 'homepage.why_tkays', 'homepage.newsletter',
  'about.brand_story', 'about.founder', 'about.balanced_wellness', 'about.vhon', 'about.dice',
  'testimonials', 'faqs',
  'settings.store_info', 'settings.notifications',
]);

async function requireAdmin(request: NextRequest) {
  const token = request.headers.get('authorization')?.split(' ')[1];
  if (!token) return null;
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  const { data } = await supabase.from('admin_users').select('user_id').eq('user_id', user.id).single();
  return data ? user : null;
}

export async function GET(request: NextRequest, { params }: { params: { key: string } }) {
  const user = await requireAdmin(request);
  if (!user) return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 });
  const { data, error } = await supabase.from('content_blocks').select('key, value, updated_at').eq('key', params.key).single();
  if (error || !data) return NextResponse.json({ success: false, message: 'Content block not found' }, { status: 404 });
  return NextResponse.json({ success: true, data: { key: data.key, value: data.value, updatedAt: data.updated_at } });
}

export async function PUT(request: NextRequest, { params }: { params: { key: string } }) {
  const user = await requireAdmin(request);
  if (!user) return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 });
  if (!ALLOWED_KEYS.has(params.key)) return NextResponse.json({ success: false, message: `Unknown content key: "${params.key}"` }, { status: 400 });

  const { value } = await request.json();
  if (value === undefined) return NextResponse.json({ success: false, message: '`value` is required' }, { status: 400 });

  const { data, error } = await supabase.from('content_blocks').upsert({ key: params.key, value }, { onConflict: 'key' }).select().single();
  if (error) return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  return NextResponse.json({ success: true, data: { key: data.key, value: data.value, updatedAt: data.updated_at } });
}
