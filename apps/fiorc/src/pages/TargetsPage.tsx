import type { MonthProps } from '../App';
import { useMonthlyTarget } from '../hooks/useMonthlyTarget';
import { TargetForm } from '../components/Targets/TargetForm';
import { CommitmentsBreakdown } from '../components/Targets/CommitmentsBreakdown';

export function TargetsPage({ year, month, monthLabel, onPrevMonth, onNextMonth }: MonthProps) {
  const { target, loading, upsertTarget, payCommitment } = useMonthlyTarget(year, month);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Metas</h1>
          <p className="page-subtitle">Compromissos financeiros do mês</p>
        </div>
        <div className="month-selector">
          <button className="month-nav-btn" onClick={onPrevMonth}>‹</button>
          <span className="month-selector-label">{monthLabel}</span>
          <button className="month-nav-btn" onClick={onNextMonth}>›</button>
        </div>
      </div>

      <div style={{ display: 'grid', gap: 'var(--fi-space-8)', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        <div className="card">
          <div className="section-title" style={{ marginBottom: 'var(--fi-space-6)' }}>✏️ Definir Meta</div>
          <TargetForm target={target} onSave={upsertTarget} loading={loading} />
        </div>

        <div className="card">
          <div className="section-title" style={{ marginBottom: 'var(--fi-space-6)' }}>📊 Detalhamento</div>
          <CommitmentsBreakdown target={target} payCommitment={payCommitment} />
        </div>
      </div>
    </div>
  );
}
