-- ============================================================
-- FI ECOSYSTEM — Initial Schema Migration
-- Migration: 001_init_schema
-- Apply via: Supabase Dashboard > SQL Editor > Paste & Run
-- ============================================================
-- Security hardening applied vs. PRD draft:
--   1. auth.role() removed — deprecated, breaks with anon sign-ins.
--      Replaced with TO authenticated + explicit USING predicates.
--   2. is_admin() SECURITY DEFINER: EXECUTE revoked from PUBLIC,
--      granted only to authenticated. Auth guard added.
--   3. WITH CHECK added to all admin INSERT/UPDATE policies.
--   4. FITEO collaborator policies use EXISTS checks to prevent BOLA.
--   5. GRANT statements ensure tables are reachable via Data API.
-- ============================================================

-- ==========================================
-- EXTENSIONS
-- ==========================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- ENUMS
-- ==========================================

DROP TYPE IF EXISTS public.fi_role_type CASCADE;
CREATE TYPE public.fi_role_type AS ENUM ('admin', 'collaborator');

DROP TYPE IF EXISTS public.transaction_type CASCADE;
CREATE TYPE public.transaction_type AS ENUM ('income', 'expense');

DROP TYPE IF EXISTS public.transaction_category CASCADE;
CREATE TYPE public.transaction_category AS ENUM (
  -- Expenses
  'housing',
  'food_grocery',
  'food_delivery',
  'transport_public',
  'transport_app',
  'health',
  'education',
  'leisure',
  'business',
  'investment',
  'unforeseen',
  -- Incomes
  'session',
  'private_lesson',
  'study_group',
  'workshop',
  'performance',
  'freelance_dev'
);

-- ==========================================
-- 1. CORE & AUTHENTICATION
-- ==========================================

