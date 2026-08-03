import { useState } from 'react';
import type { MonthlyTarget, CommitmentItem, CommitmentType, SplitRuleType } from '@fi/types';
import { formatCurrency } from '../../utils/categories';
import { useTransactions } from '../../hooks/useTransactions';
import { toMonthDate } from '../../utils/categories';
import { CommitmentModal } from './CommitmentModal';
import { inferSplitRuleAndCategory, calculateSplitShare, findForecastAmount } from '../../utils/splitting';

interface Props {
  target: MonthlyTarget | null;
  activeRoommatesCount: 2 | 3;
  forecastMap?: Record<string, number>;
  payCommitment?: (id: string, transactionId?: string) => Promise<void>;
  unpayCommitment?: (id: string, name: string) => Promise<void>;
  deleteCommitment?: (id: string, name: string) => Promise<void>;
  upsertTarget?: (updates: Partial<Omit<MonthlyTarget, 'id' | 'created_at'>>) => Promise<MonthlyTarget>;
}

const DEFAULT_FIXED_ITEMS: Omit<CommitmentItem, 'id'>[] = [
  { name: 'Aluguel + Condomínio', amount: 0, due_day: 10, is_paid: false, category_type: 'fixed', split_rule: 'weighted_rent', is_active: true },
  { name: 'Fatura do Cartão', amount: 0, due_day: 8, is_paid: false, category_type: 'fixed', split_rule: 'none', is_active: true },
  { name: 'Conta de Luz', amount: 0, due_day: 15, is_paid: false, category_type: 'fixed', split_rule: 'equal_roommates', is_active: true },
  { name: 'Internet Claro', amount: 0, due_day: 20, is_paid: false, category_type: 'fixed', split_rule: 'equal_roommates', is_active: true },
  { name: 'TIM Celular', amount: 0, due_day: 5, is_paid: false, category_type: 'fixed', split_rule: 'mobile_shared', is_active: true },
  { name: 'Estudo Shibari (Assinatura)', amount: 15, due_day: 1, is_paid: false, category_type: 'fixed', split_rule: 'none', is_active: true },
];

function isDefaultItemPresent(defName: string, commitments: CommitmentItem[]): boolean {
  const defLower = defName.toLowerCase();

  return commitments.some(c => {
    const nameLower = c.name.toLowerCase();

    if (nameLower === defLower) return true;

    if (defLower.includes('aluguel') && (nameLower.includes('aluguel') || nameLower.includes('condomínio') || nameLower.includes('condominio'))) {
      return true;
    }
    if (defLower.includes('luz') && (nameLower.includes('luz') || nameLower.includes('energia') || nameLower.includes('eletricidade'))) {
      return true;
    }
    if (defLower.includes('internet') && (nameLower.includes('internet') || nameLower.includes('claro') || nameLower.includes('net'))) {
      return true;
    }
    if (defLower.includes('tim') && (nameLower.includes('tim') || nameLower.includes('celular'))) {
      return true;
    }
    if (defLower.includes('shibari') && (nameLower.includes('shibari') || nameLower.includes('rope'))) {
      return true;
    }
    if (defLower.includes('cartão') && (nameLower.includes('cartão') || nameLower.includes('cartao') || nameLower.includes('fatura'))) {
      return true;
    }

    return false;
  });
}

function getRuleIcon(rule: SplitRuleType = 'none') {
  switch (rule) {
    case 'equal_roommates':
      return { icon: '👥', label: 'COLETIVO' };
    case 'weighted_rent':
    case 'mobile_shared':
      return { icon: '⭐', label: 'REGRA ESPECIAL' };
    case 'none':
    default:
      return { icon: '👤', label: 'INDIVIDUAL' };
  }
}

function getTypeIcon(catType: CommitmentType = 'fixed') {
  switch (catType) {
    case 'optional':
      return { icon: '⚡', label: 'Opcional', isFixed: false };
    case 'occasional':
      return { icon: '🎲', label: 'Ocasional', isFixed: false };
    case 'fixed':
    default:
      return { icon: '📌', label: 'Fixo', isFixed: true };
  }
}

