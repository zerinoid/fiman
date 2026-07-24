import { formatCurrency } from '../../utils/categories';

interface MonthSummaryCardProps {
  title: string;
  value: number;
  variant?: 'income' | 'expense';
  sub?: string;
}

export function MonthSummaryCard({ title, value, variant, sub }: MonthSummaryCardProps) {
  return (
    <div className="card">
      <div className="card-title">{title}</div>
      <div className={`card-value${variant ? ' ' + variant : ''}`}>
        {formatCurrency(value)}
      </div>
      {sub && <div className="card-sub">{sub}</div>}
    </div>
  );
}
