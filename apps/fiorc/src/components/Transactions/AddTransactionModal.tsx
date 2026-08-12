import { useState, useRef, useEffect } from 'react';
import type { TransactionCategory, Transaction } from '@fi/types';
import type { NewTransaction } from '../../hooks/useTransactions';
import {
  INCOME_CATEGORIES, EXPENSE_CATEGORIES,
  CATEGORY_LABELS, calculateCreditCardDueDate,
} from '../../utils/categories';
import { CurrencyInput } from '../Common/CurrencyInput';
import { TagInputCombobox } from '../Common/TagInputCombobox';
import { useTags } from '../../hooks/useTags';

interface AddTransactionModalProps {
  open: boolean;
  onClose: () => void;
  addTransaction: (tx: NewTransaction | NewTransaction[]) => Promise<unknown>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<unknown>;
  transactionToEdit: Transaction | null;
  onSuccess: () => void;
  defaultMonth: string;
}

function getCurrentLocalTime(): string {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function AddTransactionModal({
  open, onClose, addTransaction, updateTransaction, transactionToEdit, onSuccess, defaultMonth,
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
  const [txType, setTxType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState<TransactionCategory>('food_grocery');
  const [amount, setAmount]     = useState('');
  const [date, setDate]         = useState(defaultMonth);
  const [time, setTime]         = useState(getCurrentLocalTime);
  const [description, setDesc]  = useState('');
  const [tags, setTags]         = useState<string[]>([]);
  const [isCreditCard, setIsCreditCard] = useState(false);
  const [installments, setInstallments] = useState(false);
  const [nInstall, setNInstall] = useState(2);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const { tags: availableTags } = useTags();

  const categories = txType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  useEffect(() => {
    if (open) {
      if (transactionToEdit) {
        setTxType(transactionToEdit.type);
        setCategory(transactionToEdit.category);
        
        // Show total amount if it's a parent transaction
        const totalInst = transactionToEdit.total_installments || 1;
        const totalAmount = transactionToEdit.amount * totalInst;
        setAmount(totalAmount.toFixed(2));
        
        if (transactionToEdit.transaction_datetime) {
          const dt = new Date(transactionToEdit.transaction_datetime);
          const y = dt.getFullYear();
          const m = String(dt.getMonth() + 1).padStart(2, '0');
          const d = String(dt.getDate()).padStart(2, '0');
          setDate(`${y}-${m}-${d}`);

          const hours = String(dt.getHours()).padStart(2, '0');
          const minutes = String(dt.getMinutes()).padStart(2, '0');
          setTime(`${hours}:${minutes}`);
        } else {
          setDate(transactionToEdit.due_date);
          setTime(getCurrentLocalTime());
        }
        setTags(transactionToEdit.tags || []);
        setDesc(transactionToEdit.description || '');
        setIsCreditCard(transactionToEdit.is_credit_card || false);
        
        if (totalInst > 1 && !transactionToEdit.parent_id) {
          setInstallments(true);
          setNInstall(totalInst);
        } else {
          setInstallments(false);
          setNInstall(2);
        }
      } else {
        reset();
      }
    }
  }, [transactionToEdit, open]);

  const reset = () => {
    setTxType('expense'); setCategory('food_grocery'); setAmount('');
    setDate(defaultMonth); setTime(getCurrentLocalTime()); setDesc(''); setTags([]);
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
      let transaction_datetime = null;
      if (time) {
        const dt = new Date(`${baseDate}T${time}:00`);
        transaction_datetime = dt.toISOString();
      } else {
        const dt = new Date(`${baseDate}T12:00:00`);
        transaction_datetime = dt.toISOString();
      }

      const computedDueDate = (txType === 'expense' && isCreditCard)
        ? calculateCreditCardDueDate(baseDate)
        : baseDate;

      if (transactionToEdit) {
        const isParent = transactionToEdit.total_installments > 1 && !transactionToEdit.parent_id;
        const finalInstallments = (isParent && installments) ? nInstall : 1;
        const baseAmount = parseFloat(amount);
        const dividedAmount = isParent ? baseAmount / finalInstallments : baseAmount;

        await updateTransaction(transactionToEdit.id, {
          person_id: null,
          received_by: null,
          type: txType,
          category,
          amount: dividedAmount,
          due_date: computedDueDate,
          description: description || null,
          transaction_datetime,
          tags: tags.length > 0 ? tags : undefined,
          is_credit_card: isCreditCard,
          total_installments: finalInstallments,
        });
      } else {
        const baseAmount = parseFloat(amount);
        const shouldInstall = installments && (txType === 'income' || isCreditCard);

        if (shouldInstall && nInstall > 1) {
          // Generate N monthly projected records
          const records: NewTransaction[] = [];
          const [yr, mo, dy] = baseDate.split('-').map(Number);
          const dividedAmount = baseAmount / nInstall;
          const parentId = crypto.randomUUID();

          const firstCcDueDate = calculateCreditCardDueDate(baseDate);
          const [ccYr, ccMo] = firstCcDueDate.split('-').map(Number);

          for (let i = 0; i < nInstall; i++) {
            let itemDueDate: string;
            if (txType === 'expense' && isCreditCard) {
              const m = ((ccMo - 1 + i) % 12) + 1;
              const y = ccYr + Math.floor((ccMo - 1 + i) / 12);
              const pad = (n: number) => String(n).padStart(2, '0');
              itemDueDate = `${y}-${pad(m)}-08`;
            } else {
              const m = ((mo - 1 + i) % 12) + 1;
              const y = yr + Math.floor((mo - 1 + i) / 12);
              const pad = (n: number) => String(n).padStart(2, '0');
              itemDueDate = `${y}-${pad(m)}-${pad(dy)}`;
            }

            records.push({
              id:                i === 0 ? parentId : crypto.randomUUID(),
              parent_id:         i === 0 ? null : parentId,
              person_id:         null,
              received_by:       null,
              type:              txType,
              category,
              amount:            dividedAmount,
              due_date:          itemDueDate,
              paid_at:           null,
              is_projection:     i > 0, // First one is not necessarily a projection, others are
              is_credit_card:    txType === 'expense' ? isCreditCard : false,
              installment_index: i + 1,
              total_installments: nInstall,
              description:       description || null,
              transaction_datetime: i === 0 ? transaction_datetime : null,
              tags: tags.length > 0 ? tags : undefined,
            } as NewTransaction);
          }
          await addTransaction(records);
        } else {
          await addTransaction({
            person_id:          null,
            received_by:        null,
            type:               txType,
            category,
            amount:             baseAmount,
            due_date:           computedDueDate,
            paid_at:            null,
            is_projection:      false,
            is_credit_card:     txType === 'expense' ? isCreditCard : false,
            installment_index:  1,
            total_installments: 1,
            description:        description || null,
            transaction_datetime,
            tags: tags.length > 0 ? tags : undefined,
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
    <dialog ref={dialogRef} onClose={onClose} onClick={handleDialogClick} className="dialog-backdrop">
      <form onSubmit={handleSubmit} className="dialog-card stack-4">
        <div className="dialog-header flex-between">
          <span className="dialog-title">{transactionToEdit ? 'Editar Transação' : 'Nova Transação'}</span>
          <button type="button" className="btn btn-ghost btn-icon" onClick={handleClose} aria-label="Fechar">✕</button>
        </div>

        <div className="dialog-body stack-4">
          {/* Type */}
          <div className="type-toggle flex">
            <button type="button"
              className={`type-toggle-btn ${txType === 'expense' ? 'active-expense' : ''}`}
              onClick={() => { setTxType('expense'); setCategory('food_grocery'); }}>💸 Despesa</button>
            <button type="button"
              className={`type-toggle-btn ${txType === 'income' ? 'active-income' : ''}`}
              onClick={() => { setTxType('income'); setCategory('session'); }}>💰 Receita</button>
          </div>

          {/* Amount */}
          <div className="form-group">
            <label className="form-label" htmlFor="modal-amount">Valor (R$)</label>
            <CurrencyInput
              id="modal-amount"
              className="form-input form-input-lg"
              placeholder="0,00"
              value={amount}
              onChange={val => setAmount(val)}
              required
            />
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

          {/* Date and Time */}
          <div className="grid-2">
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
            <div className="form-group">
              <label className="form-label" htmlFor="modal-time">Hora (opcional)</label>
              <input
                id="modal-time"
                type="time"
                className="form-input"
                value={time}
                onChange={e => setTime(e.target.value)}
              />
            </div>
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

          {/* Tags */}
          <div className="form-group">
            <label className="form-label" htmlFor="modal-tags">Tags (opcional)</label>
            <TagInputCombobox
              id="modal-tags"
              tags={tags}
              onTagsChange={setTags}
              availableTags={availableTags}
            />
          </div>

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

            {(!transactionToEdit || !transactionToEdit.parent_id) && (
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
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </dialog>
  );
}
