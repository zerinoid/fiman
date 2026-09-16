-- ============================================================
-- FIALN / STUDENT REGULARIZATION — Terms Acceptance & Email Verification for Existing Students
-- Migration: 20260916000000_fialn_student_regularization.sql
-- ============================================================

-- 1. RPC for admin to generate a regularization token with 30 days validity
CREATE OR REPLACE FUNCTION public.generate_student_regularization_token(p_person_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_person RECORD;
  v_token UUID;
  v_expires_at TIMESTAMPTZ;
BEGIN
  IF p_person_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'ID do aluno inválido.');
  END IF;

  -- Verify person exists and is a student
  SELECT id, first_name, last_name, full_name, email, phone, cpf
  INTO v_person
  FROM public.people
  WHERE id = p_person_id AND is_student = TRUE;

  IF v_person.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Aluno não encontrado.');
  END IF;

  -- Generate token and 30-day expiration
  v_token := gen_random_uuid();
  v_expires_at := NOW() + INTERVAL '30 days';

  -- Ensure profile exists and update token
  INSERT INTO public.fialn_student_profiles (
    person_id,
    financial_status,
    confirmation_token,
    confirmation_token_expires_at
  ) VALUES (
    p_person_id,
    'em_dia',
    v_token,
    v_expires_at
  )
  ON CONFLICT (person_id) DO UPDATE
  SET
    confirmation_token = v_token,
    confirmation_token_expires_at = v_expires_at;

  RETURN jsonb_build_object(
    'success', true,
    'person_id', v_person.id,
    'token', v_token,
    'expires_at', v_expires_at,
    'first_name', v_person.first_name,
    'last_name', v_person.last_name,
    'full_name', v_person.full_name,
    'email', v_person.email,
    'phone', v_person.phone
  );
END;
$$;

-- 2. RPC to get student data and active legal terms using the regularization token
CREATE OR REPLACE FUNCTION public.get_student_regularization_data(p_token UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile RECORD;
  v_person RECORD;
  v_terms RECORD;
  v_is_expired BOOLEAN;
BEGIN
  IF p_token IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Token inválido.');
  END IF;

  -- Retrieve student profile
  SELECT id, person_id, shibari_experience, shibari_goals,
         terms_accepted_at, terms_version, email_verified_at,
         confirmation_token_expires_at
  INTO v_profile
  FROM public.fialn_student_profiles
  WHERE confirmation_token = p_token;

  IF v_profile.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Link de regularização não encontrado ou inválido.');
  END IF;

  -- Retrieve person details
  SELECT id, first_name, last_name, full_name, email, phone, cpf
  INTO v_person
  FROM public.people
  WHERE id = v_profile.person_id;

  v_is_expired := (v_profile.confirmation_token_expires_at < NOW());

  -- Retrieve active legal terms
  SELECT version, title, paragraphs
  INTO v_terms
  FROM public.legal_terms
  WHERE term_type = 'fialn_student_registration' AND is_active = TRUE
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_terms.version IS NULL THEN
    v_terms.version := 'v1.0';
    v_terms.title := 'Termo de Ciência & Consentimento de Participação';
    v_terms.paragraphs := '[
      "Afirmo que todas as informações prestadas neste formulário são verdadeiras e completas.",
      "Entendo que minha experiência prévia em Shibari é informação determinante para que o facilitador possa oferecer a melhor orientação pedagógica possível.",
      "Estou ciente de que, salvo comunicação prévia e explícita do facilitador, devo comparecer às aulas acompanhado(a) de um(a) modelo.",
      "Confirmo que dediquei tempo para ler e estudar os fundamentos básicos de segurança em Shibari antes de iniciar as aulas, compreendendo que a segurança é responsabilidade compartilhada entre praticantes."
    ]'::jsonb;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'person_id', v_person.id,
    'first_name', v_person.first_name,
    'last_name', v_person.last_name,
    'full_name', v_person.full_name,
    'email', v_person.email,
    'phone', v_person.phone,
    'cpf', v_person.cpf,
    'shibari_experience', v_profile.shibari_experience,
    'shibari_goals', v_profile.shibari_goals,
    'terms_accepted_at', v_profile.terms_accepted_at,
    'terms_version', v_profile.terms_version,
    'email_verified_at', v_profile.email_verified_at,
    'is_expired', v_is_expired,
    'legal_terms', jsonb_build_object(
      'version', v_terms.version,
      'title', v_terms.title,
      'paragraphs', v_terms.paragraphs
    )
  );
END;
$$;

