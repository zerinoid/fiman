import { useState } from 'react';
import type { CommitmentItem } from '@fi/types';

interface Props {
  open: boolean;
  onClose: () => void;
  onImport: (records: Array<{ month_year: string; commitments: CommitmentItem[] }>) => Promise<void>;
}

export function HistoricalIngestionModal({ open, onClose, onImport }: Props) {
  const [loading, setLoading] = useState(false);
  const [jsonText, setJsonText] = useState(`[
  {
    "month_year": "2026-07-01",
    "rent": 2770.00,
    "condo": 580.00,
    "luz": 160.00,
    "internet": 120.00
  },
  {
    "month_year": "2026-06-01",
    "rent": 2770.00,
    "condo": 560.00,
    "luz": 145.00,
    "internet": 120.00
  }
]`);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const parsed = JSON.parse(jsonText);
      if (!Array.isArray(parsed)) {
        throw new Error('O formato precisa ser uma lista de objetos mensais.');
      }

      const records = parsed.map((item: any) => {
        const month_year = item.month_year;
        const commitments: CommitmentItem[] = [];

        if (item.rent !== undefined || item.aluguel !== undefined) {
          commitments.push({
            id: crypto.randomUUID(),
            name: 'Aluguel + Condomínio',
            amount: (item.rent || item.aluguel || 0) + (item.condo || item.condominio || 0),
            due_day: 10,
            is_paid: true,
            category_type: 'fixed',
            split_rule: 'weighted_rent',
          });
        }

        if (item.luz !== undefined || item.energia !== undefined) {
          commitments.push({
            id: crypto.randomUUID(),
            name: 'Conta de Luz',
            amount: item.luz || item.energia || 0,
            due_day: 15,
            is_paid: true,
            category_type: 'fixed',
            split_rule: 'equal_roommates',
          });
        }

        if (item.internet !== undefined || item.claro !== undefined) {
          commitments.push({
            id: crypto.randomUUID(),
            name: 'Internet Claro',
            amount: item.internet || item.claro || 0,
            due_day: 20,
            is_paid: true,
            category_type: 'fixed',
            split_rule: 'equal_roommates',
          });
        }

        return { month_year, commitments };
      });

      await onImport(records);
      onClose();
    } catch (err: any) {
      alert('Erro ao importar dados históricos: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <h2>📥 Carga Histórica para Motor de Previsão</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <p style={{ fontSize: '0.875rem', color: 'var(--fi-color-text-muted)', marginBottom: '1rem' }}>
              Insira até 12 meses de dados históricos de compromissos (Aluguel, Condomínio, Luz, Internet) em formato JSON para alimentar o motor estatístico de médias móveis ponderadas.
            </p>

            <div className="form-group">
              <label className="form-label">Dados em JSON</label>
              <textarea
                className="form-input"
                rows={10}
                value={jsonText}
                onChange={e => setJsonText(e.target.value)}
                style={{ fontFamily: 'monospace', fontSize: '0.8125rem' }}
                required
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Importando…' : 'Importar Histórico'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
