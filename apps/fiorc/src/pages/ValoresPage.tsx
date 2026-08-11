import { useState } from 'react';
import { useValoresFiorc } from '../hooks/useValoresFiorc';

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/**
 * FIORC ValoresPage — admin-only view of all pending FIALN repasses.
 * Consolidates totals across all students; QUITAR button calls the
 * fiorc_settle_fialn_repasses RPC to settle all pending entries.
 */
export function FiorcValoresPage() {
  const { summary, pendingTransactions, loading, error, settling, settle, refresh } = useValoresFiorc();
  const [settleMsg, setSettleMsg] = useState<string | null>(null);
  const [settleError, setSettleError] = useState<string | null>(null);

  const handleSettle = async () => {
    if (!window.confirm(`Confirma a quitação de todos os ${summary.pendingCount} repasses pendentes?`)) return;
    setSettleMsg(null);
    setSettleError(null);
    const result = await settle();
    if (result.success) {
      setSettleMsg(result.message);
    } else {
      setSettleError(result.message);
    }
  };

  const absNet = Math.abs(summary.netBalance);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">💰 Valores — Repasses FIALN</h1>
          <p className="page-subtitle">Saldo consolidado de todos os alunos (pendentes)</p>
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
          {/* Summary card */}
          <div
            className="card"
            style={{
              maxWidth: '580px',
              marginBottom: 'var(--fi-space-8)',
              padding: 'var(--fi-space-8)',
            }}
          >
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
                  {formatCurrency(summary.totalDebts)}
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
                  {formatCurrency(summary.totalReceivables)}
                </div>
              </div>
            </div>

            <div style={{ height: '1px', background: 'var(--fi-color-border)', marginBottom: 'var(--fi-space-6)' }} />

            <div style={{ textAlign: 'center', marginBottom: 'var(--fi-space-6)' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--fi-color-text-muted)', marginBottom: 'var(--fi-space-2)' }}>
                Saldo Líquido
              </div>
              <div
                style={{
                  fontSize: '3rem',
                  fontWeight: 900,
                  lineHeight: 1,
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
              <div style={{ marginTop: 'var(--fi-space-3)', fontSize: '1rem', fontWeight: 600 }}>
                {summary.direction === 'receive' && <span style={{ color: 'var(--fi-color-success)' }}>✅ Foraisso tem a RECEBER de Shibari House</span>}
                {summary.direction === 'pay' && <span style={{ color: 'var(--fi-color-danger)' }}>⚠️ Foraisso deve PAGAR à Shibari House</span>}
                {summary.direction === 'zero' && <span style={{ color: 'var(--fi-color-text-muted)' }}>⚖️ Saldo zerado</span>}
              </div>
            </div>

            {summary.pendingCount > 0 ? (
              <button
                id="btn-quitar-repasses"
                className="btn btn-primary w-full"
                style={{ fontSize: '1rem', padding: '0.75rem', width: '100%' }}
                onClick={handleSettle}
                disabled={settling}
              >
                {settling ? (
                  <><span className="spinner" /> Quitando…</>
                ) : (
                  `✓ QUITAR TUDO (${summary.pendingCount} registro${summary.pendingCount !== 1 ? 's' : ''})`
                )}
              </button>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--fi-color-text-muted)' }}>
                Nenhum repasse pendente.
              </div>
            )}
          </div>

          {/* Detailed table */}
          {pendingTransactions.length > 0 && (
            <div className="card">
              <div className="section-header">
                <span className="section-title">Transações Pendentes</span>
                <span className="badge badge-neutral">{pendingTransactions.length}</span>
              </div>
              <table className="fi-table">
                <thead>
                  <tr>
                    <th>Vencimento FIORC</th>
                    <th>Aluno</th>
                    <th>Descrição</th>
                    <th>Tipo</th>
                    <th>Valor Split</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingTransactions.map((tx) => (
                    <tr key={tx.id}>
                      <td className="text-mono text-xs">{tx.fiorc_projection_due_date}</td>
                      <td style={{ fontSize: '0.85rem' }}>{tx.person_name ?? '—'}</td>
                      <td style={{ fontSize: '0.85rem' }}>{tx.description}</td>
                      <td>
                        {tx.split_type === 'receivable' ? (
                          <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>📈 Recebível 75%</span>
                        ) : (
                          <span className="badge badge-danger" style={{ fontSize: '0.75rem' }}>💸 Dívida 25%</span>
                        )}
                      </td>
                      <td className="text-mono" style={{ fontWeight: 700 }}>
                        {formatCurrency(tx.split_amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default FiorcValoresPage;
