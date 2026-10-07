-- Migration para remodelar fiatt_client_records e fiatt_sessions sem alterar public.people

-- Criar um enum para perfis de risco (Section 2)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'fiatt_risk_profile') THEN
        CREATE TYPE fiatt_risk_profile AS ENUM ('limite rígido', 'indiferente', 'desejável');
    END IF;
END
$$;

-- 1. Remodelar fiatt_client_records (Armazena as submissões de formulário)
-- O cliente pode preencher várias vezes, então person_id não pode ser UNIQUE.
ALTER TABLE public.fiatt_client_records 
    DROP CONSTRAINT IF EXISTS fiatt_client_records_person_id_key;

-- Remover colunas antigas não utilizadas
ALTER TABLE public.fiatt_client_records
    DROP COLUMN IF EXISTS medical_history,
    DROP COLUMN IF EXISTS physiological_notes,
    DROP COLUMN IF EXISTS pathologies,
    DROP COLUMN IF EXISTS emergency_contact;

-- Adicionar os campos das fichas (Privada e Fotográfica)
ALTER TABLE public.fiatt_client_records
    -- Tipo da ficha
    ADD COLUMN IF NOT EXISTS form_type TEXT CHECK (form_type IN ('privada', 'fotografica')),
    
    -- Dados pessoais da pessoa (específicos do formulário)
    ADD COLUMN IF NOT EXISTS pseudonym TEXT,
    ADD COLUMN IF NOT EXISTS age INTEGER,
    ADD COLUMN IF NOT EXISTS pronouns TEXT,
    ADD COLUMN IF NOT EXISTS social_media TEXT,

    -- Section 1: Datas e Modificações
    ADD COLUMN IF NOT EXISTS desired_date TEXT,
    ADD COLUMN IF NOT EXISTS body_modification_planned BOOLEAN,
    ADD COLUMN IF NOT EXISTS body_modification_details TEXT,

    -- Section 2: Experiências, Limites e Desejos
    ADD COLUMN IF NOT EXISTS identifies_as TEXT,
    ADD COLUMN IF NOT EXISTS session_intensity TEXT,
    ADD COLUMN IF NOT EXISTS shibari_experience TEXT,
    ADD COLUMN IF NOT EXISTS pain_relation TEXT,
    ADD COLUMN IF NOT EXISTS emotional_limits TEXT,
    ADD COLUMN IF NOT EXISTS activities_not_desired TEXT,
    ADD COLUMN IF NOT EXISTS shibari_motivation TEXT,
    ADD COLUMN IF NOT EXISTS desired_activities_positions TEXT,
    ADD COLUMN IF NOT EXISTS fetishes_non_conventional TEXT,
    ADD COLUMN IF NOT EXISTS can_hang_upside_down BOOLEAN,

    -- Section 2: Perfil de Risco
    ADD COLUMN IF NOT EXISTS risk_blindfold fiatt_risk_profile,
    ADD COLUMN IF NOT EXISTS risk_hair_pulling fiatt_risk_profile,
    ADD COLUMN IF NOT EXISTS risk_breath_play fiatt_risk_profile,
    ADD COLUMN IF NOT EXISTS risk_neck_rope fiatt_risk_profile,
    ADD COLUMN IF NOT EXISTS risk_rope_gag fiatt_risk_profile,
    ADD COLUMN IF NOT EXISTS risk_matanawa fiatt_risk_profile,
    ADD COLUMN IF NOT EXISTS risk_nipple_rope fiatt_risk_profile,
    ADD COLUMN IF NOT EXISTS risk_toe_rope fiatt_risk_profile,

    -- Section 3: Saúde e Segurança
    ADD COLUMN IF NOT EXISTS medical_conditions_overview TEXT,
    ADD COLUMN IF NOT EXISTS has_diabetes BOOLEAN,
    ADD COLUMN IF NOT EXISTS has_blood_pressure_issues BOOLEAN,
    ADD COLUMN IF NOT EXISTS has_asthma BOOLEAN,
    ADD COLUMN IF NOT EXISTS has_epilepsy BOOLEAN,
    ADD COLUMN IF NOT EXISTS has_osteopenia TEXT,
    ADD COLUMN IF NOT EXISTS has_hemophilia BOOLEAN,
    ADD COLUMN IF NOT EXISTS has_peripheral_neuropathy BOOLEAN,
    ADD COLUMN IF NOT EXISTS has_joint_subluxation BOOLEAN,
    ADD COLUMN IF NOT EXISTS has_prosthesis BOOLEAN,
    ADD COLUMN IF NOT EXISTS has_stroke_history BOOLEAN,
    ADD COLUMN IF NOT EXISTS has_hernia TEXT,
    ADD COLUMN IF NOT EXISTS movement_restrictions TEXT,
    ADD COLUMN IF NOT EXISTS neurodivergence TEXT,
    ADD COLUMN IF NOT EXISTS continuous_medication TEXT,
    ADD COLUMN IF NOT EXISTS surgery_or_injury TEXT,
    ADD COLUMN IF NOT EXISTS allergies TEXT,

    -- Section 4: Resultados e Expectativas
    ADD COLUMN IF NOT EXISTS safeword TEXT,
    ADD COLUMN IF NOT EXISTS stop_signal TEXT,
    ADD COLUMN IF NOT EXISTS authorizes_media TEXT,
    ADD COLUMN IF NOT EXISTS authorizes_social_media TEXT,
    ADD COLUMN IF NOT EXISTS hidden_body_parts TEXT,
    ADD COLUMN IF NOT EXISTS session_expectations TEXT,
    ADD COLUMN IF NOT EXISTS frequency_expectations TEXT,
    ADD COLUMN IF NOT EXISTS additional_info TEXT,
    ADD COLUMN IF NOT EXISTS declaration_truth TEXT;


-- 2. Atualizar fiatt_sessions (Registro de Sessões Realizadas)
-- A tabela já possui session_date, incidents, feedback_received e transaction_id
ALTER TABLE public.fiatt_sessions
    -- Link opcional com a submissão de formulário exata que deu origem à sessão
    ADD COLUMN IF NOT EXISTS client_record_id UUID REFERENCES public.fiatt_client_records(id) ON DELETE SET NULL,
    -- Relatório feito por você (admin) após a sessão
    ADD COLUMN IF NOT EXISTS admin_report TEXT;
