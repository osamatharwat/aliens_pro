import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Read Supabase credentials from environment or runtime window object
const env = typeof import.meta !== 'undefined' && (import.meta as any).env ? (import.meta as any).env : {};

const supabaseUrl = 
  env.VITE_SUPABASE_URL || 
  (typeof window !== 'undefined' && (window as any).__SUPABASE_URL__) || 
  'https://tylnloctdtucsoeqyuwq.supabase.co';

const supabaseAnonKey = 
  env.VITE_SUPABASE_ANON_KEY || 
  (typeof window !== 'undefined' && (window as any).__SUPABASE_ANON_KEY__) || 
  'sb_publishable_D30wqDYj50kWZ91ZpSq6XQ_5cgILk17';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey &&
  !String(supabaseUrl).includes('placeholder')
);

// Create and export singleton Supabase client
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: 'sb_aliens_space_auth_token'
  }
});
