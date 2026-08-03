import { useState, useEffect, useCallback } from 'react';
import type { Person, StudentProfile } from '@fi/types';
import { supabase } from '../lib/supabase';

export interface StudentWithProfile extends Person {
  profile: StudentProfile | null;
}

export interface UseStudentsReturn {
  students: StudentWithProfile[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useStudents(): UseStudentsReturn {
  const [students, setStudents] = useState<StudentWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => { fetch(); }, [fetch]);

  return { students, loading, error, refresh: fetch };
}
