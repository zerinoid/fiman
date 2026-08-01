import { useState } from 'react';
import type { MonthlyTarget, CommitmentItem } from '@fi/types';
import { formatCurrency } from '../../utils/categories';
import { useTransactions } from '../../hooks/useTransactions';
import { toMonthDate } from '../../utils/categories';
import { CommitmentModal } from './CommitmentModal';

interface Props { 
  target: MonthlyTarget | null;
  payCommitment?: (id: string) => Promise<void>;
  unpayCommitment?: (id: string, name: string) => Promise<void>;
  upsertTarget?: (updates: Partial<Omit<MonthlyTarget, 'id' | 'created_at'>>) => Promise<MonthlyTarget>;
}

export function CommitmentsBreakdown({ target, payCommitment, unpayCommitment, upsertTarget }: Props) {
  // We extract year/month from the target's month_year if available to use in useTransactions
  const year = target ? parseInt(target.month_year.substring(0, 4), 10) : new Date().getFullYear();
  const month = target ? parseInt(target.month_year.substring(5, 7), 10) : new Date().getMonth() + 1;
  const { addTransaction } = useTransactions(year, month);
  
  const [payingId, setPayingId] = useState<string | null>(null);
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [commitmentToEdit, setCommitmentToEdit] = useState<CommitmentItem | null>(null);

  const commitments = target?.commitments || [];

  const handleQuitar = async (c: CommitmentItem) => {
    if (!payCommitment) return;
    setPayingId(c.id);
    try {
      const txDate = toMonthDate(year, month).substring(0, 8) + String(c.due_day).padStart(2, '0');
      const nowIso = new Date().toISOString();
      
      await addTransaction({
        person_id: null,
        type: 'expense',
        category: 'housing', // Fallback
        amount: c.amount,
        due_date: txDate,
        transaction_datetime: nowIso,
        paid_at: new Date().toISOString().split('T')[0],
        is_projection: false,
        is_credit_card: false,
        installment_index: 1,
        total_installments: 1,
        description: c.name,
      });

      await payCommitment(c.id);
    } catch (err) {
      console.error('Failed to quitar:', err);
    } finally {
      setPayingId(null);
    }
  };

  const handleReverter = async (c: CommitmentItem) => {
    if (!unpayCommitment || !window.confirm(`Deseja reverter o pagamento de "${c.name}"? O registro de pagamento desta meta será excluído.`)) return;
    setPayingId(c.id);
    try {
      await unpayCommitment(c.id, c.name);
    } catch (err) {
      console.error('Failed to reverter:', err);
    } finally {
      setPayingId(null);
    }
  };

  const handleSaveCommitment = async (c: CommitmentItem) => {
    if (!upsertTarget) return;
    
    let updatedCommitments: CommitmentItem[];
    if (commitmentToEdit) {
      updatedCommitments = commitments.map(existing => existing.id === c.id ? c : existing);
    } else {
      updatedCommitments = [...commitments, c];
    }
    
    const total = updatedCommitments.reduce((sum, item) => sum + (item.amount || 0), 0);
    
    await upsertTarget({
      commitments: updatedCommitments,
      total_target: total,
    });
  };

  const handleDelete = async (id: string) => {
    if (!upsertTarget || !window.confirm('Tem certeza que deseja deletar este compromisso?')) return;
    
    const updatedCommitments = commitments.filter(c => c.id !== id);
    const total = updatedCommitments.reduce((sum, item) => sum + (item.amount || 0), 0);
    
    await upsertTarget({
      commitments: updatedCommitments,
      total_target: total,
    });
  };

  const openAddModal = () => {
    setCommitmentToEdit(null);
    setModalOpen(true);
  };

  const openEditModal = (c: CommitmentItem) => {
    setCommitmentToEdit(c);
    setModalOpen(true);
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--fi-space-6)' }}>
        <div className="section-title">📊 Compromissos Estabelecidos</div>
        {upsertTarget && (
          <button className="btn btn-primary btn-sm" onClick={openAddModal}>
            + Adicionar
          </button>
        )}
      </div>

      {!target ? (
        <div className="empty-state">
          <span className="empty-state-icon">📋</span>
          <p className="empty-state-text">Defina a meta para ver os compromissos.</p>
        </div>
      ) : (
        <>
          <div className="commitments-grid">
            {commitments.map(c => {
              const isCcFatura = c.name === 'Fatura do Cartão';

              return (
                <div key={c.id} className="commitment-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid var(--fi-color-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>{c.is_paid ? '✅' : '⏳'}</span>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span className="commitment-label" style={{ margin: 0 }}>
                        {c.name}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--fi-color-text-muted)' }}>
                        Dia {c.due_day}
                      </span>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--fi-space-3)' }}>
                    <span
                      className="commitment-amount"
                      style={{
                        color: c.amount < 0 ? 'var(--fi-color-success)' : 'var(--fi-color-text)',
                        textDecoration: c.is_paid ? 'line-through' : 'none'
                      }}
                    >
                      {formatCurrency(c.amount)}
                    </span>
                    
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      {upsertTarget && !isCcFatura && (
                        <>
                          <button
                            className="btn btn-ghost btn-icon"
                            style={{ padding: '0.25rem', fontSize: '1rem' }}
                            onClick={() => openEditModal(c)}
                            title="Editar"
                          >
                            ✏️
                          </button>
                          <button
                            className="btn btn-ghost btn-icon"
                            style={{ padding: '0.25rem', fontSize: '1rem', color: 'var(--fi-color-danger)' }}
                            onClick={() => handleDelete(c.id)}
                            title="Deletar"
                          >
                            🗑️
                          </button>
                        </>
                      )}
                      {!c.is_paid && payCommitment && (
                        <button
                          className="btn btn-ghost btn-icon"
                          style={{ padding: '0.25rem', fontSize: '1rem', marginLeft: '0.25rem' }}
                          onClick={() => handleQuitar(c)}
                          disabled={payingId === c.id}
                          title="Quitar"
                        >
                          {payingId === c.id ? '...' : '💳'}
                        </button>
                      )}
                      {c.is_paid && unpayCommitment && (
                        <button
                          className="btn btn-ghost btn-icon"
                          style={{ padding: '0.25rem', fontSize: '1rem', marginLeft: '0.25rem', color: 'var(--fi-color-warning)' }}
                          onClick={() => handleReverter(c)}
                          disabled={payingId === c.id}
                          title="Reverter Pagamento"
                        >
                          {payingId === c.id ? '...' : '🔄'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {commitments.length === 0 && (
              <p style={{ color: 'var(--fi-color-text-muted)', fontSize: '0.875rem' }}>Nenhum compromisso.</p>
            )}
          </div>

          <div className="commitment-total" style={{ marginTop: 'var(--fi-space-6)' }}>
            <span className="commitment-total-label">💳 Total a Pagar</span>
            <span className="commitment-total-amount">{formatCurrency(target.total_target)}</span>
          </div>
        </>
      )}
      
      <CommitmentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveCommitment}
        commitmentToEdit={commitmentToEdit}
      />
    </div>
  );
}
