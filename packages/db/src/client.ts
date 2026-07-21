import { createClient } from '@supabase/supabase-js';
import type { Database } from './types.gen';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '[fi/db] Missing Supabase environment variables.\n' +
      'Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env.local file.'
  );
}

/**
 * Singleton Supabase client for the FI Ecosystem.
 * Shared across all apps via the @fi/db workspace package.
 *
 * NOTE: Uses the publishable anon key only. The service_role key
 * must NEVER be used in frontend code.
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export type SupabaseClient = typeof supabase;
