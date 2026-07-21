/**
 * Auto-generated Supabase TypeScript types.
 *
 * DO NOT EDIT MANUALLY.
 *
 * To regenerate after schema changes, run from the monorepo root:
 *   pnpm supabase gen types typescript --project-id <your-project-ref> \
 *     > packages/db/src/types.gen.ts
 *
 * Or via Supabase CLI local dev:
 *   supabase gen types typescript --local > packages/db/src/types.gen.ts
 */

// Placeholder — replace with generated output after schema is applied.
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: Record<string, unknown>;
    Views: Record<string, never>;
    Functions: Record<string, unknown>;
    Enums: {
      user_role_type: 'admin' | 'collaborator';
      transaction_type: 'income' | 'expense';
      transaction_category:
        | 'housing_rent'
        | 'housing_condo'
        | 'utilities'
        | 'variable_expense'
        | 'savings_goal'
        | 'investment'
        | 'emergency_fund'
        | 'session'
        | 'private_lesson'
        | 'study_group'
        | 'workshop'
        | 'performance'
        | 'freelance_dev';
    };
    CompositeTypes: Record<string, never>;
  };
}
