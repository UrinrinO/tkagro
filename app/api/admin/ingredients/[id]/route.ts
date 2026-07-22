import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-server';

const VALID_TYPES = ['traditional_african', 'natural', 'organic', 'herbal', 'vegan'];

async function requireAdmin(request: NextRequest) {
  const token = request.headers.get('authorization')?.split(' ')[1];
  if (!token) return null;
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  const { data } = await supabase.from('admin_users').select('user_id').eq('user_id', user.id).single();
  return data ? user : null;
}

function toDTO(i: any) {
  return {
    id: i.id,
    name: i.name,
    origin: i.origin,
    type: i.type,
    description: i.description ?? '',
    detail: i.detail ?? null,
    benefits: i.benefits ?? [],
    sortOrder: i.sort_order ?? 0,
    createdAt: i.created_at,
    updatedAt: i.updated_at,
  };
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireAdmin(request);
  if (!user) return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 });

  const { name, origin, type, description, detail, benefits, sortOrder } = await request.json();
  if (!name) return NextResponse.json({ success: false, message: 'name is required' }, { status: 400 });
  if (!origin) return NextResponse.json({ success: false, message: 'origin is required' }, { status: 400 });
  if (!description) return NextResponse.json({ success: false, message: 'description is required' }, { status: 400 });
  if (!VALID_TYPES.includes(type)) {
    return NextResponse.json({ success: false, message: `type must be one of: ${VALID_TYPES.join(', ')}` }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('ingredients')
    .update({
      name,
      origin,
      type,
      description,
      detail: detail || null,
      benefits: Array.isArray(benefits) ? benefits : [],
      sort_order: sortOrder ?? 0,
      updated_at: new Date().toISOString(),
    })
    .eq('id', params.id)
    .select()
    .single();
  if (error) return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  return NextResponse.json({ success: true, data: { ingredient: toDTO(data) } });
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireAdmin(request);
  if (!user) return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 });
  const { error } = await supabase.from('ingredients').delete().eq('id', params.id);
  if (error) return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
