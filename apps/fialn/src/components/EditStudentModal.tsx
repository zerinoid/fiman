import { useState } from 'react';
import type { UpdateStudentPayload } from '../hooks/useStudents';

interface EditStudentModalProps {
  student: {
    id: string;
    full_name: string;
    phone?: string | null;
    email?: string | null;
    notes?: string | null;
    financial_status?: string | null;
  };
  saving: boolean;
  onClose: () => void;
  onSubmit: (payload: UpdateStudentPayload) => Promise<boolean>;
}

export function EditStudentModal({
  student,
  saving,
  onClose,
  onSubmit,
}: EditStudentModalProps) {
  const [fullName, setFullName] = useState(student.full_name ?? '');
  const [phone, setPhone] = useState(student.phone ?? '');
  const [email, setEmail] = useState(student.email ?? '');
  const [notes, setNotes] = useState(student.notes ?? '');
  const [financialStatus, setFinancialStatus] = useState(student.financial_status ?? 'em_dia');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName.trim()) {
      setErrorMsg('O nome completo é obrigatório.');
      return;
    }

    const success = await onSubmit({
      full_name: fullName.trim(),
      phone: phone.trim() || null,
      email: email.trim() || null,
      notes: notes.trim() || null,
      financial_status: financialStatus,
    });

    if (success) {
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
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Editar Aluno</h2>
            <p className="text-xs text-muted mt-2">Atualizar dados cadastrais do aluno</p>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose} type="button">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="stack-4">
          <div className="form-group">
            <label className="form-label" htmlFor="edit-student-full-name">Nome Completo *</label>
            <input
              id="edit-student-full-name"
              type="text"
              className="form-input"
              placeholder="Ex: Maria Silva"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="edit-student-phone">Telefone / WhatsApp</label>
              <input
                id="edit-student-phone"
                type="tel"
                className="form-input"
                placeholder="(11) 99999-9999"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="edit-student-email">E-mail</label>
              <input
                id="edit-student-email"
                type="email"
                className="form-input"
                placeholder="aluno@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="edit-student-fin-status">Status Financeiro</label>
            <select
              id="edit-student-fin-status"
              className="form-input"
              value={financialStatus}
              onChange={(e) => setFinancialStatus(e.target.value)}
            >
              <option value="em_dia">✓ Em dia</option>
              <option value="pendente">⚠ Pendente</option>
              <option value="inadimplente">✗ Inadimplente</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="edit-student-notes">Observações</label>
            <textarea
              id="edit-student-notes"
              className="form-input"
              rows={3}
              placeholder="Observações de cadastro..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{ resize: 'vertical' }}
            />
          </div>

          {errorMsg && <p className="form-error">{errorMsg}</p>}

          <div className="flex-gap-2" style={{ justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={saving}>
              Cancelar
            </button>
            <button id="edit-student-submit-btn" type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <><span className="spinner" /> Salvando…</> : '✓ Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditStudentModal;
