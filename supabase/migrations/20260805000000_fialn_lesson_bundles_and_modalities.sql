-- Migration to add 'monthly_group' to enum fialn_modality_type and create fialn_lesson_bundles table

ALTER TYPE public.fialn_modality_type ADD VALUE IF NOT EXISTS 'monthly_group';

-- Table for tracking private lesson bundles (Pacotes de Aulas)
CREATE TABLE IF NOT EXISTS public.fialn_lesson_bundles (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id     UUID NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
    name          TEXT NOT NULL,
    total_lessons INT NOT NULL CHECK (total_lessons > 0),
    used_lessons  INT NOT NULL DEFAULT 0 CHECK (used_lessons >= 0),
    price         NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    notes         TEXT,
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Link individual private lessons to a lesson bundle if consumed from one
ALTER TABLE public.fialn_lessons
    ADD COLUMN IF NOT EXISTS bundle_id UUID REFERENCES public.fialn_lesson_bundles(id) ON DELETE SET NULL;

-- Enable RLS and grants for lesson bundles
ALTER TABLE public.fialn_lesson_bundles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "fialn_lesson_bundles: admin full access"
    ON public.fialn_lesson_bundles FOR ALL
    TO authenticated
    USING (private.is_admin())
    WITH CHECK (private.is_admin());

CREATE POLICY "fialn_lesson_bundles: authenticated read"
    ON public.fialn_lesson_bundles FOR SELECT
    TO authenticated
    USING (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.fialn_lesson_bundles TO authenticated;
