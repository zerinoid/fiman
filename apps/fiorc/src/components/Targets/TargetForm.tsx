import { useState, useEffect } from 'react';
import type { MonthlyTarget, CommitmentItem } from '@fi/types';
import { formatCurrency } from '../../utils/categories';

interface TargetFormProps {
  target: MonthlyTarget | null;
  onSave: (updates: Partial<Omit<MonthlyTarget, 'id' | 'created_at'>>) => Promise<MonthlyTarget>;
  loading: boolean;
}

export function TargetForm({ target, onSave, loading }: TargetFormProps) {
  const [commitments, setCommitments] = useState<CommitmentItem[]>([]);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync when target loads
  useEffect(() => {
    if (target) {
      setCommitments(target.commitments || []);
      setNotes(target.notes ?? '');
    }
  }, [target]);

  const total = commitments.reduce((sum, c) => sum + (c.amount || 0), 0);

  const handleAddCommitment = () => {
    setCommitments([
      ...commitments,
      { id: crypto.randomUUID(), name: '', amount: 0, due_day: 1, is_paid: false }
    ]);
  };

  const handleUpdateCommitment = (id: string, updates: Partial<CommitmentItem>) => {
    setCommitments(commitments.map(c => (c.id === id ? { ...c, ...updates } : c)));
  };

  const handleRemoveCommitment = (id: string) => {
    setCommitments(commitments.filter(c => c.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSave({
        commitments,
        total_target: total,
        notes: notes || null,
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--fi-space-4)' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Compromissos</h3>
        <button type="button" className="btn btn-secondary" onClick={handleAddCommitment} style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}>
          + Adicionar
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--fi-space-3)' }}>
        {commitments.map(c => (
          <div key={c.id} style={{ display: 'flex', gap: 'var(--fi-space-2)', alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="form-group" style={{ flex: '1 1 200px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Nome (ex: Conta de Luz)"
                value={c.name}
                onChange={e => handleUpdateCommitment(c.id, { name: e.target.value })}
                required
              />
            </div>
            <div className="form-group" style={{ flex: '0 1 120px' }}>
              <input
                type="number" step="0.01"
                className="form-input"
                placeholder="Valor (R$)"
                value={c.amount}
                onChange={e => handleUpdateCommitment(c.id, { amount: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>
            <div className="form-group" style={{ flex: '0 1 100px' }}>
              <input
                type="number" min="1" max="31"
                className="form-input"
                placeholder="Dia Venc."
                value={c.due_day}
                onChange={e => handleUpdateCommitment(c.id, { due_day: parseInt(e.target.value, 10) || 1 })}
                required
              />
            </div>
            <button
              type="button"
              onClick={() => handleRemoveCommitment(c.id)}
              style={{ background: 'none', border: 'none', color: 'var(--fi-color-danger)', cursor: 'pointer', padding: '0.5rem', fontSize: '1.25rem' }}
              title="Remover"
            >
              ×
            </button>
          </div>
        ))}
        {commitments.length === 0 && (
          <p style={{ color: 'var(--fi-color-text-muted)', fontSize: '0.875rem' }}>Nenhum compromisso cadastrado.</p>
        )}
      </div>

      <div className="form-group" style={{ marginTop: 'var(--fi-space-6)' }}>
        <label className="form-label" htmlFor="target-notes">Notas</label>
        <textarea
          id="target-notes"
          className="form-input"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Observações do mês…"
        />
      </div>

      {/* Live total preview */}
      <div className="commitment-total" style={{ margin: 'var(--fi-space-6) 0' }}>
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
