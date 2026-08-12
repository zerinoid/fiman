import { useState, useMemo } from 'react';
import type { MonthProps } from '../App';
import type { Transaction, TransactionCategory } from '@fi/types';
import { useTransactions } from '../hooks/useTransactions';
import { useTags } from '../hooks/useTags';
import { TransactionTable } from '../components/Transactions/TransactionTable';
import { AddTransactionModal } from '../components/Transactions/AddTransactionModal';
import { CATEGORY_LABELS } from '../utils/categories';

const PAGE_SIZE = 25;

export function TransactionsPage({ year, month, monthLabel, onPrevMonth, onNextMonth }: MonthProps) {
  const { transactions, loading, addTransaction, updateTransaction, deleteTransaction, refetch } = useTransactions(year, month);
  const { tags: systemTags } = useTags();

  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [catFilter, setCatFilter]   = useState<TransactionCategory | ''>('');
  const [tagFilter, setTagFilter]   = useState<string>('');
  const [page, setPage]             = useState(1);
  const [modalOpen, setModalOpen]   = useState(false);
  const [txToEdit, setTxToEdit]     = useState<Transaction | null>(null);

  // Combine system tags with any tags present in current month transactions
  const availableTags = useMemo(() => {
    const set = new Set<string>(systemTags);
    for (const tx of transactions) {
      if (Array.isArray(tx.tags)) {
        for (const t of tx.tags) {
          if (t && t.trim()) set.add(t.trim());
        }
      }
    }
    return Array.from(set).sort();
  }, [systemTags, transactions]);

  const filtered = useMemo(() => {
    return transactions.filter(tx => {
      if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
      if (catFilter && tx.category !== catFilter) return false;
      if (tagFilter && (!tx.tags || !tx.tags.includes(tagFilter))) return false;
      return true;
    });
  }, [transactions, typeFilter, catFilter, tagFilter]);

  const hasActiveFilters = typeFilter !== 'all' || catFilter !== '' || tagFilter !== '';

  const clearFilters = () => {
    setTypeFilter('all');
    setCatFilter('');
    setTagFilter('');
    setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Transações</h1>
          <p className="page-subtitle">
            {filtered.length} de {transactions.length} registro(s) no mês
          </p>
        </div>

        <div style={{ display: 'flex', gap: 'var(--fi-space-3)', flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="month-selector">
            <button className="month-nav-btn" onClick={onPrevMonth}>‹</button>
            <span className="month-selector-label">{monthLabel}</span>
            <button className="month-nav-btn" onClick={onNextMonth}>›</button>
          </div>
          <button id="btn-add-tx" className="btn btn-primary" onClick={() => setModalOpen(true)}>+ Adicionar</button>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <select
          className="form-input"
          style={{ width: 'auto' }}
          value={typeFilter}
          onChange={e => { setTypeFilter(e.target.value as typeof typeFilter); setPage(1); }}
        >
          <option value="all">Todos os tipos</option>
          <option value="income">Receitas</option>
          <option value="expense">Despesas</option>
        </select>

        <select
          className="form-input"
          style={{ width: 'auto' }}
          value={catFilter}
          onChange={e => { setCatFilter(e.target.value as TransactionCategory | ''); setPage(1); }}
        >
          <option value="">Todas as categorias</option>
          {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>

        <select
          className="form-input"
          style={{ width: 'auto' }}
          value={tagFilter}
          onChange={e => { setTagFilter(e.target.value); setPage(1); }}
        >
          <option value="">Todas as tags</option>
          {availableTags.map(t => (
            <option key={t} value={t}>#{t}</option>
          ))}
        </select>

        {hasActiveFilters && (
          <button className="btn btn-ghost btn-sm" onClick={clearFilters} style={{ color: 'var(--fi-color-primary)' }}>
            Limpar filtros
          </button>
        )}
      </div>

      <TransactionTable 
        transactions={paged} 
        loading={loading} 
        onEdit={tx => { setTxToEdit(tx); setModalOpen(true); }}
        onDelete={deleteTransaction}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button className="btn btn-secondary btn-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>‹</button>
          <span>Página {page} de {totalPages}</span>
          <button className="btn btn-secondary btn-sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>›</button>
        </div>
      )}

      <AddTransactionModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setTxToEdit(null); }}
        addTransaction={addTransaction}
        updateTransaction={updateTransaction}
        transactionToEdit={txToEdit}
        onSuccess={refetch}
        defaultMonth={`${year}-${String(month).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`}
      />
    </div>
  );
}

