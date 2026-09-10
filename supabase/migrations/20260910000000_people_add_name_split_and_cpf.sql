-- ============================================================
-- FIALN / PEOPLE — Split Name (Nome / Sobrenome) + CPF
-- Migration: 20260910000000_people_add_name_split_and_cpf.sql
-- ============================================================

-- 1. Add first_name, last_name, cpf to public.people
ALTER TABLE public.people
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS last_name  TEXT,
  ADD COLUMN IF NOT EXISTS cpf        TEXT;

-- 2. Migrate existing data: split full_name into first_name and last_name
UPDATE public.people
SET
  first_name = COALESCE(first_name, NULLIF(split_part(TRIM(full_name), ' ', 1), '')),
  last_name  = COALESCE(last_name, NULLIF(TRIM(SUBSTR(TRIM(full_name), LENGTH(split_part(TRIM(full_name), ' ', 1)) + 1)), ''))
WHERE (first_name IS NULL OR last_name IS NULL) AND full_name IS NOT NULL;

-- 3. Trigger to keep first_name, last_name, and full_name in sync
CREATE OR REPLACE FUNCTION public.sync_people_names()
RETURNS TRIGGER AS $$
BEGIN
  IF (NEW.first_name IS NOT NULL AND TRIM(NEW.first_name) <> '') OR (NEW.last_name IS NOT NULL AND TRIM(NEW.last_name) <> '') THEN
    NEW.full_name := TRIM(CONCAT(COALESCE(TRIM(NEW.first_name), ''), ' ', COALESCE(TRIM(NEW.last_name), '')));
  ELSIF NEW.full_name IS NOT NULL AND TRIM(NEW.full_name) <> '' AND (NEW.first_name IS NULL OR TRIM(NEW.first_name) = '') THEN
    NEW.first_name := split_part(TRIM(NEW.full_name), ' ', 1);
    NEW.last_name  := NULLIF(TRIM(SUBSTR(TRIM(NEW.full_name), LENGTH(NEW.first_name) + 1)), '');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_people_names ON public.people;
CREATE TRIGGER trg_sync_people_names
  BEFORE INSERT OR UPDATE ON public.people
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_people_names();

-- 4. Update register_student_public RPC to accept first_name, last_name, cpf
DROP FUNCTION IF EXISTS public.register_student_public(TEXT, TEXT, TEXT, UUID, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.register_student_public;

CREATE OR REPLACE FUNCTION public.register_student_public(
  p_first_name TEXT DEFAULT NULL,
  p_last_name TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT NULL,
  p_email TEXT DEFAULT NULL,
  p_cpf TEXT DEFAULT NULL,
  p_course_preference_id UUID DEFAULT NULL,
  p_shibari_experience TEXT DEFAULT NULL,
  p_shibari_goals TEXT DEFAULT NULL,
  p_full_name TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_first_name TEXT;
  v_last_name TEXT;
  v_full_name TEXT;
  v_clean_phone TEXT;
  v_clean_email TEXT;
  v_clean_cpf TEXT;
  v_clean_exp TEXT;
  v_clean_goals TEXT;
  v_person_id UUID;
  v_sched_day TEXT;
  v_weekday INT := NULL;
BEGIN
  -- 1. Sanitize & trim inputs
  v_first_name  := NULLIF(TRIM(p_first_name), '');
  v_last_name   := NULLIF(TRIM(p_last_name), '');
  v_clean_cpf   := NULLIF(TRIM(p_cpf), '');
  v_clean_phone := NULLIF(TRIM(p_phone), '');
  v_clean_email := LOWER(NULLIF(TRIM(p_email), ''));
  v_clean_exp   := NULLIF(TRIM(p_shibari_experience), '');
  v_clean_goals := NULLIF(TRIM(p_shibari_goals), '');

  -- Backward compatibility if p_full_name was passed and first_name was not
  IF v_first_name IS NULL AND p_full_name IS NOT NULL THEN
    v_full_name := NULLIF(TRIM(p_full_name), '');
    v_first_name := split_part(v_full_name, ' ', 1);
    v_last_name  := NULLIF(TRIM(SUBSTR(v_full_name, LENGTH(v_first_name) + 1)), '');
  ELSE
    v_full_name := TRIM(CONCAT(COALESCE(v_first_name, ''), ' ', COALESCE(v_last_name, '')));
  END IF;

  -- 2. Validations
  IF v_first_name IS NULL OR LENGTH(v_first_name) < 2 THEN
    RAISE EXCEPTION 'Nome é obrigatório (mínimo 2 caracteres).' USING ERRCODE = '22023';
  END IF;

  IF v_last_name IS NULL OR LENGTH(v_last_name) < 2 THEN
    RAISE EXCEPTION 'Sobrenome é obrigatório (mínimo 2 caracteres).' USING ERRCODE = '22023';
  END IF;

  IF v_clean_cpf IS NOT NULL AND LENGTH(REGEXP_REPLACE(v_clean_cpf, '\D', '', 'g')) <> 11 THEN
    RAISE EXCEPTION 'CPF deve conter 11 dígitos numéricos.' USING ERRCODE = '22023';
  END IF;

  IF v_clean_phone IS NULL OR LENGTH(REGEXP_REPLACE(v_clean_phone, '\D', '', 'g')) < 10 THEN
    RAISE EXCEPTION 'WhatsApp válido é obrigatório (mínimo 10 dígitos com DDD).' USING ERRCODE = '22023';
  END IF;

  IF v_clean_email IS NULL OR v_clean_email !~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'E-mail em formato válido é obrigatório.' USING ERRCODE = '22023';
  END IF;

  -- Limit textarea length
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
    first_name,
    last_name,
    full_name,
    cpf,
    phone,
    email,
    notes,
    is_student,
    is_client
  ) VALUES (
    v_first_name,
    v_last_name,
    v_full_name,
    v_clean_cpf,
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
