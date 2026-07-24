import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Transaction } from '@fi/types';
import { supabase } from '../lib/supabase';
import { toMonthDate } from '../utils/categories';

export type NewTransaction = Omit<Transaction, 'id' | 'created_at'>;

export interface UseTransactionsReturn {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  totalIncome: number;
  totalExpenses: number;
  totalProjected: number;
  addTransaction: (tx: NewTransaction | NewTransaction[]) => Promise<Transaction[]>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<Transaction>;
  deleteTransaction: (id: string) => Promise<void>;
  refetch: () => void;
}

export function useTransactions(year: number, month: number): UseTransactionsReturn {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);

    const startDate = toMonthDate(year, month);
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear  = month === 12 ? year + 1 : year;
    const endDate   = toMonthDate(nextYear, nextMonth);

    const { data, error: fetchErr } = await supabase
      .from('fiorc_transactions')
      .select('*')
      .gte('due_date', startDate)
      .lt('due_date', endDate)
      .order('due_date', { ascending: false });

    if (fetchErr) {
      setError(fetchErr.message);
    } else {
      setTransactions((data ?? []) as Transaction[]);
    }

    setLoading(false);
  }, [year, month]);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  const addTransaction = useCallback(
    async (tx: NewTransaction | NewTransaction[]): Promise<Transaction[]> => {
      const payload = Array.isArray(tx) ? tx : [tx];

      const { data, error: insertErr } = await supabase
        .from('fiorc_transactions')
        .insert(payload)
        .select();

      if (insertErr) throw new Error(insertErr.message);

      const inserted = (data ?? []) as Transaction[];
      // Optimistic prepend — only keep those in the current month view
      setTransactions(prev => [...inserted, ...prev]);
      return inserted;
    },
    [],
  );

  const updateTransaction = useCallback(async (id: string, updates: Partial<Transaction>) => {
    const { data, error: updateErr } = await supabase
      .from('fiorc_transactions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (updateErr) throw new Error(updateErr.message);

    const updated = data as Transaction;
    setTransactions(prev => prev.map(t => (t.id === id ? updated : t)));
    return updated;
  }, []);

  const deleteTransaction = useCallback(async (id: string) => {
    const { error: deleteErr } = await supabase
      .from('fiorc_transactions')
      .delete()
      .eq('id', id);

    if (deleteErr) throw new Error(deleteErr.message);

    setTransactions(prev => prev.filter(t => t.id !== id));
  }, []);

  const derived = useMemo(() => {
    let totalIncome   = 0;
    let totalExpenses = 0;
    let totalProjected = 0;

    for (const t of transactions) {
      if (t.is_projection) {
        totalProjected += t.amount;
      } else if (t.type === 'income') {
        totalIncome += t.amount;
      } else {
        totalExpenses += t.amount;
      }
    }

    return { totalIncome, totalExpenses, totalProjected };
  }, [transactions]);

  return {
    transactions,
    loading,
    error,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    refetch: fetchTransactions,
    ...derived,
  };
}
