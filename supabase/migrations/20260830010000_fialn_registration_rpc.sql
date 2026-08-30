-- ============================================================
-- FIALN — Public Registration via SECURITY DEFINER RPC
-- Migration: 20260830010000_fialn_registration_rpc.sql
-- ============================================================

-- 1. Add course preference column to student profiles if not already present
ALTER TABLE public.fialn_student_profiles
  ADD COLUMN IF NOT EXISTS course_preference_id UUID REFERENCES public.fiteo_courses(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS group_preference_id  UUID REFERENCES public.fialn_groups(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS weekday_preference   INT;

-- 2. Drop direct table INSERT policies for anon if they existed
DROP POLICY IF EXISTS "people: anon public registration insert" ON public.people;
DROP POLICY IF EXISTS "fialn_student_profiles: anon public registration insert" ON public.fialn_student_profiles;

REVOKE INSERT ON public.people FROM anon;
REVOKE INSERT ON public.fialn_student_profiles FROM anon;

-- 3. Allow anon to read active fiteo_courses so the public page can list available courses/schedules
DROP POLICY IF EXISTS "fiteo_courses: anon select" ON public.fiteo_courses;
CREATE POLICY "fiteo_courses: anon select"
  ON public.fiteo_courses
  FOR SELECT
  TO anon
  USING (active = TRUE);

GRANT SELECT ON public.fiteo_courses TO anon;

-- Also allow anon to read fialn_groups as secondary support
DROP POLICY IF EXISTS "fialn_groups: anon select" ON public.fialn_groups;
CREATE POLICY "fialn_groups: anon select"
  ON public.fialn_groups
  FOR SELECT
  TO anon
  USING (true);

GRANT SELECT ON public.fialn_groups TO anon;

-- 4. Create SECURITY DEFINER RPC for public student registration
CREATE OR REPLACE FUNCTION public.register_student_public(
  p_full_name TEXT,
  p_phone TEXT,
  p_email TEXT,
  p_course_preference_id UUID DEFAULT NULL,
  p_shibari_experience TEXT DEFAULT NULL,
  p_shibari_goals TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_clean_name TEXT;
  v_clean_phone TEXT;
  v_clean_email TEXT;
  v_clean_exp TEXT;
  v_clean_goals TEXT;
  v_person_id UUID;
  v_sched_day TEXT;
  v_weekday INT := NULL;
BEGIN
  -- 1. Sanitize & trim inputs
  v_clean_name  := NULLIF(TRIM(p_full_name), '');
  v_clean_phone := NULLIF(TRIM(p_phone), '');
  v_clean_email := LOWER(NULLIF(TRIM(p_email), ''));
  v_clean_exp   := NULLIF(TRIM(p_shibari_experience), '');
  v_clean_goals := NULLIF(TRIM(p_shibari_goals), '');

  -- 2. Validations
  IF v_clean_name IS NULL OR LENGTH(v_clean_name) < 3 THEN
    RAISE EXCEPTION 'Nome completo é obrigatório (mínimo 3 caracteres).' USING ERRCODE = '22023';
  END IF;

  IF v_clean_phone IS NULL OR LENGTH(REGEXP_REPLACE(v_clean_phone, '\D', '', 'g')) < 10 THEN
    RAISE EXCEPTION 'WhatsApp válido é obrigatório (mínimo 10 dígitos com DDD).' USING ERRCODE = '22023';
  END IF;

  IF v_clean_email IS NULL OR v_clean_email !~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'E-mail em formato válido é obrigatório.' USING ERRCODE = '22023';
  END IF;

  -- Limit textarea length for security / payload size
  IF v_clean_exp IS NOT NULL AND LENGTH(v_clean_exp) > 5000 THEN
    v_clean_exp := LEFT(v_clean_exp, 5000);
  END IF;

  IF v_clean_goals IS NOT NULL AND LENGTH(v_clean_goals) > 5000 THEN
    v_clean_goals := LEFT(v_clean_goals, 5000);
  END IF;

  -- 3. Lookup weekday from course if preference was selected
  IF p_course_preference_id IS NOT NULL THEN
    SELECT schedule_day INTO v_sched_day
    FROM public.fiteo_courses
    WHERE id = p_course_preference_id;

    IF v_sched_day ILIKE 'Sunday' OR v_sched_day ILIKE 'Domingo' THEN v_weekday := 0;
    ELSIF v_sched_day ILIKE 'Monday' OR v_sched_day ILIKE 'Segunda%' THEN v_weekday := 1;
    ELSIF v_sched_day ILIKE 'Tuesday' OR v_sched_day ILIKE 'Terça%' THEN v_weekday := 2;
    ELSIF v_sched_day ILIKE 'Wednesday' OR v_sched_day ILIKE 'Quarta%' THEN v_weekday := 3;
    ELSIF v_sched_day ILIKE 'Thursday' OR v_sched_day ILIKE 'Quinta%' THEN v_weekday := 4;
    ELSIF v_sched_day ILIKE 'Friday' OR v_sched_day ILIKE 'Sexta%' THEN v_weekday := 5;
    ELSIF v_sched_day ILIKE 'Saturday' OR v_sched_day ILIKE 'Sábado%' THEN v_weekday := 6;
    END IF;
  END IF;

  -- 4. Insert into people
  INSERT INTO public.people (
    full_name,
    phone,
    email,
    notes,
    is_student,
    is_client
  ) VALUES (
    v_clean_name,
    v_clean_phone,
    v_clean_email,
    NULL,
    TRUE,
    FALSE
  ) RETURNING id INTO v_person_id;

  -- 5. Insert into fialn_student_profiles
  INSERT INTO public.fialn_student_profiles (
    person_id,
    financial_status,
    shibari_experience,
    shibari_goals,
    course_preference_id,
    weekday_preference
  ) VALUES (
    v_person_id,
    'em_dia',
    v_clean_exp,
    v_clean_goals,
    p_course_preference_id,
    v_weekday
  );

  RETURN jsonb_build_object(
    'success', TRUE,
    'person_id', v_person_id
  );
END;
$$;

-- 5. Permissions
REVOKE EXECUTE ON FUNCTION public.register_student_public FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.register_student_public TO anon, authenticated, service_role;
