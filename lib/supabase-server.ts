import { createClient } from '@supabase/supabase-js';

const url = process.env.TKAYS_SUPABASE_URL!;
const key = process.env.TKAYS_SERVICE_ROLE_KEY!;

if (!url || !key) throw new Error('Missing TKAYS_SUPABASE_URL or TKAYS_SERVICE_ROLE_KEY');

export const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
  global: {
    // Next.js 14 patches global fetch for caching; passing cache:'no-store'
    // opts out of that layer so Supabase requests go through cleanly.
    fetch: (input, init) => fetch(input, { ...init, cache: 'no-store' }),
  },
});
