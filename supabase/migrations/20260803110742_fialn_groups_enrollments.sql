-- 1. ENUM for Enrollment Modalities
DROP TYPE IF EXISTS public.fialn_modality_type CASCADE;
CREATE TYPE public.fialn_modality_type AS ENUM (
    'quarterly_group',
    'private_bundle',
    'single_group',
    'single_private'
);

-- 2. Groups Table (Classrooms)
DROP TABLE IF EXISTS public.fialn_groups CASCADE;
CREATE TABLE public.fialn_groups (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,
    weekday     INT NOT NULL CHECK (weekday BETWEEN 0 AND 6),
    level       TEXT NOT NULL,
    description TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default group classrooms
INSERT INTO public.fialn_groups (name, weekday, level, description) VALUES
  ('Teoria das Cordas', 1, 'Intermediário', 'Grupo de estudos de segunda-feira - nível intermediário'),
  ('Sobre Nós', 3, 'Iniciante', 'Grupo de estudos de quarta-feira - nível iniciante');

-- 3. Enrollments Table
DROP TABLE IF EXISTS public.fialn_enrollments CASCADE;
CREATE TABLE public.fialn_enrollments (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id      UUID NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
    group_id       UUID REFERENCES public.fialn_groups(id) ON DELETE SET NULL,
    modality       public.fialn_modality_type NOT NULL,
    status         TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled', 'completed')),
    start_date     DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date       DATE,
    notes          TEXT,
    created_at     TIMESTAMPTZ DEFAULT NOW(),
    updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Link FITEO attendance directly back to FIALN enrollments
ALTER TABLE public.fiteo_attendance
    ADD COLUMN IF NOT EXISTS enrollment_id UUID REFERENCES public.fialn_enrollments(id) ON DELETE SET NULL;

-- 5. Atomic RPC Function to generate financial projections in fiorc_transactions
CREATE OR REPLACE FUNCTION public.fialn_create_plan_installments(
    p_person_id UUID,
    p_category public.transaction_category,
    p_total_installments INT,
    p_amount_per_installment NUMERIC(10, 2),
    p_first_due_date DATE,
    p_description TEXT
) RETURNS SETOF public.fiorc_transactions AS $$
DECLARE
    v_i INT;
    v_due_date DATE;
BEGIN
    FOR v_i IN 1..p_total_installments LOOP
        v_due_date := (p_first_due_date + ((v_i - 1) || ' months')::INTERVAL)::DATE;
        RETURN QUERY
        INSERT INTO public.fiorc_transactions (
            person_id,
            type,
            category,
            amount,
            due_date,
            is_projection,
            installment_index,
            total_installments,
            description
        ) VALUES (
            p_person_id,
            'income'::public.transaction_type,
            p_category,
            p_amount_per_installment,
            v_due_date,
            TRUE,
            v_i,
            p_total_installments,
            p_description
        )
        RETURNING *;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Enable RLS and grants
ALTER TABLE public.fialn_groups      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fialn_enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "fialn_groups: admin full access"
    ON public.fialn_groups FOR ALL
    TO authenticated
    USING (private.is_admin())
    WITH CHECK (private.is_admin());

CREATE POLICY "fialn_groups: authenticated read"
    ON public.fialn_groups FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "fialn_enrollments: admin full access"
    ON public.fialn_enrollments FOR ALL
    TO authenticated
    USING (private.is_admin())
    WITH CHECK (private.is_admin());

GRANT SELECT, INSERT, UPDATE, DELETE ON public.fialn_groups, public.fialn_enrollments TO authenticated;
GRANT EXECUTE ON FUNCTION public.fialn_create_plan_installments TO authenticated;
;
