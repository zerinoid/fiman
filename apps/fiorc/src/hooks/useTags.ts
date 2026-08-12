import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useTags() {
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTags = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase.rpc as any)('fiorc_get_distinct_tags');
      if (!error && Array.isArray(data)) {
        setTags(data.filter((t: unknown): t is string => typeof t === 'string' && t.trim().length > 0));
      } else {
        // Fallback: fetch directly from fiorc_transactions
        const { data: txs } = await supabase
          .from('fiorc_transactions')
          .select('tags')
          .not('tags', 'is', null);

        if (txs) {
          const tagSet = new Set<string>();
          for (const tx of txs) {
            if (Array.isArray(tx.tags)) {
              for (const tag of tx.tags) {
                if (tag && typeof tag === 'string' && tag.trim()) {
                  tagSet.add(tag.trim());
                }
              }
            }
          }
          setTags(Array.from(tagSet).sort());
        }
      }
    } catch {
      // Ignore error and leave tags state as is
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  return { tags, loading, refetchTags: fetchTags };
}
