import type { MoMItemResult } from '../../hooks/useForecastingAnalytics';
import { formatCurrency } from '../../utils/categories';

interface Props {
  variations: MoMItemResult[];
  loading?: boolean;
}

export function MoMAnalyticsSection({ variations, loading }: Props) {
  if (loading) {
    return <div style={{ fontSize: '0.875rem', color: 'var(--fi-color-text-muted)' }}>Carregando estatísticas MoM…</div>;
  }

  if (!variations || variations.length === 0) {
    return null;
  }

  return (
    <div className="card" style={{ marginBottom: 'var(--fi-space-6)' }}>
      <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: 'var(--fi-space-3)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span>📈</span> Análise de Variação Mensal (MoM)
      </div>
      <p style={{ fontSize: '0.8125rem', color: 'var(--fi-color-text-muted)', marginBottom: '1rem' }}>
        Acompanhamento de inflação e flutuação de custos recorrentes em relação ao mês anterior (ex.: Condomínio, Luz, Internet).
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem' }}>
        {variations.map((item, idx) => {
          const isUp = item.direction === 'up';
          const isDown = item.direction === 'down';
          const badgeColor = isUp ? '#ef4444' : isDown ? '#10b981' : 'var(--fi-color-text-muted)';
          const badgeBg = isUp ? 'rgba(239, 68, 68, 0.1)' : isDown ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.05)';

          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.625rem 0.875rem',
                borderRadius: '8px',
                border: '1px solid var(--fi-color-border, rgba(255,255,255,0.08))',
                background: 'var(--fi-color-bg-card, rgba(255,255,255,0.02))',
              }}
            >
              <div>
                <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{item.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--fi-color-text-muted)' }}>
                  {formatCurrency(item.currentAmount)}
                  {item.previousAmount !== null && ` (ant. ${formatCurrency(item.previousAmount)})`}
                </div>
              </div>

              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: badgeColor,
                  backgroundColor: badgeBg,
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                }}
              >
                {isUp ? '▲ ' : isDown ? '▼ ' : ''}{item.text}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
