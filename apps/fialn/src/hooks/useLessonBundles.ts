import { useState, useEffect, useCallback } from 'react';
import type { LessonBundle } from '@fi/types';
import { supabase } from '../lib/supabase';

export interface CreateBundlePayload {
  person_id: string;
  name: string;
  total_lessons: number;
  price: number;
  notes?: string | null;
  // Financial projection
  generateProjections?: boolean;
  total_installments?: number;
  amount_per_installment?: number;
  first_due_date?: string;
}

export interface UseLessonBundlesReturn {
  bundles: LessonBundle[];
  activeBundles: LessonBundle[];
  unconsumedLessonsCount: number;
  loading: boolean;
  saving: boolean;
  error: string | null;
  createBundle: (payload: CreateBundlePayload) => Promise<boolean>;
  consumeBundleLesson: (bundleId: string) => Promise<boolean>;
  refresh: () => void;
}

export function useLessonBundles(personId: string | null): UseLessonBundlesReturn {
  const [bundles, setBundles] = useState<LessonBundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBundles = useCallback(async () => {
    if (!personId) {
      setBundles([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchErr } = await supabase
        .from('fialn_lesson_bundles')
        .select('*')
        .eq('person_id', personId)
        .order('created_at', { ascending: false });

      if (fetchErr) throw fetchErr;
      setBundles((data ?? []) as LessonBundle[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar pacotes de aulas');
    } finally {
      setLoading(false);
    }
  }, [personId]);

  useEffect(() => { fetchBundles(); }, [fetchBundles]);

  const createBundle = async (payload: CreateBundlePayload): Promise<boolean> => {
    setSaving(true);
    setError(null);

    try {
      // 1. Insert bundle
      const { data: newBundle, error: insertErr } = await supabase
        .from('fialn_lesson_bundles')
        .insert({
          person_id: payload.person_id,
          name: payload.name.trim(),
          total_lessons: payload.total_lessons,
          used_lessons: 0,
          price: payload.price,
          status: 'active',
          notes: payload.notes?.trim() || null,
        })
        .select('*')
        .single();

      if (insertErr) throw insertErr;

      // 2. Generate financial projections if requested
      if (
        payload.generateProjections &&
        payload.total_installments &&
        payload.total_installments > 0 &&
        payload.amount_per_installment &&
        payload.amount_per_installment > 0 &&
        payload.first_due_date
      ) {
        const { error: rpcErr } = await supabase.rpc('fialn_create_plan_installments', {
          p_person_id: payload.person_id,
          p_category: 'private_lesson',
          p_total_installments: payload.total_installments,
          p_amount_per_installment: payload.amount_per_installment,
          p_first_due_date: payload.first_due_date,
          p_description: `Pacote: ${payload.name.trim()}`,
        });

        if (rpcErr) throw rpcErr;
      }

      setBundles((prev) => [newBundle as LessonBundle, ...prev]);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar pacote de aulas');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const consumeBundleLesson = async (bundleId: string): Promise<boolean> => {
    const bundle = bundles.find((b) => b.id === bundleId);
    if (!bundle) return false;

    const newUsed = bundle.used_lessons + 1;
    const isCompleted = newUsed >= bundle.total_lessons;
    const newStatus = isCompleted ? 'completed' : 'active';

    try {
      const { error: updateErr } = await supabase
        .from('fialn_lesson_bundles')
        .update({
          used_lessons: newUsed,
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', bundleId);

      if (updateErr) throw updateErr;

      setBundles((prev) =>
        prev.map((b) =>
          b.id === bundleId ? { ...b, used_lessons: newUsed, status: newStatus } : b
        )
      );
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao debitar aula do pacote');
      return false;
    }
  };

  const activeBundles = bundles.filter((b) => b.status === 'active');
  const unconsumedLessonsCount = activeBundles.reduce(
    (sum, b) => sum + Math.max(0, b.total_lessons - b.used_lessons),
    0
  );

  return {
    bundles,
    activeBundles,
    unconsumedLessonsCount,
    loading,
    saving,
    error,
    createBundle,
    consumeBundleLesson,
    refresh: fetchBundles,
  };
}
