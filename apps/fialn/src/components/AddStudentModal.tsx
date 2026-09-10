import { useState } from 'react';
import type { CreateStudentPayload } from '../hooks/useStudents';

interface AddStudentModalProps {
  saving: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateStudentPayload) => Promise<boolean>;
}

function formatCpf(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
}

export function AddStudentModal({ saving, onClose, onSubmit }: AddStudentModalProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [financialStatus, setFinancialStatus] = useState('em_dia');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanFirst = firstName.trim();
    const cleanLast = lastName.trim();

    if (!cleanFirst) {
      setErrorMsg('O nome é obrigatório.');
      return;
    }

    if (!cleanLast) {
      setErrorMsg('O sobrenome é obrigatório.');
      return;
    }

    const cleanCpf = cpf.replace(/\D/g, '');
    if (cleanCpf && cleanCpf.length !== 11) {
      setErrorMsg('O CPF deve conter 11 dígitos numéricos.');
      return;
    }

    const fullName = `${cleanFirst} ${cleanLast}`.trim();

    const success = await onSubmit({
      first_name: cleanFirst,
      last_name: cleanLast,
      full_name: fullName,
      cpf: cleanCpf || null,
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
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Novo Aluno</h2>
            <p className="text-xs text-muted mt-2">Cadastrar um novo aluno no ecossistema</p>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose} type="button">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="stack-4">
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="student-first-name">Nome *</label>
              <input
                id="student-first-name"
                type="text"
                className="form-input"
                placeholder="Ex: Maria"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="student-last-name">Sobrenome *</label>
              <input
                id="student-last-name"
                type="text"
                className="form-input"
                placeholder="Ex: Silva"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="student-cpf">CPF</label>
              <input
                id="student-cpf"
                type="text"
                className="form-input"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={(e) => setCpf(formatCpf(e.target.value))}
                maxLength={14}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="student-phone">Telefone / WhatsApp</label>
              <input
                id="student-phone"
                type="tel"
                className="form-input"
                placeholder="(11) 99999-9999"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="student-email">E-mail</label>
            <input
              id="student-email"
              type="email"
              className="form-input"
              placeholder="aluno@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="student-fin-status">Status Financeiro Inicial</label>
            <select
              id="student-fin-status"
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
            <label className="form-label" htmlFor="student-notes">Observações Iniciais</label>
            <textarea
              id="student-notes"
              className="form-input"
              rows={3}
              placeholder="Ex: Aluno de Shibari nível intermediário..."
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
            <button id="add-student-submit-btn" type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <><span className="spinner" /> Salvando…</> : '✓ Cadastrar Aluno'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddStudentModal;
