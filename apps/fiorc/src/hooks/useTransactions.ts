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
    // 1. Fetch existing transaction to know if it's a parent
    const { data: existing, error: fetchErr } = await supabase
      .from('fiorc_transactions')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchErr) throw new Error(fetchErr.message);
    const oldTx = existing as Transaction;
    const isParent = !oldTx.parent_id; // Any transaction without a parent can potentially have children

    // 2. Update the parent transaction
    const { data, error: updateErr } = await supabase
      .from('fiorc_transactions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (updateErr) throw new Error(updateErr.message);
    const updated = data as Transaction;

    // 3. If parent, handle children cascading or recreation
    if (isParent) {
      const oldTotal = oldTx.total_installments || 1;
      const newTotal = updates.total_installments ?? oldTotal;

      if (newTotal !== oldTotal) {
        // We need to delete old children and create new ones
        await supabase.from('fiorc_transactions').delete().eq('parent_id', id);

        const newChildren: NewTransaction[] = [];
        const baseDate = updates.due_date ?? oldTx.due_date;
        const [yr, mo, dy] = baseDate.split('-').map(Number);
        const dividedAmount = updates.amount ?? oldTx.amount;
        const txType = updates.type ?? oldTx.type;
        const category = updates.category ?? oldTx.category;
        const personId = updates.person_id ?? oldTx.person_id;
        const description = updates.description ?? oldTx.description;
        const isCreditCard = updates.is_credit_card ?? oldTx.is_credit_card;

        for (let i = 1; i < newTotal; i++) {
          const m = ((mo - 1 + i) % 12) + 1;
          const y = yr + Math.floor((mo - 1 + i) / 12);
          const pad = (n: number) => String(n).padStart(2, '0');

          newChildren.push({
            id: crypto.randomUUID(),
            parent_id: id,
            person_id: personId,
            type: txType,
            category,
            amount: dividedAmount,
            due_date: `${y}-${pad(m)}-${pad(dy)}`,
            paid_at: null,
            is_projection: true,
            is_credit_card: txType === 'expense' ? isCreditCard : false,
            installment_index: i + 1,
            total_installments: newTotal,
            description: description,
          } as NewTransaction);
        }

        if (newChildren.length > 0) {
          await supabase.from('fiorc_transactions').insert(newChildren);
        }
      } else if (oldTotal > 1) {
        // Cascade changes to existing children
        const childUpdates: Partial<Transaction> = {};
        if (updates.amount !== undefined) childUpdates.amount = updates.amount;
        if (updates.category !== undefined) childUpdates.category = updates.category;
        if (updates.description !== undefined) childUpdates.description = updates.description;
        if (updates.person_id !== undefined) childUpdates.person_id = updates.person_id;
        if (updates.total_installments !== undefined) childUpdates.total_installments = updates.total_installments;

        if (Object.keys(childUpdates).length > 0) {
          await supabase
            .from('fiorc_transactions')
            .update(childUpdates)
            .eq('parent_id', id);
        }
      }
    }

    setTransactions(prev => prev.map(t => (t.id === id ? updated : t)));
    // If it's a parent, refetch entirely so we can get updated children in current view
    if (isParent) fetchTransactions();

    return updated;
  }, [fetchTransactions]);

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
      } else if (!t.is_credit_card) {
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
