import { useState, useEffect, useCallback } from 'react';
import type { ClassSchedule } from '@fi/types';
import { supabase } from '../lib/supabase';

export interface CreateSchedulePayload {
  course_id: string;
  class_date: string;          // ISO timestamp
  proposed_theme: string;      // Title
  theme_description?: string | null; // Description
  is_planned?: boolean;
}

export interface UpdateSchedulePayload {
  course_id?: string;
  class_date?: string;
  proposed_theme?: string;
  theme_description?: string | null;
  is_planned?: boolean;
}

export interface UseSchedulesReturn {
  schedules: ClassSchedule[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  createSchedule: (payload: CreateSchedulePayload) => Promise<boolean>;
  updateSchedule: (id: string, payload: UpdateSchedulePayload) => Promise<boolean>;
  deleteSchedule: (id: string, classDate: string) => Promise<{ success: boolean; error?: string }>;
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
          theme_description: payload.theme_description ?? null,
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

  const updateSchedule = async (id: string, payload: UpdateSchedulePayload): Promise<boolean> => {
    setSaving(true);
    setError(null);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: updateError } = await (supabase as any)
        .from('fiteo_class_schedules')
        .update({
          ...(payload.course_id !== undefined && { course_id: payload.course_id }),
          ...(payload.class_date !== undefined && { class_date: payload.class_date }),
          ...(payload.proposed_theme !== undefined && { proposed_theme: payload.proposed_theme }),
          ...(payload.theme_description !== undefined && { theme_description: payload.theme_description }),
          ...(payload.is_planned !== undefined && { is_planned: payload.is_planned }),
        })
        .eq('id', id)
        .select('*, course:fiteo_courses(*)')
        .single();

      if (updateError) throw updateError;
      setSchedules((prev) =>
        prev.map((s) => (s.id === id ? (data as unknown as ClassSchedule) : s)),
      );
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar aula');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const deleteSchedule = async (
    id: string,
    classDate: string,
  ): Promise<{ success: boolean; error?: string }> => {
    // Immortality check: Only future scheduled classes can be deleted
    const isFuture = new Date(classDate).getTime() > Date.now();
    if (!isFuture) {
      const msg = 'Aulas já realizadas possuem histórico de presença e não podem ser excluídas.';
      setError(msg);
      return { success: false, error: msg };
    }

    setSaving(true);
    setError(null);

    try {
      const { error: deleteError } = await supabase
        .from('fiteo_class_schedules')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      setSchedules((prev) => prev.filter((s) => s.id !== id));
      return { success: true };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao excluir aula';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setSaving(false);
    }
  };

  return {
    schedules,
    loading,
    saving,
    error,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    refresh: fetchSchedules,
  };
}
