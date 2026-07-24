import type { MonthProps } from '../App';
import { useMonthlyTarget } from '../hooks/useMonthlyTarget';
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

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : (
          <CommitmentsBreakdown target={target} payCommitment={payCommitment} upsertTarget={upsertTarget} />
        )}
      </div>
    </div>
  );
}
