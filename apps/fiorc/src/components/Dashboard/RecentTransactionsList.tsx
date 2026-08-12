import type { Transaction } from '@fi/types';
import { CATEGORY_ICONS, CATEGORY_LABELS, formatCurrency, formatDate, formatTxDate } from '../../utils/categories';

interface Props { transactions: Transaction[]; }

export function RecentTransactionsList({ transactions }: Props) {
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
                {tx.is_projection && (
                  <span className="badge badge-projection" style={{ marginLeft: '0.4rem' }}>Projeção</span>
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
