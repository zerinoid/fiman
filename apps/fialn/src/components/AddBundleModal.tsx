import { useState } from 'react';
import type { CreateBundlePayload } from '../hooks/useLessonBundles';

interface AddBundleModalProps {
  personId: string;
  studentName: string;
  saving: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateBundlePayload) => Promise<boolean>;
}

function toLocalDateString(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function AddBundleModal({
  personId,
  studentName,
  saving,
  onClose,
  onSubmit,
}: AddBundleModalProps) {
  const [name, setName] = useState('Pacote 4 Aulas Particulares');
  const [totalLessons, setTotalLessons] = useState('4');
  const [price, setPrice] = useState('600');
  const [notes, setNotes] = useState('');

  // Projections
  const [generateProjections, setGenerateProjections] = useState(true);
  const [installments, setInstallments] = useState('1');
  const [amount, setAmount] = useState('600');
  const [firstDueDate, setFirstDueDate] = useState(toLocalDateString(new Date()));

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handlePriceChange = (val: string) => {
    setPrice(val);
    if (installments === '1') {
      setAmount(val);
    } else {
      const p = parseFloat(val);
      const inst = parseInt(installments, 10);
      if (!isNaN(p) && !isNaN(inst) && inst > 0) {
        setAmount((p / inst).toFixed(2));
      }
    }
  };

  const handleInstallmentsChange = (val: string) => {
    setInstallments(val);
    const p = parseFloat(price);
    const inst = parseInt(val, 10);
    if (!isNaN(p) && !isNaN(inst) && inst > 0) {
      setAmount((p / inst).toFixed(2));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg('Informe o nome do pacote.');
      return;
    }

    const totNum = parseInt(totalLessons, 10);
    const prcNum = parseFloat(price);

    if (isNaN(totNum) || totNum <= 0) {
      setErrorMsg('Informe uma quantidade válida de aulas.');
      return;
    }

    if (isNaN(prcNum) || prcNum < 0) {
      setErrorMsg('Informe um preço válido.');
      return;
    }

    let instNum = 0;
    let amtNum = 0;

    if (generateProjections) {
      instNum = parseInt(installments, 10);
      amtNum = parseFloat(amount);
      if (isNaN(instNum) || instNum <= 0) {
        setErrorMsg('Informe um número válido de parcelas.');
        return;
      }
      if (isNaN(amtNum) || amtNum <= 0) {
        setErrorMsg('Informe um valor de parcela válido.');
        return;
      }
    }

    const ok = await onSubmit({
      person_id: personId,
      name: name.trim(),
      total_lessons: totNum,
      price: prcNum,
      notes: notes.trim() || null,
      generateProjections,
      total_installments: generateProjections ? instNum : undefined,
      amount_per_installment: generateProjections ? amtNum : undefined,
      first_due_date: generateProjections ? firstDueDate : undefined,
    });

    if (ok) {
      onClose();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
        padding: '1rem',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        className="card"
        style={{
          maxWidth: '500px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <div className="flex-between mb-6">
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Novo Pacote de Aulas (Bundle)</h2>
            <p className="text-xs text-muted mt-2">Aluno: {studentName}</p>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose} type="button">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="stack-4">
          <div className="form-group">
            <label className="form-label" htmlFor="bundle-name">Nome / Descrição do Pacote *</label>
            <input
              id="bundle-name"
              type="text"
              className="form-input"
              placeholder="Ex: Pacote 4 Aulas Particulares"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="bundle-total-lessons">Qtd. de Aulas *</label>
              <input
                id="bundle-total-lessons"
                type="number"
                className="form-input"
                value={totalLessons}
                onChange={(e) => setTotalLessons(e.target.value)}
                min="1"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="bundle-price">Preço Total (R$) *</label>
              <input
                id="bundle-price"
                type="number"
                className="form-input"
                value={price}
                onChange={(e) => handlePriceChange(e.target.value)}
                step="0.01"
                min="0"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="bundle-notes">Observações (opcional)</label>
            <input
              id="bundle-notes"
              type="text"
              className="form-input"
              placeholder="Ex: Validade de 3 meses, PIX..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Financial Projection */}
          <div
            style={{
              padding: '1rem',
              background: 'var(--fi-color-surface-2)',
              borderRadius: 'var(--fi-radius-md)',
              border: '1px solid var(--fi-color-border)',
            }}
            className="stack-4"
          >
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={generateProjections}
                onChange={(e) => setGenerateProjections(e.target.checked)}
              />
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                💳 Gerar projeções financeiras no FIORC (RPC)
              </span>
            </label>

            {generateProjections && (
              <div className="stack-4 mt-2">
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="bundle-installments">Parcelas</label>
                    <input
                      id="bundle-installments"
                      type="number"
                      className="form-input"
                      value={installments}
                      onChange={(e) => handleInstallmentsChange(e.target.value)}
                      min="1"
                      max="12"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="bundle-amount">Valor Parcela (R$)</label>
                    <input
                      id="bundle-amount"
                      type="number"
                      className="form-input"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      step="0.01"
                      min="1"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="bundle-due">Vencimento da 1ª Parcela</label>
                  <input
                    id="bundle-due"
                    type="date"
                    className="form-input"
                    value={firstDueDate}
                    onChange={(e) => setFirstDueDate(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}
          </div>

          {errorMsg && <p className="form-error">{errorMsg}</p>}

          <div className="flex-gap-2" style={{ justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={saving}>
              Cancelar
            </button>
            <button id="bundle-submit-btn" type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <><span className="spinner" /> Salvando…</> : '✓ Cadastrar Pacote'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddBundleModal;
