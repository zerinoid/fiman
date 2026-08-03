import { useState, useEffect, useCallback } from 'react';
import type { Attendance } from '@fi/types';
import { supabase } from '../lib/supabase';

export interface AttendanceWithPerson extends Attendance {
  person: {
    id: string;
    full_name: string;
  } | null;
}

export interface UseAttendanceReturn {
  attendance: AttendanceWithPerson[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  /** Toggle a person's presence for this class. Creates the row if it doesn't exist, updates if it does. */
  togglePresence: (personId: string, enrollmentId: string | null, currentValue: boolean) => Promise<void>;
  /** Persist updated minutes_and_notes for the class schedule. */
  saveMinutes: (classId: string, text: string) => Promise<boolean>;
  refresh: () => void;
}

/**
 * Manages attendance records for a single class session.
 * Fetches all attendance rows joined with the person entity.
 */
export function useAttendance(classId: string | null): UseAttendanceReturn {
  const [attendance, setAttendance] = useState<AttendanceWithPerson[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAttendance = useCallback(async () => {
    if (!classId) { setAttendance([]); return; }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('fiteo_attendance')
        .select('*, person:people(id, full_name)')
        .eq('class_id', classId);

      if (fetchError) throw fetchError;
      setAttendance((data ?? []) as unknown as AttendanceWithPerson[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar lista de presença');
    } finally {
      setLoading(false);
    }
  }, [classId]);

  useEffect(() => { fetchAttendance(); }, [fetchAttendance]);

  const togglePresence = async (
    personId: string,
    enrollmentId: string | null,
    currentValue: boolean,
  ): Promise<void> => {
    if (!classId) return;

    setSaving(true);
    const newValue = !currentValue;

    // Optimistic update
    setAttendance((prev) =>
      prev.map((row) =>
        row.person_id === personId ? { ...row, present: newValue } : row,
      ),
    );

    try {
      // Check if an attendance row already exists for this person+class
      const existing = attendance.find((a) => a.person_id === personId);

      if (existing) {
        const { error: updateError } = await supabase
          .from('fiteo_attendance')
          .update({ present: newValue })
          .eq('id', existing.id);

        if (updateError) throw updateError;
      } else {
        // First time marking attendance — insert new row
        const { error: insertError } = await supabase
          .from('fiteo_attendance')
          .insert({
            class_id: classId,
            person_id: personId,
            enrollment_id: enrollmentId,
            present: newValue,
          });

        if (insertError) throw insertError;
        // Refresh to get the full row with person join
        await fetchAttendance();
      }
    } catch (err) {
      // Revert optimistic update on failure
      setAttendance((prev) =>
        prev.map((row) =>
          row.person_id === personId ? { ...row, present: currentValue } : row,
        ),
      );
      setError(err instanceof Error ? err.message : 'Erro ao atualizar presença');
    } finally {
      setSaving(false);
    }
  };

  const saveMinutes = async (scheduleClassId: string, text: string): Promise<boolean> => {
    setSaving(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('fiteo_class_schedules')
        .update({ minutes_and_notes: text })
        .eq('id', scheduleClassId);

      if (updateError) throw updateError;
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar ata');
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    attendance,
    loading,
    saving,
    error,
    togglePresence,
    saveMinutes,
    refresh: fetchAttendance,
  };
}
