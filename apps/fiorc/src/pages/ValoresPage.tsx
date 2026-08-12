import { useState, useEffect, useMemo } from 'react';
import { useValoresFiorc } from '../hooks/useValoresFiorc';

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/**
 * FIORC ValoresPage — admin-only view of all pending FIALN repasses.
 * Allows selective settlement of open debt/receivable transactions via checkboxes.
 * Calculates dynamic settlement summary based on user selection.
 */
export function FiorcValoresPage() {
  const { pendingTransactions, loading, error, settling, settle, refresh } = useValoresFiorc();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [settleMsg, setSettleMsg] = useState<string | null>(null);
  const [settleError, setSettleError] = useState<string | null>(null);

  // Initialize selection with all pending transactions whenever pendingTransactions changes
  useEffect(() => {
    setSelectedIds(new Set(pendingTransactions.map((tx) => tx.id)));
  }, [pendingTransactions]);

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
          <p className="page-subtitle">Quitação seletiva de dívidas e recebíveis entre Foraisso e Shibari House</p>
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
        <>
          {/* Dynamic Summary Card */}
          <div
            className="card"
            style={{
              maxWidth: '580px',
              marginBottom: 'var(--fi-space-8)',
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
                Nenhum repasse pendente.
              </div>
            )}
          </div>

          {/* Interactive Table with Checkboxes */}
          {pendingTransactions.length > 0 && (
            <div className="card">
              <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span className="section-title">Transações Pendentes (Dívidas e Recebíveis)</span>
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
        </>
      )}
    </div>
  );
}

export default FiorcValoresPage;
