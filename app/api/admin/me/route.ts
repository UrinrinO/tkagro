import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  const token = request.headers.get('authorization')?.split(' ')[1];
  if (!token) return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return NextResponse.json({ success: false, message: 'Invalid or expired token' }, { status: 401 });

  const { data: adminUser } = await supabase.from('admin_users').select('user_id').eq('user_id', user.id).single();
  if (!adminUser) return NextResponse.json({ success: false, message: 'Not an admin' }, { status: 403 });

  return NextResponse.json({ success: true, data: { id: user.id, email: user.email } });
}
