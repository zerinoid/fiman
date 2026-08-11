import { useState } from 'react';
import type { MonthProps } from '../App';
import { useMonthlyTarget } from '../hooks/useMonthlyTarget';
import { useTransactions } from '../hooks/useTransactions';
import { usePeople } from '../hooks/usePeople';
import { useHouseSettings } from '../hooks/useHouseSettings';
import { useFialnProjections } from '../hooks/useFialnProjections';
import { MonthSummaryCard } from '../components/Dashboard/MonthSummaryCard';
import { GoalProgressBar } from '../components/Dashboard/GoalProgressBar';
import { RecentTransactionsList } from '../components/Dashboard/RecentTransactionsList';
import { ReceivablesSummaryCard } from '../components/Targets/ReceivablesSummaryCard';
import { AddTransactionModal } from '../components/Transactions/AddTransactionModal';
import { formatCurrency } from '../utils/categories';

export function DashboardPage({ year, month, monthLabel, onPrevMonth, onNextMonth }: MonthProps) {
  const { activeRoommatesCount } = useHouseSettings();
  const { target, loading: targetLoading } = useMonthlyTarget(year, month, activeRoommatesCount);
  const {
    transactions, loading: txLoading,
    totalIncome, totalExpenses, totalProjected,
    addTransaction, updateTransaction, refetch,
  } = useTransactions(year, month);
  const { people } = usePeople();
  const { totalReceivable, totalDebt, netBalance, loading: fialnLoading } = useFialnProjections(year, month);

  const [modalOpen, setModalOpen] = useState(false);

  const totalTarget = target?.total_target ?? 0;
  const progressPct = totalTarget > 0 ? Math.min((totalIncome / totalTarget) * 100, 100) : 0;
  const loading = targetLoading || txLoading;
  const commitments = target?.commitments || [];

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

          {/* ── Receivables Summary ─────────────── */}
          <ReceivablesSummaryCard
            commitments={commitments}
            activeRoommatesCount={activeRoommatesCount}
          />

          {/* ── Repasses FIALN ─────────────────── */}
          {!fialnLoading && (totalReceivable > 0 || totalDebt > 0) && (
            <div className="card" style={{ marginBottom: 'var(--fi-space-6)', borderLeft: '3px solid var(--fi-color-primary)' }}>
              <div className="section-header" style={{ marginBottom: 'var(--fi-space-4)' }}>
                <span className="section-title">🎓 Repasses FIALN — {monthLabel}</span>
                <span className={`badge ${netBalance >= 0 ? 'badge-success' : 'badge-danger'}`}>
                  {netBalance >= 0 ? '✅ Saldo positivo' : '⚠️ Saldo negativo'}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--fi-space-4)', fontSize: '0.9rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--fi-color-success)', fontWeight: 600, marginBottom: '0.25rem', textTransform: 'uppercase' }}>📈 A Receber</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--fi-color-text-muted)', marginBottom: '0.5rem' }}>SH → Foraisso</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--fi-color-success)' }}>{formatCurrency(totalReceivable)}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--fi-color-danger)', fontWeight: 600, marginBottom: '0.25rem', textTransform: 'uppercase' }}>💸 A Repassar</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--fi-color-text-muted)', marginBottom: '0.5rem' }}>Foraisso → SH</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--fi-color-danger)' }}>{formatCurrency(totalDebt)}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--fi-color-text-muted)', fontWeight: 600, marginBottom: '0.25rem', textTransform: 'uppercase' }}>Saldo Líquido</div>
                  <div style={{ height: '1.25rem', marginBottom: '0.5rem' }} />
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: netBalance >= 0 ? 'var(--fi-color-success)' : 'var(--fi-color-danger)' }}>
                    {netBalance < 0 ? '− ' : ''}{formatCurrency(Math.abs(netBalance))}
                  </div>
                </div>
              </div>
            </div>
          )}

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
        updateTransaction={updateTransaction}
        transactionToEdit={null}
        people={people}
        onSuccess={refetch}
        defaultMonth={`${year}-${String(month).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`}
      />
    </div>
  );
}
