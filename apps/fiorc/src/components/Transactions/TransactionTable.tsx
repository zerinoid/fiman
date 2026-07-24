import type { Transaction } from '@fi/types';
import { formatCurrency, formatDate, CATEGORY_LABELS, CATEGORY_ICONS } from '../../utils/categories';

interface Props { transactions: Transaction[]; loading: boolean; }

export function TransactionTable({ transactions, loading }: Props) {
  if (loading) {
    return <div className="loading-center"><div className="spinner" /></div>;
  }

  if (transactions.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-state-icon">📭</span>
        <p className="empty-state-text">Nenhuma transação encontrada.</p>
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Data</th>
            <th>Categoria</th>
            <th>Descrição</th>
            <th>Tipo</th>
            <th style={{ textAlign: 'right' }}>Valor</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(tx => (
            <tr key={tx.id}>
              <td style={{ whiteSpace: 'nowrap', color: 'var(--fi-color-text-muted)', fontSize: '0.8rem' }}>
                {formatDate(tx.due_date)}
              </td>
              <td>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  {CATEGORY_ICONS[tx.category]} {CATEGORY_LABELS[tx.category]}
                </span>
              </td>
              <td style={{ color: 'var(--fi-color-text-muted)', fontSize: '0.85rem' }}>
                {tx.description ?? '—'}
              </td>
              <td>
                <span className={`badge badge-${tx.type}`}>
                  {tx.type === 'income' ? 'Receita' : 'Despesa'}
                </span>
                {tx.is_projection && (
                  <span className="badge badge-projection" style={{ marginLeft: '0.25rem' }}>Proj.</span>
                )}
              </td>
              <td style={{ textAlign: 'right', fontFamily: 'var(--fi-font-mono)', fontWeight: 600 }}>
                <span style={{ color: tx.type === 'income' ? 'var(--fi-color-success)' : 'var(--fi-color-danger)' }}>
                  {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
