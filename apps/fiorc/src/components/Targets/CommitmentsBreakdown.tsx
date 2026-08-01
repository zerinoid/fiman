import { useState } from 'react';
import type { MonthlyTarget, CommitmentItem, CommitmentType } from '@fi/types';
import { formatCurrency } from '../../utils/categories';
import { useTransactions } from '../../hooks/useTransactions';
import { toMonthDate } from '../../utils/categories';
import { CommitmentModal } from './CommitmentModal';
import { inferSplitRuleAndCategory, calculateSplitShare } from '../../utils/splitting';

interface Props {
  target: MonthlyTarget | null;
  activeRoommatesCount: 2 | 3;
  payCommitment?: (id: string, transactionId?: string) => Promise<void>;
  unpayCommitment?: (id: string, name: string) => Promise<void>;
  deleteCommitment?: (id: string, name: string) => Promise<void>;
  upsertTarget?: (updates: Partial<Omit<MonthlyTarget, 'id' | 'created_at'>>) => Promise<MonthlyTarget>;
}

export function CommitmentsBreakdown({
  target,
  activeRoommatesCount,
  payCommitment,
  unpayCommitment,
  deleteCommitment,
  upsertTarget,
}: Props) {
  const year = target ? parseInt(target.month_year.substring(0, 4), 10) : new Date().getFullYear();
  const month = target ? parseInt(target.month_year.substring(5, 7), 10) : new Date().getMonth() + 1;
  const { addTransaction } = useTransactions(year, month);

  const [payingId, setPayingId] = useState<string | null>(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [commitmentToEdit, setCommitmentToEdit] = useState<CommitmentItem | null>(null);

  const rawCommitments = target?.commitments || [];

  const handleQuitar = async (c: CommitmentItem) => {
    if (!payCommitment) return;
    setPayingId(c.id);
    try {
      const txDate = toMonthDate(year, month).substring(0, 8) + String(c.due_day).padStart(2, '0');
      const nowIso = new Date().toISOString();

      const personalAmount = c.user_calculated_share ?? c.amount;

      const createdTxList = await addTransaction({
        person_id: null,
        type: 'expense',
        category: 'housing',
        amount: personalAmount,
        due_date: txDate,
        transaction_datetime: nowIso,
        paid_at: new Date().toISOString().split('T')[0],
        is_projection: false,
        is_credit_card: false,
        installment_index: 1,
        total_installments: 1,
        description: c.name,
      });

      await payCommitment(c.id, createdTxList?.[0]?.id);
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

  const handleToggleActive = async (c: CommitmentItem) => {
    if (!upsertTarget) return;
    const nextActiveState = !(c.is_active !== false);
    const updated = rawCommitments.map(item =>
      item.id === c.id ? { ...item, is_active: nextActiveState } : item
    );
    await upsertTarget({ commitments: updated });
  };

  const handleSaveCommitment = async (c: CommitmentItem) => {
    if (!upsertTarget) return;

    let updatedCommitments: CommitmentItem[];
    if (commitmentToEdit) {
      updatedCommitments = rawCommitments.map(existing => existing.id === c.id ? c : existing);
    } else {
      updatedCommitments = [...rawCommitments, c];
    }

    await upsertTarget({ commitments: updatedCommitments });
  };

  const handleDelete = async (c: CommitmentItem) => {
    if (!deleteCommitment || !window.confirm(`Tem certeza que deseja deletar "${c.name}"?`)) return;
    try {
      await deleteCommitment(c.id, c.name);
    } catch (err) {
      console.error('Failed to delete commitment:', err);
    }
  };

  const openAddModal = () => {
    setCommitmentToEdit(null);
    setModalOpen(true);
  };

  const openEditModal = (c: CommitmentItem) => {
    setCommitmentToEdit(c);
    setModalOpen(true);
  };

  // Group commitments by category type
  const categorized: Record<CommitmentType, CommitmentItem[]> = {
    fixed: [],
    toggleable: [],
    variable: [],
  };

  for (const c of rawCommitments) {
    const inferred = inferSplitRuleAndCategory(c.name);
    const cat = c.category_type || inferred.categoryType;
    categorized[cat].push(c);
  }

  const renderCategoryGroup = (title: string, icon: string, items: CommitmentItem[], description: string) => {
    if (items.length === 0) return null;

    return (
      <div className="section" style={{ marginBottom: 'var(--fi-space-6)' }}>
        <div style={{ marginBottom: 'var(--fi-space-3)' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <span>{icon}</span> {title}
          </h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--fi-color-text-muted)', margin: '0.25rem 0 0 0' }}>
            {description}
          </p>
        </div>

        {/* Asymmetric Masonry Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1rem',
            alignItems: 'start',
          }}
        >
          {items.map(c => {
            const isCcFatura = c.name === 'Fatura do Cartão';
            const isActive = c.is_active !== false;
            const rule = c.split_rule || inferSplitRuleAndCategory(c.name).splitRule;
            const split = calculateSplitShare(c.amount, rule, activeRoommatesCount);

            return (
              <div
                key={c.id}
                style={{
                  background: 'var(--fi-color-bg-card, rgba(255,255,255,0.03))',
                  borderRadius: 'var(--fi-radius-lg, 12px)',
                  border: c.is_paid
                    ? '1px solid rgba(16, 185, 129, 0.3)'
                    : !isActive
                    ? '1px dashed var(--fi-color-border, rgba(255,255,255,0.15))'
                    : '1px solid var(--fi-color-border, rgba(255,255,255,0.1))',
                  padding: '1.25rem',
                  opacity: !isActive ? 0.6 : 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
              >
                {/* Card Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>
                      {!isActive ? '⏸️' : c.is_paid ? '✅' : '⏳'}
                    </span>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, textDecoration: c.is_paid ? 'line-through' : 'none' }}>
                        {c.name}
                      </h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--fi-color-text-muted)' }}>
                        Vencimento dia {c.due_day}
                      </span>
                    </div>
                  </div>

                  {/* Toggle active switch for toggleable commitments */}
                  {c.category_type === 'toggleable' && (
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => handleToggleActive(c)}
                      title={isActive ? 'Suspender este mês' : 'Ativar este mês'}
                      style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '12px', background: isActive ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)', color: isActive ? '#ef4444' : '#10b981' }}
                    >
                      {isActive ? 'Suspender' : 'Ativar'}
                    </button>
                  )}
                </div>

                {/* Values & Rule */}
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                    <span style={{ color: 'var(--fi-color-text-muted)' }}>Valor Total da Conta:</span>
                    <span style={{ fontWeight: 600 }}>{formatCurrency(c.amount)}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                    <span style={{ color: 'var(--fi-color-text-muted)' }}>Regra:</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--fi-color-primary, #3b82f6)' }}>
                      {split.splitLabel}
                    </span>
                  </div>

                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.375rem', marginTop: '0.125rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Sua Cota Pessoal:</span>
                    <span style={{ fontSize: '1.125rem', fontWeight: 700, color: c.is_paid ? 'var(--fi-color-success, #10b981)' : 'var(--fi-color-text)' }}>
                      {formatCurrency(split.userCalculatedShare)}
                    </span>
                  </div>
                </div>

                {/* Receivables breakdown if applicable */}
                {(split.receivables.roommate_b || split.receivables.roommate_c || split.receivables.mother) ? (
                  <div style={{ fontSize: '0.75rem', color: 'var(--fi-color-text-muted)', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    <span style={{ fontWeight: 600 }}>A receber:</span>
                    {split.receivables.roommate_b ? <div>• Morador B: {formatCurrency(split.receivables.roommate_b)}</div> : null}
                    {split.receivables.roommate_c ? <div>• Morador C: {formatCurrency(split.receivables.roommate_c)}</div> : null}
                    {split.receivables.mother ? <div>• Mãe: {formatCurrency(split.receivables.mother)}</div> : null}
                  </div>
                ) : null}

                {/* Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  {upsertTarget && !isCcFatura && (
                    <>
                      <button className="btn btn-ghost btn-icon" onClick={() => openEditModal(c)} title="Editar">✏️</button>
                      <button className="btn btn-ghost btn-icon" style={{ color: 'var(--fi-color-danger)' }} onClick={() => handleDelete(c)} title="Deletar">🗑️</button>
                    </>
                  )}

                  {!c.is_paid && payCommitment && isActive && (
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleQuitar(c)}
                      disabled={payingId === c.id}
                      title="Quitar"
                    >
                      {payingId === c.id ? 'Quitando…' : '💳 Quitar'}
                    </button>
                  )}

                  {c.is_paid && unpayCommitment && (
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ color: 'var(--fi-color-warning, #f59e0b)' }}
                      onClick={() => handleReverter(c)}
                      disabled={payingId === c.id}
                      title="Reverter Pagamento"
                    >
                      {payingId === c.id ? 'Revertendo…' : '🔄 Reverter'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--fi-space-6)' }}>
        <div>
          <h2 className="section-title" style={{ margin: 0 }}>📊 Compromissos Estabelecidos</h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--fi-color-text-muted)', margin: '0.25rem 0 0 0' }}>
            Grade de metas com cálculo de rateio para {activeRoommatesCount} moradores
          </p>
        </div>
        {upsertTarget && (
          <button className="btn btn-primary btn-sm" onClick={openAddModal}>
            + Adicionar Metas
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
          {renderCategoryGroup('Compromissos Fixos Recorrentes', '📌', categorized.fixed, 'Moradia, serviços básicos e assinaturas fixas.')}
          {renderCategoryGroup('Compromissos Desligáveis / Opcionais', '⚡', categorized.toggleable, 'Metas que podem ser suspensas em meses mais apertados.')}
          {renderCategoryGroup('Compromissos Variáveis / Cursos', '🎓', categorized.variable, 'Cursos, workshops e investimentos educacionais pontuais.')}

          <div className="card commitment-total" style={{ marginTop: 'var(--fi-space-6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="commitment-total-label">💳 Sua Cota Total a Pagar</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--fi-color-text-muted)' }}>Custo pessoal líquido após aplicação das regras de rateio</div>
            </div>
            <span className="commitment-total-amount" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--fi-color-primary)' }}>
              {formatCurrency(target.total_target)}
            </span>
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
