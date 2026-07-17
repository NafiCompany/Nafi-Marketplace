import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL || 'https://example.supabase.co';
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || 'missing-key';

export const supabaseAdmin = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
});
