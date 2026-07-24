import { useState } from 'react';
import type { MonthProps } from '../App';
import { useMonthlyTarget } from '../hooks/useMonthlyTarget';
import { useTransactions } from '../hooks/useTransactions';
import { usePeople } from '../hooks/usePeople';
import { MonthSummaryCard } from '../components/Dashboard/MonthSummaryCard';
import { GoalProgressBar } from '../components/Dashboard/GoalProgressBar';
import { RecentTransactionsList } from '../components/Dashboard/RecentTransactionsList';
import { AddTransactionModal } from '../components/Transactions/AddTransactionModal';
import { formatCurrency } from '../utils/categories';

export function DashboardPage({ year, month, monthLabel, onPrevMonth, onNextMonth }: MonthProps) {
  const { target, loading: targetLoading } = useMonthlyTarget(year, month);
  const {
    transactions, loading: txLoading,
    totalIncome, totalExpenses, totalProjected,
    addTransaction, refetch,
  } = useTransactions(year, month);
  const { people } = usePeople();

  const [modalOpen, setModalOpen] = useState(false);

  const totalTarget = target?.total_target ?? 0;
  const progressPct = totalTarget > 0 ? Math.min((totalIncome / totalTarget) * 100, 100) : 0;
  const loading = targetLoading || txLoading;

  return (
    <div className="page">
      {/* ── Header ─────────────────────────── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Visão financeira do mês</p>
        </div>

        <div style={{ display: 'flex', gap: 'var(--fi-space-3)', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="month-selector">
            <button className="month-nav-btn" onClick={onPrevMonth} title="Mês anterior">‹</button>
            <span className="month-selector-label">{monthLabel}</span>
            <button className="month-nav-btn" onClick={onNextMonth} title="Próximo mês">›</button>
          </div>
          <button
            id="btn-add-transaction-desktop"
            className="btn btn-primary"
            onClick={() => setModalOpen(true)}
            style={{ display: 'none' } as React.CSSProperties}
          >
            + Adicionar
          </button>
        </div>
      </div>

      {/* ── Stat Cards ─────────────────────── */}
      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : (
        <>
          <div className="stat-grid">
            <MonthSummaryCard
              title="Meta do Mês"
              value={totalTarget}
              sub={target ? 'Definida' : 'Não definida'}
            />
            <MonthSummaryCard
              title="Receita Realizada"
              value={totalIncome}
              variant="income"
              sub={`${formatCurrency(totalProjected)} projetado`}
            />
            <MonthSummaryCard
              title="Despesas"
              value={totalExpenses}
              variant="expense"
              sub="Realizadas"
            />
          </div>

          {/* ── Goal Progress ─────────────── */}
          <div className="card" style={{ marginBottom: 'var(--fi-space-6)' }}>
            <GoalProgressBar
              income={totalIncome}
              target={totalTarget}
              projected={totalProjected}
              pct={progressPct}
            />
          </div>

          {/* ── Recent Transactions ────────── */}
          <div className="section">
            <div className="section-header">
              <span className="section-title">Transações Recentes</span>
              <button
                id="btn-add-transaction-section"
                className="btn btn-secondary btn-sm"
                onClick={() => setModalOpen(true)}
              >
                + Adicionar
              </button>
            </div>
            <RecentTransactionsList transactions={transactions.slice(0, 10)} />
          </div>
        </>
      )}

      {/* ── Mobile FAB ─────────────────────── */}
      <button
        id="fab-add-transaction"
        className="fab"
        onClick={() => setModalOpen(true)}
        title="Adicionar transação"
        aria-label="Adicionar transação"
      >
        +
      </button>

      {/* ── Add Transaction Modal ──────────── */}
      <AddTransactionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        addTransaction={addTransaction}
        people={people}
        onSuccess={refetch}
        defaultMonth={`${year}-${String(month).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`}
      />
    </div>
  );
}
