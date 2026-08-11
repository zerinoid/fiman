import { useState, useEffect, useCallback } from 'react';
import type { StudentTransaction } from '@fi/types';
import { supabase } from '../lib/supabase';

/** A FIALN transaction mapped to FIORC display format. */
export interface FialnProjection extends StudentTransaction {
  person_name: string | null;
  /** Display type derived from split_type: 'receivable' → income, 'debt' → expense */
  display_type: 'income' | 'expense';
}

export interface UseFialnProjectionsReturn {
  projections: FialnProjection[];
  totalReceivable: number;   // sum of receivable split_amounts
  totalDebt: number;         // sum of debt split_amounts
  netBalance: number;        // totalReceivable - totalDebt
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

/** Returns the last day of the given month/year as a YYYY-MM-DD string. */
function lastDayOfMonth(year: number, month: number): string {
  const d = new Date(year, month, 0); // day 0 of next month = last day of current
  const mm = String(month).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

/**
 * Fetches FIALN student transactions whose fiorc_projection_due_date falls in the given month.
 * These are displayed in FIORC TransactionsPage alongside regular transactions.
 * Only admin can query this (enforced by Supabase RLS via is_associate_or_admin — admin qualifies).
 */
export function useFialnProjections(year: number, month: number): UseFialnProjectionsReturn {
  const [projections, setProjections] = useState<FialnProjection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const firstDay = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay  = lastDayOfMonth(year, month);

  const fetchProjections = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('fialn_student_transactions')
        .select(`
          *,
          person:people(full_name)
        `)
        .eq('fiorc_status', 'pending')
        .gte('fiorc_projection_due_date', firstDay)
        .lte('fiorc_projection_due_date', lastDay)
        .order('fiorc_projection_due_date', { ascending: true });

      if (fetchError) throw fetchError;

      const mapped: FialnProjection[] = (data ?? []).map((row) => {
        const person = (row as unknown as { person: { full_name: string } | null }).person;
        return {
          ...(row as unknown as StudentTransaction),
          person_name: person?.full_name ?? null,
          display_type: row.split_type === 'receivable' ? 'income' : 'expense',
        } as FialnProjection;
      });

      setProjections(mapped);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar projeções FIALN');
    } finally {
      setLoading(false);
    }
  }, [firstDay, lastDay]);

  useEffect(() => { fetchProjections(); }, [fetchProjections]);

  const totalReceivable = projections
    .filter((p) => p.split_type === 'receivable')
    .reduce((acc, p) => acc + p.split_amount, 0);

  const totalDebt = projections
    .filter((p) => p.split_type === 'debt')
    .reduce((acc, p) => acc + p.split_amount, 0);

  return {
    projections,
    totalReceivable,
    totalDebt,
    netBalance: totalReceivable - totalDebt,
    loading,
    error,
    refresh: fetchProjections,
  };
}
