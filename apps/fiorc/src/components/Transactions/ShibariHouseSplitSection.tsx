import { useState } from 'react';
import type { Transaction } from '@fi/types';
import { supabase } from '../../lib/supabase';
import { formatCurrency, formatDate } from '../../utils/categories';

interface Props {
  transactions: Transaction[];
  loading: boolean;
  onRefetch: () => void;
  onOpenAddModal: () => void;
}

export function ShibariHouseSplitSection({ transactions, loading, onRefetch, onOpenAddModal }: Props) {
  const [filterType, setFilterType] = useState<'all' | 'projections' | 'repasses'>('all');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  // Filter transactions belonging to Shibari House split
  const shibariTxs = transactions.filter(
    (tx) =>
      tx.received_by !== null ||
      tx.enrollment_id !== null ||
      (tx.description && tx.description.includes('Shibari House'))
  );

  // Calculated totals
  const total75Projections = shibariTxs
    .filter((tx) => tx.type === 'income' && (tx.is_projection || !tx.paid_at))
    .reduce((sum, tx) => sum + Number(tx.amount), 0);

  const total25Repasses = shibariTxs
    .filter((tx) => tx.type === 'expense' && (!tx.paid_at || tx.is_projection))
    .reduce((sum, tx) => sum + Number(tx.amount), 0);

  const totalSettled = shibariTxs
    .filter((tx) => tx.paid_at !== null)
    .reduce((sum, tx) => sum + (tx.type === 'income' ? Number(tx.amount) : -Number(tx.amount)), 0);

  const filteredList = shibariTxs.filter((tx) => {
    if (filterType === 'projections') return tx.type === 'income';
    if (filterType === 'repasses') return tx.type === 'expense';
    return true;
  });

  const handleConfirmProjection = async (txId: string) => {
    setActionLoadingId(txId);
    setActionMsg(null);

    try {
      const { error } = await supabase.rpc('fiorc_confirm_shibari_projection', {
        p_transaction_id: txId,
      });

      if (error) throw error;
      setActionMsg('✓ Projeção confirmada e liquidada com sucesso! Status no FIALN atualizado.');
      onRefetch();
    } catch (err) {
      setActionMsg(err instanceof Error ? `Erro: ${err.message}` : 'Erro ao confirmar projeção');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handlePayRepasse = async (txId: string) => {
    setActionLoadingId(txId);
    setActionMsg(null);

    try {
      const today = new Date().toISOString().substring(0, 10);
      const { error } = await supabase
        .from('fiorc_transactions')
        .update({ paid_at: today, is_projection: false })
        .eq('id', txId);

      if (error) throw error;
      setActionMsg('✓ Repasse quitado com sucesso!');
      onRefetch();
    } catch (err) {
      setActionMsg(err instanceof Error ? `Erro: ${err.message}` : 'Erro ao quitar repasse');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="stack-6" style={{ marginTop: '1.5rem' }}>
      {/* Overview Cards */}
      <div className="grid-3">
        <div
          className="card"
          style={{
            background: 'var(--fi-color-surface-2)',
            borderLeft: '4px solid var(--fi-color-success)',
          }}
        >
          <div className="text-xs text-muted">📈 Projeções a Receber (75%)</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--fi-color-success)', marginTop: '0.25rem' }}>
            {formatCurrency(total75Projections)}
          </div>
          <p className="text-xs text-muted mt-2">Pagamentos recebidos por Shibari House</p>
        </div>

        <div
          className="card"
          style={{
            background: 'var(--fi-color-surface-2)',
            borderLeft: '4px solid var(--fi-color-danger)',
          }}
        >
          <div className="text-xs text-muted">💸 Repasses a Pagar (25%)</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--fi-color-danger)', marginTop: '0.25rem' }}>
            {formatCurrency(total25Repasses)}
          </div>
          <p className="text-xs text-muted mt-2">Vencimento no dia 5 do mês seguinte</p>
        </div>

        <div
          className="card"
          style={{
            background: 'var(--fi-color-surface-2)',
            borderLeft: '4px solid var(--fi-color-primary)',
          }}
        >
          <div className="text-xs text-muted">⚖️ Saldo Liquidado do Mês</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.25rem' }}>
            {formatCurrency(totalSettled)}
          </div>
          <p className="text-xs text-muted mt-2">Valores confirmados e quitados</p>
        </div>
      </div>

      {/* Bar Controls */}
      <div className="flex-between" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className={`btn btn-sm ${filterType === 'all' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setFilterType('all')}
          >
            Todos ({shibariTxs.length})
          </button>
          <button
            className={`btn btn-sm ${filterType === 'projections' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setFilterType('projections')}
          >
            Projeções 75% ({shibariTxs.filter((t) => t.type === 'income').length})
          </button>
          <button
            className={`btn btn-sm ${filterType === 'repasses' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setFilterType('repasses')}
          >
            Repasses 25% ({shibariTxs.filter((t) => t.type === 'expense').length})
          </button>
        </div>

        <button className="btn btn-secondary btn-sm" onClick={onOpenAddModal}>
          + Novo Lançamento Shibari House
        </button>
      </div>

      {actionMsg && (
        <div
          style={{
            padding: '0.75rem 1rem',
            background: 'var(--fi-color-surface-2)',
            borderRadius: 'var(--fi-radius-md)',
            border: '1px solid var(--fi-color-primary)',
            fontSize: '0.85rem',
          }}
        >
          {actionMsg}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="loading-center">
          <div className="spinner" />
        </div>
      ) : filteredList.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state-icon">🏛️</span>
          <p className="empty-state-text">Nenhum lançamento Shibari House registrado no mês.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Vencimento / Data</th>
                <th>Descrição</th>
                <th>Modalidade</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Valor</th>
                <th style={{ textAlign: 'center' }}>Ação / Baixa</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.map((tx) => {
                const isPaid = tx.paid_at !== null;
                const isProjection75 = tx.type === 'income';
                const isLoadingThis = actionLoadingId === tx.id;

                return (
                  <tr key={tx.id}>
                    <td style={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                      {formatDate(tx.due_date)}
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>
                      <span style={{ fontWeight: 600 }}>{tx.description}</span>
                    </td>
                    <td>
                      <span className="badge badge-neutral" style={{ fontSize: '0.72rem' }}>
                        {isProjection75 ? '📈 Receita (75%)' : '💸 Repasse (25%)'}
                      </span>
                    </td>
                    <td>
                      {isPaid ? (
                        <span className="badge badge-success" style={{ fontSize: '0.72rem' }}>
                          ✓ Pago em {formatDate(tx.paid_at!)}
                        </span>
                      ) : (
                        <span className="badge badge-warning" style={{ fontSize: '0.72rem' }}>
                          ⏳ Pendente
                        </span>
                      )}
                    </td>
                    <td
                      style={{
                        textAlign: 'right',
                        fontFamily: 'var(--fi-font-mono)',
                        fontWeight: 600,
                        color: isProjection75 ? 'var(--fi-color-success)' : 'var(--fi-color-danger)',
                      }}
                    >
                      {isProjection75 ? '+' : '-'}{formatCurrency(tx.amount)}
                    </td>
                    <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                      {isPaid ? (
                        <span className="text-xs text-muted">✓ Concluído</span>
                      ) : isProjection75 ? (
                        <button
                          className="btn btn-primary btn-sm"
                          disabled={isLoadingThis}
                          onClick={() => handleConfirmProjection(tx.id)}
                        >
                          {isLoadingThis ? 'Salvando…' : '✓ Confirmar Recebimento'}
                        </button>
                      ) : (
                        <button
                          className="btn btn-secondary btn-sm"
                          disabled={isLoadingThis}
                          onClick={() => handlePayRepasse(tx.id)}
                        >
                          {isLoadingThis ? 'Quitando…' : '💸 Quitar Repasse'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
