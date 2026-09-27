import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Captured before the client reads and clears the URL hash.
export const openedFromRecoveryLink = typeof window !== 'undefined' && window.location.hash.includes('type=recovery');

// Browser-safe client. The session is kept in localStorage and refreshed
// automatically, so members stay signed in between visits.
export const supabase = url && key
 ? createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } })
 : null;
