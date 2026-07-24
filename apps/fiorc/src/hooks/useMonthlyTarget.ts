import { useState, useEffect, useCallback } from 'react';
import type { MonthlyTarget } from '@fi/types';
import { supabase } from '../lib/supabase';
import { toMonthDate } from '../utils/categories';

export interface UseMonthlyTargetReturn {
  target: MonthlyTarget | null;
  loading: boolean;
  error: string | null;
  upsertTarget: (updates: Partial<Omit<MonthlyTarget, 'id' | 'created_at'>>) => Promise<MonthlyTarget>;
  refetch: () => void;
}

export function useMonthlyTarget(year: number, month: number): UseMonthlyTargetReturn {
  const [target, setTarget] = useState<MonthlyTarget | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTarget = useCallback(async () => {
    setLoading(true);
    setError(null);

    const monthDate = toMonthDate(year, month);

    const { data, error: fetchErr } = await supabase
      .from('fiorc_monthly_targets')
      .select('*')
      .eq('month_year', monthDate)
      .maybeSingle();

    if (fetchErr) {
      setError(fetchErr.message);
      setLoading(false);
      return;
    }

    if (data) {
      setTarget(data as MonthlyTarget);
      setLoading(false);
      return;
    }

    // ── Auto-rollover: seed from previous month if no target exists ──
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear  = month === 1 ? year - 1 : year;

    const { data: prev } = await supabase
      .from('fiorc_monthly_targets')
      .select('*')
      .eq('month_year', toMonthDate(prevYear, prevMonth))
      .maybeSingle();

    if (prev) {
      // Unsaved draft — user must confirm before persisting
      setTarget({
        ...prev,
        id: '',
        month_year: monthDate,
        emergency_fund_completed: false,
        notes: null,
        created_at: '',
      } as MonthlyTarget);
    } else {
      setTarget(null);
    }

    setLoading(false);
  }, [year, month]);

  useEffect(() => { fetchTarget(); }, [fetchTarget]);

  const upsertTarget = async (
    updates: Partial<Omit<MonthlyTarget, 'id' | 'created_at'>>,
  ): Promise<MonthlyTarget> => {
    const monthDate = toMonthDate(year, month);
    const payload = { ...updates, month_year: monthDate };

    const { data, error: upsertErr } = await supabase
      .from('fiorc_monthly_targets')
      .upsert(payload, { onConflict: 'month_year' })
      .select()
      .single();

    if (upsertErr) throw new Error(upsertErr.message);

    const saved = data as MonthlyTarget;
    setTarget(saved);
    return saved;
  };

  return { target, loading, error, upsertTarget, refetch: fetchTarget };
}
