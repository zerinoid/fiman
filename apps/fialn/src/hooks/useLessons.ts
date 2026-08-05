import { useState, useEffect, useCallback } from 'react';
import type { Lesson } from '@fi/types';
import { supabase } from '../lib/supabase';

export interface NewLesson {
  person_id: string;
  bundle_id?: string | null;
  lesson_date: string;       // ISO 8601 timestamp
  duration_hours: number;
  location: string;
  topics_covered: string;
  performance_notes: string | null;
  action_items: string | null;
}

export interface UseLessonsReturn {
  lessons: Lesson[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  addLesson: (lesson: NewLesson) => Promise<boolean>;
  refresh: () => void;
}

export function useLessons(personId: string | null): UseLessonsReturn {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLessons = useCallback(async () => {
    if (!personId) {
      setLessons([]);
      return;
    }
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from('fialn_lessons')
      .select(`
        *,
        bundle:fialn_lesson_bundles(*)
      `)
      .eq('person_id', personId)
      .order('lesson_date', { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setLessons((data ?? []) as unknown as Lesson[]);
    }

    setLoading(false);
  }, [personId]);

  useEffect(() => { fetchLessons(); }, [fetchLessons]);

  /**
   * Insert a new lesson entry and automatically update bundle usage if linked.
   */
  const addLesson = useCallback(
    async (lesson: NewLesson): Promise<boolean> => {
      setSaving(true);
      setError(null);

      const { data, error: insertError } = await supabase
        .from('fialn_lessons')
        .insert({
          person_id: lesson.person_id,
          bundle_id: lesson.bundle_id || null,
          lesson_date: lesson.lesson_date,
          duration_hours: lesson.duration_hours,
          location: lesson.location,
          topics_covered: lesson.topics_covered,
          performance_notes: lesson.performance_notes,
          action_items: lesson.action_items,
        })
        .select(`*, bundle:fialn_lesson_bundles(*)`)
        .single();

      if (insertError) {
        setError(insertError.message);
        setSaving(false);
        return false;
      }

      // If tied to a bundle, increment consumed lesson count
      if (lesson.bundle_id) {
        const { data: bData } = await supabase
          .from('fialn_lesson_bundles')
          .select('used_lessons, total_lessons')
          .eq('id', lesson.bundle_id)
          .single();

        if (bData) {
          const newUsed = bData.used_lessons + 1;
          const isCompleted = newUsed >= bData.total_lessons;
          await supabase
            .from('fialn_lesson_bundles')
            .update({
              used_lessons: newUsed,
              status: isCompleted ? 'completed' : 'active',
              updated_at: new Date().toISOString(),
            })
            .eq('id', lesson.bundle_id);
        }
      }

      setSaving(false);
      setLessons((prev) => [data as unknown as Lesson, ...prev]);
      return true;
    },
    [],
  );

  return { lessons, loading, saving, error, addLesson, refresh: fetchLessons };
}
