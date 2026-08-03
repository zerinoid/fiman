import { useState, useEffect, useCallback } from 'react';
import type { CourseTrack } from '@fi/types';
import { supabase } from '../lib/supabase';

export interface UseCoursesReturn {
  courses: CourseTrack[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

/**
 * Fetches all active fiteo_courses from the database.
 * Returns only active courses ordered by schedule_day.
 */
export function useCourses(): UseCoursesReturn {
  const [courses, setCourses] = useState<CourseTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: fetchError } = await (supabase as any)
        .from('fiteo_courses')
        .select('*')
        .eq('active', true)
        .order('schedule_day');

      if (fetchError) throw fetchError;
      // Cast via unknown: fiteo_courses is a new table not yet in generated DB types.
      // Will resolve once DB types are regenerated after migration is applied.
      setCourses((data ?? []) as unknown as CourseTrack[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar trilhas de curso');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  return { courses, loading, error, refresh: fetchCourses };
}
