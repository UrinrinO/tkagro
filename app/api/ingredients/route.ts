import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-server';

const VALID_TYPES = ['traditional_african', 'natural', 'organic', 'herbal', 'vegan'];

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
  };
}

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get('type');

  let query = supabase
    .from('ingredients')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });

  if (type && VALID_TYPES.includes(type)) {
    query = query.eq('type', type);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data: { ingredients: (data ?? []).map(toDTO) } });
}
