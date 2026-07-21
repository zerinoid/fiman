// Re-export the shared Supabase client from @fi/db.
// Use this import within the fiorc app instead of importing @supabase/supabase-js directly.
export { supabase } from '@fi/db';
export type { SupabaseClient } from '@fi/db';
