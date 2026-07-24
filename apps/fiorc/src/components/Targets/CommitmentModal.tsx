import { useState, useRef, useEffect } from 'react';
import type { CommitmentItem } from '@fi/types';

interface CommitmentModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (commitment: CommitmentItem) => Promise<void>;
  commitmentToEdit: CommitmentItem | null;
}

export function CommitmentModal({
  open, onClose, onSave, commitmentToEdit
}: CommitmentModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Sync open state ↔ native dialog
  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open && !el.open) {
      el.showModal();
    } else if (!open && el.open) {
      el.close();
    }
  }, [open]);

  // Close on backdrop click
  const handleDialogClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) onClose();
  };

  // Form state
  const [name, setName]     = useState('');
  const [amount, setAmount] = useState('');
  const [dueDay, setDueDay] = useState(5); // Default day 5 as requested
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (commitmentToEdit) {
        setName(commitmentToEdit.name);
        setAmount(commitmentToEdit.amount.toString());
        setDueDay(commitmentToEdit.due_day);
      } else {
        reset();
      }
    }
  }, [commitmentToEdit, open]);

  const reset = () => {
    setName('');
    setAmount('');
    setDueDay(5);
    setError(null);
  };

  const handleClose = () => { reset(); onClose(); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      setError('Informe um valor válido.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const parsedAmount = parseFloat(amount);
      const parsedDay = Math.max(1, Math.min(31, dueDay));
      
      const newCommitment: CommitmentItem = {
        id: commitmentToEdit ? commitmentToEdit.id : crypto.randomUUID(),
        name,
        amount: parsedAmount,
        due_day: parsedDay,
        is_paid: commitmentToEdit ? commitmentToEdit.is_paid : false,
      };

      await onSave(newCommitment);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <dialog ref={dialogRef} onClose={onClose} onClick={handleDialogClick}>
      <div className="dialog-header">
        <span className="dialog-title">{commitmentToEdit ? 'Editar Compromisso' : 'Novo Compromisso'}</span>
        <button className="btn btn-ghost btn-icon" onClick={handleClose} aria-label="Fechar">✕</button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="dialog-body">
          {/* Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="commit-name">Nome</label>
            <input
              id="commit-name"
              type="text"
              className="form-input"
              placeholder="ex: Conta de Luz"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>

          {/* Amount */}
          <div className="form-group">
            <label className="form-label" htmlFor="commit-amount">Valor (R$)</label>
            <input
              id="commit-amount"
              type="number"
              className="form-input"
              placeholder="0,00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              step="0.01"
              min="0.01"
              required
            />
          </div>

          {/* Due Day */}
          <div className="form-group">
            <label className="form-label" htmlFor="commit-day">Dia de Vencimento</label>
            <input
              id="commit-day"
              type="number"
              className="form-input"
              value={dueDay}
              onChange={e => setDueDay(parseInt(e.target.value, 10) || 1)}
              min="1"
              max="31"
              required
            />
          </div>

          {error && <p className="form-error">{error}</p>}
        </div>

        <div className="dialog-footer">
          <button type="button" className="btn btn-secondary" onClick={handleClose}>Cancelar</button>
          <button id="btn-modal-submit" type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <><span className="spinner" /> Salvando…</> : 'Salvar'}
          </button>
        </div>
      </form>
    </dialog>
  );
}
