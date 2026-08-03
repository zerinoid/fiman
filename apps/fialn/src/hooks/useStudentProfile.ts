import { useState, useEffect, useCallback } from 'react';
import type { StudentProfile } from '@fi/types';
import { supabase } from '../lib/supabase';

export interface ProfileUpdatePayload {
  strengths: string | null;
  dificulties: string | null;
  growth_pathway: string | null;
}

export interface UseStudentProfileReturn {
  profile: StudentProfile | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  saveProfile: (payload: ProfileUpdatePayload) => Promise<boolean>;
}

export function useStudentProfile(personId: string | null): UseStudentProfileReturn {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!personId) return;
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from('fialn_student_profiles')
      .select('*')
      .eq('person_id', personId)
      .maybeSingle();

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setProfile(data as StudentProfile | null);
    }

    setLoading(false);
  }, [personId]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  /**
   * Upsert the qualitative profile fields for this student.
   * If no profile row exists, one is created.
   * Returns true on success.
   */
  const saveProfile = useCallback(
    async (payload: ProfileUpdatePayload): Promise<boolean> => {
      if (!personId) return false;
      setSaving(true);
      setError(null);

      const upsertData = { person_id: personId, ...payload };

      const { data, error: upsertError } = await supabase
        .from('fialn_student_profiles')
        .upsert(upsertData, { onConflict: 'person_id' })
        .select()
        .single();

      setSaving(false);

      if (upsertError) {
        setError(upsertError.message);
        return false;
      }

      setProfile(data as StudentProfile);
      return true;
    },
    [personId],
  );

  return { profile, loading, saving, error, saveProfile };
}
