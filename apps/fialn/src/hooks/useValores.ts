import { useState, useEffect, useCallback } from 'react';
import type { StudentTransaction } from '@fi/types';
import { supabase } from '../lib/supabase';

export interface ValoresSummary {
  totalDebts: number;        // sum of split_amount where split_type = 'debt' and status = 'pending'
  totalReceivables: number;  // sum of split_amount where split_type = 'receivable' and status = 'pending'
  netBalance: number;        // totalReceivables - totalDebts
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
  transactions: StudentTransaction[];
}

export interface UseValoresReturn {
  summary: ValoresSummary;
  pendingTransactions: StudentTransaction[];
  settledBatches: SettlementBatch[];
  loading: boolean;
  error: string | null;
  settling: boolean;
  settle: () => Promise<{ success: boolean; message: string }>;
  refresh: () => void;
}

const EMPTY_SUMMARY: ValoresSummary = {
  totalDebts: 0,
  totalReceivables: 0,
  netBalance: 0,
  direction: 'zero',
  pendingCount: 0,
};

export function useValores(): UseValoresReturn {
  const [pendingTransactions, setPendingTransactions] = useState<StudentTransaction[]>([]);
  const [settledBatches, setSettledBatches] = useState<SettlementBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [settling, setSettling] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Pending transactions
      const { data: pendingData, error: pendingErr } = await supabase
        .from('fialn_student_transactions')
        .select(`*, person:people(full_name)`)
        .eq('fiorc_status', 'pending')
        .order('transaction_date', { ascending: false });

      if (pendingErr) throw pendingErr;

      const mappedPending = (pendingData ?? []).map((row) => {
        const person = (row as unknown as { person: { full_name: string } | null }).person;
        return {
          ...(row as unknown as StudentTransaction),
          person_name: person?.full_name ?? null,
        };
      });

      setPendingTransactions(mappedPending as unknown as StudentTransaction[]);

      // 2. Settled transactions (completed quittances history)
      const { data: settledData, error: settledErr } = await supabase
        .from('fialn_student_transactions')
        .select(`*, person:people(full_name)`)
        .eq('fiorc_status', 'settled')
        .order('updated_at', { ascending: false });

      if (settledErr) throw settledErr;

      const mappedSettled = (settledData ?? []).map((row) => {
        const person = (row as unknown as { person: { full_name: string } | null }).person;
        return {
          ...(row as unknown as StudentTransaction),
          person_name: person?.full_name ?? null,
        };
      });

      // Group settled transactions by batch (settlement_batch_id or fallback date)
      const batchesMap = new Map<string, StudentTransaction[]>();
      mappedSettled.forEach((tx) => {
        const key = tx.settlement_batch_id || tx.settled_at || tx.updated_at || 'outros';
        if (!batchesMap.has(key)) {
          batchesMap.set(key, []);
        }
        batchesMap.get(key)!.push(tx as unknown as StudentTransaction);
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

  // Compute summary from pending transactions
  const summary: ValoresSummary = (() => {
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

  /**
   * Calls the fiorc_settle_fialn_repasses RPC (admin-only).
   * Marks all pending transactions as settled and creates an accrual entry in fiorc_transactions.
   */
  const settle = async (): Promise<{ success: boolean; message: string }> => {
    setSettling(true);
    setError(null);

    try {
      const { data, error: rpcError } = await supabase
        .rpc('fiorc_settle_fialn_repasses');

      if (rpcError) throw rpcError;

      const result = data as { settled: boolean; net: number; message?: string };

      if (result.settled) {
        const formatted = Math.abs(result.net).toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        });
        const msg = result.net === 0
          ? 'Quitado — saldo zerado, nenhuma transação de acerto necessária.'
          : result.net > 0
            ? `Quitado — R$ ${formatted} a receber registrado no FIORC.`
            : `Quitado — R$ ${formatted} a pagar registrado no FIORC.`;

        await fetchAll();
        return { success: true, message: msg };
      }

      return { success: false, message: result.message ?? 'Nenhum repasse pendente.' };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao quitar repasses';
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

