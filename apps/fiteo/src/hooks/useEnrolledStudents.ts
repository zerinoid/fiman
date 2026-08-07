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
 * Fetches active fialn_enrollments for students enrolled in a specific course during the class date.
 * Cross-module read: FITEO reads from fialn_enrollments (owned by FIALN) to
 * populate per-class attendance sheets without duplicating enrollment data.
 *
 * Matching strategy: The `fiteo_courses.schedule_day` ('Monday'/'Wednesday')
 * maps to `fialn_groups.weekday` (1 = Mon, 3 = Wed). We join via group_id.
 *
 * @param groupWeekday - The weekday number from fialn_groups (1=Mon, 3=Wed).
 * @param classDate    - The ISO string or YYYY-MM-DD date of the class schedule.
 */
export function useEnrolledStudents(
  groupWeekday: number | null,
  classDate: string | null = null,
): UseEnrolledStudentsReturn {
  const [students, setStudents] = useState<EnrolledStudent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStudents = useCallback(async () => {
    if (groupWeekday === null) { setStudents([]); return; }

    setLoading(true);
    setError(null);

    try {
      // Fetch enrollments for groups matching this weekday (ordered newest first)
      const { data, error: fetchError } = await supabase
        .from('fialn_enrollments')
        .select(`
          *,
          group:fialn_groups(*),
          person:people(id, full_name)
        `)
        .not('group_id', 'is', null)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const targetDate = classDate ? classDate.split('T')[0] : new Date().toISOString().split('T')[0];

      // Filter client-side to enrollments matching weekday, status and date validity window
      const filtered = (data ?? []).filter((enrollment: any) => {
        if (enrollment.group?.weekday !== groupWeekday) return false;

        const startDate = enrollment.start_date;
        const endDate = enrollment.end_date;
        const status = enrollment.status;

        // Enrollment must start on or before targetDate
        if (startDate && startDate > targetDate) return false;

        // If end_date exists, it must not be before targetDate
        if (endDate && endDate < targetDate) return false;

        // Status must be active (or completed if it covered targetDate)
        if (status !== 'active' && status !== 'completed') return false;

        return true;
      });

      // Deduplicate by person_id (keep only 1 enrollment per student)
      const personMap = new Map<string, EnrolledStudent>();
      for (const row of filtered) {
        const pid = row.person?.id ?? row.person_id;
        if (pid && !personMap.has(pid)) {
          personMap.set(pid, row as unknown as EnrolledStudent);
        }
      }

      setStudents(Array.from(personMap.values()));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar alunos matriculados');
    } finally {
      setLoading(false);
    }
  }, [groupWeekday, classDate]);

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
