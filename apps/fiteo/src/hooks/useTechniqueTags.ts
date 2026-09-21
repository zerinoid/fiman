import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface UseTechniqueTagsReturn {
  existingTags: string[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

/**
 * Hook to retrieve distinct technique tags across all schedules in FITEO.
 * Deduplicates and sorts tags alphabetically.
 */
export function useTechniqueTags(): UseTechniqueTagsReturn {
  const [existingTags, setExistingTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTags = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: queryError } = await (supabase as any)
        .from('fiteo_class_schedules')
        .select('techniques');

      if (queryError) throw queryError;

      const tagSet = new Set<string>();
      if (Array.isArray(data)) {
        for (const row of data) {
          if (Array.isArray(row.techniques)) {
            for (const tag of row.techniques) {
              const cleaned = (tag || '').trim().replace(/^#/, '');
              if (cleaned) {
                tagSet.add(cleaned);
              }
            }
          }
        }
      }

      const sortedTags = Array.from(tagSet).sort((a, b) =>
        a.localeCompare(b, undefined, { sensitivity: 'base' })
      );

      setExistingTags(sortedTags);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar tags existentes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  return {
    existingTags,
    loading,
    error,
    refresh: fetchTags,
  };
}
