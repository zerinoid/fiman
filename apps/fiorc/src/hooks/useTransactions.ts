import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Transaction } from '@fi/types';
import { supabase } from '../lib/supabase';

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
  toggleProjection: (id: string, isReceived: boolean, paidAtDate?: string) => Promise<Transaction>;
  refetch: () => void;
}

export function getTxTimestamp(tx: Transaction): number {
  if (tx.transaction_datetime) {
    const t = new Date(tx.transaction_datetime).getTime();
    if (!isNaN(t)) return t;
  }
  if (tx.created_at) {
    const t = new Date(tx.created_at).getTime();
    if (!isNaN(t)) return t;
  }
  if (tx.due_date) {
    const t = new Date(tx.due_date + 'T12:00:00').getTime();
    if (!isNaN(t)) return t;
  }
  return 0;
}

export function isTxInMonth(tx: Transaction, year: number, month: number): boolean {
  if (tx.transaction_datetime) {
    const dt = new Date(tx.transaction_datetime);
    return dt.getFullYear() === year && (dt.getMonth() + 1) === month;
  }
  if (tx.due_date) {
    const [y, m] = tx.due_date.split('-').map(Number);
    return y === year && m === month;
  }
  return false;
}

export function sortTransactions(txs: Transaction[]): Transaction[] {
  return [...txs].sort((a, b) => {
    // 1. Primary sort: timestamp (transaction_datetime / created_at) descending
    const timeA = getTxTimestamp(a);
    const timeB = getTxTimestamp(b);
    if (timeA !== timeB) {
      return timeB - timeA;
    }
    // 2. Secondary sort: created_at descending
    const catA = a.created_at || '';
    const catB = b.created_at || '';
    if (catA !== catB) {
      return catB.localeCompare(catA);
    }
    // 3. Fallback: id
    return (b.id || '').localeCompare(a.id || '');
  });
}

export function useTransactions(year: number, month: number): UseTransactionsReturn {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error: fetchErr } = await supabase
      .from('fiorc_transactions')
      .select('*')
      .order('transaction_datetime', { ascending: false, nullsFirst: false })
      .order('due_date', { ascending: false });

    if (fetchErr) {
      setError(fetchErr.message);
    } else {
      const all = (data ?? []) as Transaction[];
      const monthTxs = all.filter(t => isTxInMonth(t, year, month));
      setTransactions(sortTransactions(monthTxs));
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
      // Keep sorted view filtered to current month
      setTransactions(prev => sortTransactions([...inserted, ...prev].filter(t => isTxInMonth(t, year, month))));
      return inserted;
    },
    [year, month],
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

        const baseTxDt = updates.transaction_datetime ?? oldTx.transaction_datetime;

        for (let i = 1; i < newTotal; i++) {
          const m = ((mo - 1 + i) % 12) + 1;
          const y = yr + Math.floor((mo - 1 + i) / 12);
          const pad = (n: number) => String(n).padStart(2, '0');

          let childTxDatetime: string | null = null;
          if (baseTxDt) {
            const dt = new Date(baseTxDt);
            if (!isNaN(dt.getTime())) {
              dt.setMonth(dt.getMonth() + i);
              childTxDatetime = dt.toISOString();
            }
          }

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
            transaction_datetime: childTxDatetime,
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

    setTransactions(prev => sortTransactions(prev.map(t => (t.id === id ? updated : t))));
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

  const toggleProjection = useCallback(
    async (id: string, isReceived: boolean, paidAtDate?: string) => {
      const today = new Date().toISOString().split('T')[0];
      const updates: Partial<Transaction> = {
        is_projection: !isReceived,
        paid_at: isReceived ? (paidAtDate || today) : null,
      };

      const { data, error: updateErr } = await supabase
        .from('fiorc_transactions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateErr) throw new Error(updateErr.message);
      const updated = data as Transaction;

      setTransactions(prev =>
        sortTransactions(prev.map(t => (t.id === id ? updated : t)))
      );
      return updated;
    },
    []
  );

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
    toggleProjection,
    refetch: fetchTransactions,
    ...derived,
  };
}
