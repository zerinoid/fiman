-- ============================================================
-- FIALN / STUDENT STATUS — Add status 'pendente' for unconfirmed registrations
-- Migration: 20260910030000_fialn_student_status_pendente.sql
-- ============================================================

-- 1. Add status column to fialn_student_profiles
ALTER TABLE public.fialn_student_profiles
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pendente';

-- Add check constraint for supported statuses
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'fialn_student_profiles_status_check'
  ) THEN
    ALTER TABLE public.fialn_student_profiles
      ADD CONSTRAINT fialn_student_profiles_status_check
      CHECK (status IN ('pendente', 'confirmado', 'ativo', 'inativo'));
  END IF;
END $$;

-- 2. Backfill existing records:
-- Profiles with verified email or active enrollments/lessons become 'ativo' or 'confirmado'
UPDATE public.fialn_student_profiles
SET status = 'ativo'
WHERE person_id IN (
  SELECT DISTINCT person_id FROM public.fialn_lessons
  UNION
  SELECT DISTINCT person_id FROM public.fialn_enrollments WHERE status = 'active'
);

UPDATE public.fialn_student_profiles
SET status = 'confirmado'
WHERE status = 'pendente' AND email_verified_at IS NOT NULL;

-- 3. Update register_student_public to set status = 'pendente'
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
  v_confirmation_token UUID;

  -- Audit & Legal compliance vars
  v_headers JSONB;
  v_raw_ip TEXT;
  v_user_agent TEXT;
  v_ip_hash TEXT;
  v_active_terms_version TEXT;
BEGIN
  -- 1. Sanitize & trim inputs
  v_first_name  := NULLIF(TRIM(p_first_name), '');
  v_last_name   := NULLIF(TRIM(p_last_name), '');
  v_clean_cpf   := NULLIF(TRIM(p_cpf), '');
  v_clean_phone := NULLIF(TRIM(p_phone), '');
  v_clean_email := LOWER(NULLIF(TRIM(p_email), ''));
  v_clean_exp   := NULLIF(TRIM(p_shibari_experience), '');
  v_clean_goals := NULLIF(TRIM(p_shibari_goals), '');

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

  -- 4. Capture request headers for IP & User-Agent audit
  BEGIN
    v_headers := current_setting('request.headers', true)::jsonb;
  EXCEPTION WHEN OTHERS THEN
    v_headers := '{}'::jsonb;
  END;

  v_raw_ip := NULLIF(TRIM(COALESCE(
    v_headers->>'cf-connecting-ip',
    split_part(v_headers->>'x-forwarded-for', ',', 1)
  )), '');

  v_user_agent := NULLIF(TRIM(v_headers->>'user-agent'), '');

  IF v_raw_ip IS NOT NULL THEN
    v_ip_hash := encode(sha256(('fi_lgpd_salt_2026_' || v_raw_ip)::bytea), 'hex');
  ELSE
    v_ip_hash := NULL;
  END IF;

  SELECT version INTO v_active_terms_version
  FROM public.legal_terms
  WHERE term_type = 'fialn_student_registration' AND is_active = TRUE
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_active_terms_version IS NULL THEN
    v_active_terms_version := 'v1.0';
  END IF;

  v_confirmation_token := gen_random_uuid();

  -- 5. Insert into people
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

  -- 6. Insert into fialn_student_profiles with status = 'pendente'
  INSERT INTO public.fialn_student_profiles (
    person_id,
    status,
    financial_status,
    shibari_experience,
    shibari_goals,
    course_preference_id,
    weekday_preference,
    terms_accepted_at,
    terms_version,
    terms_client_ip,
    terms_ip_hash,
    terms_user_agent,
    confirmation_token,
    confirmation_token_expires_at,
    email_verified_at
  ) VALUES (
    v_person_id,
    'pendente',
    'em_dia',
    v_clean_exp,
    v_clean_goals,
    p_course_preference_id,
    v_weekday,
    NOW(),
    v_active_terms_version,
    v_raw_ip,
    v_ip_hash,
    v_user_agent,
    v_confirmation_token,
    NOW() + INTERVAL '72 hours',
    NULL
  );

  RETURN jsonb_build_object(
    'success', TRUE,
    'person_id', v_person_id,
    'confirmation_token', v_confirmation_token,
    'status', 'pendente',
    'terms_version', v_active_terms_version,
    'terms_accepted_at', NOW()
  );
END;
$$;

-- 4. Update confirm_student_registration to set status = 'confirmado'
CREATE OR REPLACE FUNCTION public.confirm_student_registration(p_token UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile_id UUID;
  v_verified_at TIMESTAMPTZ;
  v_expires_at TIMESTAMPTZ;
  v_current_status TEXT;
BEGIN
  IF p_token IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Token inválido.');
  END IF;

  SELECT id, email_verified_at, confirmation_token_expires_at, status
  INTO v_profile_id, v_verified_at, v_expires_at, v_current_status
  FROM public.fialn_student_profiles
  WHERE confirmation_token = p_token;

  IF v_profile_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Inscrição não encontrada para o link informado.');
  END IF;

  IF v_verified_at IS NOT NULL THEN
    RETURN jsonb_build_object(
      'success', true,
      'already_confirmed', true,
      'status', v_current_status,
      'verified_at', v_verified_at
    );
  END IF;

  IF v_expires_at < NOW() THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Este link de confirmação expirou (prazo de 72 horas). Por favor, entre em contato para reenviar.'
    );
  END IF;

  -- Mark email verified and transition status to 'confirmado'
  UPDATE public.fialn_student_profiles
  SET
    email_verified_at = NOW(),
    status = CASE WHEN status = 'pendente' THEN 'confirmado' ELSE status END
  WHERE id = v_profile_id;

  RETURN jsonb_build_object(
    'success', true,
    'already_confirmed', false,
    'status', 'confirmado',
    'verified_at', NOW()
  );
END;
$$;

-- 5. Update get_student_registration_by_token to return status
CREATE OR REPLACE FUNCTION public.get_student_registration_by_token(p_token UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_res JSONB;
BEGIN
  IF p_token IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Token inválido');
  END IF;

  SELECT jsonb_build_object(
    'success', true,
    'full_name', p.full_name,
    'first_name', p.first_name,
    'last_name', p.last_name,
    'email', p.email,
    'phone', p.phone,
    'status', sp.status,
    'course_title', c.title,
    'schedule_day', c.schedule_day,
    'skill_level', c.skill_level,
    'shibari_experience', sp.shibari_experience,
    'shibari_goals', sp.shibari_goals,
    'terms_accepted_at', sp.terms_accepted_at,
    'terms_version', sp.terms_version,
    'email_verified_at', sp.email_verified_at,
    'is_expired', (sp.confirmation_token_expires_at < NOW())
  ) INTO v_res
  FROM public.fialn_student_profiles sp
  JOIN public.people p ON p.id = sp.person_id
  LEFT JOIN public.fiteo_courses c ON c.id = sp.course_preference_id
  WHERE sp.confirmation_token = p_token;

  IF v_res IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Inscrição não encontrada ou token inválido.');
  END IF;

  RETURN v_res;
END;
$$;
