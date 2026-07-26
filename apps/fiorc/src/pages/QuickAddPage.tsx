import { useState, useRef, useEffect } from 'react';
import type { TransactionCategory } from '@fi/types';
import type { NewTransaction } from '../hooks/useTransactions';
import { useTransactions } from '../hooks/useTransactions';
import { EXPENSE_CATEGORIES, CATEGORY_LABELS } from '../utils/categories';
import { MonthProps } from '../App';

export function QuickAddPage({ year, month }: MonthProps) {
  const { addTransaction } = useTransactions(year, month);
  const [amount, setAmount] = useState('');
  const [description, setDesc] = useState('');
  const [category, setCategory] = useState<TransactionCategory>('food_grocery');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isCreditCard, setIsCreditCard] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const amountRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLInputElement>(null);

  // Auto-focus amount on load
  useEffect(() => {
    amountRef.current?.focus();
  }, []);

  const handleAmountKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      descRef.current?.focus();
    }
  };

  const processTags = (inputStr: string) => {
    const rawTags = inputStr.split(/[,;]/);
    const newTagsList = [...tags];
    let changed = false;
    for (const raw of rawTags) {
      const val = raw.trim();
      if (val && !newTagsList.includes(val)) {
        newTagsList.push(val);
        changed = true;
      }
    }
    if (changed) setTags(newTagsList);
    setTagInput('');
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === ';') {
      e.preventDefault();
      processTags(tagInput);
    }
  };

  const removeTag = (t: string) => setTags(tags.filter(tag => tag !== t));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      setError('Informe um valor válido.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const now = new Date();
      // Pad to YYYY-MM-DD
      const baseDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      
      const newTx: NewTransaction = {
        person_id: null,
        type: 'expense',
        category,
        amount: parseFloat(amount),
        due_date: baseDate,
        paid_at: isCreditCard ? null : baseDate, // Credit card expenses are not paid directly from balance
        is_projection: false,
        is_credit_card: isCreditCard,
        installment_index: 1,
        total_installments: 1,
        description: description || null,
        transaction_datetime: now.toISOString(),
        tags: tags.length > 0 ? tags : undefined,
      };

      await addTransaction(newTx);
      
      setSuccessMsg('Despesa registrada com sucesso! Redirecionando...');

      setTimeout(() => {
        window.location.hash = 'transactions';
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '1rem' }}>
      <header style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
        <button className="btn btn-ghost btn-icon" onClick={() => window.location.hash = 'transactions'}>
          ←
        </button>
        <h2 style={{ marginLeft: '1rem' }}>Nova Despesa Rápida</h2>
      </header>

      {successMsg && (
        <div style={{
          padding: '1rem',
          marginBottom: '1.5rem',
          borderRadius: '8px',
          backgroundColor: 'rgba(34, 197, 94, 0.15)',
          border: '1px solid rgba(34, 197, 94, 0.4)',
          color: '#22c55e',
          fontWeight: 600,
          textAlign: 'center',
          fontSize: '1.1rem'
        }}>
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Amount - Huge input */}
        <div className="form-group">
          <label className="form-label" htmlFor="quick-amount">Valor (R$)</label>
          <input
            ref={amountRef}
            id="quick-amount"
            type="number"
            className="form-input"
            style={{ fontSize: '2rem', height: '4rem', textAlign: 'center' }}
            placeholder="0,00"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            onKeyDown={handleAmountKeyDown}
            step="0.01"
            min="0.01"
            required
          />
        </div>

        {/* Description */}
        <div className="form-group">
          <label className="form-label" htmlFor="quick-desc">Descrição</label>
          <input
            ref={descRef}
            id="quick-desc"
            type="text"
            className="form-input"
            placeholder="No que você gastou?"
            value={description}
            onChange={e => setDesc(e.target.value)}
          />
        </div>

        {/* Category */}
        <div className="form-group">
          <label className="form-label" htmlFor="quick-category">Categoria</label>
          <select
            id="quick-category"
            className="form-input"
            value={category}
            onChange={e => setCategory(e.target.value as TransactionCategory)}
          >
            {EXPENSE_CATEGORIES.map(c => (
              <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
            ))}
          </select>
        </div>

        {/* Credit Card Option */}
        <div className="form-group">
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', userSelect: 'none', padding: '0.5rem 0' }}>
            <input
              type="checkbox"
              id="quick-credit-card"
              checked={isCreditCard}
              onChange={e => setIsCreditCard(e.target.checked)}
              style={{ width: '1.25rem', height: '1.25rem', cursor: 'pointer' }}
            />
            <span className="form-label" style={{ margin: 0, fontSize: '1rem', cursor: 'pointer' }}>
              💳 Pagar no Cartão de Crédito
            </span>
          </label>
        </div>

        {/* Tags */}
        <div className="form-group">
          <label className="form-label" htmlFor="quick-tags">Tags (separadas por vírgula ou Enter)</label>
          <input
            id="quick-tags"
            type="text"
            className="form-input"
            placeholder="ex: rolê, ifood, farmácia"
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            onBlur={() => {
              if (tagInput.trim()) {
                processTags(tagInput);
              }
            }}
          />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
            {tags.map(t => (
              <span key={t} style={{
                background: 'var(--fi-color-primary-light)',
                color: 'var(--fi-color-primary-dark)',
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.875rem',
                display: 'flex', alignItems: 'center', gap: '0.25rem'
              }}>
                {t}
                <button type="button" onClick={() => removeTag(t)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'inherit' }}>×</button>
              </span>
            ))}
          </div>
        </div>

        {error && <p className="form-error">{error}</p>}

        <button id="quick-add-btn" type="submit" className="btn btn-primary" style={{ height: '3.5rem', fontSize: '1.25rem' }} disabled={loading}>
          {loading ? <><span className="spinner" /> Salvando…</> : 'Salvar Despesa'}
        </button>
      </form>
    </div>
  );
}
