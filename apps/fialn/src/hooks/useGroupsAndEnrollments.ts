import { useState, useEffect, useCallback } from 'react';
import type { GroupClassroom, StudentEnrollment, ModalityType, TransactionCategory, PaymentRecipient, PaymentMethod } from '@fi/types';
import { supabase } from '../lib/supabase';

export interface CreateEnrollmentPayload {
  person_id: string;
  group_id: string | null;
  modality: ModalityType;
  start_date: string;
  notes: string | null;
  is_partner?: boolean;
  partner_details?: string | null;
  received_by?: PaymentRecipient | null;
  payment_method?: PaymentMethod | null;
  // Optional financial projection parameters:
  generateProjections?: boolean;
  total_installments?: number;
  amount_per_installment?: number;
  first_due_date?: string;
}

export interface UpdateEnrollmentPayload {
  group_id?: string | null;
  modality?: ModalityType;
  status?: StudentEnrollment['status'];
  start_date?: string;
  notes?: string | null;
  is_partner?: boolean;
  partner_details?: string | null;
  received_by?: PaymentRecipient | null;
  payment_method?: PaymentMethod | null;
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
          .order('created_at', { ascending: false });

        if (enrollError) throw enrollError;
        setEnrollments((enrollmentsData ?? []) as unknown as StudentEnrollment[]);
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
      // 1. Insert enrollment row
      const { data: newEnrollment, error: enrollError } = await supabase
        .from('fialn_enrollments')
        .insert({
          person_id: payload.person_id,
          group_id: payload.group_id,
          modality: payload.modality,
          status: 'active',
          start_date: payload.start_date,
          notes: payload.notes,
          is_partner: payload.is_partner ?? false,
          partner_details: payload.is_partner ? payload.partner_details : null,
          received_by: payload.is_partner ? null : (payload.received_by ?? 'foraisso'),
          payment_method: payload.is_partner ? null : (payload.payment_method ?? 'credit'),
        })
        .select(`*, group:fialn_groups(*)`)
        .single();

      if (enrollError) throw enrollError;

      // 2. If not a partner and financial projections requested, call RPC function
      if (
        !payload.is_partner &&
        payload.generateProjections &&
        payload.amount_per_installment &&
        payload.amount_per_installment > 0 &&
        payload.first_due_date
      ) {
        const category: TransactionCategory =
          payload.modality === 'private_bundle' || payload.modality === 'single_private'
            ? 'private_lesson'
            : 'study_group';

        const groupName = (newEnrollment as unknown as StudentEnrollment).group?.name;
        const modalityLabel =
          payload.modality === 'monthly_group'
            ? 'Plano Mensal'
            : payload.modality === 'quarterly_group'
            ? 'Plano Trimestral'
            : payload.modality === 'private_bundle'
            ? 'Pacote Particular'
            : payload.modality === 'single_group'
            ? 'Aula Avulsa Grupo'
            : 'Aula Particular Avulsa';

        const desc = groupName
          ? `${modalityLabel} (${groupName})`
          : modalityLabel;

        const { error: rpcError } = await supabase.rpc('fialn_create_enrollment_financials', {
          p_person_id: payload.person_id,
          p_enrollment_id: newEnrollment.id,
          p_category: category,
          p_payment_method: payload.payment_method || 'credit',
          p_received_by: payload.received_by || 'foraisso',
          p_total_installments: payload.payment_method === 'pix' ? 1 : (payload.total_installments || 1),
          p_amount_per_installment: payload.amount_per_installment,
          p_first_due_date: payload.first_due_date,
          p_description: desc,
          p_is_partner: false,
        });

        if (rpcError) throw rpcError;
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
      const { data: updatedData, error: updateError } = await supabase
        .from('fialn_enrollments')
        .update({
          ...payload,
          updated_at: new Date().toISOString(),
        })
        .eq('id', enrollmentId)
        .select(`*, group:fialn_groups(*)`)
        .single();

      if (updateError) throw updateError;

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
