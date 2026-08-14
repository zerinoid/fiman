import { useState, useEffect, useCallback } from 'react';
import type { ClassSchedule } from '@fi/types';
import { supabase } from '../lib/supabase';

export interface CreateSchedulePayload {
  course_id: string;
  class_date: string;          // ISO timestamp
  proposed_theme: string;      // Title
  theme_description?: string | null; // Description
  is_planned?: boolean;
  techniques?: string[];
  has_photo_content?: boolean;
  has_video_content?: boolean;
  is_highlighted?: boolean;
  is_cancelled?: boolean;
}

export interface UpdateSchedulePayload {
  course_id?: string;
  class_date?: string;
  proposed_theme?: string;
  theme_description?: string | null;
  is_planned?: boolean;
  techniques?: string[];
  has_photo_content?: boolean;
  has_video_content?: boolean;
  is_highlighted?: boolean;
  is_cancelled?: boolean;
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
 * Helper to auto-mark past classes as planned
 */
function normalizeClassSchedule(item: any): ClassSchedule {
  const isPast = new Date(item.class_date).getTime() < Date.now();
  return {
    ...item,
    is_planned: isPast || Boolean(item.is_planned),
    techniques: Array.isArray(item.techniques) ? item.techniques : [],
    has_photo_content: Boolean(item.has_photo_content),
    has_video_content: Boolean(item.has_video_content),
    is_highlighted: Boolean(item.is_highlighted),
    is_cancelled: Boolean(item.is_cancelled),
  };
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
      const normalized = (data ?? []).map(normalizeClassSchedule);
      setSchedules(normalized);
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

    const isPast = new Date(payload.class_date).getTime() < Date.now();
    const finalIsPlanned = isPast || Boolean(payload.is_planned);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: insertError } = await (supabase as any)
        .from('fiteo_class_schedules')
        .insert({
          course_id: payload.course_id,
          class_date: payload.class_date,
          proposed_theme: payload.proposed_theme,
          theme_description: payload.theme_description ?? null,
          is_planned: finalIsPlanned,
          techniques: payload.techniques ?? [],
          has_photo_content: payload.has_photo_content ?? false,
          has_video_content: payload.has_video_content ?? false,
          is_highlighted: payload.is_highlighted ?? false,
          is_cancelled: payload.is_cancelled ?? false,
        })
        .select('*, course:fiteo_courses(*)')
        .single();

      if (insertError) throw insertError;
      setSchedules((prev) => [normalizeClassSchedule(data), ...prev]);
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
      const updateData: Record<string, any> = {};
      if (payload.course_id !== undefined) updateData.course_id = payload.course_id;
      if (payload.class_date !== undefined) updateData.class_date = payload.class_date;
      if (payload.proposed_theme !== undefined) updateData.proposed_theme = payload.proposed_theme;
      if (payload.theme_description !== undefined) updateData.theme_description = payload.theme_description;
      if (payload.techniques !== undefined) updateData.techniques = payload.techniques;
      if (payload.has_photo_content !== undefined) updateData.has_photo_content = payload.has_photo_content;
      if (payload.has_video_content !== undefined) updateData.has_video_content = payload.has_video_content;
      if (payload.is_highlighted !== undefined) updateData.is_highlighted = payload.is_highlighted;
      if (payload.is_cancelled !== undefined) updateData.is_cancelled = payload.is_cancelled;

      if (payload.class_date !== undefined) {
        const isPast = new Date(payload.class_date).getTime() < Date.now();
        if (isPast) {
          updateData.is_planned = true;
        } else if (payload.is_planned !== undefined) {
          updateData.is_planned = payload.is_planned;
        }
      } else if (payload.is_planned !== undefined) {
        updateData.is_planned = payload.is_planned;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: updateError } = await (supabase as any)
        .from('fiteo_class_schedules')
        .update(updateData)
        .eq('id', id)
        .select('*, course:fiteo_courses(*)')
        .single();

      if (updateError) throw updateError;
      setSchedules((prev) =>
        prev.map((s) => (s.id === id ? normalizeClassSchedule(data) : s)),
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
