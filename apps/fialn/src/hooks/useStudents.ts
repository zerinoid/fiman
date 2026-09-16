import { useState, useEffect, useCallback } from 'react';
import type { Person, StudentProfile, StudentViewRecord } from '@fi/types';
import { supabase } from '../lib/supabase';

export interface StudentWithProfile extends Person {
  profile: StudentProfile | null;
}

export interface CreateStudentPayload {
  first_name?: string | null;
  last_name?: string | null;
  cpf?: string | null;
  full_name?: string;
  phone?: string | null;
  email?: string | null;
  notes?: string | null;
  financial_status?: string | null;
}

export interface UpdateStudentPayload {
  first_name?: string | null;
  last_name?: string | null;
  cpf?: string | null;
  full_name?: string;
  phone?: string | null;
  email?: string | null;
  notes?: string | null;
  financial_status?: string | null;
}

export interface UseStudentsReturn {
  students: StudentWithProfile[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  refresh: () => void;
  createStudent: (payload: CreateStudentPayload) => Promise<boolean>;
  updateStudent: (personId: string, payload: UpdateStudentPayload) => Promise<boolean>;
}

export function useStudents(): UseStudentsReturn {
  const [students, setStudents] = useState<StudentWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: rows, error: viewError } = await supabase
        .from('fialn_students_view')
        .select('*')
        .order('full_name');

      if (viewError) throw viewError;

      if (!rows || rows.length === 0) {
        setStudents([]);
        return;
      }

      setStudents(
        (rows as StudentViewRecord[]).map((r) => ({
          id: r.id,
          first_name: r.first_name,
          last_name: r.last_name,
          full_name: r.full_name,
          cpf: r.cpf,
          phone: r.phone,
          email: r.email,
          notes: r.notes,
          is_student: r.is_student,
          is_client: r.is_client,
          created_at: r.created_at,
          updated_at: r.updated_at,
          profile: r.profile_id
            ? {
                id: r.profile_id,
                person_id: r.id,
                strengths: r.strengths,
                dificulties: r.dificulties,
                growth_pathway: r.growth_pathway,
                financial_status: r.financial_status,
                status: r.status,
                shibari_experience: r.shibari_experience,
                shibari_goals: r.shibari_goals,
                course_preference_id: r.course_preference_id,
                group_preference_id: r.group_preference_id,
                weekday_preference: r.weekday_preference,
                terms_accepted_at: r.terms_accepted_at,
                terms_version: r.terms_version,
                terms_client_ip: r.terms_client_ip,
                terms_ip_hash: r.terms_ip_hash,
                terms_user_agent: r.terms_user_agent,
                confirmation_token: r.confirmation_token,
                confirmation_token_expires_at: r.confirmation_token_expires_at,
                email_verified_at: r.email_verified_at,
                created_at: r.profile_created_at ?? r.created_at,
              }
            : null,
        })),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar alunos');
    } finally {
      setLoading(false);
    }
  }, []);

  const createStudent = useCallback(
    async (payload: CreateStudentPayload): Promise<boolean> => {
      setSaving(true);
      setError(null);

      try {
        const firstName = payload.first_name?.trim() || null;
        const lastName = payload.last_name?.trim() || null;
        const computedFullName =
          [firstName, lastName].filter(Boolean).join(' ') || payload.full_name?.trim() || '';

        const { data: person, error: personError } = await supabase
          .from('people')
          .insert({
            first_name: firstName,
            last_name: lastName,
            full_name: computedFullName,
            cpf: payload.cpf?.trim() || null,
            phone: payload.phone?.trim() || null,
            email: payload.email?.trim() || null,
            notes: payload.notes?.trim() || null,
            is_student: true,
            is_client: false,
          })
          .select()
          .single();

        if (personError) throw personError;

        const { error: profileError } = await supabase
          .from('fialn_student_profiles')
          .insert({
            person_id: person.id,
            financial_status: payload.financial_status || 'em_dia',
          });

        if (profileError) throw profileError;

        await fetch();
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao cadastrar aluno');
        return false;
      } finally {
        setSaving(false);
      }
    },
    [fetch],
  );

  const updateStudent = useCallback(
    async (personId: string, payload: UpdateStudentPayload): Promise<boolean> => {
      setSaving(true);
      setError(null);

      try {
        // 1. Update people record
        const firstName = payload.first_name !== undefined ? (payload.first_name?.trim() || null) : undefined;
        const lastName = payload.last_name !== undefined ? (payload.last_name?.trim() || null) : undefined;
        let computedFullName = payload.full_name?.trim();
        if (firstName !== undefined || lastName !== undefined) {
          computedFullName = [firstName, lastName].filter(Boolean).join(' ');
        }

        const updateData: {
          first_name?: string | null;
          last_name?: string | null;
          full_name?: string;
          cpf?: string | null;
          phone?: string | null;
          email?: string | null;
          notes?: string | null;
          updated_at: string;
        } = {
          phone: payload.phone?.trim() || null,
          email: payload.email?.trim() || null,
          notes: payload.notes?.trim() || null,
          updated_at: new Date().toISOString(),
        };

        if (firstName !== undefined) updateData.first_name = firstName;
        if (lastName !== undefined) updateData.last_name = lastName;
        if (computedFullName) updateData.full_name = computedFullName;
        if (payload.cpf !== undefined) updateData.cpf = payload.cpf?.trim() || null;

        const { error: personError } = await supabase
          .from('people')
          .update(updateData)
          .eq('id', personId);

        if (personError) throw personError;

        // 2. Upsert financial status in fialn_student_profiles
        if (payload.financial_status) {
          const { error: profileError } = await supabase
            .from('fialn_student_profiles')
            .upsert(
              {
                person_id: personId,
                financial_status: payload.financial_status,
              },
              { onConflict: 'person_id' }
            );

          if (profileError) throw profileError;
        }

        await fetch();
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao atualizar dados do aluno');
        return false;
      } finally {
        setSaving(false);
      }
    },
    [fetch],
  );

  useEffect(() => { fetch(); }, [fetch]);

  return { students, loading, saving, error, refresh: fetch, createStudent, updateStudent };
}
