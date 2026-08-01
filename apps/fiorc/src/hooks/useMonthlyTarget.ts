import { useState, useEffect, useCallback } from 'react';
import type { MonthlyTarget, CommitmentItem } from '@fi/types';
import { supabase } from '../lib/supabase';
import { toMonthDate } from '../utils/categories';
import { calculateSplitShare, inferSplitRuleAndCategory } from '../utils/splitting';

export interface UseMonthlyTargetReturn {
  target: MonthlyTarget | null;
  loading: boolean;
  error: string | null;
  upsertTarget: (updates: Partial<Omit<MonthlyTarget, 'id' | 'created_at'>>) => Promise<MonthlyTarget>;
  payCommitment: (commitmentId: string, transactionId?: string) => Promise<void>;
  unpayCommitment: (commitmentId: string, commitmentName: string) => Promise<void>;
  deleteCommitment: (commitmentId: string, commitmentName: string) => Promise<void>;
  refetch: () => void;
}

export function useMonthlyTarget(year: number, month: number, activeRoommatesCount: 2 | 3 = 3): UseMonthlyTargetReturn {
  const [target, setTarget] = useState<MonthlyTarget | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const enrichCommitment = useCallback((c: CommitmentItem): CommitmentItem => {
    const inferred = inferSplitRuleAndCategory(c.name);
    const category_type = c.category_type || inferred.categoryType;
    const split_rule = c.split_rule || inferred.splitRule;
    const is_active = c.is_active !== undefined ? c.is_active : true;

    const split = calculateSplitShare(c.amount, split_rule, activeRoommatesCount);

    return {
      ...c,
      category_type,
      split_rule,
      is_active,
      user_calculated_share: split.userCalculatedShare,
      receivables: split.receivables,
    };
  }, [activeRoommatesCount]);

  const fetchTarget = useCallback(async () => {
    setLoading(true);
    setError(null);

    const monthDate = toMonthDate(year, month);
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear  = month === 12 ? year + 1 : year;
    const nextMonthDate = toMonthDate(nextYear, nextMonth);

    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear  = month === 1 ? year - 1 : year;
    const prevMonthDate = toMonthDate(prevYear, prevMonth);

    // Fetch credit card transactions due in this target month
    const { data: ccTxs } = await supabase
      .from('fiorc_transactions')
      .select('amount')
      .gte('due_date', monthDate)
      .lt('due_date', nextMonthDate)
      .eq('is_credit_card', true);

    const ccTotal = ccTxs ? ccTxs.reduce((sum, tx) => sum + Number(tx.amount), 0) : 0;

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
      let rawCommitments: CommitmentItem[] = (data.commitments as unknown as CommitmentItem[]) || [];

      if (ccTotal > 0) {
        const existingCcIdx = rawCommitments.findIndex((c: CommitmentItem) => c.name === 'Fatura do Cartão');
        if (existingCcIdx >= 0) {
          rawCommitments[existingCcIdx] = { ...rawCommitments[existingCcIdx], amount: ccTotal };
        } else {
          rawCommitments.push({
            id: crypto.randomUUID(),
            name: 'Fatura do Cartão',
            amount: ccTotal,
            due_day: 8,
            is_paid: false,
            category_type: 'fixed',
            split_rule: 'none',
            is_active: true,
          });
        }
      } else {
        const existingCcIdx = rawCommitments.findIndex((c: CommitmentItem) => c.name === 'Fatura do Cartão');
        if (existingCcIdx >= 0 && !rawCommitments[existingCcIdx].is_paid) {
          rawCommitments[existingCcIdx] = { ...rawCommitments[existingCcIdx], amount: 0 };
        }
      }

      const commitments = rawCommitments.map(enrichCommitment);
      const totalTarget = commitments
        .filter(c => c.is_active !== false)
        .reduce((sum: number, c: CommitmentItem) => sum + (c.user_calculated_share ?? c.amount), 0);

      setTarget({ ...data, commitments, total_target: Math.round(totalTarget * 100) / 100 } as unknown as MonthlyTarget);
      setLoading(false);
      return;
    }

    // Auto-rollover seed from previous month
    const { data: prev } = await supabase
      .from('fiorc_monthly_targets')
      .select('*')
      .eq('month_year', prevMonthDate)
      .maybeSingle();

    let newCommitments: CommitmentItem[] = [];

    if (prev && prev.commitments) {
      const prevCommitments = prev.commitments as unknown as CommitmentItem[];
      newCommitments = prevCommitments.map((c: CommitmentItem) => ({
        ...c,
        is_paid: false,
      }));
    }

    if (ccTotal > 0) {
      const existingCcIdx = newCommitments.findIndex(c => c.name === 'Fatura do Cartão');
      if (existingCcIdx >= 0) {
        newCommitments[existingCcIdx].amount = ccTotal;
      } else {
        newCommitments.push({
          id: crypto.randomUUID(),
          name: 'Fatura do Cartão',
          amount: ccTotal,
          due_day: 8,
          is_paid: false,
          category_type: 'fixed',
          split_rule: 'none',
          is_active: true,
        });
      }
    }

    if (prev || newCommitments.length > 0) {
      const commitments = newCommitments.map(enrichCommitment);
      const totalTarget = commitments
        .filter(c => c.is_active !== false)
        .reduce((sum: number, c: CommitmentItem) => sum + (c.user_calculated_share ?? c.amount), 0);

      setTarget({
        ...(prev || {}),
        id: '',
        month_year: monthDate,
        commitments,
        notes: null,
        created_at: '',
        total_target: Math.round(totalTarget * 100) / 100,
      } as unknown as MonthlyTarget);
    } else {
      setTarget(null);
    }

    setLoading(false);
  }, [year, month, enrichCommitment]);

  useEffect(() => { fetchTarget(); }, [fetchTarget]);

  const upsertTarget = async (
    updates: Partial<Omit<MonthlyTarget, 'id' | 'created_at'>>,
  ): Promise<MonthlyTarget> => {
    const monthDate = toMonthDate(year, month);
    const enrichedCommitments = (updates.commitments || target?.commitments || []).map(enrichCommitment);
    const calculatedTotal = enrichedCommitments
      .filter(c => c.is_active !== false)
      .reduce((sum, c) => sum + (c.user_calculated_share ?? c.amount), 0);

    const payload = {
      ...updates,
      commitments: enrichedCommitments,
      total_target: Math.round(calculatedTotal * 100) / 100,
      month_year: monthDate,
    } as any;

    const { data, error: upsertErr } = await supabase
      .from('fiorc_monthly_targets')
      .upsert(payload, { onConflict: 'month_year' })
      .select()
      .single();

    if (upsertErr) throw new Error(upsertErr.message);

    const savedCommitments = ((data.commitments as unknown as CommitmentItem[]) || []).map(enrichCommitment);
    const saved = {
      ...data,
      commitments: savedCommitments,
      total_target: payload.total_target,
    } as unknown as MonthlyTarget;

    setTarget(saved);
    return saved;
  };

  const payCommitment = async (commitmentId: string, transactionId?: string): Promise<void> => {
    if (!target) return;

    const updatedCommitments = target.commitments.map(c =>
      c.id === commitmentId ? { ...c, is_paid: true, transaction_id: transactionId || c.transaction_id } : c
    );

    await upsertTarget({
      ...target,
      commitments: updatedCommitments,
    });
  };

  const unpayCommitment = async (commitmentId: string, commitmentName: string): Promise<void> => {
    if (!target) return;

    const commitmentToUnpay = target.commitments.find(c => c.id === commitmentId);
    const txId = commitmentToUnpay?.transaction_id;

    const updatedCommitments = target.commitments.map(c =>
      c.id === commitmentId ? { ...c, is_paid: false, transaction_id: null } : c
    );

    await upsertTarget({
      ...target,
      commitments: updatedCommitments,
    });

    const monthDate = toMonthDate(year, month);
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear  = month === 12 ? year + 1 : year;
    const nextMonthDate = toMonthDate(nextYear, nextMonth);

    if (txId) {
      await supabase.from('fiorc_transactions').delete().eq('id', txId);
    } else {
      await supabase
        .from('fiorc_transactions')
        .delete()
        .eq('description', commitmentName)
        .gte('due_date', monthDate)
        .lt('due_date', nextMonthDate);
    }
  };

  const deleteCommitment = async (commitmentId: string, commitmentName: string): Promise<void> => {
    if (!target) return;

    const commitmentToDelete = target.commitments.find(c => c.id === commitmentId);
    const txId = commitmentToDelete?.transaction_id;

    const updatedCommitments = target.commitments.filter(c => c.id !== commitmentId);

    await upsertTarget({
      ...target,
      commitments: updatedCommitments,
    });

    const monthDate = toMonthDate(year, month);
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear  = month === 12 ? year + 1 : year;
    const nextMonthDate = toMonthDate(nextYear, nextMonth);

    if (txId) {
      await supabase.from('fiorc_transactions').delete().eq('id', txId);
    } else {
      await supabase
        .from('fiorc_transactions')
        .delete()
        .eq('description', commitmentName)
        .gte('due_date', monthDate)
        .lt('due_date', nextMonthDate);
    }
  };

  return {
    target,
    loading,
    error,
    upsertTarget,
    payCommitment,
    unpayCommitment,
    deleteCommitment,
    refetch: fetchTarget,
  };
}
