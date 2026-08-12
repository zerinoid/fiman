import { useState, useEffect, useMemo } from 'react';
import { useValoresFiorc } from '../hooks/useValoresFiorc';

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDateTime(isoString: string): string {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

/**
 * FIORC ValoresPage — admin-only view of pending FIALN repasses and historical consummated settlements.
 * Grouped by settlement batch ("agrupe por lote").
 */
export function FiorcValoresPage() {
  const { pendingTransactions, settledBatches, loading, error, settling, settle, refresh } = useValoresFiorc();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [settleMsg, setSettleMsg] = useState<string | null>(null);
  const [settleError, setSettleError] = useState<string | null>(null);
  const [expandedBatches, setExpandedBatches] = useState<Set<string>>(new Set());

  // Initialize selection with all pending transactions whenever pendingTransactions changes
  useEffect(() => {
    setSelectedIds(new Set(pendingTransactions.map((tx) => tx.id)));
  }, [pendingTransactions]);

  // Default all batchaccordions to open
  useEffect(() => {
    if (settledBatches.length > 0) {
      setExpandedBatches(new Set(settledBatches.map((b) => b.batch_id)));
    }
  }, [settledBatches]);

  const allSelected = pendingTransactions.length > 0 && selectedIds.size === pendingTransactions.length;
  const isSomeSelected = selectedIds.size > 0 && selectedIds.size < pendingTransactions.length;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(pendingTransactions.map((tx) => tx.id)));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleBatchExpand = (batchId: string) => {
    setExpandedBatches((prev) => {
      const next = new Set(prev);
      if (next.has(batchId)) {
        next.delete(batchId);
      } else {
        next.add(batchId);
      }
      return next;
    });
  };

  // Dynamic summary based on selected items
  const dynamicSummary = useMemo(() => {
    const selectedTxs = pendingTransactions.filter((tx) => selectedIds.has(tx.id));

    const totalDebts = selectedTxs
      .filter((t) => t.split_type === 'debt')
      .reduce((acc, t) => acc + t.split_amount, 0);

    const totalReceivables = selectedTxs
      .filter((t) => t.split_type === 'receivable')
      .reduce((acc, t) => acc + t.split_amount, 0);

    const netBalance = totalReceivables - totalDebts;

    return {
      totalDebts,
      totalReceivables,
      netBalance,
      direction: netBalance > 0 ? 'receive' : netBalance < 0 ? 'pay' : 'zero',
      selectedCount: selectedTxs.length,
    };
  }, [pendingTransactions, selectedIds]);

  const handleSettle = async () => {
    if (dynamicSummary.selectedCount === 0) return;
    const confirmText = `Confirma a quitação de ${dynamicSummary.selectedCount} repasse(s) selecionado(s)?`;
    if (!window.confirm(confirmText)) return;

    setSettleMsg(null);
    setSettleError(null);
    const result = await settle(Array.from(selectedIds));
    if (result.success) {
      setSettleMsg(result.message);
    } else {
      setSettleError(result.message);
    }
  };

  const absNet = Math.abs(dynamicSummary.netBalance);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">💰 Valores — Repasses FIALN</h1>
          <p className="page-subtitle">Quitação seletiva de dívidas/recebíveis e histórico de quitações consumadas</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={refresh} disabled={loading}>
          ↺ Atualizar
        </button>
      </div>

      {error && <div className="alert alert-error mb-4">✗ {error}</div>}
      {settleError && <div className="alert alert-error mb-4">✗ {settleError}</div>}
      {settleMsg && <div className="alert alert-success mb-4">✓ {settleMsg}</div>}

      {loading ? (
        <div className="loading-center"><div className="spinner spinner-lg" /></div>
      ) : (
        <div className="stack-6">
          {/* Dynamic Summary Card */}
          <div
            className="card"
            style={{
              maxWidth: '580px',
              margin: '0 auto',
              padding: 'var(--fi-space-8)',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: 'var(--fi-space-4)', fontSize: '0.85rem', color: 'var(--fi-color-text-muted)' }}>
              Somatória dos itens selecionados ({dynamicSummary.selectedCount} de {pendingTransactions.length})
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 'var(--fi-space-6)',
                marginBottom: 'var(--fi-space-8)',
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--fi-color-danger)', marginBottom: '0.25rem' }}>
                  💸 Dívidas
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--fi-color-text-muted)', marginBottom: '0.5rem' }}>
                  Foraisso → Shibari House
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--fi-color-danger)' }}>
                  {formatCurrency(dynamicSummary.totalDebts)}
                </div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--fi-color-success)', marginBottom: '0.25rem' }}>
                  📈 Recebíveis
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--fi-color-text-muted)', marginBottom: '0.5rem' }}>
                  Shibari House → Foraisso
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--fi-color-success)' }}>
                  {formatCurrency(dynamicSummary.totalReceivables)}
                </div>
              </div>
            </div>

            <div style={{ height: '1px', background: 'var(--fi-color-border)', marginBottom: 'var(--fi-space-6)' }} />

            <div style={{ textAlign: 'center', marginBottom: 'var(--fi-space-6)' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--fi-color-text-muted)', marginBottom: 'var(--fi-space-2)' }}>
                Saldo Líquido a Quitar
              </div>
              <div
                style={{
                  fontSize: '3rem',
                  fontWeight: 900,
                  lineHeight: 1,
                  color:
                    dynamicSummary.direction === 'receive'
                      ? 'var(--fi-color-success)'
                      : dynamicSummary.direction === 'pay'
                      ? 'var(--fi-color-danger)'
                      : 'var(--fi-color-text-muted)',
                }}
              >
                {dynamicSummary.direction === 'pay' ? '− ' : ''}{formatCurrency(absNet)}
              </div>
              <div style={{ marginTop: 'var(--fi-space-3)', fontSize: '1rem', fontWeight: 600 }}>
                {dynamicSummary.direction === 'receive' && <span style={{ color: 'var(--fi-color-success)' }}>✅ Foraisso tem a RECEBER de Shibari House</span>}
                {dynamicSummary.direction === 'pay' && <span style={{ color: 'var(--fi-color-danger)' }}>⚠️ Foraisso deve PAGAR à Shibari House</span>}
                {dynamicSummary.direction === 'zero' && <span style={{ color: 'var(--fi-color-text-muted)' }}>⚖️ Saldo zerado</span>}
              </div>
            </div>

            {pendingTransactions.length > 0 ? (
              <button
                id="btn-quitar-repasses"
                className="btn btn-primary w-full"
                style={{ fontSize: '1rem', padding: '0.75rem', width: '100%' }}
                onClick={handleSettle}
                disabled={settling || dynamicSummary.selectedCount === 0}
              >
                {settling ? (
                  <><span className="spinner" /> Quitando…</>
                ) : (
                  `✓ QUITAR SELECIONADOS (${dynamicSummary.selectedCount} registro${dynamicSummary.selectedCount !== 1 ? 's' : ''})`
                )}
              </button>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--fi-color-text-muted)' }}>
                Nenhum repasse pendente no momento.
              </div>
            )}
          </div>

          {/* 1. Interactive Pending Table with Checkboxes */}
          {pendingTransactions.length > 0 && (
            <div className="card">
              <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span className="section-title">⏳ Transações Pendentes (Dívidas e Recebíveis)</span>
                  <span className="badge badge-neutral ml-2">{pendingTransactions.length}</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--fi-color-text-muted)' }}>
                  {dynamicSummary.selectedCount} selecionada(s)
                </div>
              </div>
              <div className="table-wrapper">
                <table className="fi-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40px', textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={allSelected}
                          ref={(input) => {
                            if (input) input.indeterminate = isSomeSelected;
                          }}
                          onChange={toggleSelectAll}
                          title="Selecionar / Desselecionar todos"
                        />
                      </th>
                      <th>Vencimento FIORC</th>
                      <th>Aluno</th>
                      <th>Descrição</th>
                      <th>Pagamento</th>
                      <th>Tipo Split</th>
                      <th style={{ textAlign: 'right' }}>Valor Split</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingTransactions.map((tx) => {
                      const isSelected = selectedIds.has(tx.id);
                      return (
                        <tr
                          key={tx.id}
                          style={{
                            backgroundColor: isSelected ? 'var(--fi-color-surface-2, rgba(255,255,255,0.03))' : undefined,
                            cursor: 'pointer',
                          }}
                          onClick={() => toggleSelectOne(tx.id)}
                        >
                          <td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectOne(tx.id)}
                            />
                          </td>
                          <td className="text-mono text-xs">{tx.fiorc_projection_due_date}</td>
                          <td style={{ fontSize: '0.85rem' }}>{tx.person_name ?? '—'}</td>
                          <td style={{ fontSize: '0.85rem' }}>{tx.description}</td>
                          <td>
                            <span className={`badge ${tx.payment_method === 'pix' ? 'badge-primary' : 'badge-secondary'}`} style={{ fontSize: '0.72rem' }}>
                              {tx.payment_method === 'pix' ? '⚡ PIX' : '💳 Crédito'}
                            </span>
                          </td>
                          <td>
                            {tx.split_type === 'receivable' ? (
                              <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>📈 Recebível (75%)</span>
                            ) : (
                              <span className="badge badge-danger" style={{ fontSize: '0.75rem' }}>💸 Dívida (25%)</span>
                            )}
                          </td>
                          <td className="text-mono" style={{ textAlign: 'right', fontWeight: 700 }}>
                            {formatCurrency(tx.split_amount)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 2. Quitações Consumadas (Histórico Agrupado por Lote) */}
          <div className="card">
            <div className="section-header" style={{ marginBottom: '1rem' }}>
              <div>
                <span className="section-title">📜 Quitações Consumadas (Histórico por Lote)</span>
                <span className="badge badge-success ml-2">{settledBatches.length} lote(s)</span>
              </div>
            </div>

            {settledBatches.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--fi-color-text-muted)', fontSize: '0.9rem' }}>
                Nenhuma quitação consumada registrada até o momento.
              </div>
            ) : (
              <div className="stack-4">
                {settledBatches.map((batch, index) => {
                  const isExpanded = expandedBatches.has(batch.batch_id);
                  const absBatchNet = Math.abs(batch.netBalance);

                  return (
                    <div
                      key={batch.batch_id || index}
                      style={{
                        background: 'var(--fi-color-surface-2, rgba(255,255,255,0.02))',
                        border: '1px solid var(--fi-color-border)',
                        borderRadius: 'var(--fi-radius-md)',
                        overflow: 'hidden',
                      }}
                    >
                      {/* Batch Header */}
                      <div
                        style={{
                          padding: '1rem 1.25rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          background: 'rgba(255,255,255,0.02)',
                        }}
                        onClick={() => toggleBatchExpand(batch.batch_id)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{ fontSize: '1.1rem' }}>{isExpanded ? '▼' : '▶'}</span>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                              🗓️ Quitação consumada em {formatDateTime(batch.settled_at)}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--fi-color-text-muted)' }}>
                              {batch.transactions.length} transação(ões) quitada(s) no lote
                            </div>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--fi-color-text-muted)' }}>Saldo Quitado</div>
                            <div
                              style={{
                                fontWeight: 800,
                                fontSize: '1.1rem',
                                color:
                                  batch.direction === 'receive'
                                    ? 'var(--fi-color-success)'
                                    : batch.direction === 'pay'
                                    ? 'var(--fi-color-danger)'
                                    : 'var(--fi-color-text-muted)',
                              }}
                            >
                              {batch.direction === 'pay' ? '− ' : ''}{formatCurrency(absBatchNet)}
                            </div>
                          </div>
                          <span
                            className={`badge ${
                              batch.direction === 'receive'
                                ? 'badge-success'
                                : batch.direction === 'pay'
                                ? 'badge-danger'
                                : 'badge-neutral'
                            }`}
                            style={{ fontSize: '0.75rem' }}
                          >
                            {batch.direction === 'receive' && 'Recebido'}
                            {batch.direction === 'pay' && 'Pago'}
                            {batch.direction === 'zero' && 'Zerado'}
                          </span>
                        </div>
                      </div>

                      {/* Expanded Transactions List inside Batch */}
                      {isExpanded && (
                        <div style={{ borderTop: '1px solid var(--fi-color-border)', padding: '0.5rem 1rem 1rem 1rem' }}>
                          <table className="fi-table">
                            <thead>
                              <tr>
                                <th>Vencimento Original</th>
                                <th>Aluno</th>
                                <th>Descrição</th>
                                <th>Pagamento</th>
                                <th>Tipo Split</th>
                                <th style={{ textAlign: 'right' }}>Valor Split</th>
                              </tr>
                            </thead>
                            <tbody>
                              {batch.transactions.map((tx) => (
                                <tr key={tx.id}>
                                  <td className="text-mono text-xs">{tx.fiorc_projection_due_date || tx.transaction_date}</td>
                                  <td style={{ fontSize: '0.85rem', fontWeight: 600 }}>{tx.person_name ?? '—'}</td>
                                  <td style={{ fontSize: '0.85rem' }}>{tx.description}</td>
                                  <td>
                                    <span className={`badge ${tx.payment_method === 'pix' ? 'badge-primary' : 'badge-secondary'}`} style={{ fontSize: '0.72rem' }}>
                                      {tx.payment_method === 'pix' ? '⚡ PIX' : '💳 Crédito'}
                                    </span>
                                  </td>
                                  <td>
                                    {tx.split_type === 'receivable' ? (
                                      <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>📈 Recebível (75%)</span>
                                    ) : (
                                      <span className="badge badge-danger" style={{ fontSize: '0.75rem' }}>💸 Dívida (25%)</span>
                                    )}
                                  </td>
                                  <td className="text-mono" style={{ textAlign: 'right', fontWeight: 700 }}>
                                    {formatCurrency(tx.split_amount)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default FiorcValoresPage;
