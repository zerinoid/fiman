import { useState, useEffect, useCallback } from 'react';
import type { Transaction } from '@fi/types';
import { supabase } from '../lib/supabase';

export interface AttendanceRecord {
  id: string;
  class_id: string;
  person_id: string;
  present: boolean;
  payment_type: 'quarterly_plan' | 'single_class' | 'private_lesson' | null;
  transaction_id: string | null;
  created_at: string;
  // Joined from fiteo_class_schedules:
  class_date: string | null;
  proposed_theme: string | null;
}

export interface UseStudentFinancialsReturn {
  incomeTransactions: Transaction[];
  attendance: AttendanceRecord[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useStudentFinancials(personId: string | null): UseStudentFinancialsReturn {
  const [incomeTransactions, setIncomeTransactions] = useState<Transaction[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFinancials = useCallback(async () => {
    if (!personId) {
      setIncomeTransactions([]);
      setAttendance([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Income transactions linked to this student
      const { data: transactions, error: txError } = await supabase
        .from('fiorc_transactions')
        .select('*')
        .eq('person_id', personId)
        .in('category', ['private_lesson', 'study_group', 'workshop', 'session'])
        .order('due_date', { ascending: false });

      if (txError) throw txError;

      // 2. Attendance records with class info
      const { data: attendanceRows, error: attError } = await supabase
        .from('fiteo_attendance')
        .select(`
          id,
          class_id,
          person_id,
          present,
          payment_type,
          transaction_id,
          created_at,
          fiteo_class_schedules (
            class_date,
            proposed_theme
          )
        `)
        .eq('person_id', personId)
        .order('created_at', { ascending: false });

      if (attError) throw attError;

      // Flatten the joined class schedule columns
      const flatAttendance: AttendanceRecord[] = (attendanceRows ?? []).map((row) => {
        const schedule = (row as unknown as { fiteo_class_schedules: { class_date: string; proposed_theme: string } | null })
          .fiteo_class_schedules;
        return {
          id: row.id,
          class_id: row.class_id ?? '',
          person_id: row.person_id ?? '',
          present: row.present ?? false,
          payment_type: row.payment_type as AttendanceRecord['payment_type'],
          transaction_id: row.transaction_id,
          created_at: row.created_at ?? '',
          class_date: schedule?.class_date ?? null,
          proposed_theme: schedule?.proposed_theme ?? null,
        };
      });

      setIncomeTransactions((transactions ?? []) as Transaction[]);
      setAttendance(flatAttendance);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar financeiro');
    } finally {
      setLoading(false);
    }
  }, [personId]);

  useEffect(() => { fetchFinancials(); }, [fetchFinancials]);

  return { incomeTransactions, attendance, loading, error, refresh: fetchFinancials };
}
