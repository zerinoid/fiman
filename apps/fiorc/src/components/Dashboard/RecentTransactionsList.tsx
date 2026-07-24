import type { Transaction } from '@fi/types';
import { CATEGORY_ICONS, CATEGORY_LABELS, formatCurrency, formatDate } from '../../utils/categories';

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
      {transactions.map(tx => (
        <div key={tx.id} className="tx-item">
          <div className={`tx-icon ${tx.type}`}>
            {CATEGORY_ICONS[tx.category] ?? '💵'}
          </div>
          <div className="tx-info">
            <div className="tx-name">
              {tx.description ?? CATEGORY_LABELS[tx.category]}
            </div>
            <div className="tx-meta">
              {formatDate(tx.due_date)}
              {tx.is_projection && (
                <span className="badge badge-projection" style={{ marginLeft: '0.5rem' }}>Projeção</span>
              )}
            </div>
          </div>
          <div className={`tx-amount ${tx.type}`}>
            {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
          </div>
        </div>
      ))}
    </div>
  );
}
