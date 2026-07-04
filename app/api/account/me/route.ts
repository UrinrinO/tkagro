import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-server';

async function getAuthUser(request: NextRequest) {
  const token = request.headers.get('authorization')?.split(' ')[1];
  if (!token) return null;
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  return NextResponse.json({
    success: true,
    data: { id: user.id, email: user.email, firstName: profile?.first_name ?? '', lastName: profile?.last_name ?? '', phone: profile?.phone ?? '' },
  });
}

export async function PATCH(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });

  const { firstName, lastName, phone } = await request.json();
  const { error } = await supabase.from('profiles').upsert({
    id: user.id, first_name: firstName ?? '', last_name: lastName ?? '',
    phone: phone ?? '', updated_at: new Date().toISOString(),
  });
  if (error) return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
