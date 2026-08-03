import { useState } from 'react';
import type { MonthProps } from '../App';
import { useMonthlyTarget } from '../hooks/useMonthlyTarget';
import { useHouseSettings } from '../hooks/useHouseSettings';
import { useForecastingAnalytics } from '../hooks/useForecastingAnalytics';
import { CommitmentsBreakdown } from '../components/Targets/CommitmentsBreakdown';
import { ReceivablesSummaryCard } from '../components/Targets/ReceivablesSummaryCard';
import { MoMAnalyticsSection } from '../components/Targets/MoMAnalyticsSection';
import { HistoricalIngestionModal } from '../components/Targets/HistoricalIngestionModal';

export function TargetsPage({ year, month, monthLabel, onPrevMonth, onNextMonth }: MonthProps) {
  const { activeRoommatesCount, setRoommatesCount } = useHouseSettings();
  const { target, loading: targetLoading, upsertTarget, payCommitment, unpayCommitment, deleteCommitment } = useMonthlyTarget(year, month, activeRoommatesCount);
  const { momVariations, forecastMap, loading: analyticsLoading, bulkImportHistoricalData } = useForecastingAnalytics(year, month);

  const [importModalOpen, setImportModalOpen] = useState(false);

  const commitments = target?.commitments || [];

  return (
    <div className="page">
      {/* ── Title & Month Header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Metas</h1>
          <p className="page-subtitle">Compromissos financeiros do mês</p>
        </div>

        <div style={{ display: 'flex', gap: 'var(--fi-space-3)', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="month-selector">
            <button className="month-nav-btn" onClick={onPrevMonth} title="Mês anterior">‹</button>
            <span className="month-selector-label">{monthLabel}</span>
            <button className="month-nav-btn" onClick={onNextMonth} title="Próximo mês">›</button>
          </div>

          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setImportModalOpen(true)}
            title="Importar histórico de meses anteriores"
          >
            📥 Importar Histórico
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {/* ── Roommate Occupancy Bar (Responsive Segmented Control) ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--fi-color-bg-card, rgba(255,255,255,0.03))',
            border: '1px solid var(--fi-color-border, rgba(255,255,255,0.08))',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--fi-radius-lg, 12px)',
            marginBottom: 'var(--fi-space-6)',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.25rem' }}>🏠</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Ocupação da Casa</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--fi-color-text-muted)' }}>
                {activeRoommatesCount === 3
                  ? '3 moradores ativos (Contas ÷3 | Aluguel 31% você)'
                  : '2 moradores ativos - Quarto vago (Contas ÷2 | Aluguel 65,5% você)'}
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              background: 'rgba(0,0,0,0.25)',
              padding: '0.25rem',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.08)',
              gap: '0.25rem',
              width: '100%',
              maxWidth: '320px',
            }}
          >
            <button
              className={`btn btn-sm ${activeRoommatesCount === 3 ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setRoommatesCount(3)}
              style={{ flex: 1, fontSize: '0.75rem', padding: '0.35rem 0.5rem', fontWeight: 600 }}
            >
              👥 3 Moradores
            </button>
            <button
              className={`btn btn-sm ${activeRoommatesCount === 2 ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setRoommatesCount(2)}
              style={{ flex: 1, fontSize: '0.75rem', padding: '0.35rem 0.5rem', fontWeight: 600 }}
              title="Rateio de Quarto Vago (65,5% aluguel | 50% contas)"
            >
              🏠 2 (Quarto Vago)
            </button>
          </div>
        </div>

        {targetLoading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : (
          <>
            {/* 1. Receivables Summary Card */}
            <ReceivablesSummaryCard
              commitments={commitments}
              activeRoommatesCount={activeRoommatesCount}
            />

            {/* 2. Primary Cards Masonry Grid & Total */}
            <CommitmentsBreakdown
              target={target}
              activeRoommatesCount={activeRoommatesCount}
              forecastMap={forecastMap}
              payCommitment={payCommitment}
              unpayCommitment={unpayCommitment}
              deleteCommitment={deleteCommitment}
              upsertTarget={upsertTarget}
            />

            {/* 3. Secondary Diagnostics: MoM Percentage Variation Analytics */}
            <div style={{ marginTop: 'var(--fi-space-8)' }}>
              <MoMAnalyticsSection
                variations={momVariations}
                loading={analyticsLoading}
              />
            </div>
          </>
        )}
      </div>

      <HistoricalIngestionModal
        open={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImport={bulkImportHistoricalData}
      />
    </div>
  );
}
