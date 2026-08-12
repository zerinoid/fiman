import { useValores } from '../hooks/useValores';

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function ValoresPage() {
  const { summary, pendingTransactions, loading, error, refresh } = useValores();

  const absNet = Math.abs(summary.netBalance);

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">💰 Valores</h1>
          <p className="page-subtitle">Repasses pendentes entre Foraisso e Shibari House (somente leitura)</p>
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
          <div
            className="card"
            style={{
              maxWidth: '580px',
              margin: '0 auto',
              padding: 'var(--fi-space-8)',
            }}
          >
            {/* Dívidas / Recebíveis */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 'var(--fi-space-6)',
                marginBottom: 'var(--fi-space-8)',
              }}
            >
              {/* Dívidas */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--fi-color-danger)', marginBottom: 'var(--fi-space-2)' }}>
                  💸 Dívidas
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--fi-color-text-muted)', marginBottom: 'var(--fi-space-3)' }}>
                  Foraisso → Shibari House
                </div>
                <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--fi-color-danger)', lineHeight: 1 }}>
                  {formatCurrency(summary.totalDebts)}
                </div>
              </div>

              {/* Recebíveis */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--fi-color-success)', marginBottom: 'var(--fi-space-2)' }}>
                  📈 Recebíveis
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--fi-color-text-muted)', marginBottom: 'var(--fi-space-3)' }}>
                  Shibari House → Foraisso
                </div>
                <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--fi-color-success)', lineHeight: 1 }}>
                  {formatCurrency(summary.totalReceivables)}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: '1px', background: 'var(--fi-color-border)', marginBottom: 'var(--fi-space-6)' }} />

            {/* Saldo */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--fi-color-text-muted)', marginBottom: 'var(--fi-space-2)' }}>
                Saldo Líquido Pendente
              </div>
              <div
                style={{
                  fontSize: '2.75rem',
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
              <div
                style={{
                  marginTop: 'var(--fi-space-3)',
                  fontSize: '0.95rem',
                  fontWeight: 600,
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

          {/* Pending Transactions List (Readonly) */}
          <div className="card">
            <div className="section-header">
              <span className="section-title">Transações Pendentes (Dívidas e Recebíveis)</span>
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
                      <th>Descrição</th>
                      <th>Recebedor</th>
                      <th>Pagamento</th>
                      <th>Tipo Split</th>
                      <th style={{ textAlign: 'right' }}>Valor Split</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingTransactions.map((tx) => (
                      <tr key={tx.id}>
                        <td className="text-mono text-xs">{tx.transaction_date}</td>
                        <td style={{ fontSize: '0.85rem' }}>{tx.person_name ?? '—'}</td>
                        <td style={{ fontSize: '0.85rem' }}>{tx.description}</td>
                        <td style={{ fontSize: '0.8rem' }}>
                          {tx.received_by === 'shibarihouse' ? '🏛️ ShibariHouse' : '🩸 Foraisso'}
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
        </div>
      )}
    </div>
  );
}

export default ValoresPage;
