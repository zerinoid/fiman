import { useState, useEffect } from 'react';
import type { MonthlyTarget } from '@fi/types';
import { formatCurrency } from '../../utils/categories';

interface TargetFormProps {
  target: MonthlyTarget | null;
  onSave: (updates: Partial<Omit<MonthlyTarget, 'id' | 'created_at'>>) => Promise<MonthlyTarget>;
  loading: boolean;
}

export function TargetForm({ target, onSave, loading }: TargetFormProps) {
  const [rentBase,   setRentBase]   = useState(target?.rent_base   ?? 0);
  const [condoBase,  setCondoBase]  = useState(target?.condo_base  ?? 0);
  const [condoCredit,setCondoCredit]= useState(target?.condo_credit ?? 0);
  const [notes,      setNotes]      = useState(target?.notes        ?? '');
  const [efDone,     setEfDone]     = useState(target?.emergency_fund_completed ?? false);
  const [saving,     setSaving]     = useState(false);
  const [saved,      setSaved]      = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  // Sync when target loads
  useEffect(() => {
    if (target) {
      setRentBase(target.rent_base);
      setCondoBase(target.condo_base);
      setCondoCredit(target.condo_credit ?? 0);
      setNotes(target.notes ?? '');
      setEfDone(target.emergency_fund_completed);
    }
  }, [target]);

  const total = rentBase + condoBase + (condoCredit ?? 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSave({
        rent_base:   rentBase,
        condo_base:  condoBase,
        condo_credit: condoCredit,
        total_target: total,
        notes:       notes || null,
        emergency_fund_completed: efDone,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="loading-center"><div className="spinner" /></div>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'grid', gap: 'var(--fi-space-4)', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div className="form-group">
          <label className="form-label" htmlFor="target-rent">Aluguel Base (R$)</label>
          <input
            id="target-rent"
            type="number" step="0.01" min="0"
            className="form-input"
            value={rentBase}
            onChange={e => setRentBase(parseFloat(e.target.value) || 0)}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="target-condo">Condomínio Base (R$)</label>
          <input
            id="target-condo"
            type="number" step="0.01" min="0"
            className="form-input"
            value={condoBase}
            onChange={e => setCondoBase(parseFloat(e.target.value) || 0)}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="target-credit">Crédito Antena (R$)</label>
          <input
            id="target-credit"
            type="number" step="0.01"
            className="form-input"
            placeholder="-25.81"
            value={condoCredit}
            onChange={e => setCondoCredit(parseFloat(e.target.value) || 0)}
          />
        </div>
      </div>

      <div className="form-group" style={{ marginTop: 'var(--fi-space-4)' }}>
        <label className="form-label" htmlFor="target-notes">Notas</label>
        <textarea
          id="target-notes"
          className="form-input"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Observações do mês…"
        />
      </div>

      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', margin: 'var(--fi-space-4) 0' }}>
        <input
          type="checkbox"
          checked={efDone}
          onChange={e => setEfDone(e.target.checked)}
        />
        <span style={{ fontSize: '0.875rem' }}>🛡️ Reserva de Emergência atingida este mês</span>
      </label>

      {/* Live total preview */}
      <div className="commitment-total" style={{ marginBottom: 'var(--fi-space-4)' }}>
        <span className="commitment-total-label">Total da Meta</span>
        <span className="commitment-total-amount">{formatCurrency(total)}</span>
      </div>

      {error && <p className="form-error" style={{ marginBottom: '1rem' }}>{error}</p>}

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--fi-space-3)' }}>
        <button id="btn-save-target" type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? <><span className="spinner" /> Salvando…</> : 'Salvar Meta'}
        </button>
        {saved && (
          <span style={{ color: 'var(--fi-color-success)', fontSize: '0.875rem', fontWeight: 600 }}>
            ✓ Salvo
          </span>
        )}
      </div>
    </form>
  );
}
