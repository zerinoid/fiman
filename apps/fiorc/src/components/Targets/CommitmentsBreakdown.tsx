import { useState } from 'react';
import type { MonthlyTarget, CommitmentItem } from '@fi/types';
import { formatCurrency } from '../../utils/categories';
import { useTransactions } from '../../hooks/useTransactions';
import { toMonthDate } from '../../utils/categories';

interface Props { 
  target: MonthlyTarget | null;
  payCommitment?: (id: string) => Promise<void>;
}

export function CommitmentsBreakdown({ target, payCommitment }: Props) {
  // We extract year/month from the target's month_year if available to use in useTransactions
  const year = target ? parseInt(target.month_year.substring(0, 4), 10) : new Date().getFullYear();
  const month = target ? parseInt(target.month_year.substring(5, 7), 10) : new Date().getMonth() + 1;
  const { addTransaction } = useTransactions(year, month);
  const [payingId, setPayingId] = useState<string | null>(null);

  if (!target) {
    return (
      <div className="empty-state">
        <span className="empty-state-icon">📋</span>
        <p className="empty-state-text">Defina a meta para ver o detalhamento.</p>
      </div>
    );
  }

  const commitments = target.commitments || [];

  const handleQuitar = async (c: CommitmentItem) => {
    if (!payCommitment) return;
    setPayingId(c.id);
    try {
      // 1. Create a transaction for this commitment
      const txDate = toMonthDate(year, month).substring(0, 8) + String(c.due_day).padStart(2, '0');
      
      await addTransaction({
        person_id: null,
        type: 'expense',
        category: 'housing', // Fallback or could be mapped based on name
        amount: c.amount,
        due_date: txDate,
        paid_at: new Date().toISOString().split('T')[0], // Paid today
        is_projection: false,
        is_credit_card: false, // Could be handled specifically if needed
        installment_index: 1,
        total_installments: 1,
        description: c.name,
      });

      // 2. Mark commitment as paid
      await payCommitment(c.id);
    } catch (err) {
      console.error('Failed to quitar:', err);
    } finally {
      setPayingId(null);
    }
  };

  return (
    <div>
      <div className="commitments-grid">
        {commitments.map(c => (
          <div key={c.id} className="commitment-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="commitment-label">
              <span style={{ marginRight: '0.5rem' }}>{c.is_paid ? '✅' : '⏳'}</span>
              {c.name}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--fi-space-3)' }}>
              <span
                className="commitment-amount"
                style={{
                  color: c.amount < 0
                    ? 'var(--fi-color-success)'
                    : 'var(--fi-color-text)',
                  textDecoration: c.is_paid ? 'line-through' : 'none'
                }}
              >
                {formatCurrency(c.amount)}
              </span>
              {!c.is_paid && payCommitment && (
                <button
                  className="btn btn-secondary"
                  style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                  onClick={() => handleQuitar(c)}
                  disabled={payingId === c.id}
                >
                  {payingId === c.id ? '...' : 'Quitar'}
                </button>
              )}
            </div>
          </div>
        ))}
        {commitments.length === 0 && (
          <p style={{ color: 'var(--fi-color-text-muted)', fontSize: '0.875rem' }}>Nenhum compromisso.</p>
        )}
      </div>

      <div className="commitment-total" style={{ marginTop: 'var(--fi-space-6)' }}>
        <span className="commitment-total-label">💳 Total a Pagar</span>
        <span className="commitment-total-amount">{formatCurrency(target.total_target)}</span>
      </div>
    </div>
  );
}