export function CommitmentsBreakdown({
  target,
  activeRoommatesCount,
  forecastMap,
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

  // Merge default fixed commitments ONLY IF not already present
  const mergedCommitments: CommitmentItem[] = [...rawCommitments];
  for (const defItem of DEFAULT_FIXED_ITEMS) {
    const exists = isDefaultItemPresent(defItem.name, rawCommitments);
    if (!exists) {
      mergedCommitments.push({
        id: `default-${defItem.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
        ...defItem,
      });
    }
  }

  const currentDateStr = toMonthDate(new Date().getFullYear(), new Date().getMonth() + 1);
  const targetDateStr = target?.month_year || toMonthDate(year, month);
  const isFutureMonth = targetDateStr > currentDateStr;

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
    const isExistingInRaw = rawCommitments.some(existing => existing.id === c.id || existing.name.toLowerCase().trim() === c.name.toLowerCase().trim());

    if (isExistingInRaw) {
      updatedCommitments = rawCommitments.map(existing =>
        (existing.id === c.id || existing.name.toLowerCase().trim() === c.name.toLowerCase().trim()) ? c : existing
      );
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

  return (
    <div>
      {/* Total Card */}
      {target && (
        <div className="card commitment-total" style={{ marginBottom: 'var(--fi-space-6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="commitment-total-label">
              💳 {isFutureMonth ? 'Sua Cota Total Estimada (Previsão)' : 'Sua Cota Total de Metas'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--fi-color-text-muted)' }}>
              {isFutureMonth
                ? 'Custo líquido estimado via média móvel ponderada para este mês futuro'
                : 'Custo pessoal líquido após aplicação das regras de rateio'}
            </div>
          </div>
          <span className="commitment-total-amount" style={{ fontSize: '1.75rem', fontWeight: 800, color: isFutureMonth ? '#c084fc' : 'var(--fi-color-primary)' }}>
            {formatCurrency(target.total_target)}
          </span>
        </div>
      )}

      {/* Unified Masonry Grid */}
      <div className="masonry-grid">
        {mergedCommitments.map(c => {
          const isCcFatura = c.name === 'Fatura do Cartão';
          const isActive = c.is_active !== false;

          const inferred = inferSplitRuleAndCategory(c.name);
          let catType = (c.category_type || inferred.categoryType) as CommitmentType;
          if ((catType as string) === 'toggleable') catType = 'optional';
          if ((catType as string) === 'variable') catType = 'occasional';

          const rule = c.split_rule || inferred.splitRule;

          // Placeholders ONLY exist for 'fixed' and 'optional' commitments
          const supportsPlaceholder = catType === 'fixed' || catType === 'optional';
          const isForecast = supportsPlaceholder && !c.is_paid && !c.is_manually_set && (isFutureMonth || c.amount === 0);
          const forecastedVal = isForecast && forecastMap ? findForecastAmount(c.name, forecastMap) : 0;
          const displayAmount = forecastedVal > 0 ? forecastedVal : c.amount;
          const isUnpopulated = supportsPlaceholder && displayAmount === 0;

          const split = calculateSplitShare(displayAmount, rule, activeRoommatesCount);

          const ruleInfo = getRuleIcon(rule);
          const typeInfo = getTypeIcon(catType);

          return (
            <div
              key={c.id}
              style={{
                background: 'var(--fi-color-bg-card, rgba(255,255,255,0.03))',
                borderRadius: 'var(--fi-radius-lg, 12px)',
                border: c.is_paid
                  ? '1px solid rgba(16, 185, 129, 0.4)'
                  : !isActive
                  ? '1px dashed var(--fi-color-border, rgba(255,255,255,0.15))'
                  : isForecast && forecastedVal > 0
                  ? '1px solid rgba(168, 85, 247, 0.45)'
                  : isUnpopulated
                  ? '1px dashed rgba(245, 158, 11, 0.5)'
                  : '1px solid var(--fi-color-border, rgba(255,255,255,0.1))',
                padding: '1.25rem',
                opacity: !isActive ? 0.5 : 1,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
              }}
            >
              {/* Card Header matching reference layout */}
              <div>
                <h3
                  style={{
                    margin: 0,
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    textDecoration: c.is_paid ? 'line-through' : 'none',
                    lineHeight: 1.3,
                  }}
                >
                  {c.name}
                </h3>

                {/* Sub-line: venc + green rule icon + red type pin/icon */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.35rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--fi-color-text-muted)' }}>
                    venc {c.due_day}
                  </span>

                  {/* Green Circle -> Active Rule Icon */}
                  <span
                    style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      color: '#ffffff',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                    }}
                    title={`Regra: ${ruleInfo.label}`}
                  >
                    {ruleInfo.icon}
                  </span>

                  {/* Red Circle / Type Icon: Red Pin for Fixo, Icon for Opcional / Ocasional */}
                  <span
                    style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      color: '#ffffff',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                    }}
                    title={`Tipo: ${typeInfo.label}`}
                  >
                    {typeInfo.icon}
                  </span>

                  {!isActive && (
                    <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 600, marginLeft: 'auto' }}>
                      ⏸️ Suspenso
                    </span>
                  )}

                  {c.is_paid && (
                    <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600, marginLeft: 'auto' }}>
                      ✅ Pago
                    </span>
                  )}

                  {isForecast && forecastedVal > 0 && (
                    <span style={{ fontSize: '0.7rem', color: '#c084fc', background: 'rgba(168, 85, 247, 0.15)', padding: '0.15rem 0.4rem', borderRadius: '8px', marginLeft: 'auto' }}>
                      🔮 Previsão
                    </span>
                  )}
                </div>
              </div>

              {/* Forecast CTA if placeholder value */}
              {isForecast && forecastedVal > 0 ? (
                <div style={{ background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.25)', padding: '0.6rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--fi-color-text-muted)', marginBottom: '0.35rem' }}>
                    Média móvel prevista: {formatCurrency(forecastedVal)}
                  </div>
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ width: '100%', fontSize: '0.75rem', padding: '0.3rem 0.4rem', background: 'linear-gradient(135deg, #a855f7, #6366f1)' }}
                    onClick={() => handleSaveCommitment({ ...c, amount: forecastedVal, is_manually_set: true })}
                    title="Confirmar este valor sugerido como meta definida do mês"
                  >
                    ✨ Confirmar Meta ({formatCurrency(forecastedVal)})
                  </button>
                </div>
              ) : null}

              {/* Inner Box of Values (matching reference UI) */}
              <div
                style={{
                  border: '1.5px solid var(--fi-color-border, rgba(255,255,255,0.12))',
                  borderRadius: '10px',
                  padding: '0.75rem 1rem',
                  background: 'rgba(0, 0, 0, 0.25)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--fi-color-text-muted)' }}>Total:</span>
                  <span style={{ fontWeight: 600 }}>{formatCurrency(displayAmount)}</span>
                </div>

                {/* Participant A */}
                {split.receivables.roommate_b ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--fi-color-text-muted)' }}>
                    <span>particip A:</span>
                    <span>{formatCurrency(split.receivables.roommate_b)}</span>
                  </div>
                ) : null}

                {/* Participant B */}
                {split.receivables.roommate_c ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--fi-color-text-muted)' }}>
                    <span>particip B:</span>
                    <span>{formatCurrency(split.receivables.roommate_c)}</span>
                  </div>
                ) : null}

                {/* Mother participant if TIM Celular */}
                {split.receivables.mother ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--fi-color-text-muted)' }}>
                    <span>particip A (Mãe):</span>
                    <span>{formatCurrency(split.receivables.mother)}</span>
                  </div>
                ) : null}

                {/* Você Paga (Highlighted) */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '0.4rem',
                    marginTop: '0.2rem',
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  <span style={{ fontSize: '1.05rem', fontWeight: 800 }}>você paga:</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: c.is_paid ? '#10b981' : 'var(--fi-color-primary, #3b82f6)' }}>
                    {formatCurrency(split.userCalculatedShare)}
                  </span>
                </div>
              </div>

              {/* Actions Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div>
                  {catType === 'optional' && (
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => handleToggleActive(c)}
                      style={{ fontSize: '0.75rem', padding: '0.15rem 0.4rem', color: isActive ? '#ef4444' : '#10b981' }}
                    >
                      {isActive ? 'Suspender' : 'Ativar'}
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.375rem' }}>
                  {upsertTarget && !isCcFatura && (
                    <>
                      <button className="btn btn-ghost btn-icon" onClick={() => openEditModal(c)} title="Editar">✏️</button>
                      {!c.id.startsWith('default-') && (
                        <button className="btn btn-ghost btn-icon" style={{ color: 'var(--fi-color-danger)' }} onClick={() => handleDelete(c)} title="Deletar">🗑️</button>
                      )}
                    </>
                  )}

                  {displayAmount > 0 && !isForecast && !c.is_paid && payCommitment && isActive && (
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleQuitar(c)}
                      disabled={payingId === c.id}
                      title="Quitar"
                    >
                      {payingId === c.id ? '...' : '💳 Quitar'}
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
                      {payingId === c.id ? '...' : '🔄 Reverter'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Final "+ Adicionar Meta" card tile slot */}
        <div
          onClick={openAddModal}
          style={{
            background: 'rgba(255,255,255,0.01)',
            borderRadius: 'var(--fi-radius-lg, 12px)',
            border: '2px dashed var(--fi-color-border, rgba(255,255,255,0.15))',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            minHeight: '220px',
            transition: 'all 0.2s ease',
            color: 'var(--fi-color-text-muted)',
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--fi-color-primary)')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--fi-color-border, rgba(255,255,255,0.15))')}
        >
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>➕</div>
          <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--fi-color-text)' }}>Adicionar Meta</div>
          <div style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>Criar compromisso fixo, opcional ou ocasional</div>
        </div>
      </div>

      <CommitmentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveCommitment}
        commitmentToEdit={commitmentToEdit}
      />
    </div>
  );
}
