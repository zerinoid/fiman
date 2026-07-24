import { useState, useEffect, useCallback } from 'react';
import type { MonthlyTarget, CommitmentItem } from '@fi/types';
import { supabase } from '../lib/supabase';
import { toMonthDate } from '../utils/categories';

export interface UseMonthlyTargetReturn {
  target: MonthlyTarget | null;
  loading: boolean;
  error: string | null;
  upsertTarget: (updates: Partial<Omit<MonthlyTarget, 'id' | 'created_at'>>) => Promise<MonthlyTarget>;
  payCommitment: (commitmentId: string) => Promise<void>;
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
      // Ensure commitments is an array
      setTarget({ ...data, commitments: data.commitments || [] } as MonthlyTarget);
      setLoading(false);
      return;
    }

    // ── Auto-rollover: seed from previous month if no target exists ──
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear  = month === 1 ? year - 1 : year;
    const prevMonthDate = toMonthDate(prevYear, prevMonth);

    const { data: prev } = await supabase
      .from('fiorc_monthly_targets')
      .select('*')
      .eq('month_year', prevMonthDate)
      .maybeSingle();

    let newCommitments: CommitmentItem[] = [];

    if (prev && prev.commitments) {
      newCommitments = prev.commitments.map((c: CommitmentItem) => ({
        ...c,
        is_paid: false,
      }));
    }

    // Fetch previous month credit card transactions
    const nextOfPrevMonth = prevMonth === 12 ? 1 : prevMonth + 1;
    const nextOfPrevYear  = prevMonth === 12 ? prevYear + 1 : prevYear;
    
    const { data: ccTxs } = await supabase
      .from('fiorc_transactions')
      .select('amount')
      .gte('due_date', prevMonthDate)
      .lt('due_date', toMonthDate(nextOfPrevYear, nextOfPrevMonth))
      .eq('is_credit_card', true);

    if (ccTxs && ccTxs.length > 0) {
      const ccTotal = ccTxs.reduce((sum, tx) => sum + Number(tx.amount), 0);
      if (ccTotal > 0) {
        newCommitments.push({
          id: crypto.randomUUID(),
          name: 'Fatura do Cartão',
          amount: ccTotal,
          due_day: 8,
          is_paid: false,
        });
      }
    }

    if (prev || newCommitments.length > 0) {
      // Unsaved draft — user must confirm before persisting
      setTarget({
        ...(prev || {}),
        id: '',
        month_year: monthDate,
        commitments: newCommitments,
        notes: null,
        created_at: '',
        total_target: newCommitments.reduce((sum, c) => sum + c.amount, 0),
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

    const saved = { ...data, commitments: data.commitments || [] } as MonthlyTarget;
    setTarget(saved);
    return saved;
  };

  const payCommitment = async (commitmentId: string): Promise<void> => {
    if (!target) return;
    
    const updatedCommitments = target.commitments.map(c => 
      c.id === commitmentId ? { ...c, is_paid: true } : c
    );
    
    await upsertTarget({
      ...target,
      commitments: updatedCommitments,
    });
  };

  return { target, loading, error, upsertTarget, payCommitment, refetch: fetchTarget };
}
