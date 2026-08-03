-- ============================================================
-- FITEO PRD 03 — Course Catalog & Schedule Linkage
-- Migration: 20260803120000_fiteo_prd03_courses_schedules
-- ============================================================

-- 1. fiteo_courses — Course track registry
--    Two pre-configured active courses per PRD §2.1
CREATE TABLE IF NOT EXISTS public.fiteo_courses (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title        TEXT NOT NULL,
    schedule_day TEXT NOT NULL,   -- 'Monday' | 'Wednesday'
    skill_level  TEXT NOT NULL,   -- 'Beginner' | 'Intermediate' | 'Advanced'
    active       BOOLEAN DEFAULT TRUE,
    created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default active courses (idempotent via ON CONFLICT DO NOTHING workaround)
INSERT INTO public.fiteo_courses (title, schedule_day, skill_level)
SELECT 'Teoria das Cordas', 'Monday', 'Intermediate'
WHERE NOT EXISTS (
    SELECT 1 FROM public.fiteo_courses WHERE title = 'Teoria das Cordas'
);

INSERT INTO public.fiteo_courses (title, schedule_day, skill_level)
SELECT 'Sobre Nós', 'Wednesday', 'Beginner'
WHERE NOT EXISTS (
    SELECT 1 FROM public.fiteo_courses WHERE title = 'Sobre Nós'
);

-- 2. Link fiteo_class_schedules to a course track
--    Nullable for backward compatibility with any rows created before this migration.
ALTER TABLE public.fiteo_class_schedules
    ADD COLUMN IF NOT EXISTS course_id UUID
        REFERENCES public.fiteo_courses(id) ON DELETE SET NULL;

-- 3. Row Level Security
ALTER TABLE public.fiteo_courses ENABLE ROW LEVEL SECURITY;

-- Admin has full control
CREATE POLICY "fiteo_courses: admin full access"
    ON public.fiteo_courses FOR ALL
    TO authenticated
    USING (private.is_admin())
    WITH CHECK (private.is_admin());

-- Collaborators may read course catalog
CREATE POLICY "fiteo_courses: collaborators select"
    ON public.fiteo_courses FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = (SELECT auth.uid())
              AND role = 'collaborator'
        )
    );

-- 4. Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fiteo_courses TO authenticated;
-- anon may read the course catalog (public-facing class listing, if needed)
GRANT SELECT ON public.fiteo_courses TO anon;
