-- ============================================================
-- FIALN — Public Registration Migration
-- Adds shibari_experience + shibari_goals to student profiles
-- and opens anon INSERT access for the public registration form.
-- ============================================================

-- ------------------------------------------
-- 1. New columns on fialn_student_profiles
-- ------------------------------------------

ALTER TABLE public.fialn_student_profiles
  ADD COLUMN IF NOT EXISTS shibari_experience TEXT,
  ADD COLUMN IF NOT EXISTS shibari_goals      TEXT;

-- ------------------------------------------
-- 2. RLS — Allow anon to INSERT into people
--    (public self-registration only)
--    WITH CHECK restricts to student-only inserts:
--      • is_student must be TRUE
--      • is_client must be FALSE
--      • notes must be NULL  (admin-only field)
-- ------------------------------------------

CREATE POLICY "people: anon public registration insert"
  ON public.people
  FOR INSERT
  TO anon
  WITH CHECK (
    is_student = TRUE
    AND is_client = FALSE
    AND notes IS NULL
  );

-- ------------------------------------------
-- 3. RLS — Allow anon to INSERT into fialn_student_profiles
--    WITH CHECK ensures admin fields stay clean:
--      • financial_status must default to 'em_dia' or NULL
--        (application always sends 'em_dia'; anon cannot set
--         arbitrary statuses via the API)
--    strengths / dificulties / growth_pathway are editable
--    by admin later — left unrestricted here.
-- ------------------------------------------

CREATE POLICY "fialn_student_profiles: anon public registration insert"
  ON public.fialn_student_profiles
  FOR INSERT
  TO anon
  WITH CHECK (
    financial_status IS NULL
    OR financial_status = 'em_dia'
  );

-- ------------------------------------------
-- 4. GRANTS — expose INSERT to anon role
-- ------------------------------------------

GRANT INSERT ON public.people                TO anon;
GRANT INSERT ON public.fialn_student_profiles TO anon;
