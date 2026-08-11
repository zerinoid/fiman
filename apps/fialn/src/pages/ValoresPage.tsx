import { useState } from 'react';
import { useValores } from '../hooks/useValores';

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function ValoresPage() {
  const { summary, loading, error, settling, settle, refresh } = useValores();
  const [settleMsg, setSettleMsg] = useState<string | null>(null);
  const [settleError, setSettleError] = useState<string | null>(null);

  const handleSettle = async () => {
    if (!window.confirm('Confirma a quitação de todos os repasses pendentes?')) return;
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
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">💰 Valores</h1>
          <p className="page-subtitle">Repasses pendentes entre Foraisso e Shibari House</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={refresh} disabled={loading}>
          ↺ Atualizar
        </button>
      </div>

      {error && <div className="alert alert-error mb-4">✗ {error}</div>}
      {settleError && <div className="alert alert-error mb-4">✗ {settleError}</div>}
      {settleMsg && <div className="alert alert-success mb-4">✓ {settleMsg}</div>}

      {loading ? (
        <div className="loading-center" style={{ minHeight: '40vh' }}>
          <div className="spinner spinner-lg" />
          <span>Carregando valores…</span>
        </div>
      ) : (
        <div
          className="card"
          style={{
            maxWidth: '560px',
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
          <div style={{ textAlign: 'center', marginBottom: 'var(--fi-space-6)' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--fi-color-text-muted)', marginBottom: 'var(--fi-space-2)' }}>
              Saldo Líquido
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

          {/* QUITAR button */}
          {summary.pendingCount > 0 && (
            <button
              className="btn btn-primary w-full"
              style={{ fontSize: '1rem', padding: '0.75rem' }}
              onClick={handleSettle}
              disabled={settling}
            >
              {settling ? (
                <><span className="spinner" /> Quitando…</>
              ) : (
                `✓ QUITAR (${summary.pendingCount} registro${summary.pendingCount !== 1 ? 's' : ''})`
              )}
            </button>
          )}

          {summary.pendingCount === 0 && !loading && (
            <div style={{ textAlign: 'center', color: 'var(--fi-color-text-muted)', fontSize: '0.9rem' }}>
              Nenhum repasse pendente.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ValoresPage;
