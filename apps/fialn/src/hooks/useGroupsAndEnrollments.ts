import { useState, useEffect, useCallback } from 'react';
import type { GroupClassroom, StudentEnrollment, ModalityType, TransactionCategory, PaymentRecipient, PaymentMethod } from '@fi/types';
import { supabase } from '../lib/supabase';

export function toLocalDateString(date: Date = new Date()): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function calculateEndDate(startDateStr: string, modality: ModalityType): string {
  if (!startDateStr) return startDateStr;
  const d = new Date(`${startDateStr}T00:00:00`);
  if (isNaN(d.getTime())) return startDateStr;

  if (modality === 'monthly_group') {
    d.setMonth(d.getMonth() + 1);
  } else if (modality === 'quarterly_group') {
    d.setMonth(d.getMonth() + 3);
  } else if (modality === 'single_group' || modality === 'single_private') {
    // same day
  } else if (modality === 'private_bundle') {
    d.setMonth(d.getMonth() + 3);
  } else {
    d.setMonth(d.getMonth() + 1);
  }

  return toLocalDateString(d);
}

// ---- Financial calculation helpers ----

/** Returns a new ISO date string (YYYY-MM-DD) with `months` added. */
function addMonths(dateStr: string, months: number): string {
  const d = new Date(`${dateStr}T00:00:00`);
  d.setMonth(d.getMonth() + months);
  return toLocalDateString(d);
}

