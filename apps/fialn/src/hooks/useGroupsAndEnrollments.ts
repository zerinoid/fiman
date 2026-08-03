import { useState, useEffect, useCallback } from 'react';
import type { GroupClassroom, StudentEnrollment, ModalityType, TransactionCategory } from '@fi/types';
import { supabase } from '../lib/supabase';

export interface CreateEnrollmentPayload {
  person_id: string;
  group_id: string | null;
  modality: ModalityType;
  start_date: string;
  notes: string | null;
  // Optional financial projection parameters:
  generateProjections?: boolean;
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
  updateEnrollmentStatus: (enrollmentId: string, status: StudentEnrollment['status']) => Promise<boolean>;
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
   * Creates a student enrollment. If financial projections are requested,
   * calls the `fialn_create_plan_installments` RPC function to insert projected rows
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
        })
        .select(`*, group:fialn_groups(*)`)
        .single();

      if (enrollError) throw enrollError;

      // 2. If projections requested, call RPC function
      if (
        payload.generateProjections &&
        payload.total_installments &&
        payload.total_installments > 0 &&
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
          payload.modality === 'quarterly_group'
            ? 'Plano Trimestral'
            : payload.modality === 'private_bundle'
            ? 'Pacote Particular'
            : payload.modality === 'single_group'
            ? 'Aula Avulsa Grupo'
            : 'Aula Particular Avulsa';

        const desc = groupName
          ? `${modalityLabel} (${groupName})`
          : modalityLabel;

        const { error: rpcError } = await supabase.rpc('fialn_create_plan_installments', {
          p_person_id: payload.person_id,
          p_category: category,
          p_total_installments: payload.total_installments,
          p_amount_per_installment: payload.amount_per_installment,
          p_first_due_date: payload.first_due_date,
          p_description: desc,
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

  const updateEnrollmentStatus = async (
    enrollmentId: string,
    status: StudentEnrollment['status'],
  ): Promise<boolean> => {
    setSaving(true);
    setError(null);

    const { error: updateError } = await supabase
      .from('fialn_enrollments')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', enrollmentId);

    setSaving(false);

    if (updateError) {
      setError(updateError.message);
      return false;
    }

    setEnrollments((prev) =>
      prev.map((e) => (e.id === enrollmentId ? { ...e, status } : e)),
    );
    return true;
  };

  return {
    groups,
    enrollments,
    loading,
    saving,
    error,
    createEnrollment,
    updateEnrollmentStatus,
    refresh: fetchAll,
  };
}
