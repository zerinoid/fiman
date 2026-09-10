-- ============================================================
-- FIALN / LEGAL — Legal Terms Versioning & Acceptance Audit Trail
-- Migration: 20260910010000_fialn_legal_terms_and_audit.sql
-- ============================================================

-- 1. Create legal_terms table for versioned terms and conditions
CREATE TABLE IF NOT EXISTS public.legal_terms (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  term_type   TEXT NOT NULL,               -- e.g. 'fialn_student_registration'
  version     TEXT NOT NULL,               -- e.g. 'v1.0'
  title       TEXT NOT NULL,               -- e.g. 'Termos de Participação e Orientações de Segurança'
  paragraphs  JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of clauses/paragraphs
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT legal_terms_type_version_key UNIQUE (term_type, version)
);

-- RLS on legal_terms: public read for active terms, admin-only write
ALTER TABLE public.legal_terms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "legal_terms: anon and authenticated can read active terms" ON public.legal_terms;
CREATE POLICY "legal_terms: anon and authenticated can read active terms"
  ON public.legal_terms
  FOR SELECT
  TO anon, authenticated
  USING (is_active = TRUE);

DROP POLICY IF EXISTS "legal_terms: admin full access" ON public.legal_terms;
CREATE POLICY "legal_terms: admin full access"
  ON public.legal_terms
  FOR ALL
  TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

GRANT SELECT ON public.legal_terms TO anon, authenticated;

-- Seed v1.0 of student registration terms if not exists
INSERT INTO public.legal_terms (term_type, version, title, paragraphs, is_active)
VALUES (
  'fialn_student_registration',
  'v1.0',
  'Termo de Ciência & Consentimento de Participação',
  '[
    "Afirmo que todas as informações prestadas neste formulário são verdadeiras e completas.",
    "Entendo que minha experiência prévia em Shibari é informação determinante para que o facilitador possa oferecer a melhor orientação pedagógica possível.",
    "Estou ciente de que, salvo comunicação prévia e explícita do facilitador, devo comparecer às aulas acompanhado(a) de um(a) modelo.",
    "Confirmo que dediquei tempo para ler e estudar os fundamentos básicos de segurança em Shibari antes de iniciar as aulas, compreendendo que a segurança é responsabilidade compartilhada entre praticantes."
  ]'::jsonb,
  TRUE
)
ON CONFLICT (term_type, version) DO NOTHING;

-- 2. Add audit trail columns to public.fialn_student_profiles
ALTER TABLE public.fialn_student_profiles
  ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS terms_version     TEXT,
  ADD COLUMN IF NOT EXISTS terms_client_ip   TEXT,
  ADD COLUMN IF NOT EXISTS terms_ip_hash     TEXT,
  ADD COLUMN IF NOT EXISTS terms_user_agent  TEXT;

-- 3. Update register_student_public RPC to record full audit trail
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

  -- 4. Capture request headers for IP & User-Agent audit
  BEGIN
    v_headers := current_setting('request.headers', true)::jsonb;
  EXCEPTION WHEN OTHERS THEN
    v_headers := '{}'::jsonb;
  END;

  -- Extract client IP (prioritizes Cloudflare cf-connecting-ip, then first IP in x-forwarded-for)
  v_raw_ip := NULLIF(TRIM(COALESCE(
    v_headers->>'cf-connecting-ip',
    split_part(v_headers->>'x-forwarded-for', ',', 1)
  )), '');

  -- Extract User-Agent
  v_user_agent := NULLIF(TRIM(v_headers->>'user-agent'), '');

  -- Generate salted SHA-256 hash of the IP for cryptographic non-repudiation
  IF v_raw_ip IS NOT NULL THEN
    v_ip_hash := encode(sha256(('fi_lgpd_salt_2026_' || v_raw_ip)::bytea), 'hex');
  ELSE
    v_ip_hash := NULL;
  END IF;

  -- Query the latest active terms version from legal_terms table
  SELECT version INTO v_active_terms_version
  FROM public.legal_terms
  WHERE term_type = 'fialn_student_registration' AND is_active = TRUE
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_active_terms_version IS NULL THEN
    v_active_terms_version := 'v1.0';
  END IF;

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

  -- 6. Insert into fialn_student_profiles with full legal audit trail
  INSERT INTO public.fialn_student_profiles (
    person_id,
    financial_status,
    shibari_experience,
    shibari_goals,
    course_preference_id,
    weekday_preference,
    terms_accepted_at,
    terms_version,
    terms_client_ip,
    terms_ip_hash,
    terms_user_agent
  ) VALUES (
    v_person_id,
    'em_dia',
    v_clean_exp,
    v_clean_goals,
    p_course_preference_id,
    v_weekday,
    NOW(),
    v_active_terms_version,
    v_raw_ip,
    v_ip_hash,
    v_user_agent
  );

  RETURN jsonb_build_object(
    'success', TRUE,
    'person_id', v_person_id,
    'terms_version', v_active_terms_version,
    'terms_accepted_at', NOW()
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.register_student_public FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.register_student_public TO anon, authenticated, service_role;
