import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export type FiattClientRecord = {
  id: string;
  created_at: string;
  form_type: string;
  person_id: string;
  // Personal Info (Joined from people)
  people: {
    full_name: string;
    email: string;
    phone: string;
  };
  // Detailed fields on fiatt_client_records
  pseudonym?: string;
  age?: number;
  pronouns?: string;
  social_media?: string;
  desired_date: string;
  body_modification_planned: boolean;
  body_modification_details: string;
  identifies_as: string;
  session_intensity: string;
  shibari_experience: string;
  pain_relation: string;
  emotional_limits: string;
  activities_not_desired: string;
  shibari_motivation: string;
  desired_activities_positions: string;
  fetishes_non_conventional: string;
  can_hang_upside_down: boolean;
  // Risks
  risk_blindfold: string;
  risk_hair_pulling: string;
  risk_breath_play: string;
  risk_neck_rope: string;
  risk_rope_gag: string;
  risk_matanawa: string;
  risk_nipple_rope: string;
  risk_toe_rope: string;
  // Medical
  medical_conditions_overview: string;
  has_diabetes: boolean;
  has_blood_pressure_issues: boolean;
  has_asthma: boolean;
  has_epilepsy: boolean;
  has_osteopenia: string;
  has_hemophilia: boolean;
  has_peripheral_neuropathy: boolean;
  has_joint_subluxation: boolean;
  has_prosthesis: boolean;
  has_stroke_history: boolean;
  has_hernia: string;
  movement_restrictions: string;
  neurodivergence: string;
  continuous_medication: string;
  surgery_or_injury: string;
  allergies: string;
  // Results
  safeword: string;
  stop_signal: string;
  authorizes_media: string;
  authorizes_social_media: string;
  hidden_body_parts: string;
  session_expectations: string;
  frequency_expectations: string;
  additional_info: string;
};

export type FiattSession = {
  id: string;
  created_at?: string | null;
  person_id: string;
  client_record_id?: string | null;
  session_date: string;
  transaction_id?: string | null;
  incidents?: string | null;
  admin_report?: string | null;
  feedback_received?: string | null;
};

export function useFiattRecords() {
  const [records, setRecords] = useState<FiattClientRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecords = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('fiatt_client_records')
      .select(`
        *,
        people (
          full_name, email, phone
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching records:', error);
    } else {
      setRecords((data as unknown as FiattClientRecord[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  return { records, loading, refetch: fetchRecords };
}

export function useFiattSessions(personId: string | null) {
  const [sessions, setSessions] = useState<FiattSession[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
    if (!personId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('fiatt_sessions')
      .select('*')
      .eq('person_id', personId)
      .order('session_date', { ascending: false });
    
    if (error) {
      console.error('Error fetching sessions:', error);
    } else {
      setSessions((data as unknown as FiattSession[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSessions();
  }, [personId]);

  return { sessions, loading, refetchSessions: fetchSessions };
}
