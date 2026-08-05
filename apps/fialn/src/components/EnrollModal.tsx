import { useState, useEffect } from 'react';
import type { GroupClassroom, ModalityType } from '@fi/types';
import type { CreateEnrollmentPayload } from '../hooks/useGroupsAndEnrollments';

interface EnrollModalProps {
  personId: string;
  studentName: string;
  groups: GroupClassroom[];
  saving: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateEnrollmentPayload) => Promise<boolean>;
}

function toLocalDateString(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function EnrollModal({
  personId,
  studentName,
  groups,
  saving,
  onClose,
  onSubmit,
}: EnrollModalProps) {
  const [groupId, setGroupId] = useState<string>(groups[0]?.id ?? '');
  const [modality, setModality] = useState<ModalityType>('quarterly_group');
  const [startDate, setStartDate] = useState<string>(toLocalDateString(new Date()));
  const [notes, setNotes] = useState<string>('');

  // Projections
  const [generateProjections, setGenerateProjections] = useState<boolean>(true);
  const [installments, setInstallments] = useState<string>('1');
  const [amount, setAmount] = useState<string>('900');
  const [firstDueDate, setFirstDueDate] = useState<string>(toLocalDateString(new Date()));

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Auto-pricing based on group and modality
  useEffect(() => {
    const selectedGroup = groups.find((g) => g.id === groupId);
    const groupName = selectedGroup?.name.toLowerCase() ?? '';

    if (groupName.includes('teoria das cordas')) {
      if (modality === 'monthly_group') {
        setInstallments('1');
        setAmount('450');
      } else {
        // quarterly_group - default 1x (à vista) R$ 900
        setInstallments('1');
        setAmount('900');
      }
    } else if (groupName.includes('sobre nós') || groupName.includes('sobre nos')) {
      if (modality === 'monthly_group') {
        setInstallments('1');
        setAmount('300');
      } else {
        // quarterly_group - default 1x (à vista) R$ 750
        setInstallments('1');
        setAmount('750');
      }
    }
  }, [groupId, modality, groups]);

  const setQuarterlyInstallmentsPreset = () => {
    const selectedGroup = groups.find((g) => g.id === groupId);
    const groupName = selectedGroup?.name.toLowerCase() ?? '';
    setInstallments('3');
    if (groupName.includes('teoria das cordas')) {
      setAmount('300');
    } else if (groupName.includes('sobre nós') || groupName.includes('sobre nos')) {
      setAmount('250');
    } else {
      setAmount('250');
    }
  };

  const setSinglePaymentPreset = () => {
    const selectedGroup = groups.find((g) => g.id === groupId);
    const groupName = selectedGroup?.name.toLowerCase() ?? '';
    setInstallments('1');
    if (groupName.includes('teoria das cordas')) {
      setAmount(modality === 'monthly_group' ? '450' : '900');
    } else if (groupName.includes('sobre nós') || groupName.includes('sobre nos')) {
      setAmount(modality === 'monthly_group' ? '300' : '750');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!groupId) {
      setErrorMsg('Selecione uma turma de grupo.');
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
      group_id: groupId,
      modality,
      start_date: startDate,
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
          maxWidth: '520px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <div className="flex-between mb-6">
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Nova Matrícula / Plano</h2>
            <p className="text-xs text-muted mt-2">Aluno: {studentName}</p>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose} type="button">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="stack-4">
          {/* 1. Group Classroom selector (Moved to TOP per prompt) */}
          <div className="form-group">
            <label className="form-label" htmlFor="enroll-group">Turma / Sala de Aula *</label>
            <select
              id="enroll-group"
              className="form-input"
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              required
            >
              <option value="">Selecione uma turma…</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} ({g.weekday === 1 ? 'Segundas' : g.weekday === 3 ? 'Quartas' : `Dia ${g.weekday}`} · {g.level})
                </option>
              ))}
            </select>
          </div>

          {/* 2. Modality Selector (Only recurring group modalities) */}
          <div className="form-group">
            <label className="form-label" htmlFor="enroll-modality">Modalidade do Plano *</label>
            <select
              id="enroll-modality"
              className="form-input"
              value={modality}
              onChange={(e) => setModality(e.target.value as ModalityType)}
            >
              <option value="quarterly_group">Plano Trimestral Grupo</option>
              <option value="monthly_group">Plano Mensal Grupo</option>
            </select>
          </div>

          {/* Start Date */}
          <div className="form-group">
            <label className="form-label" htmlFor="enroll-start">Data de Início</label>
            <input
              id="enroll-start"
              type="date"
              className="form-input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>

          {/* Notes */}
          <div className="form-group">
            <label className="form-label" htmlFor="enroll-notes">Observações (opcional)</label>
            <input
              id="enroll-notes"
              type="text"
              className="form-input"
              placeholder="Ex: Pagamento via PIX..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Financial Projection Checkbox */}
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
                {modality === 'quarterly_group' && (
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <button
                      type="button"
                      className={`btn btn-sm ${installments === '1' ? 'btn-primary' : 'btn-ghost'}`}
                      onClick={setSinglePaymentPreset}
                    >
                      À Vista (1x)
                    </button>
                    <button
                      type="button"
                      className={`btn btn-sm ${installments === '3' ? 'btn-primary' : 'btn-ghost'}`}
                      onClick={setQuarterlyInstallmentsPreset}
                    >
                      Parcelado (3x)
                    </button>
                  </div>
                )}

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="proj-installments">Parcelas</label>
                    <input
                      id="proj-installments"
                      type="number"
                      className="form-input"
                      value={installments}
                      onChange={(e) => setInstallments(e.target.value)}
                      min="1"
                      max="36"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="proj-amount">Valor Parcela (R$)</label>
                    <input
                      id="proj-amount"
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

                <p className="text-xs text-muted" style={{ fontStyle: 'italic' }}>
                  Total previsto: { (parseFloat(amount || '0') * parseInt(installments || '1', 10)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>

                <div className="form-group">
                  <label className="form-label" htmlFor="proj-due">Vencimento da 1ª Parcela</label>
                  <input
                    id="proj-due"
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
            <button id="enroll-submit-btn" type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <><span className="spinner" /> Salvando…</> : '✓ Confirmar Matrícula'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EnrollModal;
