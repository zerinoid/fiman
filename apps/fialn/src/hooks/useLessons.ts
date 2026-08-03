import { useState, useEffect, useCallback } from 'react';
import type { Lesson } from '@fi/types';
import { supabase } from '../lib/supabase';

export interface NewLesson {
  person_id: string;
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
      .select('*')
      .eq('person_id', personId)
      .order('lesson_date', { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setLessons((data ?? []) as Lesson[]);
    }

    setLoading(false);
  }, [personId]);

  useEffect(() => { fetchLessons(); }, [fetchLessons]);

  /**
   * Insert a new lesson entry.
   * Returns true on success.
   */
  const addLesson = useCallback(
    async (lesson: NewLesson): Promise<boolean> => {
      setSaving(true);
      setError(null);

      const { data, error: insertError } = await supabase
        .from('fialn_lessons')
        .insert(lesson)
        .select()
        .single();

      setSaving(false);

      if (insertError) {
        setError(insertError.message);
        return false;
      }

      // Prepend so timeline stays newest-first
      setLessons((prev) => [data as Lesson, ...prev]);
      return true;
    },
    [],
  );

  return { lessons, loading, saving, error, addLesson, refresh: fetchLessons };
}
