import { useState, useEffect } from 'react';
import type { SupabaseClient } from '../lib/supabase';
import { supabase } from '../lib/supabase';

type Session = Awaited<ReturnType<SupabaseClient['auth']['getSession']>>['data']['session'];

export interface UseAuthReturn {
  session: Session | null;
  loading: boolean;
  signInWithPassword: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
        setLoading(false);
      },
    );

    return () => subscription.unsubscribe();
  }, []);

  const signInWithPassword = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return {
    session,
    loading,
    signInWithPassword,
    signOut,
  };
}
