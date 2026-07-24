import { useState, useRef, useEffect } from 'react';
import type { Person, TransactionCategory, Transaction } from '@fi/types';
import type { NewTransaction } from '../../hooks/useTransactions';
import {
  INCOME_CATEGORIES, EXPENSE_CATEGORIES,
  CATEGORY_LABELS,
} from '../../utils/categories';

interface AddTransactionModalProps {
  open: boolean;
  onClose: () => void;
  addTransaction: (tx: NewTransaction | NewTransaction[]) => Promise<unknown>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<unknown>;
  transactionToEdit: Transaction | null;
  people: Person[];
  onSuccess: () => void;
  defaultMonth: string;
}

export function AddTransactionModal({
  open, onClose, addTransaction, updateTransaction, transactionToEdit, people, onSuccess, defaultMonth,
}: AddTransactionModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Sync open state ↔ native dialog
  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open && !el.open) {
      el.showModal();
    } else if (!open && el.open) {
      el.close();
    }
  }, [open]);

  // Close on backdrop click
  const handleDialogClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) onClose();
  };

  // Form state
  const [txType, setTxType] = useState<'income' | 'expense'>('income');
  const [category, setCategory] = useState<TransactionCategory>('session');
  const [amount, setAmount]     = useState('');
  const [date, setDate]         = useState(defaultMonth);
  const [description, setDesc]  = useState('');
  const [personId, setPersonId] = useState('');
  const [isCreditCard, setIsCreditCard] = useState(false);
  const [installments, setInstallments] = useState(false);
  const [nInstall, setNInstall] = useState(2);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const categories = txType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  useEffect(() => {
    if (open) {
      if (transactionToEdit) {
        setTxType(transactionToEdit.type);
        setCategory(transactionToEdit.category);
        setAmount(transactionToEdit.amount.toString());
        setDate(transactionToEdit.due_date);
        setDesc(transactionToEdit.description || '');
        setPersonId(transactionToEdit.person_id || '');
        setIsCreditCard(transactionToEdit.is_credit_card || false);
        setInstallments(false);
        setNInstall(2);
      } else {
        reset();
      }
    }
  }, [transactionToEdit, open]);

  const reset = () => {
    setTxType('income'); setCategory('session'); setAmount('');
    setDate(defaultMonth); setDesc(''); setPersonId('');
    setIsCreditCard(false); setInstallments(false); setNInstall(2); setError(null);
  };

  const handleClose = () => { reset(); onClose(); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      setError('Informe um valor válido.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const baseDate = date || defaultMonth;

      if (transactionToEdit) {
        await updateTransaction(transactionToEdit.id, {
          person_id: personId || null,
          type: txType,
          category,
          amount: parseFloat(amount),
          due_date: baseDate,
          description: description || null,
          is_credit_card: isCreditCard,
        });
      } else {
        const baseAmount = parseFloat(amount);
        const shouldInstall = installments && (txType === 'income' || isCreditCard);

        if (shouldInstall && nInstall > 1) {
          // Generate N monthly projected records
          const records: NewTransaction[] = [];
          const [yr, mo, dy] = baseDate.split('-').map(Number);
          
          // Divide amount for both incomes and expenses, but we generate the parent ID
          const dividedAmount = baseAmount / nInstall;
          const parentId = crypto.randomUUID();

          for (let i = 0; i < nInstall; i++) {
            const m   = ((mo - 1 + i) % 12) + 1;
            const y   = yr + Math.floor((mo - 1 + i) / 12);
            const pad = (n: number) => String(n).padStart(2, '0');

            records.push({
              id:                i === 0 ? parentId : crypto.randomUUID(),
              parent_id:         i === 0 ? null : parentId,
              person_id:         personId || null,
              type:              txType,
              category,
              amount:            dividedAmount,
              due_date:          `${y}-${pad(m)}-${pad(dy)}`,
              paid_at:           null,
              is_projection:     i > 0, // First one is not necessarily a projection, others are
              is_credit_card:    txType === 'expense' ? isCreditCard : false,
              installment_index: i + 1,
              total_installments: nInstall,
              description:       description || null,
            } as NewTransaction);
          }
          await addTransaction(records);
        } else {
          await addTransaction({
            person_id:          personId || null,
            type:               txType,
            category,
            amount:             baseAmount,
            due_date:           baseDate,
            paid_at:            null,
            is_projection:      false,
            is_credit_card:     txType === 'expense' ? isCreditCard : false,
            installment_index:  1,
            total_installments: 1,
            description:        description || null,
          });
        }
      }

      onSuccess();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <dialog ref={dialogRef} onClose={onClose} onClick={handleDialogClick}>
      <div className="dialog-header">
        <span className="dialog-title">{transactionToEdit ? 'Editar Transação' : 'Nova Transação'}</span>
        <button className="btn btn-ghost btn-icon" onClick={handleClose} aria-label="Fechar">✕</button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="dialog-body">
          {/* Type */}
          <div className="form-group">
            <label className="form-label">Tipo</label>
            <div className="type-toggle">
              <button type="button"
                className={`type-toggle-btn${txType === 'income' ? ' active income' : ''}`}
                onClick={() => { setTxType('income'); setCategory('session'); }}>💚 Receita</button>
              <button type="button"
                className={`type-toggle-btn${txType === 'expense' ? ' active expense' : ''}`}
                onClick={() => { setTxType('expense'); setCategory('housing'); }}>❤️ Despesa</button>
            </div>
          </div>

          {/* Category */}
          <div className="form-group">
            <label className="form-label" htmlFor="modal-category">Categoria</label>
            <select
              id="modal-category"
              className="form-input"
              value={category}
              onChange={e => setCategory(e.target.value as TransactionCategory)}
            >
              {categories.map(c => (
                <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div className="form-group">
            <label className="form-label" htmlFor="modal-amount">Valor (R$)</label>
            <input
              id="modal-amount"
              type="number"
              className="form-input"
              placeholder="0,00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              step="0.01"
              min="0.01"
              required
            />
          </div>

          {/* Date */}
          <div className="form-group">
            <label className="form-label" htmlFor="modal-date">Data</label>
            <input
              id="modal-date"
              type="date"
              className="form-input"
              value={date}
              onChange={e => setDate(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label" htmlFor="modal-desc">Descrição (opcional)</label>
            <input
              id="modal-desc"
              type="text"
              className="form-input"
              placeholder="Ex: Sessão fulano, 09/jul"
              value={description}
              onChange={e => setDesc(e.target.value)}
            />
          </div>

          {/* Person */}
          {people.length > 0 && (
            <div className="form-group">
              <label className="form-label" htmlFor="modal-person">Pessoa (opcional)</label>
              <select
                id="modal-person"
                className="form-input"
                value={personId}
                onChange={e => setPersonId(e.target.value)}
              >
                <option value="">— Nenhuma —</option>
                {people.map(p => (
                  <option key={p.id} value={p.id}>{p.full_name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Installments & Credit Card */}
          <div className="form-group">
            {txType === 'expense' ? (
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={isCreditCard}
                  onChange={e => setIsCreditCard(e.target.checked)}
                />
                <span className="form-label" style={{ margin: 0 }}>Pagar no Cartão de Crédito</span>
              </label>
            ) : (
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={installments}
                  onChange={e => setInstallments(e.target.checked)}
                />
                <span className="form-label" style={{ margin: 0 }}>Receita Parcelada / Projetada</span>
              </label>
            )}

            {!transactionToEdit && (
              <>
                {txType === 'expense' && isCreditCard && (
                  <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'var(--fi-color-bg-alt)', borderRadius: 'var(--fi-radius-md)' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: installments ? '0.5rem' : 0 }}>
                      <input
                        type="checkbox"
                        checked={installments}
                        onChange={e => setInstallments(e.target.checked)}
                      />
                      <span className="form-label" style={{ margin: 0 }}>Parcelar em meses</span>
                    </label>
                  </div>
                )}
                
                {installments && (
                  <div style={{ marginTop: txType === 'income' ? '0.75rem' : 0, padding: txType === 'income' ? '0.75rem' : 0, background: txType === 'income' ? 'var(--fi-color-bg-alt)' : 'transparent', borderRadius: 'var(--fi-radius-md)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="form-label" style={{ margin: 0 }}>Parcelas:</span>
                      <input
                        type="number"
                        className="form-input"
                        style={{ width: '80px' }}
                        value={nInstall}
                        onChange={e => setNInstall(Math.max(2, parseInt(e.target.value) || 2))}
                        min="2"
                        max="24"
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {error && <p className="form-error">{error}</p>}
        </div>

        <div className="dialog-footer">
          <button type="button" className="btn btn-secondary" onClick={handleClose}>Cancelar</button>
          <button id="btn-modal-submit" type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <><span className="spinner" /> Salvando…</> : 'Salvar'}
          </button>
        </div>
      </form>
    </dialog>
  );
}
