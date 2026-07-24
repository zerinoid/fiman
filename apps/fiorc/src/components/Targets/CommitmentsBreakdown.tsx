import type { MonthlyTarget } from '@fi/types';
import { formatCurrency } from '../../utils/categories';

interface Props { target: MonthlyTarget | null; }

export function CommitmentsBreakdown({ target }: Props) {
  if (!target) {
    return (
      <div className="empty-state">
        <span className="empty-state-icon">📋</span>
        <p className="empty-state-text">Defina a meta para ver o detalhamento.</p>
      </div>
    );
  }

  const credit = target.condo_credit ?? 0;

  const rows = [
    { icon: '🏠', label: 'Aluguel Base',       amount: target.rent_base,  positive: false },
    { icon: '🏢', label: 'Condomínio Base',     amount: target.condo_base, positive: false },
    { icon: '📡', label: 'Crédito Antena',      amount: credit,            positive: credit > 0 },
  ];

  return (
    <div>
      <div className="commitments-grid">
        {rows.map(row => (
          <div key={row.label} className="commitment-row">
            <span className="commitment-label">
              <span>{row.icon}</span>
              {row.label}
            </span>
            <span
              className="commitment-amount"
              style={{
                color: row.label === 'Crédito Antena' && credit < 0
                  ? 'var(--fi-color-success)'
                  : 'var(--fi-color-text)',
              }}
            >
              {formatCurrency(row.amount)}
            </span>
          </div>
        ))}
      </div>

      <div className="commitment-total">
        <span className="commitment-total-label">💳 Total a Pagar</span>
        <span className="commitment-total-amount">{formatCurrency(target.total_target)}</span>
      </div>
    </div>
  );
}
