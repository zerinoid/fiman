import { useState, useEffect, useCallback } from 'react';
import type { StudentEnrollment } from '@fi/types';
import { supabase } from '../lib/supabase';

/** Enrollment joined with the person entity for display in attendance sheets. */
export interface EnrolledStudent extends StudentEnrollment {
  person: {
    id: string;
    full_name: string;
  } | null;
}

export interface UseEnrolledStudentsReturn {
  students: EnrolledStudent[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

/**
 * Fetches active fialn_enrollments for students enrolled in a specific course.
 * Cross-module read: FITEO reads from fialn_enrollments (owned by FIALN) to
 * populate per-class attendance sheets without duplicating enrollment data.
 *
 * Matching strategy: The `fiteo_courses.schedule_day` ('Monday'/'Wednesday')
 * maps to `fialn_groups.weekday` (1 = Mon, 3 = Wed). We join via group_id.
 *
 * @param groupWeekday - The weekday number from fialn_groups (1=Mon, 3=Wed).
 *                       Pass null to skip fetching.
 */
export function useEnrolledStudents(groupWeekday: number | null): UseEnrolledStudentsReturn {
  const [students, setStudents] = useState<EnrolledStudent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStudents = useCallback(async () => {
    if (groupWeekday === null) { setStudents([]); return; }

    setLoading(true);
    setError(null);

    try {
      // Fetch active enrollments for groups matching this weekday
      const { data, error: fetchError } = await supabase
        .from('fialn_enrollments')
        .select(`
          *,
          group:fialn_groups(*),
          person:people(id, full_name)
        `)
        .eq('status', 'active')
        .not('group_id', 'is', null);

      if (fetchError) throw fetchError;

      // Filter client-side to enrollments whose group.weekday matches
      const filtered = (data ?? []).filter(
        (enrollment: any) => enrollment.group?.weekday === groupWeekday,
      ) as unknown as EnrolledStudent[];

      setStudents(filtered);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar alunos matriculados');
    } finally {
      setLoading(false);
    }
  }, [groupWeekday]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  return { students, loading, error, refresh: fetchStudents };
}

/**
 * Maps a fiteo_courses.schedule_day string to a fialn_groups weekday integer.
 * Returns null if the day is not recognized.
 */
export function scheduleDayToWeekday(scheduleDay: string): number | null {
  const map: Record<string, number> = {
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
    Sunday: 0,
  };
  return map[scheduleDay] ?? null;
}
