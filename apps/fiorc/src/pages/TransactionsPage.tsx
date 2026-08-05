import { useState, useMemo } from 'react';
import type { MonthProps } from '../App';
import type { Transaction, TransactionCategory } from '@fi/types';
import { useTransactions } from '../hooks/useTransactions';
import { usePeople } from '../hooks/usePeople';
import { TransactionTable } from '../components/Transactions/TransactionTable';
import { AddTransactionModal } from '../components/Transactions/AddTransactionModal';
import { ShibariHouseSplitSection } from '../components/Transactions/ShibariHouseSplitSection';
import { CATEGORY_LABELS } from '../utils/categories';

const PAGE_SIZE = 25;

export function TransactionsPage({ year, month, monthLabel, onPrevMonth, onNextMonth }: MonthProps) {
  const { transactions, loading, addTransaction, updateTransaction, deleteTransaction, refetch } = useTransactions(year, month);
  const { people } = usePeople();

  const [activeView, setActiveView] = useState<'all' | 'shibari'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [catFilter, setCatFilter] = useState<TransactionCategory | ''>('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [txToEdit, setTxToEdit] = useState<Transaction | null>(null);

  const filtered = useMemo(() => {
    return transactions.filter(tx => {
      if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
      if (catFilter && tx.category !== catFilter) return false;
      return true;
    });
  }, [transactions, typeFilter, catFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Transações</h1>
          <p className="page-subtitle">{transactions.length} registro(s) no mês</p>
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

      {/* Main View Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <button
          className={`btn ${activeView === 'all' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveView('all')}
        >
          📋 Todas as Transações
        </button>
        <button
          className={`btn ${activeView === 'shibari' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveView('shibari')}
        >
          🏛️ Shibari House (75/25)
        </button>
      </div>

      {activeView === 'all' ? (
        <>
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
        </>
      ) : (
        <ShibariHouseSplitSection
          transactions={transactions}
          loading={loading}
          onRefetch={refetch}
          onOpenAddModal={() => setModalOpen(true)}
        />
      )}

      <AddTransactionModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setTxToEdit(null); }}
        addTransaction={addTransaction}
        updateTransaction={updateTransaction}
        transactionToEdit={txToEdit}
        people={people}
        onSuccess={refetch}
        defaultMonth={`${year}-${String(month).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`}
      />
    </div>
  );
}
