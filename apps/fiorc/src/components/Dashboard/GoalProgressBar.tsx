import { formatCurrency } from '../../utils/categories';

interface GoalProgressBarProps {
  income: number;
  target: number;
  projected: number;
  pct: number;
}

export function GoalProgressBar({ income, target, projected, pct }: GoalProgressBarProps) {
  const colorClass = pct >= 100 ? 'good' : pct >= 70 ? 'warning' : 'danger';
  const displayPct = Math.min(pct, 100);

  return (
    <div className="progress-wrapper">
      <div className="progress-header">
        <span className="progress-label">
          Receita vs Meta — {formatCurrency(income)}
          {projected > 0 && (
            <span style={{ color: 'var(--fi-color-warning)', marginLeft: '0.5rem' }}>
              +{formatCurrency(projected)} projetado
            </span>
          )}
        </span>
        <span className={`progress-pct`} style={{
          color: pct >= 100
            ? 'var(--fi-color-success)'
            : pct >= 70
            ? 'var(--fi-color-warning)'
            : 'var(--fi-color-danger)',
        }}>
          {pct.toFixed(0)}%
        </span>
      </div>

      <div className="progress-track">
        <div
          className={`progress-fill ${colorClass}`}
          style={{ width: `${displayPct}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>

      {target > 0 && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '0.375rem',
          fontSize: '0.72rem',
          color: 'var(--fi-color-text-muted)',
        }}>
          <span>R$ 0</span>
          <span>Meta: {formatCurrency(target)}</span>
        </div>
      )}

      {target === 0 && (
        <p style={{ fontSize: '0.78rem', color: 'var(--fi-color-text-muted)', marginTop: '0.5rem' }}>
          Defina uma meta mensal na aba Metas para ver o progresso.
        </p>
      )}
    </div>
  );
}
