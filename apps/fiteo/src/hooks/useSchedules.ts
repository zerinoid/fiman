import { useState, useEffect, useCallback } from 'react';
import type { ClassSchedule } from '@fi/types';
import { supabase } from '../lib/supabase';

export interface CreateSchedulePayload {
  course_id: string;
  class_date: string;     // ISO timestamp
  proposed_theme: string;
  is_planned?: boolean;
}

export interface UseSchedulesReturn {
  schedules: ClassSchedule[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  createSchedule: (payload: CreateSchedulePayload) => Promise<boolean>;
  refresh: () => void;
}

/**
 * Fetches fiteo_class_schedules joined with fiteo_courses.
 * Optionally filtered by course_id.
 * Ordered by class_date descending (most recent first).
 */
export function useSchedules(courseId?: string | null): UseSchedulesReturn {
  const [schedules, setSchedules] = useState<ClassSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedules = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let query = (supabase as any)
        .from('fiteo_class_schedules')
        .select('*, course:fiteo_courses(*)')
        .order('class_date', { ascending: false });

      if (courseId) {
        query = query.eq('course_id', courseId);
      }

      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;
      setSchedules((data ?? []) as unknown as ClassSchedule[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar agenda de aulas');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => { fetchSchedules(); }, [fetchSchedules]);

  const createSchedule = async (payload: CreateSchedulePayload): Promise<boolean> => {
    setSaving(true);
    setError(null);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: insertError } = await (supabase as any)
        .from('fiteo_class_schedules')
        .insert({
          course_id: payload.course_id,
          class_date: payload.class_date,
          proposed_theme: payload.proposed_theme,
          is_planned: payload.is_planned ?? false,
        })
        .select('*, course:fiteo_courses(*)')
        .single();

      if (insertError) throw insertError;
      setSchedules((prev) => [data as unknown as ClassSchedule, ...prev]);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar aula');
      return false;
    } finally {
      setSaving(false);
    }
  };

  return { schedules, loading, saving, error, createSchedule, refresh: fetchSchedules };
}
