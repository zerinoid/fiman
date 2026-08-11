import { useState, useEffect } from 'react';
import type { GroupClassroom, ModalityType, PaymentRecipient, PaymentMethod, StudentEnrollment } from '@fi/types';
import { calculateEndDate, toLocalDateString, type CreateEnrollmentPayload, type UpdateEnrollmentPayload } from '../hooks/useGroupsAndEnrollments';

interface EnrollModalProps {
  personId: string;
  studentName: string;
  groups: GroupClassroom[];
  saving: boolean;
  enrollmentToEdit?: StudentEnrollment | null;
  onClose: () => void;
  onSubmit: (payload: CreateEnrollmentPayload) => Promise<boolean>;
  onUpdate?: (enrollmentId: string, payload: UpdateEnrollmentPayload) => Promise<boolean>;
}

function toLocalDateStringFallback(date: Date): string {
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
  enrollmentToEdit,
  onClose,
  onSubmit,
  onUpdate,
}: EnrollModalProps) {
  const isEditing = Boolean(enrollmentToEdit);

  const [groupId, setGroupId] = useState<string>(enrollmentToEdit?.group_id ?? (groups[0]?.id ?? ''));
  const [modality, setModality] = useState<ModalityType>(enrollmentToEdit?.modality ?? 'quarterly_group');
  const [status, setStatus] = useState<StudentEnrollment['status']>(enrollmentToEdit?.status ?? 'active');
  const [startDate, setStartDate] = useState<string>(enrollmentToEdit?.start_date ?? toLocalDateStringFallback(new Date()));
  const [notes, setNotes] = useState<string>(enrollmentToEdit?.notes ?? '');

  // Partner / Scholarship toggle
  const [isPartner, setIsPartner] = useState<boolean>(enrollmentToEdit?.is_partner ?? false);
  const [partnerDetails, setPartnerDetails] = useState<string>(enrollmentToEdit?.partner_details ?? '');

  // Split payment recipient & payment method
  const [receivedBy, setReceivedBy] = useState<PaymentRecipient>(enrollmentToEdit?.received_by ?? 'foraisso');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(enrollmentToEdit?.payment_method ?? 'credit');

  // Projections / Payment Registration
  const [registerPayment, setRegisterPayment] = useState<boolean>(!isEditing);
  const [installments, setInstallments] = useState<string>('1');
  const [amount, setAmount] = useState<string>('900');
  const [firstDueDate, setFirstDueDate] = useState<string>(toLocalDateStringFallback(new Date()));

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const calculatedEndDate = calculateEndDate(startDate, modality);
  const todayStr = toLocalDateString();
  const isRetroactive = calculatedEndDate < todayStr;

  // Auto-pricing based on group and modality (only when creating)
  useEffect(() => {
    if (isEditing) return;
    const selectedGroup = groups.find((g) => g.id === groupId);
    const groupName = selectedGroup?.name.toLowerCase() ?? '';

    if (groupName.includes('teoria das cordas')) {
      if (modality === 'single_group') {
        setInstallments('1');
        setAmount('150');
      } else if (modality === 'monthly_group') {
        setInstallments('1');
        setAmount('450');
      } else {
        setInstallments('1');
        setAmount('900');
      }
    } else if (groupName.includes('sobre nós') || groupName.includes('sobre nos')) {
      if (modality === 'single_group') {
        setInstallments('1');
        setAmount('100');
      } else if (modality === 'monthly_group') {
        setInstallments('1');
        setAmount('300');
      } else {
        setInstallments('1');
        setAmount('750');
      }
    }
  }, [groupId, modality, groups, isEditing]);

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

  const parsedAmount = parseFloat(amount || '0');
  const parsedInstallments = paymentMethod === 'pix' ? 1 : parseInt(installments || '1', 10);
  const totalAmount = parsedAmount * parsedInstallments;
  const split75Amount = (parsedAmount * 0.75).toFixed(2);
  const split25Amount = (parsedAmount * 0.25).toFixed(2);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!groupId) {
      setErrorMsg('Selecione uma turma de grupo.');
      return;
    }

    if (isPartner && !partnerDetails.trim()) {
      setErrorMsg('Descreva a condição da parceria ou vigência.');
      return;
    }

    if (isEditing && enrollmentToEdit && onUpdate) {
      const ok = await onUpdate(enrollmentToEdit.id, {
        group_id: groupId,
        modality,
        status,
        start_date: startDate,
        end_date: calculatedEndDate,
        notes: notes.trim() || null,
        is_partner: isPartner,
        partner_details: isPartner ? partnerDetails.trim() : null,
        received_by: isPartner ? null : receivedBy,
        payment_method: isPartner ? null : paymentMethod,
      });

      if (ok) {
        onClose();
      }
      return;
    }

    let instNum = 1;
    let amtNum = 0;

    if (!isPartner && registerPayment) {
      instNum = paymentMethod === 'pix' ? 1 : parseInt(installments, 10);
      amtNum = parseFloat(amount);
      if (paymentMethod === 'credit' && (isNaN(instNum) || instNum <= 0)) {
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
      end_date: calculatedEndDate,
      notes: notes.trim() || null,
      is_partner: isPartner,
      partner_details: isPartner ? partnerDetails.trim() : null,
      received_by: isPartner ? null : receivedBy,
      payment_method: isPartner ? null : paymentMethod,
      registerPayment: !isPartner && registerPayment,
      total_installments: !isPartner && registerPayment ? instNum : undefined,
      amount_per_installment: !isPartner && registerPayment ? amtNum : undefined,
      first_due_date: !isPartner && registerPayment ? firstDueDate : undefined,
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
          maxWidth: '540px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <div className="flex-between mb-6">
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
              {isEditing ? 'Editar Matrícula' : 'Nova Matrícula / Plano'}
            </h2>
            <p className="text-xs text-muted mt-2">Aluno: {studentName}</p>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose} type="button">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="stack-4">
          {/* Status selector in edit mode */}
          {isEditing && (
            <div className="form-group">
              <label className="form-label" htmlFor="enroll-status">Status da Matrícula *</label>
              <select
                id="enroll-status"
                className="form-input"
                value={status}
                onChange={(e) => setStatus(e.target.value as StudentEnrollment['status'])}
              >
                <option value="active">✓ Ativa</option>
                <option value="paused">⏸ Pausada</option>
                <option value="completed">✔ Concluída / Vencida</option>
                <option value="cancelled">✖ Cancelada</option>
              </select>
            </div>
          )}

          {/* 1. Group Classroom selector */}
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

          {/* 2. Modality Selector */}
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
              <option value="single_group">Aula Avulsa Grupo</option>
            </select>
          </div>

          {/* Start Date and End Date preview */}
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="enroll-start">Data de Início *</label>
              <input
                id="enroll-start"
                type="date"
                className="form-input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="enroll-end">Fim Previsto</label>
              <input
                id="enroll-end"
                type="date"
                className="form-input"
                value={calculatedEndDate}
                readOnly
                title="Calculado automaticamente com base na modalidade"
                style={{ opacity: 0.85, cursor: 'not-allowed', background: 'var(--fi-color-surface-2)' }}
              />
            </div>
          </div>

          {isRetroactive && !isEditing && (
            <div className="alert alert-warning" style={{ fontSize: '0.8rem', padding: '0.5rem 0.75rem' }}>
              ⚠️ <strong>Matrícula Retroativa / Vencida:</strong> Como o término ({calculatedEndDate}) já passou, o registro será salvo como <strong>concluído (completed)</strong>.
            </div>
          )}

          {/* Partner / Scholarship Toggle */}
          <div
            style={{
              padding: '0.75rem 1rem',
              background: isPartner ? 'var(--fi-color-surface-3, rgba(234, 179, 8, 0.1))' : 'var(--fi-color-surface-2)',
              borderRadius: 'var(--fi-radius-md)',
              border: `1px solid ${isPartner ? '#eab308' : 'var(--fi-color-border)'}`,
            }}
            className="stack-3"
          >
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={isPartner}
                onChange={(e) => setIsPartner(e.target.checked)}
              />
              <span>🤝 Parceiro / Bolsista (Troca de Serviços)</span>
            </label>

            {isPartner && (
              <div className="form-group mt-2">
                <label className="form-label" htmlFor="partner-details">Condição da Parceria / Vigência *</label>
                <input
                  id="partner-details"
                  type="text"
                  className="form-input"
                  placeholder="Circunstancia da parceria, vigência, etc"
                  value={partnerDetails}
                  onChange={(e) => setPartnerDetails(e.target.value)}
                  required={isPartner}
                />
                <p className="text-xs text-muted mt-1" style={{ color: '#eab308' }}>
                  ℹ️ Alunos parceiros não geram registros financeiros.
                </p>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="form-group">
            <label className="form-label" htmlFor="enroll-notes">Observações (opcional)</label>
            <input
              id="enroll-notes"
              type="text"
              className="form-input"
              placeholder="Ex: Aluno vindo do evento X..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Financial Section (Only if NOT partner) */}
          {!isPartner && (
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
                  checked={registerPayment}
                  onChange={(e) => setRegisterPayment(e.target.checked)}
                />
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                  💳 {isEditing ? 'Atualizar Dados de Pagamento' : 'Registrar Pagamento'}
                </span>
              </label>

              {registerPayment && (
                <div className="stack-4 mt-2">
                  {/* Parte que recebeu */}
                  <div className="form-group">
                    <label className="form-label">Parte que Recebeu o Pagamento *</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        type="button"
                        className={`btn btn-sm ${receivedBy === 'foraisso' ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => setReceivedBy('foraisso')}
                        style={{ flex: 1 }}
                      >
                        Foraisso (Eu recebi)
                      </button>
                      <button
                        type="button"
                        className={`btn btn-sm ${receivedBy === 'shibarihouse' ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => setReceivedBy('shibarihouse')}
                        style={{ flex: 1 }}
                      >
                        Shibari House (Eles receberam)
                      </button>
                    </div>
                  </div>

                  {/* Método de Pagamento */}
                  <div className="form-group">
                    <label className="form-label">Método de Pagamento *</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        type="button"
                        className={`btn btn-sm ${paymentMethod === 'pix' ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => {
                          setPaymentMethod('pix');
                          setInstallments('1');
                        }}
                        style={{ flex: 1 }}
                      >
                        ⚡ PIX
                      </button>
                      <button
                        type="button"
                        className={`btn btn-sm ${paymentMethod === 'credit' ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => setPaymentMethod('credit')}
                        style={{ flex: 1 }}
                      >
                        💳 CRÉDITO
                      </button>
                    </div>
                  </div>

                  {/* Parcelas (Se crédito) */}
                  {paymentMethod === 'credit' && (
                    <>
                      {modality === 'quarterly_group' && (
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <button
                            type="button"
                            className={`btn btn-sm ${installments === '1' ? 'btn-secondary' : 'btn-ghost'}`}
                            onClick={setSinglePaymentPreset}
                          >
                            À Vista (1x)
                          </button>
                          <button
                            type="button"
                            className={`btn btn-sm ${installments === '3' ? 'btn-secondary' : 'btn-ghost'}`}
                            onClick={setQuarterlyInstallmentsPreset}
                          >
                            Parcelado (3x)
                          </button>
                        </div>
                      )}

                      <div className="grid-2">
                        <div className="form-group">
                          <label className="form-label" htmlFor="proj-installments">Qtde Parcelas</label>
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
                          <label className="form-label" htmlFor="proj-amount">Valor por Parcela (R$)</label>
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
                    </>
                  )}

                  {paymentMethod === 'pix' && (
                    <div className="form-group">
                      <label className="form-label" htmlFor="proj-amount-pix">Valor Total do PIX (R$)</label>
                      <input
                        id="proj-amount-pix"
                        type="number"
                        className="form-input"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        step="0.01"
                        min="1"
                        required
                      />
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label" htmlFor="proj-due">
                      {paymentMethod === 'pix' ? 'Data de Recebimento' : 'Vencimento da 1ª Parcela'}
                    </label>
                    <input
                      id="proj-due"
                      type="date"
                      className="form-input"
                      value={firstDueDate}
                      onChange={(e) => setFirstDueDate(e.target.value)}
                      required
                    />
                  </div>

                  {/* Calculation summary info box */}
                  <div
                    style={{
                      padding: '0.75rem',
                      background: 'var(--fi-color-surface-1)',
                      borderRadius: 'var(--fi-radius-sm)',
                      fontSize: '0.85rem',
                      borderLeft: '3px solid var(--fi-color-primary)',
                    }}
                    className="stack-2"
                  >
                    <p style={{ fontWeight: 600 }}>
                      Total Bruto: {totalAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                    {receivedBy === 'shibarihouse' ? (
                      <p style={{ color: 'var(--fi-color-success)' }}>
                        📈 <strong>Shibari House recebeu:</strong> Foraisso tem a receber R$ {split75Amount}{paymentMethod === 'credit' ? '/parcela' : ''} no dia 5 do mês seguinte.
                      </p>
                    ) : (
                      <p style={{ color: 'var(--fi-color-danger)' }}>
                        💸 <strong>Foraisso recebeu:</strong> Foraisso deve repassar R$ {split25Amount}{paymentMethod === 'credit' ? '/parcela' : ''} no dia 5 do mês seguinte.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {errorMsg && <p className="form-error">{errorMsg}</p>}

          <div className="flex-gap-2" style={{ justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={saving}>
              Cancelar
            </button>
            <button id="enroll-submit-btn" type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <><span className="spinner" /> Salvando…</> : isEditing ? '✓ Atualizar Matrícula' : '✓ Confirmar Matrícula'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EnrollModal;
