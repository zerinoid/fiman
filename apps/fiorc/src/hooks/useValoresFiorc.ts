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

export interface SettlementBatch {
  batch_id: string;
  settled_at: string;
  totalDebts: number;
  totalReceivables: number;
  netBalance: number;
  direction: 'receive' | 'pay' | 'zero';
  transactions: FialnProjection[];
}

export interface UseValoresFiorcReturn {
  summary: FiorcValoresSummary;
  pendingTransactions: FialnProjection[];
  settledBatches: SettlementBatch[];
  loading: boolean;
  error: string | null;
  settling: boolean;
  settle: (selectedIds?: string[]) => Promise<{ success: boolean; message: string }>;
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
 * Fetches pending transactions, settled history grouped by batch, and provides selective settle().
 */
export function useValoresFiorc(): UseValoresFiorcReturn {
  const [pendingTransactions, setPendingTransactions] = useState<FialnProjection[]>([]);
  const [settledBatches, setSettledBatches] = useState<SettlementBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [settling, setSettling] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Fetch pending transactions
      const { data: pendingData, error: pendingErr } = await supabase
        .from('fialn_student_transactions')
        .select(`*, person:people(full_name)`)
        .eq('fiorc_status', 'pending')
        .order('fiorc_projection_due_date', { ascending: true });

      if (pendingErr) throw pendingErr;

      const mappedPending: FialnProjection[] = (pendingData ?? []).map((row) => {
        const person = (row as unknown as { person: { full_name: string } | null }).person;
        return {
          ...(row as unknown as FialnProjection),
          person_name: person?.full_name ?? null,
          display_type: row.split_type === 'receivable' ? 'income' : 'expense',
        } as FialnProjection;
      });

      setPendingTransactions(mappedPending);

      // 2. Fetch settled transactions for settlement history
      const { data: settledData, error: settledErr } = await supabase
        .from('fialn_student_transactions')
        .select(`*, person:people(full_name)`)
        .eq('fiorc_status', 'settled')
        .order('updated_at', { ascending: false });

      if (settledErr) throw settledErr;

      const mappedSettled: FialnProjection[] = (settledData ?? []).map((row) => {
        const person = (row as unknown as { person: { full_name: string } | null }).person;
        return {
          ...(row as unknown as FialnProjection),
          person_name: person?.full_name ?? null,
          display_type: row.split_type === 'receivable' ? 'income' : 'expense',
        } as FialnProjection;
      });

      // Group settled transactions by batch (settlement_batch_id or fallback date)
      const batchesMap = new Map<string, FialnProjection[]>();
      mappedSettled.forEach((tx) => {
        const key = tx.settlement_batch_id || tx.settled_at || tx.updated_at || 'outros';
        if (!batchesMap.has(key)) {
          batchesMap.set(key, []);
        }
        batchesMap.get(key)!.push(tx);
      });

      const batches: SettlementBatch[] = Array.from(batchesMap.entries()).map(([batch_id, txs]) => {
        const settled_at = txs[0].settled_at || txs[0].updated_at;
        const totalDebts = txs
          .filter((t) => t.split_type === 'debt')
          .reduce((acc, t) => acc + t.split_amount, 0);
        const totalReceivables = txs
          .filter((t) => t.split_type === 'receivable')
          .reduce((acc, t) => acc + t.split_amount, 0);
        const netBalance = totalReceivables - totalDebts;

        return {
          batch_id,
          settled_at,
          totalDebts,
          totalReceivables,
          netBalance,
          direction: netBalance > 0 ? 'receive' : netBalance < 0 ? 'pay' : 'zero',
          transactions: txs,
        };
      });

      setSettledBatches(batches);
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

  const settle = async (selectedIds?: string[]): Promise<{ success: boolean; message: string }> => {
    setSettling(true);
    setError(null);
    try {
      const { data, error: rpcError } = await supabase.rpc('fiorc_settle_fialn_repasses', {
        p_transaction_ids: selectedIds && selectedIds.length > 0 ? selectedIds : null,
      });
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
      return { success: false, message: result.message ?? 'Nenhum repasse pendente selecionado.' };
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
    settledBatches,
    loading,
    error,
    settling,
    settle,
    refresh: fetchAll,
  };
}

export default useValoresFiorc;
