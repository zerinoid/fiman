import { formatCurrency } from '../../utils/categories';
import { calculateTotalReceivables } from '../../utils/splitting';
import type { CommitmentItem } from '@fi/types';

interface Props {
  commitments: CommitmentItem[];
  activeRoommatesCount: 2 | 3;
}

export function ReceivablesSummaryCard({ commitments, activeRoommatesCount }: Props) {
  const summary = calculateTotalReceivables(commitments, activeRoommatesCount);

  return (
    <div className="card" style={{ marginBottom: 'var(--fi-space-6)', borderLeft: '4px solid var(--fi-color-primary)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--fi-space-3)' }}>
        <div style={{ fontWeight: 600, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>🤝</span> Resumo de A Receber (Moradores & Família)
        </div>
        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--fi-color-primary)' }}>
          Total a Receber: {formatCurrency(summary.total)}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
        <div style={{ background: 'var(--fi-color-bg-alt, rgba(255,255,255,0.03))', padding: '0.75rem 1rem', borderRadius: 'var(--fi-radius-md, 8px)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--fi-color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Morador B (34.5% / Split)
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--fi-color-text)', marginTop: '0.25rem' }}>
            {formatCurrency(summary.roommate_b)}
          </div>
        </div>

        <div style={{ background: 'var(--fi-color-bg-alt, rgba(255,255,255,0.03))', padding: '0.75rem 1rem', borderRadius: 'var(--fi-radius-md, 8px)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--fi-color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Morador C {activeRoommatesCount === 2 ? '(Quarto Vago)' : '(34.5% / Split)'}
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 600, color: activeRoommatesCount === 2 ? 'var(--fi-color-text-muted)' : 'var(--fi-color-text)', marginTop: '0.25rem' }}>
            {activeRoommatesCount === 2 ? 'R$ 0,00' : formatCurrency(summary.roommate_c)}
          </div>
        </div>

        <div style={{ background: 'var(--fi-color-bg-alt, rgba(255,255,255,0.03))', padding: '0.75rem 1rem', borderRadius: 'var(--fi-radius-md, 8px)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--fi-color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Mãe (TIM 50%)
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--fi-color-text)', marginTop: '0.25rem' }}>
            {formatCurrency(summary.mother)}
          </div>
        </div>
      </div>
    </div>
  );
}
