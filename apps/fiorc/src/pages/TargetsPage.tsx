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
  const { momVariations, loading: analyticsLoading, bulkImportHistoricalData } = useForecastingAnalytics(year, month);

  const [importModalOpen, setImportModalOpen] = useState(false);

  const commitments = target?.commitments || [];

  return (
    <div className="page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Metas & Rateios</h1>
          <p className="page-subtitle">Compromissos financeiros, rateio por morador e projeções</p>
        </div>

        <div style={{ display: 'flex', gap: 'var(--fi-space-3)', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* House Occupancy Toggle */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'var(--fi-color-bg-card, rgba(255,255,255,0.05))',
              padding: '0.25rem 0.5rem',
              borderRadius: '8px',
              border: '1px solid var(--fi-color-border, rgba(255,255,255,0.1))',
              gap: '0.5rem',
            }}
          >
            <span style={{ fontSize: '0.8125rem', color: 'var(--fi-color-text-muted)', fontWeight: 500 }}>
              🏠 Moradores:
            </span>
            <button
              className={`btn btn-sm ${activeRoommatesCount === 3 ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setRoommatesCount(3)}
              style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}
            >
              3 Ativos
            </button>
            <button
              className={`btn btn-sm ${activeRoommatesCount === 2 ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setRoommatesCount(2)}
              style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}
              title="Ativa o rateio com quarto vago (você assume a cota do aluguel de 34.5% extra = 65.5%)"
            >
              2 Ativos (Vago)
            </button>
          </div>

          <div className="month-selector">
            <button className="month-nav-btn" onClick={onPrevMonth}>‹</button>
            <span className="month-selector-label">{monthLabel}</span>
            <button className="month-nav-btn" onClick={onNextMonth}>›</button>
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
        {targetLoading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : (
          <>
            {/* Receivables Summary */}
            <ReceivablesSummaryCard
              commitments={commitments}
              activeRoommatesCount={activeRoommatesCount}
            />

            {/* MoM Percentage Variation Analytics */}
            <MoMAnalyticsSection
              variations={momVariations}
              loading={analyticsLoading}
            />

            {/* Commitments Grid */}
            <CommitmentsBreakdown
              target={target}
              activeRoommatesCount={activeRoommatesCount}
              payCommitment={payCommitment}
              unpayCommitment={unpayCommitment}
              deleteCommitment={deleteCommitment}
              upsertTarget={upsertTarget}
            />
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