/** Returns the date of day 5 of the month following the given date string. */
function day5OfNextMonth(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`);
  d.setDate(1);
  d.setMonth(d.getMonth() + 1);
  d.setDate(5);
  return toLocalDateString(d);
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function getTransactionCode(groupName: string | undefined, modality: ModalityType): string {
  if (!groupName) return 'SOBAV'; // safe fallback to satisfy DB constraints
  const name = groupName.toLowerCase();
  let prefix = '';
  if (name.includes('sobre nós') || name.includes('sobre nos')) {
    prefix = 'SOB';
  } else if (name.includes('teoria das cordas')) {
    prefix = 'TEO';
  } else {
    prefix = 'SOB'; // default fallback for constraint
  }

  let suffix = 'AV';
  if (modality === 'monthly_group') {
    suffix = 'ME';
  } else if (modality === 'quarterly_group') {
    suffix = 'TR';
  } else {
    suffix = 'AV';
  }

  return `${prefix}${suffix}`;
}

export interface CreateEnrollmentPayload {
  person_id: string;
  group_id: string | null;
  modality: ModalityType;
  start_date: string;
  end_date?: string | null;
  notes: string | null;
  is_partner?: boolean;
  partner_details?: string | null;
  received_by?: PaymentRecipient | null;
  payment_method?: PaymentMethod | null;
  // Optional financial registration parameters:
  registerPayment?: boolean;         // renamed from generateProjections
  total_installments?: number;
  amount_per_installment?: number;
  first_due_date?: string;
}

export interface UpdateEnrollmentPayload {
  group_id?: string | null;
  modality?: ModalityType;
  status?: StudentEnrollment['status'];
  start_date?: string;
  end_date?: string | null;
  notes?: string | null;
  is_partner?: boolean;
  partner_details?: string | null;
  received_by?: PaymentRecipient | null;
  payment_method?: PaymentMethod | null;
  registerPayment?: boolean;
  total_installments?: number;
  amount_per_installment?: number;
  first_due_date?: string;
}

export interface UseGroupsAndEnrollmentsReturn {
  groups: GroupClassroom[];
  enrollments: StudentEnrollment[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  createEnrollment: (payload: CreateEnrollmentPayload) => Promise<boolean>;
  updateEnrollment: (enrollmentId: string, payload: UpdateEnrollmentPayload) => Promise<boolean>;
  updateEnrollmentStatus: (enrollmentId: string, status: StudentEnrollment['status']) => Promise<boolean>;
  deleteEnrollment: (enrollmentId: string) => Promise<boolean>;
  refresh: () => void;
}

export function useGroupsAndEnrollments(personId: string | null): UseGroupsAndEnrollmentsReturn {
  const [groups, setGroups] = useState<GroupClassroom[]>([]);
  const [enrollments, setEnrollments] = useState<StudentEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Fetch group classrooms
      const { data: groupsData, error: groupsError } = await supabase
        .from('fialn_groups')
        .select('*')
        .order('name');

      if (groupsError) throw groupsError;
      setGroups((groupsData ?? []) as GroupClassroom[]);

      // 2. Fetch student enrollments if personId is provided
      if (personId) {
        const { data: enrollmentsData, error: enrollError } = await supabase
          .from('fialn_enrollments')
          .select(`
            *,
            group:fialn_groups(*)
          `)
          .eq('person_id', personId)
          .order('start_date', { ascending: false })
          .order('created_at', { ascending: false });

        if (enrollError) throw enrollError;

        const rawEnrollments = (enrollmentsData ?? []) as unknown as StudentEnrollment[];
        rawEnrollments.sort((a, b) => (b.start_date || '').localeCompare(a.start_date || ''));
        const todayStr = toLocalDateString(new Date());

        // Process enrollments: auto-complete if active but end_date has passed
        const processed = rawEnrollments.map((e) => {
          const endDate = e.end_date ?? calculateEndDate(e.start_date, e.modality);
          const isExpired = endDate < todayStr;
          if (e.status === 'active' && isExpired) {
            // Asynchronously sync status update to DB
            supabase
              .from('fialn_enrollments')
              .update({ status: 'completed', end_date: endDate, updated_at: new Date().toISOString() })
              .eq('id', e.id)
              .then(() => {});

            return { ...e, end_date: endDate, status: 'completed' as const };
          }
          return { ...e, end_date: endDate };
        });

        setEnrollments(processed);
      } else {
        setEnrollments([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados de grupos e matrículas');
    } finally {
      setLoading(false);
    }
  }, [personId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  /**
   * Creates a student enrollment. If financial projections are requested and not partner,
   * calls the `fialn_create_enrollment_financials` RPC function to insert rows
   * into `fiorc_transactions` in a single atomic SQL call.
   */
  const createEnrollment = async (payload: CreateEnrollmentPayload): Promise<boolean> => {
    setSaving(true);
    setError(null);

    try {
      const calculatedEnd = payload.end_date ?? calculateEndDate(payload.start_date, payload.modality);
      const todayStr = toLocalDateString(new Date());
      const isExpiredOrRetroactive = calculatedEnd < todayStr;
      const initialStatus: StudentEnrollment['status'] = isExpiredOrRetroactive ? 'completed' : 'active';

      // 1. Insert enrollment row
      const { data: newEnrollment, error: enrollError } = await supabase
        .from('fialn_enrollments')
        .insert({
          person_id: payload.person_id,
          group_id: payload.group_id,
          modality: payload.modality,
          status: initialStatus,
          start_date: payload.start_date,
          end_date: calculatedEnd,
          notes: payload.notes,
          is_partner: payload.is_partner ?? false,
          partner_details: payload.is_partner ? payload.partner_details : null,
          received_by: payload.is_partner ? null : (payload.received_by ?? 'foraisso'),
          payment_method: payload.is_partner ? null : (payload.payment_method ?? 'pix'),
        })
        .select(`*, group:fialn_groups(*)`)
        .single();

      if (enrollError) throw enrollError;

      // 2. If not a partner and payment registration is requested, insert directly into fialn_student_transactions
      if (
        !payload.is_partner &&
        payload.registerPayment &&
        payload.amount_per_installment &&
        payload.amount_per_installment > 0 &&
        payload.first_due_date
      ) {
        const isForaisso   = (payload.received_by ?? 'foraisso') === 'foraisso';
        const installments = payload.payment_method === 'pix' ? 1 : (payload.total_installments ?? 1);

        const category: TransactionCategory =
          payload.modality === 'private_bundle' || payload.modality === 'single_private'
            ? 'private_lesson'
            : 'study_group';

        // Build description from group name + modality
        const groupName = (newEnrollment as unknown as StudentEnrollment).group?.name;
        const codigo = getTransactionCode(groupName, payload.modality);
        const modalityLabel =
          payload.modality === 'monthly_group'   ? 'Plano Mensal'
          : payload.modality === 'quarterly_group' ? 'Plano Trimestral'
          : payload.modality === 'private_bundle'  ? 'Pacote Particular'
          : payload.modality === 'single_group'    ? 'Aula Avulsa Grupo'
          : 'Aula Particular Avulsa';
        const desc = groupName ? `${modalityLabel} (${groupName})` : modalityLabel;

        // Suppress unused variable warning for category (kept for future filtering)
        void category;

        const rows = Array.from({ length: installments }, (_, i) => {
          // For credit: each installment has its own due_date (monthly)
          // For PIX: single transaction on the first_due_date; due_date is null
          const txnDate  = addMonths(payload.first_due_date!, i);
          const dueDate  = payload.payment_method === 'credit' ? txnDate : null;
          const projDue  = day5OfNextMonth(txnDate);

          return {
            person_id:                 payload.person_id,
            enrollment_id:             newEnrollment.id,
            transaction_date:          txnDate,
            description:               desc,
            codigo:                    codigo,
            received_by:               payload.received_by ?? 'foraisso',
            amount:                    payload.amount_per_installment!,
            payment_method:            payload.payment_method ?? 'pix',
            due_date:                  dueDate,
            split_percent:             isForaisso ? 25 : 75,
            split_amount:              round2(payload.amount_per_installment! * (isForaisso ? 0.25 : 0.75)),
            split_type:                isForaisso ? 'debt' : 'receivable',
            fiorc_projection_due_date: projDue,
            fiorc_status:              'pending',
            installment_index:         i + 1,
            total_installments:        installments,
          };
        });

        const { error: txnError } = await supabase
          .from('fialn_student_transactions')
          .insert(rows);

        if (txnError) throw txnError;
      }

      setEnrollments((prev) => [newEnrollment as unknown as StudentEnrollment, ...prev]);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar matrícula');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const updateEnrollment = async (
    enrollmentId: string,
    payload: UpdateEnrollmentPayload,
  ): Promise<boolean> => {
    setSaving(true);
    setError(null);
    try {
      const existing = enrollments.find((e) => e.id === enrollmentId);
      const startDate = payload.start_date ?? existing?.start_date;
      const modality = payload.modality ?? existing?.modality;
      const calculatedEnd = payload.end_date ?? (startDate && modality ? calculateEndDate(startDate, modality) : undefined);

      const todayStr = toLocalDateString(new Date());
      const isExpired = calculatedEnd && calculatedEnd < todayStr;
      const finalStatus = isExpired ? 'completed' : (payload.status ?? existing?.status);

      const { data: updatedData, error: updateError } = await supabase
        .from('fialn_enrollments')
        .update({
          group_id: payload.group_id,
          modality: payload.modality,
          status: finalStatus,
          start_date: payload.start_date,
          end_date: calculatedEnd,
          notes: payload.notes,
          is_partner: payload.is_partner,
          partner_details: payload.partner_details,
          received_by: payload.received_by,
          payment_method: payload.payment_method,
          updated_at: new Date().toISOString(),
        })
        .eq('id', enrollmentId)
        .select(`*, group:fialn_groups(*)`)
        .single();

      if (updateError) throw updateError;

      // Handle financial transactions update/recalculation
      if (payload.is_partner || payload.registerPayment === false) {
        // If it's a partner or payment is explicitly disabled, remove pending transactions for this enrollment
        const { error: delError } = await supabase
          .from('fialn_student_transactions')
          .delete()
          .eq('enrollment_id', enrollmentId)
          .eq('fiorc_status', 'pending');

        if (delError) throw delError;
      } else if (
        payload.registerPayment &&
        payload.amount_per_installment &&
        payload.amount_per_installment > 0 &&
        payload.first_due_date
      ) {
        // Delete pending transactions before inserting newly recalculated ones
        const { error: delError } = await supabase
          .from('fialn_student_transactions')
          .delete()
          .eq('enrollment_id', enrollmentId)
          .eq('fiorc_status', 'pending');

        if (delError) throw delError;

        const isForaisso = (payload.received_by ?? 'foraisso') === 'foraisso';
        const installments = payload.payment_method === 'pix' ? 1 : (payload.total_installments ?? 1);

        const groupName = (updatedData as unknown as StudentEnrollment).group?.name;
        const currentModality = payload.modality ?? updatedData.modality;
        const codigo = getTransactionCode(groupName, currentModality);
        const modalityLabel =
          currentModality === 'monthly_group' ? 'Plano Mensal'
          : currentModality === 'quarterly_group' ? 'Plano Trimestral'
          : currentModality === 'private_bundle' ? 'Pacote Particular'
          : currentModality === 'single_group' ? 'Aula Avulsa Grupo'
          : 'Aula Particular Avulsa';
        const desc = groupName ? `${modalityLabel} (${groupName})` : modalityLabel;

        const rows = Array.from({ length: installments }, (_, i) => {
          const txnDate = addMonths(payload.first_due_date!, i);
          const dueDate = payload.payment_method === 'credit' ? txnDate : null;
          const projDue = day5OfNextMonth(txnDate);

          return {
            person_id: updatedData.person_id,
            enrollment_id: enrollmentId,
            transaction_date: txnDate,
            description: desc,
            codigo: codigo,
            received_by: payload.received_by ?? 'foraisso',
            amount: payload.amount_per_installment!,
            payment_method: payload.payment_method ?? 'pix',
            due_date: dueDate,
            split_percent: isForaisso ? 25 : 75,
            split_amount: round2(payload.amount_per_installment! * (isForaisso ? 0.25 : 0.75)),
            split_type: isForaisso ? 'debt' : 'receivable',
            fiorc_projection_due_date: projDue,
            fiorc_status: 'pending',
            installment_index: i + 1,
            total_installments: installments,
          };
        });

        const { error: txnError } = await supabase
          .from('fialn_student_transactions')
          .insert(rows);

        if (txnError) throw txnError;
      }

      setEnrollments((prev) =>
        prev.map((e) => (e.id === enrollmentId ? (updatedData as unknown as StudentEnrollment) : e))
      );
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar matrícula');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const updateEnrollmentStatus = async (
    enrollmentId: string,
    status: StudentEnrollment['status'],
  ): Promise<boolean> => {
    return updateEnrollment(enrollmentId, { status });
  };

  const deleteEnrollment = async (enrollmentId: string): Promise<boolean> => {
    setSaving(true);
    setError(null);

    try {
      const { error: deleteError } = await supabase
        .from('fialn_enrollments')
        .delete()
        .eq('id', enrollmentId);

      if (deleteError) throw deleteError;

      setEnrollments((prev) => prev.filter((e) => e.id !== enrollmentId));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir matrícula');
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    groups,
    enrollments,
    loading,
    saving,
    error,
    createEnrollment,
    updateEnrollment,
    updateEnrollmentStatus,
    deleteEnrollment,
    refresh: fetchAll,
  };
}