-- 3. RPC to submit regularization (updates people, records audit trail and email verification)
CREATE OR REPLACE FUNCTION public.submit_student_regularization(
  p_token UUID,
  p_first_name TEXT DEFAULT NULL,
  p_last_name TEXT DEFAULT NULL,
  p_email TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT NULL,
  p_cpf TEXT DEFAULT NULL,
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
  v_profile RECORD;
  v_first_name TEXT;
  v_last_name TEXT;
  v_full_name TEXT;
  v_clean_phone TEXT;
  v_clean_email TEXT;
  v_clean_cpf TEXT;
  v_clean_exp TEXT;
  v_clean_goals TEXT;

  -- Audit vars
  v_headers JSONB;
  v_raw_ip TEXT;
  v_user_agent TEXT;
  v_ip_hash TEXT;
  v_active_terms_version TEXT;
BEGIN
  IF p_token IS NULL THEN
    RAISE EXCEPTION 'Token inválido.' USING ERRCODE = '22023';
  END IF;

  -- Verify token
  SELECT id, person_id, confirmation_token_expires_at
  INTO v_profile
  FROM public.fialn_student_profiles
  WHERE confirmation_token = p_token;

  IF v_profile.id IS NULL THEN
    RAISE EXCEPTION 'Link de regularização não encontrado ou inválido.' USING ERRCODE = '22023';
  END IF;

  IF v_profile.confirmation_token_expires_at < NOW() THEN
    RAISE EXCEPTION 'Este link de regularização expirou. Por favor, solicite um novo link.' USING ERRCODE = '22023';
  END IF;

  -- Sanitize inputs
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

  -- Validations
  IF v_first_name IS NULL OR LENGTH(v_first_name) < 2 THEN
    RAISE EXCEPTION 'Nome é obrigatório (mínimo 2 caracteres).' USING ERRCODE = '22023';
  END IF;

  IF v_last_name IS NULL OR LENGTH(v_last_name) < 2 THEN
    RAISE EXCEPTION 'Sobrenome é obrigatório (mínimo 2 caracteres).' USING ERRCODE = '22023';
  END IF;

  IF v_clean_email IS NULL OR v_clean_email !~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'E-mail em formato válido é obrigatório.' USING ERRCODE = '22023';
  END IF;

  IF v_clean_phone IS NULL OR LENGTH(REGEXP_REPLACE(v_clean_phone, '\D', '', 'g')) < 10 THEN
    RAISE EXCEPTION 'WhatsApp válido é obrigatório (mínimo 10 dígitos com DDD).' USING ERRCODE = '22023';
  END IF;

  IF v_clean_cpf IS NOT NULL AND LENGTH(REGEXP_REPLACE(v_clean_cpf, '\D', '', 'g')) <> 11 THEN
    RAISE EXCEPTION 'CPF deve conter 11 dígitos numéricos.' USING ERRCODE = '22023';
  END IF;

  IF v_clean_exp IS NOT NULL AND LENGTH(v_clean_exp) > 5000 THEN
    v_clean_exp := LEFT(v_clean_exp, 5000);
  END IF;

  IF v_clean_goals IS NOT NULL AND LENGTH(v_clean_goals) > 5000 THEN
    v_clean_goals := LEFT(v_clean_goals, 5000);
  END IF;

  -- Capture request headers for IP & User-Agent audit
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

  -- Active terms version
  SELECT version INTO v_active_terms_version
  FROM public.legal_terms
  WHERE term_type = 'fialn_student_registration' AND is_active = TRUE
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_active_terms_version IS NULL THEN
    v_active_terms_version := 'v1.0';
  END IF;

  -- Update people
  UPDATE public.people
  SET
    first_name = v_first_name,
    last_name = v_last_name,
    full_name = v_full_name,
    email = v_clean_email,
    phone = v_clean_phone,
    cpf = COALESCE(v_clean_cpf, cpf),
    updated_at = NOW()
  WHERE id = v_profile.person_id;

  -- Update student profile
  UPDATE public.fialn_student_profiles
  SET
    terms_accepted_at = NOW(),
    terms_version = v_active_terms_version,
    terms_client_ip = v_raw_ip,
    terms_ip_hash = v_ip_hash,
    terms_user_agent = v_user_agent,
    email_verified_at = NOW(),
    shibari_experience = COALESCE(v_clean_exp, shibari_experience),
    shibari_goals = COALESCE(v_clean_goals, shibari_goals)
  WHERE id = v_profile.id;

  RETURN jsonb_build_object(
    'success', true,
    'person_id', v_profile.person_id,
    'first_name', v_first_name,
    'full_name', v_full_name,
    'email', v_clean_email,
    'terms_version', v_active_terms_version,
    'terms_accepted_at', NOW(),
    'email_verified_at', NOW()
  );
END;
$$;

-- Permissions
REVOKE EXECUTE ON FUNCTION public.generate_student_regularization_token(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.generate_student_regularization_token(UUID) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.get_student_regularization_data(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_student_regularization_data(UUID) TO anon, authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.submit_student_regularization(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_student_regularization(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated, service_role;
