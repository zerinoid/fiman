import type { Transaction } from '@fi/types';
import { CATEGORY_ICONS, CATEGORY_LABELS, formatCurrency, formatDate, formatTxDate } from '../../utils/categories';

interface Props { 
  transactions: Transaction[]; 
  onToggleProjection?: (id: string, isReceived: boolean) => void;
}

export function RecentTransactionsList({ transactions, onToggleProjection }: Props) {
  if (transactions.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-state-icon">📭</span>
        <p className="empty-state-text">Nenhuma transação este mês.</p>
      </div>
    );
  }

  return (
    <div className="tx-list">
      {transactions.map(tx => {
        const timeStr = tx.transaction_datetime
          ? new Date(tx.transaction_datetime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
          : null;

        return (
          <div key={tx.id} className="tx-item">
            <div className={`tx-icon ${tx.type}`}>
              {CATEGORY_ICONS[tx.category] ?? '💵'}
            </div>
            <div className="tx-info">
              <div className="tx-name">
                {tx.description ?? CATEGORY_LABELS[tx.category]}
                {tx.installment_index && tx.total_installments > 1 && (
                  <span style={{ fontSize: '0.75rem', opacity: 0.7, marginLeft: '0.4rem', color: 'var(--fi-color-primary)' }}>
                    ({tx.installment_index}/{tx.total_installments})
                  </span>
                )}
              </div>
              <div className="tx-meta">
                <span>{formatTxDate(tx)}</span>
                {timeStr && (
                  <span style={{ marginLeft: '0.4rem', opacity: 0.85 }}>
                    • {timeStr}
                  </span>
                )}
                {tx.is_credit_card && (
                  <span className="badge badge-credit-card" style={{ marginLeft: '0.4rem' }} title={`Fatura com vencimento em ${formatDate(tx.due_date)}`}>
                    💳 {formatDate(tx.due_date).substring(0, 5)}
                  </span>
                )}
                {tx.type === 'income' && tx.is_projection && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    style={{
                      marginLeft: '0.4rem',
                      fontSize: '0.68rem',
                      padding: '0.1rem 0.35rem',
                      background: 'rgba(234, 179, 8, 0.18)',
                      color: '#eab308',
                      border: '1px solid rgba(234, 179, 8, 0.4)',
                      borderRadius: 'var(--fi-radius-sm)',
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                    onClick={() => onToggleProjection?.(tx.id, true)}
                    title="Clique para confirmar recebimento (quitar)"
                  >
                    ⏳ Quitar Projeção
                  </button>
                )}
                {!tx.is_projection && tx.type === 'income' && tx.paid_at && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    style={{
                      marginLeft: '0.4rem',
                      fontSize: '0.68rem',
                      padding: '0.1rem 0.35rem',
                      background: 'rgba(34, 197, 94, 0.15)',
                      color: 'var(--fi-color-success, #22c55e)',
                      border: '1px solid rgba(34, 197, 94, 0.3)',
                      borderRadius: 'var(--fi-radius-sm)',
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                    onClick={() => onToggleProjection?.(tx.id, false)}
                    title="Recebimento confirmado"
                  >
                    ✓ Recebido
                  </button>
                )}
              </div>
              {tx.tags && tx.tags.length > 0 && (
                <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                  {tx.tags.map(t => (
                    <span key={t} className="tag-badge">#{t}</span>
                  ))}
                </div>
              )}
            </div>
            <div className={`tx-amount ${tx.type}`}>
              {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