DROP TABLE IF EXISTS public.profiles CASCADE;
-- User profile linked 1:1 to auth.users.
-- Stores the application-level role (admin / collaborator).
CREATE TABLE public.profiles (
    id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name   TEXT NOT NULL,
    role        public.fi_role_type NOT NULL DEFAULT 'collaborator',
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

DROP TABLE IF EXISTS public.people CASCADE;
-- Central Person Entity.
-- A single record can represent a student, a client, or both.
-- All cross-app FKs anchor here.
CREATE TABLE public.people (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name   TEXT NOT NULL,
    phone       TEXT,
    email       TEXT,
    notes       TEXT,
    is_student  BOOLEAN DEFAULT FALSE,
    is_client   BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 2. FIORC (ORÇAMENTO PESSOAL)
-- ==========================================

DROP TABLE IF EXISTS public.fiorc_monthly_targets CASCADE;
CREATE TABLE public.fiorc_monthly_targets (
    id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month_year                DATE NOT NULL,          -- First day of target month e.g. 2026-08-01
    commitments               JSONB DEFAULT '[]'::jsonb, -- Array of bills
    credit_card_total         NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total_target              NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    notes                     TEXT,
    created_at                TIMESTAMPTZ DEFAULT NOW()
);

DROP TABLE IF EXISTS public.fiorc_transactions CASCADE;
CREATE TABLE public.fiorc_transactions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id           UUID REFERENCES public.people(id) ON DELETE SET NULL,
    type                public.transaction_type NOT NULL,
    category            public.transaction_category NOT NULL,
    amount              NUMERIC(10, 2) NOT NULL,
    due_date            DATE NOT NULL,
    paid_at             DATE,
    is_projection       BOOLEAN DEFAULT FALSE,
    is_credit_card      BOOLEAN DEFAULT FALSE,
    installment_index   INT DEFAULT 1,
    total_installments  INT DEFAULT 1,
    description         TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

DROP TABLE IF EXISTS public.fiorc_rent_boletos CASCADE;
-- Boleto PDF/image parsed data (rent decomposition).
-- total_payable is a generated column — never insert it directly.
CREATE TABLE public.fiorc_rent_boletos (
    id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month_year               DATE NOT NULL,
    rent_amount              NUMERIC(10, 2) NOT NULL,            -- e.g. 2770.00 (Aluguel)
    condo_measured           NUMERIC(10, 2) NOT NULL,            -- e.g. 600.00 (med. condominio)
    condo_credit_prev_month  NUMERIC(10, 2) NOT NULL,            -- e.g. -25.81 (cred. cond. mes passado)
    total_payable            NUMERIC(10, 2) GENERATED ALWAYS AS (
                                 rent_amount + condo_measured + condo_credit_prev_month
                             ) STORED,
    file_path                TEXT,
    raw_ocr_json             JSONB,
    created_at               TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 3. FIALN (ACOMPANHAMENTO DE ALUNOS)
-- ==========================================

DROP TABLE IF EXISTS public.fialn_student_profiles CASCADE;
CREATE TABLE public.fialn_student_profiles (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id        UUID UNIQUE REFERENCES public.people(id) ON DELETE CASCADE,
    strengths        TEXT,
    dificulties      TEXT,   -- intentional: matches PRD spelling
    growth_pathway   TEXT,
    financial_status TEXT,
    created_at       TIMESTAMPTZ DEFAULT NOW()
);

DROP TABLE IF EXISTS public.fialn_lessons CASCADE;
CREATE TABLE public.fialn_lessons (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id         UUID REFERENCES public.people(id) ON DELETE CASCADE,
    lesson_date       TIMESTAMPTZ NOT NULL,
    duration_hours    NUMERIC(4, 2) NOT NULL,
    location          TEXT NOT NULL,
    topics_covered    TEXT NOT NULL,
    performance_notes TEXT,
    action_items      TEXT,
    created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 4. FITEO (SISTEMA DE AULAS & GRUPOS DE ESTUDO)
-- ==========================================

DROP TABLE IF EXISTS public.fiteo_class_schedules CASCADE;
CREATE TABLE public.fiteo_class_schedules (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_date        TIMESTAMPTZ NOT NULL,
    proposed_theme    TEXT NOT NULL,
    minutes_and_notes TEXT,   -- Editable by collaborators
    is_planned        BOOLEAN DEFAULT FALSE,
    created_at        TIMESTAMPTZ DEFAULT NOW()
);

DROP TABLE IF EXISTS public.fiteo_attendance CASCADE;
CREATE TABLE public.fiteo_attendance (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id        UUID REFERENCES public.fiteo_class_schedules(id) ON DELETE CASCADE,
    person_id       UUID REFERENCES public.people(id) ON DELETE CASCADE,
    present         BOOLEAN DEFAULT TRUE,
    payment_type    TEXT CHECK (payment_type IN ('quarterly_plan', 'single_class', 'private_lesson')),
    transaction_id  UUID REFERENCES public.fiorc_transactions(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 5. FIATT (SESSÕES DE CLIENTES)
-- ==========================================

DROP TABLE IF EXISTS public.fiatt_client_records CASCADE;
CREATE TABLE public.fiatt_client_records (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id            UUID UNIQUE REFERENCES public.people(id) ON DELETE CASCADE,
    medical_history      TEXT,
    physiological_notes  TEXT,
    pathologies          TEXT,
    emergency_contact    TEXT,
    created_at           TIMESTAMPTZ DEFAULT NOW()
);

DROP TABLE IF EXISTS public.fiatt_sessions CASCADE;
CREATE TABLE public.fiatt_sessions (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id         UUID REFERENCES public.people(id) ON DELETE CASCADE,
    session_date      TIMESTAMPTZ NOT NULL,
    incidents         TEXT,
    feedback_received TEXT,
    transaction_id    UUID REFERENCES public.fiorc_transactions(id) ON DELETE SET NULL,
    created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 6. ROW LEVEL SECURITY — ENABLE
-- ==========================================

ALTER TABLE public.profiles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.people                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fiorc_monthly_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fiorc_transactions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fiorc_rent_boletos    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fialn_student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fialn_lessons         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fiteo_class_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fiteo_attendance      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fiatt_client_records  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fiatt_sessions        ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 7. HELPER FUNCTION: private.is_admin()
-- ==========================================
-- SECURITY NOTE:
--   • SECURITY DEFINER is required here so the function can query
--     profiles without triggering its own RLS (chicken-and-egg).
--   • EXECUTE revoked from PUBLIC and re-granted only to authenticated
--     to prevent anon role from calling it.
--   • auth.uid() IS NOT NULL guard ensures unauthenticated sessions
--     always return FALSE.

-- Private schema for internal security functions (hidden from PostgREST Data API)
CREATE SCHEMA IF NOT EXISTS private;

CREATE OR REPLACE FUNCTION private.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;
  
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  );
END;
$$;

-- Lock down execute
REVOKE EXECUTE ON FUNCTION private.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.is_admin() TO postgres, service_role, authenticated;

-- ==========================================
-- 8. RLS POLICIES
-- ==========================================

-- ------------------------------------------
-- profiles — admin self-service only
-- (collaborators can read their own profile)
-- ------------------------------------------

CREATE POLICY "profiles: admin full access"
    ON public.profiles FOR ALL
    TO authenticated
    USING (private.is_admin())
    WITH CHECK (private.is_admin());

CREATE POLICY "profiles: users read own profile"
    ON public.profiles FOR SELECT
    TO authenticated
    USING ((SELECT auth.uid()) = id);

-- ------------------------------------------
-- people — admin only
-- ------------------------------------------

CREATE POLICY "people: admin full access"
    ON public.people FOR ALL
    TO authenticated
    USING (private.is_admin())
    WITH CHECK (private.is_admin());

-- ------------------------------------------
-- fiorc_monthly_targets — admin only
-- ------------------------------------------

CREATE POLICY "fiorc_monthly_targets: admin full access"
    ON public.fiorc_monthly_targets FOR ALL
    TO authenticated
    USING (private.is_admin())
    WITH CHECK (private.is_admin());

-- ------------------------------------------
-- fiorc_transactions — admin only
-- ------------------------------------------

CREATE POLICY "fiorc_transactions: admin full access"
    ON public.fiorc_transactions FOR ALL
    TO authenticated
    USING (private.is_admin())
    WITH CHECK (private.is_admin());

-- ------------------------------------------
-- fiorc_rent_boletos — admin only
-- ------------------------------------------

CREATE POLICY "fiorc_rent_boletos: admin full access"
    ON public.fiorc_rent_boletos FOR ALL
    TO authenticated
    USING (private.is_admin())
    WITH CHECK (private.is_admin());

-- ------------------------------------------
-- fialn_student_profiles — admin only
-- ------------------------------------------

CREATE POLICY "fialn_student_profiles: admin full access"
    ON public.fialn_student_profiles FOR ALL
    TO authenticated
    USING (private.is_admin())
    WITH CHECK (private.is_admin());

-- ------------------------------------------
-- fialn_lessons — admin only
-- ------------------------------------------

CREATE POLICY "fialn_lessons: admin full access"
    ON public.fialn_lessons FOR ALL
    TO authenticated
    USING (private.is_admin())
    WITH CHECK (private.is_admin());

-- ------------------------------------------
-- fiatt_client_records — admin only
-- ------------------------------------------

CREATE POLICY "fiatt_client_records: admin full access"
    ON public.fiatt_client_records FOR ALL
    TO authenticated
    USING (private.is_admin())
    WITH CHECK (private.is_admin());

-- ------------------------------------------
-- fiatt_sessions — admin only
-- ------------------------------------------

CREATE POLICY "fiatt_sessions: admin full access"
    ON public.fiatt_sessions FOR ALL
    TO authenticated
    USING (private.is_admin())
    WITH CHECK (private.is_admin());

-- ------------------------------------------
-- fiteo_class_schedules — admin + collaborator
-- Collaborators: SELECT + UPDATE (minutes_and_notes)
-- Admin: full control
-- ------------------------------------------

CREATE POLICY "fiteo_class_schedules: admin full access"
    ON public.fiteo_class_schedules FOR ALL
    TO authenticated
    USING (private.is_admin())
    WITH CHECK (private.is_admin());

-- Collaborators may read any schedule.
CREATE POLICY "fiteo_class_schedules: collaborators select"
    ON public.fiteo_class_schedules FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = (SELECT auth.uid())
              AND role = 'collaborator'
        )
    );

-- Collaborators may update minutes_and_notes only.
-- Full-row updates are blocked at the application layer (PRD intent).
CREATE POLICY "fiteo_class_schedules: collaborators update minutes"
    ON public.fiteo_class_schedules FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = (SELECT auth.uid())
              AND role = 'collaborator'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = (SELECT auth.uid())
              AND role = 'collaborator'
        )
    );

-- ------------------------------------------
-- fiteo_attendance — admin + collaborator
-- ------------------------------------------

CREATE POLICY "fiteo_attendance: admin full access"
    ON public.fiteo_attendance FOR ALL
    TO authenticated
    USING (private.is_admin())
    WITH CHECK (private.is_admin());

-- Collaborators may read attendance for any class.
CREATE POLICY "fiteo_attendance: collaborators select"
    ON public.fiteo_attendance FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = (SELECT auth.uid())
              AND role = 'collaborator'
        )
    );

-- Collaborators may mark attendance (insert).
CREATE POLICY "fiteo_attendance: collaborators insert"
    ON public.fiteo_attendance FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = (SELECT auth.uid())
              AND role = 'collaborator'
        )
    );

-- ==========================================
-- 9. GRANTS — Expose tables to Data API
-- ==========================================
-- Required so anon/authenticated roles can reach
-- tables via the Supabase REST/GraphQL Data API.
-- RLS policies above control which rows are visible.

GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON
    public.profiles,
    public.people,
    public.fiorc_monthly_targets,
    public.fiorc_transactions,
    public.fiorc_rent_boletos,
    public.fialn_student_profiles,
    public.fialn_lessons,
    public.fiteo_class_schedules,
    public.fiteo_attendance,
    public.fiatt_client_records,
    public.fiatt_sessions
TO authenticated;

-- anon may only read public schedule info (used for public-facing class calendar, if needed).
-- Expand or restrict as required by future PRDs.
GRANT SELECT ON public.fiteo_class_schedules TO anon;
