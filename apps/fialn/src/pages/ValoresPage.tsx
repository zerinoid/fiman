import { useState, useEffect } from 'react';
import { useValores } from '../hooks/useValores';

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

export function ValoresPage() {
  const { summary, pendingTransactions, settledBatches, loading, error, refresh } = useValores();
  const [expandedBatches, setExpandedBatches] = useState<Set<string>>(new Set());

  // Default all batch accordions to open when loaded
  useEffect(() => {
    if (settledBatches.length > 0) {
      setExpandedBatches(new Set(settledBatches.map((b) => b.batch_id)));
    }
  }, [settledBatches]);

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

  const absNet = Math.abs(summary.netBalance);

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">💰 Valores</h1>
          <p className="page-subtitle">Repasses pendentes e histórico de quitações consumadas (somente leitura)</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={refresh} disabled={loading}>
          ↺ Atualizar
        </button>
      </div>

      {error && <div className="alert alert-error mb-4">✗ {error}</div>}

      {loading ? (
        <div className="loading-center" style={{ minHeight: '40vh' }}>
          <div className="spinner spinner-lg" />
          <span>Carregando valores…</span>
        </div>
      ) : (
        <div className="stack-6">
          {/* Summary Card */}
          <div className="card valores-summary-card">
            {/* Dívidas / Recebíveis */}
            <div className="valores-grid">
              {/* Dívidas */}
              <div style={{ textAlign: 'center' }}>
                <div className="valores-metric-title" style={{ color: 'var(--fi-color-danger)' }}>
                  💸 Dívidas
                </div>
                <div className="valores-metric-sub">
                  Foraisso → Shibari House
                </div>
                <div className="valores-metric-value" style={{ color: 'var(--fi-color-danger)' }}>
                  {formatCurrency(summary.totalDebts)}
                </div>
              </div>

              {/* Recebíveis */}
              <div style={{ textAlign: 'center' }}>
                <div className="valores-metric-title" style={{ color: 'var(--fi-color-success)' }}>
                  📈 Recebíveis
                </div>
                <div className="valores-metric-sub">
                  Shibari House → Foraisso
                </div>
                <div className="valores-metric-value" style={{ color: 'var(--fi-color-success)' }}>
                  {formatCurrency(summary.totalReceivables)}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="valores-divider" />

            {/* Saldo */}
            <div className="valores-net-container">
              <div className="valores-net-label">
                Saldo Líquido Pendente
              </div>
              <div
                className="valores-net-value"
                style={{
                  color:
                    summary.direction === 'receive'
                      ? 'var(--fi-color-success)'
                      : summary.direction === 'pay'
                      ? 'var(--fi-color-danger)'
                      : 'var(--fi-color-text-muted)',
                }}
              >
                {summary.direction === 'pay' ? '− ' : ''}{formatCurrency(absNet)}
              </div>
              <div
                className="valores-net-status"
                style={{
                  color:
                    summary.direction === 'receive'
                      ? 'var(--fi-color-success)'
                      : summary.direction === 'pay'
                      ? 'var(--fi-color-danger)'
                      : 'var(--fi-color-text-muted)',
                }}
              >
                {summary.direction === 'receive' && '✅ Foraisso tem a RECEBER de Shibari House'}
                {summary.direction === 'pay'     && '⚠️ Foraisso deve PAGAR à Shibari House'}
                {summary.direction === 'zero'    && '⚖️ Saldo zerado'}
              </div>
            </div>
          </div>

          {/* 1. Pending Transactions List (Readonly) */}
          <div className="card">
            <div className="section-header">
              <span className="section-title">⏳ Transações Pendentes (Dívidas e Recebíveis)</span>
              <span className="badge badge-neutral">{pendingTransactions.length}</span>
            </div>

            {pendingTransactions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--fi-color-text-muted)' }}>
                Nenhum repasse pendente no momento.
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="fi-table">
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Aluno</th>
                      <th>Código</th>
                      <th>Recebedor</th>
                      <th>Meio</th>
                      <th>Tipo Split</th>
                      <th style={{ textAlign: 'right' }}>Valor Split</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingTransactions.map((tx) => (
                      <tr key={tx.id}>
                        <td className="text-mono text-xs">{tx.transaction_date}</td>
                        <td style={{ fontSize: '0.85rem' }}>{tx.person_name ?? '—'}</td>
                        <td style={{ fontSize: '0.85rem', fontWeight: 600 }} className="text-mono">{tx.codigo}</td>
                        <td style={{ fontSize: '0.8rem' }}>
                          {tx.received_by === 'shibarihouse' ? '🏛️ SbHs' : '🩸 Foraisso'}
                        </td>
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
                      className="batch-card"
                    >
                      {/* Batch Header */}
                      <div
                        className="batch-header"
                        onClick={() => toggleBatchExpand(batch.batch_id)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{ fontSize: '1.1rem' }}>{isExpanded ? '▼' : '▶'}</span>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                              🗓️ Quitação consumada em <span className="text-mono">{formatDateTime(batch.settled_at)}</span>
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--fi-color-text-muted)' }}>
                              {batch.transactions.length} transação(ões) quitada(s) no lote
                            </div>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
                          <div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--fi-color-text-muted)' }}>Saldo Quitado</div>
                            <div
                              className="text-mono"
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
                        <div className="batch-content">
                          <div className="table-wrapper table-wrapper-nested">
                            <table className="fi-table">
                              <thead>
                                <tr>
                                  <th>Data Original</th>
                                  <th>Aluno</th>
                                  <th>Código</th>
                                  <th>Recebedor</th>
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
                                    <td style={{ fontSize: '0.85rem' }} className="text-mono">{tx.codigo}</td>
                                    <td style={{ fontSize: '0.8rem' }}>
                                      {tx.received_by === 'shibarihouse' ? '🏛️ SbHs' : '🩸 Foraisso'}
                                    </td>
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

export default ValoresPage;

