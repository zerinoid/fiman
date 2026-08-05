import { useState, useEffect, useCallback } from 'react';
import type { Person, StudentProfile } from '@fi/types';
import { supabase } from '../lib/supabase';

export interface StudentWithProfile extends Person {
  profile: StudentProfile | null;
}

export interface CreateStudentPayload {
  full_name: string;
  phone?: string | null;
  email?: string | null;
  notes?: string | null;
  financial_status?: string | null;
}

export interface UpdateStudentPayload {
  full_name: string;
  phone?: string | null;
  email?: string | null;
  notes?: string | null;
  financial_status?: string | null;
}

export interface UseStudentsReturn {
  students: StudentWithProfile[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  refresh: () => void;
  createStudent: (payload: CreateStudentPayload) => Promise<boolean>;
  updateStudent: (personId: string, payload: UpdateStudentPayload) => Promise<boolean>;
}

export function useStudents(): UseStudentsReturn {
  const [students, setStudents] = useState<StudentWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch all people who are students
      const { data: people, error: peopleError } = await supabase
        .from('people')
        .select('*')
        .eq('is_student', true)
        .order('full_name');

      if (peopleError) throw peopleError;

      if (!people || people.length === 0) {
        setStudents([]);
        return;
      }

      // Fetch all student profiles for those people
      const personIds = people.map((p) => p.id);
      const { data: profiles, error: profilesError } = await supabase
        .from('fialn_student_profiles')
        .select('*')
        .in('person_id', personIds);

      if (profilesError) throw profilesError;

      // Join in memory
      const profileMap = new Map<string, StudentProfile>(
        (profiles ?? [])
          .filter((p): p is typeof p & { person_id: string } => p.person_id !== null)
          .map((p) => [p.person_id, p as StudentProfile]),
      );

      setStudents(
        (people as Person[]).map((person) => ({
          ...person,
          profile: profileMap.get(person.id) ?? null,
        })),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar alunos');
    } finally {
      setLoading(false);
    }
  }, []);

  const createStudent = useCallback(
    async (payload: CreateStudentPayload): Promise<boolean> => {
      setSaving(true);
      setError(null);

      try {
        const { data: person, error: personError } = await supabase
          .from('people')
          .insert({
            full_name: payload.full_name.trim(),
            phone: payload.phone?.trim() || null,
            email: payload.email?.trim() || null,
            notes: payload.notes?.trim() || null,
            is_student: true,
            is_client: false,
          })
          .select()
          .single();

        if (personError) throw personError;

        const { error: profileError } = await supabase
          .from('fialn_student_profiles')
          .insert({
            person_id: person.id,
            financial_status: payload.financial_status || 'em_dia',
          });

        if (profileError) throw profileError;

        await fetch();
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao cadastrar aluno');
        return false;
      } finally {
        setSaving(false);
      }
    },
    [fetch],
  );

  const updateStudent = useCallback(
    async (personId: string, payload: UpdateStudentPayload): Promise<boolean> => {
      setSaving(true);
      setError(null);

      try {
        // 1. Update people record
        const { error: personError } = await supabase
          .from('people')
          .update({
            full_name: payload.full_name.trim(),
            phone: payload.phone?.trim() || null,
            email: payload.email?.trim() || null,
            notes: payload.notes?.trim() || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', personId);

        if (personError) throw personError;

        // 2. Upsert financial status in fialn_student_profiles
        if (payload.financial_status) {
          const { error: profileError } = await supabase
            .from('fialn_student_profiles')
            .upsert(
              {
                person_id: personId,
                financial_status: payload.financial_status,
              },
              { onConflict: 'person_id' }
            );

          if (profileError) throw profileError;
        }

        await fetch();
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao atualizar dados do aluno');
        return false;
      } finally {
        setSaving(false);
      }
    },
    [fetch],
  );

  useEffect(() => { fetch(); }, [fetch]);

  return { students, loading, saving, error, refresh: fetch, createStudent, updateStudent };
}
