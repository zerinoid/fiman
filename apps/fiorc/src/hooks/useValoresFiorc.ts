import { useState, useEffect, useCallback } from 'react';
import type { FialnProjection } from './useFialnProjections';
import { supabase } from '../lib/supabase';

export interface FiorcValoresSummary {
  totalDebts: number;
  totalReceivables: number;
  netBalance: number;
  direction: 'receive' | 'pay' | 'zero';
  pendingCount: number;
}

export interface UseValoresFiorcReturn {
  summary: FiorcValoresSummary;
  pendingTransactions: FialnProjection[];
  loading: boolean;
  error: string | null;
  settling: boolean;
  settle: () => Promise<{ success: boolean; message: string }>;
  refresh: () => void;
}

const EMPTY_SUMMARY: FiorcValoresSummary = {
  totalDebts: 0,
  totalReceivables: 0,
  netBalance: 0,
  direction: 'zero',
  pendingCount: 0,
};

/**
 * FIORC-side hook for the Valores page.
 * Same data as useValores (in FIALN) but includes person name via join,
 * and the settle() function calls fiorc_settle_fialn_repasses.
 */
export function useValoresFiorc(): UseValoresFiorcReturn {
  const [pendingTransactions, setPendingTransactions] = useState<FialnProjection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [settling, setSettling] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('fialn_student_transactions')
        .select(`*, person:people(full_name)`)
        .eq('fiorc_status', 'pending')
        .order('fiorc_projection_due_date', { ascending: true });

      if (fetchError) throw fetchError;

      const mapped: FialnProjection[] = (data ?? []).map((row) => {
        const person = (row as unknown as { person: { full_name: string } | null }).person;
        return {
          ...(row as unknown as FialnProjection),
          person_name: person?.full_name ?? null,
          display_type: row.split_type === 'receivable' ? 'income' : 'expense',
        } as FialnProjection;
      });

      setPendingTransactions(mapped);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar valores');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const summary: FiorcValoresSummary = (() => {
    const totalDebts = pendingTransactions
      .filter((t) => t.split_type === 'debt')
      .reduce((acc, t) => acc + t.split_amount, 0);
    const totalReceivables = pendingTransactions
      .filter((t) => t.split_type === 'receivable')
      .reduce((acc, t) => acc + t.split_amount, 0);
    const netBalance = totalReceivables - totalDebts;
    return {
      totalDebts,
      totalReceivables,
      netBalance,
      direction: netBalance > 0 ? 'receive' : netBalance < 0 ? 'pay' : 'zero',
      pendingCount: pendingTransactions.length,
    };
  })();

  const settle = async (): Promise<{ success: boolean; message: string }> => {
    setSettling(true);
    setError(null);
    try {
      const { data, error: rpcError } = await supabase.rpc('fiorc_settle_fialn_repasses');
      if (rpcError) throw rpcError;

      const result = data as { settled: boolean; net: number; message?: string };
      if (result.settled) {
        const formatted = Math.abs(result.net).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        const msg =
          result.net === 0
            ? 'Quitado — saldo zerado.'
            : result.net > 0
            ? `Quitado — ${formatted} a receber registrado no FIORC.`
            : `Quitado — ${formatted} a pagar registrado no FIORC.`;
        await fetchAll();
        return { success: true, message: msg };
      }
      return { success: false, message: result.message ?? 'Nenhum repasse pendente.' };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao quitar';
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setSettling(false);
    }
  };

  return {
    summary: loading ? EMPTY_SUMMARY : summary,
    pendingTransactions,
    loading,
    error,
    settling,
    settle,
    refresh: fetchAll,
  };
}
