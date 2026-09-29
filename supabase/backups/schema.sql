


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "private";


ALTER SCHEMA "private" OWNER TO "postgres";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."commitment_type" AS ENUM (
    'fixed',
    'optional',
    'occasional'
);


ALTER TYPE "public"."commitment_type" OWNER TO "postgres";


CREATE TYPE "public"."fi_role_type" AS ENUM (
    'admin',
    'collaborator',
    'associate',
    'clerk'
);


ALTER TYPE "public"."fi_role_type" OWNER TO "postgres";


CREATE TYPE "public"."fialn_modality_type" AS ENUM (
    'quarterly_group',
    'private_bundle',
    'single_group',
    'single_private',
    'monthly_group'
);


ALTER TYPE "public"."fialn_modality_type" OWNER TO "postgres";


CREATE TYPE "public"."split_rule_type" AS ENUM (
    'none',
    'equal_roommates',
    'weighted_rent',
    'mobile_shared'
);


ALTER TYPE "public"."split_rule_type" OWNER TO "postgres";


CREATE TYPE "public"."transaction_category" AS ENUM (
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
    'pet',
    'session',
    'private_lesson',
    'study_group',
    'workshop',
    'performance',
    'freelance_dev'
);


ALTER TYPE "public"."transaction_category" OWNER TO "postgres";


CREATE TYPE "public"."transaction_type" AS ENUM (
    'income',
    'expense'
);


ALTER TYPE "public"."transaction_type" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "private"."can_edit_fiteo_ata"() RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('admin', 'associate', 'clerk')
  );
END;
$$;


ALTER FUNCTION "private"."can_edit_fiteo_ata"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "private"."is_admin"() RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
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


ALTER FUNCTION "private"."is_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "private"."is_associate_or_admin"() RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('admin', 'associate')
  );
END;
$$;


ALTER FUNCTION "private"."is_associate_or_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."confirm_student_registration"("p_token" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
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

  SELECT id, email_verified_at, confirmation_token_expires_at
  INTO v_profile_id, v_verified_at, v_expires_at
  FROM public.fialn_student_profiles
  WHERE confirmation_token = p_token;

  IF v_profile_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Inscrição não encontrada para o link informado.');
  END IF;

  IF v_verified_at IS NOT NULL THEN
    SELECT status INTO v_current_status
    FROM public.fialn_students_view
    WHERE profile_id = v_profile_id;

    RETURN jsonb_build_object(
      'success', true,
      'already_confirmed', true,
      'status', COALESCE(v_current_status, 'inativo'),
      'verified_at', v_verified_at
    );
  END IF;

  IF v_expires_at < NOW() THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Este link de confirmação expirou (prazo de 72 horas). Por favor, entre em contato para reenviar.'
    );
  END IF;

  -- Mark email verified
  UPDATE public.fialn_student_profiles
  SET
    email_verified_at = NOW()
  WHERE id = v_profile_id;

  SELECT status INTO v_current_status
  FROM public.fialn_students_view
  WHERE profile_id = v_profile_id;

  RETURN jsonb_build_object(
    'success', true,
    'already_confirmed', false,
    'status', COALESCE(v_current_status, 'inativo'),
    'verified_at', NOW()
  );
END;
$$;


ALTER FUNCTION "public"."confirm_student_registration"("p_token" "uuid") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."fiorc_transactions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "person_id" "uuid",
    "type" "public"."transaction_type" NOT NULL,
    "category" "public"."transaction_category" NOT NULL,
    "amount" numeric(10,2) NOT NULL,
    "due_date" "date" NOT NULL,
    "paid_at" "date",
    "is_projection" boolean DEFAULT false,
    "is_credit_card" boolean DEFAULT false,
    "installment_index" integer DEFAULT 1,
    "total_installments" integer DEFAULT 1,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "parent_id" "uuid",
    "transaction_datetime" timestamp with time zone,
    "tags" "text"[] DEFAULT '{}'::"text"[],
    "received_by" "text",
    "enrollment_id" "uuid",
    CONSTRAINT "fiorc_transactions_received_by_check" CHECK (("received_by" = ANY (ARRAY['foraisso'::"text", 'shibarihouse'::"text"])))
);


ALTER TABLE "public"."fiorc_transactions" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fialn_create_enrollment_financials"("p_person_id" "uuid", "p_enrollment_id" "uuid", "p_category" "public"."transaction_category", "p_payment_method" "text", "p_received_by" "text", "p_total_installments" integer, "p_amount_per_installment" numeric, "p_first_due_date" "date", "p_description" "text", "p_is_partner" boolean DEFAULT false) RETURNS SETOF "public"."fiorc_transactions"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_i INT;
    v_due_date DATE;
    v_target_due_date DATE;
    v_split_amount NUMERIC(10, 2);
    v_type public.transaction_type;
    v_is_proj BOOLEAN;
    v_cat public.transaction_category;
    v_desc TEXT;
    v_installments INT;
BEGIN
    -- If it's a partner/scholarship, do not generate any financial transactions
    IF p_is_partner IS TRUE THEN
        RETURN;
    END IF;

    v_installments := COALESCE(p_total_installments, 1);
    IF p_payment_method = 'pix' THEN
        v_installments := 1;
    END IF;

    FOR v_i IN 1..v_installments LOOP
        v_due_date := (p_first_due_date + ((v_i - 1) || ' months')::INTERVAL)::DATE;
        
        IF p_received_by = 'shibarihouse' THEN
            -- Shibari House received the money: user has a projection to receive 75%
            v_split_amount := ROUND(p_amount_per_installment * 0.75, 2);
            v_type := 'income'::public.transaction_type;
            v_is_proj := TRUE;
            v_target_due_date := v_due_date;
            v_cat := p_category;
            v_desc := '[Shibari House 75%] ' || COALESCE(p_description, '');
        ELSE
            -- Foraisso received the money: user owes a 25% debt/repasse to Shibari House due on day 5 of next month
            v_split_amount := ROUND(p_amount_per_installment * 0.25, 2);
            v_type := 'expense'::public.transaction_type;
            v_is_proj := FALSE;
            v_target_due_date := ((date_trunc('month', v_due_date) + INTERVAL '1 month')::DATE + INTERVAL '4 days')::DATE;
            v_cat := 'business'::public.transaction_category;
            v_desc := '[Shibari House Repasse 25%] ' || COALESCE(p_description, '');
        END IF;

        RETURN QUERY
        INSERT INTO public.fiorc_transactions (
            person_id,
            enrollment_id,
            type,
            category,
            amount,
            due_date,
            is_projection,
            installment_index,
            total_installments,
            received_by,
            description
        ) VALUES (
            p_person_id,
            p_enrollment_id,
            v_type,
            v_cat,
            v_split_amount,
            v_target_due_date,
            v_is_proj,
            v_i,
            v_installments,
            p_received_by,
            v_desc
        )
        RETURNING *;
    END LOOP;
END;
$$;


ALTER FUNCTION "public"."fialn_create_enrollment_financials"("p_person_id" "uuid", "p_enrollment_id" "uuid", "p_category" "public"."transaction_category", "p_payment_method" "text", "p_received_by" "text", "p_total_installments" integer, "p_amount_per_installment" numeric, "p_first_due_date" "date", "p_description" "text", "p_is_partner" boolean) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fialn_create_plan_installments"("p_person_id" "uuid", "p_category" "public"."transaction_category", "p_total_installments" integer, "p_amount_per_installment" numeric, "p_first_due_date" "date", "p_description" "text") RETURNS SETOF "public"."fiorc_transactions"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."fialn_create_plan_installments"("p_person_id" "uuid", "p_category" "public"."transaction_category", "p_total_installments" integer, "p_amount_per_installment" numeric, "p_first_due_date" "date", "p_description" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fiorc_confirm_shibari_projection"("p_transaction_id" "uuid") RETURNS "public"."fiorc_transactions"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_tx public.fiorc_transactions;
    v_person_id UUID;
    v_remaining_projections INT;
BEGIN
    -- 1. Mark transaction as confirmed / paid
    UPDATE public.fiorc_transactions
    SET 
        paid_at = CURRENT_DATE,
        is_projection = FALSE
    WHERE id = p_transaction_id
    RETURNING * INTO v_tx;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Transação % não encontrada', p_transaction_id;
    END IF;

    -- 2. If tied to a person, check if student has remaining overdue/pending projections
    v_person_id := v_tx.person_id;
    IF v_person_id IS NOT NULL THEN
        SELECT COUNT(*)
        INTO v_remaining_projections
        FROM public.fiorc_transactions
        WHERE person_id = v_person_id
          AND is_projection = TRUE
          AND due_date < CURRENT_DATE;

        -- If no overdue projections, update financial status to em_dia in FIALN
        IF v_remaining_projections = 0 THEN
            UPDATE public.fialn_student_profiles
            SET financial_status = 'em_dia'
            WHERE person_id = v_person_id;
        END IF;
    END IF;

    RETURN v_tx;
END;
$$;


ALTER FUNCTION "public"."fiorc_confirm_shibari_projection"("p_transaction_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fiorc_get_distinct_tags"() RETURNS SETOF "text"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  SELECT DISTINCT unnest(tags) AS tag
  FROM public.fiorc_transactions
  WHERE tags IS NOT NULL AND array_length(tags, 1) > 0
  ORDER BY 1;
$$;


ALTER FUNCTION "public"."fiorc_get_distinct_tags"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fiorc_settle_fialn_repasses"("p_transaction_ids" "uuid"[] DEFAULT NULL::"uuid"[]) RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_total_debt        NUMERIC := 0;
    v_total_receivable  NUMERIC := 0;
    v_net               NUMERIC := 0;
    v_settled_count     INT := 0;
    v_fiorc_tx_id       UUID := NULL;
    v_batch_id          UUID := gen_random_uuid();
    v_now               TIMESTAMPTZ := NOW();
    v_result            JSON;
BEGIN
    -- Somente admin pode executar esta operação
    IF NOT private.is_admin() THEN
        RAISE EXCEPTION 'Unauthorized: apenas admin pode quitar repasses FIALN';
    END IF;

    -- Somatória de dívidas e recebíveis pendentes (filtrando pelos IDs se informados)
    SELECT
        COALESCE(SUM(CASE WHEN split_type = 'debt'       THEN split_amount ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN split_type = 'receivable' THEN split_amount ELSE 0 END), 0),
        COUNT(*)
    INTO v_total_debt, v_total_receivable, v_settled_count
    FROM public.fialn_student_transactions
    WHERE fiorc_status = 'pending'
      AND (p_transaction_ids IS NULL OR array_length(p_transaction_ids, 1) IS NULL OR id = ANY(p_transaction_ids));

    v_net := v_total_receivable - v_total_debt;

    -- Se não há nada pendente selecionado, retornar sem erro
    IF v_settled_count = 0 THEN
        RETURN json_build_object(
            'settled', FALSE,
            'message', 'Nenhum repasse pendente selecionado',
            'total_debt', 0,
            'total_receivable', 0,
            'net', 0
        );
    END IF;

    -- Registrar transação de acerto em fiorc_transactions (se houver saldo != 0)
    IF v_net > 0 THEN
        -- Saldo positivo: Foraisso tem a receber → income
        INSERT INTO public.fiorc_transactions (
            type, category, amount, due_date, is_projection, description
        ) VALUES (
            'income',
            'business',
            v_net,
            CURRENT_DATE,
            FALSE,
            '[QUITAR FIALN] Recebimento líquido — repasses ShibariHouse → Foraisso'
        ) RETURNING id INTO v_fiorc_tx_id;
    ELSIF v_net < 0 THEN
        -- Saldo negativo: Foraisso deve pagar → expense
        INSERT INTO public.fiorc_transactions (
            type, category, amount, due_date, is_projection, description
        ) VALUES (
            'expense',
            'business',
            ABS(v_net),
            CURRENT_DATE,
            FALSE,
            '[QUITAR FIALN] Pagamento líquido — repasse Foraisso → ShibariHouse'
        ) RETURNING id INTO v_fiorc_tx_id;
    END IF;

    -- Utilizar o ID da transação do FIORC como batch_id, ou o UUID gerado caso net = 0
    IF v_fiorc_tx_id IS NOT NULL THEN
        v_batch_id := v_fiorc_tx_id;
    END IF;

    -- Marcar as pendências selecionadas como settled gravando settled_at e settlement_batch_id
    UPDATE public.fialn_student_transactions
    SET fiorc_status        = 'settled',
        settled_at          = v_now,
        settlement_batch_id = v_batch_id,
        updated_at          = v_now
    WHERE fiorc_status = 'pending'
      AND (p_transaction_ids IS NULL OR array_length(p_transaction_ids, 1) IS NULL OR id = ANY(p_transaction_ids));

    v_result := json_build_object(
        'settled', TRUE,
        'settled_count', v_settled_count,
        'total_debt', v_total_debt,
        'total_receivable', v_total_receivable,
        'net', v_net,
        'settlement_batch_id', v_batch_id,
        'settled_at', v_now
    );

    RETURN v_result;
END;
$$;


ALTER FUNCTION "public"."fiorc_settle_fialn_repasses"("p_transaction_ids" "uuid"[]) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_student_regularization_token"("p_person_id" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
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


ALTER FUNCTION "public"."generate_student_regularization_token"("p_person_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_student_registration_by_token"("p_token" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_res JSONB;
BEGIN
  IF p_token IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Token inválido');
  END IF;

  SELECT jsonb_build_object(
    'success', true,
    'full_name', sv.full_name,
    'first_name', sv.first_name,
    'last_name', sv.last_name,
    'email', sv.email,
    'phone', sv.phone,
    'status', sv.status,
    'course_title', c.title,
    'schedule_day', c.schedule_day,
    'skill_level', c.skill_level,
    'shibari_experience', sv.shibari_experience,
    'shibari_goals', sv.shibari_goals,
    'terms_accepted_at', sv.terms_accepted_at,
    'terms_version', sv.terms_version,
    'email_verified_at', sv.email_verified_at,
    'is_expired', (sv.confirmation_token_expires_at < NOW())
  ) INTO v_res
  FROM public.fialn_students_view sv
  LEFT JOIN public.fiteo_courses c ON c.id = sv.course_preference_id
  WHERE sv.confirmation_token = p_token;

  IF v_res IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Inscrição não encontrada ou token inválido.');
  END IF;

  RETURN v_res;
END;
$$;


ALTER FUNCTION "public"."get_student_registration_by_token"("p_token" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_student_regularization_data"("p_token" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
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


ALTER FUNCTION "public"."get_student_regularization_data"("p_token" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."register_student_public"("p_first_name" "text" DEFAULT NULL::"text", "p_last_name" "text" DEFAULT NULL::"text", "p_phone" "text" DEFAULT NULL::"text", "p_email" "text" DEFAULT NULL::"text", "p_cpf" "text" DEFAULT NULL::"text", "p_course_preference_id" "uuid" DEFAULT NULL::"uuid", "p_shibari_experience" "text" DEFAULT NULL::"text", "p_shibari_goals" "text" DEFAULT NULL::"text", "p_full_name" "text" DEFAULT NULL::"text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $_$
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

  -- 6. Insert into fialn_student_profiles without physical status column
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
    terms_user_agent,
    confirmation_token,
    confirmation_token_expires_at,
    email_verified_at
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
$_$;


ALTER FUNCTION "public"."register_student_public"("p_first_name" "text", "p_last_name" "text", "p_phone" "text", "p_email" "text", "p_cpf" "text", "p_course_preference_id" "uuid", "p_shibari_experience" "text", "p_shibari_goals" "text", "p_full_name" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."submit_student_regularization"("p_token" "uuid", "p_first_name" "text" DEFAULT NULL::"text", "p_last_name" "text" DEFAULT NULL::"text", "p_email" "text" DEFAULT NULL::"text", "p_phone" "text" DEFAULT NULL::"text", "p_cpf" "text" DEFAULT NULL::"text", "p_shibari_experience" "text" DEFAULT NULL::"text", "p_shibari_goals" "text" DEFAULT NULL::"text", "p_full_name" "text" DEFAULT NULL::"text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $_$
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
$_$;


ALTER FUNCTION "public"."submit_student_regularization"("p_token" "uuid", "p_first_name" "text", "p_last_name" "text", "p_email" "text", "p_phone" "text", "p_cpf" "text", "p_shibari_experience" "text", "p_shibari_goals" "text", "p_full_name" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."sync_people_names"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF (NEW.first_name IS NOT NULL AND TRIM(NEW.first_name) <> '') OR (NEW.last_name IS NOT NULL AND TRIM(NEW.last_name) <> '') THEN
    NEW.full_name := TRIM(CONCAT(COALESCE(TRIM(NEW.first_name), ''), ' ', COALESCE(TRIM(NEW.last_name), '')));
  ELSIF NEW.full_name IS NOT NULL AND TRIM(NEW.full_name) <> '' AND (NEW.first_name IS NULL OR TRIM(NEW.first_name) = '') THEN
    NEW.first_name := split_part(TRIM(NEW.full_name), ' ', 1);
    NEW.last_name  := NULLIF(TRIM(SUBSTR(TRIM(NEW.full_name), LENGTH(NEW.first_name) + 1)), '');
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."sync_people_names"() OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."fialn_enrollments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "person_id" "uuid" NOT NULL,
    "group_id" "uuid",
    "modality" "public"."fialn_modality_type" NOT NULL,
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "start_date" "date" DEFAULT CURRENT_DATE NOT NULL,
    "end_date" "date",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "is_partner" boolean DEFAULT false,
    "partner_details" "text",
    "received_by" "text",
    "payment_method" "text",
    CONSTRAINT "fialn_enrollments_payment_method_check" CHECK (("payment_method" = ANY (ARRAY['pix'::"text", 'credit'::"text"]))),
    CONSTRAINT "fialn_enrollments_received_by_check" CHECK (("received_by" = ANY (ARRAY['foraisso'::"text", 'shibarihouse'::"text"]))),
    CONSTRAINT "fialn_enrollments_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'paused'::"text", 'cancelled'::"text", 'completed'::"text"])))
);


ALTER TABLE "public"."fialn_enrollments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."fialn_groups" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "weekday" integer NOT NULL,
    "level" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "fialn_groups_weekday_check" CHECK ((("weekday" >= 0) AND ("weekday" <= 6)))
);


ALTER TABLE "public"."fialn_groups" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."fialn_lesson_bundles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "person_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "total_lessons" integer NOT NULL,
    "used_lessons" integer DEFAULT 0 NOT NULL,
    "price" numeric(10,2) DEFAULT 0.00 NOT NULL,
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "fialn_lesson_bundles_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'completed'::"text", 'cancelled'::"text"]))),
    CONSTRAINT "fialn_lesson_bundles_total_lessons_check" CHECK (("total_lessons" > 0)),
    CONSTRAINT "fialn_lesson_bundles_used_lessons_check" CHECK (("used_lessons" >= 0))
);


ALTER TABLE "public"."fialn_lesson_bundles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."fialn_lessons" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "person_id" "uuid",
    "lesson_date" timestamp with time zone NOT NULL,
    "duration_hours" numeric(4,2) NOT NULL,
    "location" "text" NOT NULL,
    "topics_covered" "text" NOT NULL,
    "performance_notes" "text",
    "action_items" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "bundle_id" "uuid"
);


ALTER TABLE "public"."fialn_lessons" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."fialn_student_profiles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "person_id" "uuid",
    "strengths" "text",
    "dificulties" "text",
    "growth_pathway" "text",
    "financial_status" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "shibari_experience" "text",
    "shibari_goals" "text",
    "course_preference_id" "uuid",
    "group_preference_id" "uuid",
    "weekday_preference" integer,
    "terms_accepted_at" timestamp with time zone,
    "terms_version" "text",
    "terms_client_ip" "text",
    "terms_ip_hash" "text",
    "terms_user_agent" "text",
    "confirmation_token" "uuid" DEFAULT "gen_random_uuid"(),
    "confirmation_token_expires_at" timestamp with time zone DEFAULT ("now"() + '72:00:00'::interval),
    "email_verified_at" timestamp with time zone
);


ALTER TABLE "public"."fialn_student_profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."fialn_student_transactions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "person_id" "uuid" NOT NULL,
    "enrollment_id" "uuid",
    "bundle_id" "uuid",
    "transaction_date" "date" NOT NULL,
    "description" "text" NOT NULL,
    "received_by" "text" NOT NULL,
    "amount" numeric(10,2) NOT NULL,
    "payment_method" "text" NOT NULL,
    "due_date" "date",
    "split_percent" numeric(5,2) NOT NULL,
    "split_amount" numeric(10,2) NOT NULL,
    "split_type" "text" NOT NULL,
    "fiorc_projection_due_date" "date" NOT NULL,
    "fiorc_status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "installment_index" integer DEFAULT 1 NOT NULL,
    "total_installments" integer DEFAULT 1 NOT NULL,
    "notes" "text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "settled_at" timestamp with time zone,
    "settlement_batch_id" "uuid",
    "codigo" "text" NOT NULL,
    CONSTRAINT "fialn_student_transactions_codigo_check" CHECK (("codigo" = ANY (ARRAY['SOBME'::"text", 'SOBTR'::"text", 'SOBAV'::"text", 'TEOME'::"text", 'TEOTR'::"text", 'TEOAV'::"text"]))),
    CONSTRAINT "fialn_student_transactions_fiorc_status_check" CHECK (("fiorc_status" = ANY (ARRAY['pending'::"text", 'settled'::"text"]))),
    CONSTRAINT "fialn_student_transactions_payment_method_check" CHECK (("payment_method" = ANY (ARRAY['pix'::"text", 'credit'::"text"]))),
    CONSTRAINT "fialn_student_transactions_received_by_check" CHECK (("received_by" = ANY (ARRAY['foraisso'::"text", 'shibarihouse'::"text"]))),
    CONSTRAINT "fialn_student_transactions_split_type_check" CHECK (("split_type" = ANY (ARRAY['receivable'::"text", 'debt'::"text"])))
);


ALTER TABLE "public"."fialn_student_transactions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."people" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "full_name" "text" NOT NULL,
    "phone" "text",
    "email" "text",
    "notes" "text",
    "is_student" boolean DEFAULT false,
    "is_client" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "first_name" "text",
    "last_name" "text",
    "cpf" "text"
);


ALTER TABLE "public"."people" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."fialn_students_view" WITH ("security_invoker"='true') AS
 SELECT "p"."id",
    "p"."first_name",
    "p"."last_name",
    "p"."full_name",
    "p"."cpf",
    "p"."phone",
    "p"."email",
    "p"."notes",
    "p"."is_student",
    "p"."is_client",
    "p"."created_at",
    "p"."updated_at",
    "sp"."id" AS "profile_id",
    "sp"."financial_status",
    "sp"."shibari_experience",
    "sp"."shibari_goals",
    "sp"."course_preference_id",
    "sp"."group_preference_id",
    "sp"."weekday_preference",
    "sp"."terms_accepted_at",
    "sp"."terms_version",
    "sp"."terms_client_ip",
    "sp"."terms_ip_hash",
    "sp"."terms_user_agent",
    "sp"."confirmation_token",
    "sp"."confirmation_token_expires_at",
    "sp"."email_verified_at",
    "sp"."strengths",
    "sp"."dificulties",
    "sp"."growth_pathway",
    "sp"."created_at" AS "profile_created_at",
        CASE
            WHEN (("sp"."email_verified_at" IS NULL) OR ("sp"."terms_accepted_at" IS NULL)) THEN 'pendente'::"text"
            WHEN (EXISTS ( SELECT 1
               FROM "public"."fialn_enrollments" "e"
              WHERE (("e"."person_id" = "p"."id") AND ("e"."status" = 'active'::"text") AND (("e"."end_date" IS NULL) OR ("e"."end_date" >= CURRENT_DATE))))) THEN 'ativo'::"text"
            ELSE 'inativo'::"text"
        END AS "status"
   FROM ("public"."people" "p"
     LEFT JOIN "public"."fialn_student_profiles" "sp" ON (("sp"."person_id" = "p"."id")))
  WHERE ("p"."is_student" = true);


ALTER VIEW "public"."fialn_students_view" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."fiatt_client_records" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "person_id" "uuid",
    "medical_history" "text",
    "physiological_notes" "text",
    "pathologies" "text",
    "emergency_contact" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."fiatt_client_records" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."fiatt_sessions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "person_id" "uuid",
    "session_date" timestamp with time zone NOT NULL,
    "incidents" "text",
    "feedback_received" "text",
    "transaction_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."fiatt_sessions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."fiorc_commitments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "name" "text" NOT NULL,
    "category_type" "public"."commitment_type" DEFAULT 'occasional'::"public"."commitment_type" NOT NULL,
    "split_rule" "public"."split_rule_type" DEFAULT 'none'::"public"."split_rule_type" NOT NULL,
    "default_amount" numeric(10,2) DEFAULT 0.00 NOT NULL,
    "due_day" integer DEFAULT 1 NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "fiorc_commitments_due_day_check" CHECK ((("due_day" >= 1) AND ("due_day" <= 31)))
);


ALTER TABLE "public"."fiorc_commitments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."fiorc_house_settings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "active_roommates_count" integer DEFAULT 3 NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "fiorc_house_settings_active_roommates_count_check" CHECK (("active_roommates_count" = ANY (ARRAY[2, 3])))
);


ALTER TABLE "public"."fiorc_house_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."fiorc_monthly_commitments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "commitment_id" "uuid",
    "month_year" "date" NOT NULL,
    "total_amount" numeric(10,2) NOT NULL,
    "user_calculated_share" numeric(10,2) NOT NULL,
    "is_paid" boolean DEFAULT false NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "transaction_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."fiorc_monthly_commitments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."fiorc_monthly_targets" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "month_year" "date" NOT NULL,
    "commitments" "jsonb" DEFAULT '[]'::"jsonb",
    "credit_card_total" numeric(10,2) DEFAULT 0.00 NOT NULL,
    "total_target" numeric(10,2) DEFAULT 0.00 NOT NULL,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."fiorc_monthly_targets" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."fiorc_rent_boletos" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "month_year" "date" NOT NULL,
    "rent_amount" numeric(10,2) NOT NULL,
    "condo_measured" numeric(10,2) NOT NULL,
    "condo_credit_prev_month" numeric(10,2) NOT NULL,
    "total_payable" numeric(10,2) GENERATED ALWAYS AS ((("rent_amount" + "condo_measured") + "condo_credit_prev_month")) STORED,
    "file_path" "text",
    "raw_ocr_json" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."fiorc_rent_boletos" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."fiteo_attendance" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "class_id" "uuid",
    "person_id" "uuid",
    "present" boolean DEFAULT true,
    "payment_type" "text",
    "transaction_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "enrollment_id" "uuid",
    CONSTRAINT "fiteo_attendance_payment_type_check" CHECK (("payment_type" = ANY (ARRAY['quarterly_plan'::"text", 'single_class'::"text", 'private_lesson'::"text"])))
);


ALTER TABLE "public"."fiteo_attendance" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."fiteo_class_schedules" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "class_date" timestamp with time zone NOT NULL,
    "proposed_theme" "text" NOT NULL,
    "minutes_and_notes" "text",
    "is_planned" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "course_id" "uuid",
    "theme_description" "text",
    "techniques" "text"[] DEFAULT '{}'::"text"[],
    "has_photo_content" boolean DEFAULT false,
    "has_video_content" boolean DEFAULT false,
    "is_highlighted" boolean DEFAULT false,
    "is_cancelled" boolean DEFAULT false
);


ALTER TABLE "public"."fiteo_class_schedules" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."fiteo_courses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "schedule_day" "text" NOT NULL,
    "skill_level" "text" NOT NULL,
    "active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."fiteo_courses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."legal_terms" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "term_type" "text" NOT NULL,
    "version" "text" NOT NULL,
    "title" "text" NOT NULL,
    "paragraphs" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."legal_terms" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "full_name" "text" NOT NULL,
    "role" "public"."fi_role_type" DEFAULT 'associate'::"public"."fi_role_type" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


ALTER TABLE ONLY "public"."fialn_enrollments"
    ADD CONSTRAINT "fialn_enrollments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."fialn_groups"
    ADD CONSTRAINT "fialn_groups_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."fialn_lesson_bundles"
    ADD CONSTRAINT "fialn_lesson_bundles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."fialn_lessons"
    ADD CONSTRAINT "fialn_lessons_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."fialn_student_profiles"
    ADD CONSTRAINT "fialn_student_profiles_person_id_key" UNIQUE ("person_id");



ALTER TABLE ONLY "public"."fialn_student_profiles"
    ADD CONSTRAINT "fialn_student_profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."fialn_student_transactions"
    ADD CONSTRAINT "fialn_student_transactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."fiatt_client_records"
    ADD CONSTRAINT "fiatt_client_records_person_id_key" UNIQUE ("person_id");



ALTER TABLE ONLY "public"."fiatt_client_records"
    ADD CONSTRAINT "fiatt_client_records_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."fiatt_sessions"
    ADD CONSTRAINT "fiatt_sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."fiorc_commitments"
    ADD CONSTRAINT "fiorc_commitments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."fiorc_house_settings"
    ADD CONSTRAINT "fiorc_house_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."fiorc_monthly_commitments"
    ADD CONSTRAINT "fiorc_monthly_commitments_commitment_id_month_year_key" UNIQUE ("commitment_id", "month_year");



ALTER TABLE ONLY "public"."fiorc_monthly_commitments"
    ADD CONSTRAINT "fiorc_monthly_commitments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."fiorc_monthly_targets"
    ADD CONSTRAINT "fiorc_monthly_targets_month_year_key" UNIQUE ("month_year");



ALTER TABLE ONLY "public"."fiorc_monthly_targets"
    ADD CONSTRAINT "fiorc_monthly_targets_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."fiorc_rent_boletos"
    ADD CONSTRAINT "fiorc_rent_boletos_month_year_key" UNIQUE ("month_year");



ALTER TABLE ONLY "public"."fiorc_rent_boletos"
    ADD CONSTRAINT "fiorc_rent_boletos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."fiorc_transactions"
    ADD CONSTRAINT "fiorc_transactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."fiteo_attendance"
    ADD CONSTRAINT "fiteo_attendance_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."fiteo_class_schedules"
    ADD CONSTRAINT "fiteo_class_schedules_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."fiteo_courses"
    ADD CONSTRAINT "fiteo_courses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."legal_terms"
    ADD CONSTRAINT "legal_terms_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."legal_terms"
    ADD CONSTRAINT "legal_terms_type_version_key" UNIQUE ("term_type", "version");



ALTER TABLE ONLY "public"."people"
    ADD CONSTRAINT "people_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_fialn_student_profiles_confirmation_token" ON "public"."fialn_student_profiles" USING "btree" ("confirmation_token") WHERE ("confirmation_token" IS NOT NULL);



CREATE OR REPLACE TRIGGER "trg_sync_people_names" BEFORE INSERT OR UPDATE ON "public"."people" FOR EACH ROW EXECUTE FUNCTION "public"."sync_people_names"();



ALTER TABLE ONLY "public"."fialn_enrollments"
    ADD CONSTRAINT "fialn_enrollments_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."fialn_groups"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."fialn_enrollments"
    ADD CONSTRAINT "fialn_enrollments_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."fialn_lesson_bundles"
    ADD CONSTRAINT "fialn_lesson_bundles_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."fialn_lessons"
    ADD CONSTRAINT "fialn_lessons_bundle_id_fkey" FOREIGN KEY ("bundle_id") REFERENCES "public"."fialn_lesson_bundles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."fialn_lessons"
    ADD CONSTRAINT "fialn_lessons_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."fialn_student_profiles"
    ADD CONSTRAINT "fialn_student_profiles_course_preference_id_fkey" FOREIGN KEY ("course_preference_id") REFERENCES "public"."fiteo_courses"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."fialn_student_profiles"
    ADD CONSTRAINT "fialn_student_profiles_group_preference_id_fkey" FOREIGN KEY ("group_preference_id") REFERENCES "public"."fialn_groups"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."fialn_student_profiles"
    ADD CONSTRAINT "fialn_student_profiles_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."fialn_student_transactions"
    ADD CONSTRAINT "fialn_student_transactions_bundle_id_fkey" FOREIGN KEY ("bundle_id") REFERENCES "public"."fialn_lesson_bundles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."fialn_student_transactions"
    ADD CONSTRAINT "fialn_student_transactions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."fialn_student_transactions"
    ADD CONSTRAINT "fialn_student_transactions_enrollment_id_fkey" FOREIGN KEY ("enrollment_id") REFERENCES "public"."fialn_enrollments"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."fialn_student_transactions"
    ADD CONSTRAINT "fialn_student_transactions_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."fiatt_client_records"
    ADD CONSTRAINT "fiatt_client_records_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."fiatt_sessions"
    ADD CONSTRAINT "fiatt_sessions_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."fiatt_sessions"
    ADD CONSTRAINT "fiatt_sessions_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "public"."fiorc_transactions"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."fiorc_commitments"
    ADD CONSTRAINT "fiorc_commitments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."fiorc_house_settings"
    ADD CONSTRAINT "fiorc_house_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."fiorc_monthly_commitments"
    ADD CONSTRAINT "fiorc_monthly_commitments_commitment_id_fkey" FOREIGN KEY ("commitment_id") REFERENCES "public"."fiorc_commitments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."fiorc_monthly_commitments"
    ADD CONSTRAINT "fiorc_monthly_commitments_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "public"."fiorc_transactions"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."fiorc_transactions"
    ADD CONSTRAINT "fiorc_transactions_enrollment_id_fkey" FOREIGN KEY ("enrollment_id") REFERENCES "public"."fialn_enrollments"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."fiorc_transactions"
    ADD CONSTRAINT "fiorc_transactions_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."fiorc_transactions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."fiorc_transactions"
    ADD CONSTRAINT "fiorc_transactions_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."fiteo_attendance"
    ADD CONSTRAINT "fiteo_attendance_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "public"."fiteo_class_schedules"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."fiteo_attendance"
    ADD CONSTRAINT "fiteo_attendance_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."fiteo_attendance"
    ADD CONSTRAINT "fiteo_attendance_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "public"."fiorc_transactions"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."fiteo_class_schedules"
    ADD CONSTRAINT "fiteo_class_schedules_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."fiteo_courses"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE "public"."fialn_enrollments" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "fialn_enrollments: associate access" ON "public"."fialn_enrollments" TO "authenticated" USING ("private"."is_associate_or_admin"()) WITH CHECK ("private"."is_associate_or_admin"());



CREATE POLICY "fialn_enrollments: clerk select" ON "public"."fialn_enrollments" FOR SELECT TO "authenticated" USING ("private"."can_edit_fiteo_ata"());



ALTER TABLE "public"."fialn_groups" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "fialn_groups: anon select" ON "public"."fialn_groups" FOR SELECT TO "anon" USING (true);



CREATE POLICY "fialn_groups: associate access" ON "public"."fialn_groups" TO "authenticated" USING ("private"."is_associate_or_admin"()) WITH CHECK ("private"."is_associate_or_admin"());



CREATE POLICY "fialn_groups: clerk select" ON "public"."fialn_groups" FOR SELECT TO "authenticated" USING ("private"."can_edit_fiteo_ata"());



ALTER TABLE "public"."fialn_lesson_bundles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "fialn_lesson_bundles: associate access" ON "public"."fialn_lesson_bundles" TO "authenticated" USING ("private"."is_associate_or_admin"()) WITH CHECK ("private"."is_associate_or_admin"());



ALTER TABLE "public"."fialn_lessons" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "fialn_lessons: associate access" ON "public"."fialn_lessons" TO "authenticated" USING ("private"."is_associate_or_admin"()) WITH CHECK ("private"."is_associate_or_admin"());



ALTER TABLE "public"."fialn_student_profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "fialn_student_profiles: associate access" ON "public"."fialn_student_profiles" TO "authenticated" USING ("private"."is_associate_or_admin"()) WITH CHECK ("private"."is_associate_or_admin"());



ALTER TABLE "public"."fialn_student_transactions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "fialn_student_transactions: associate access" ON "public"."fialn_student_transactions" TO "authenticated" USING ("private"."is_associate_or_admin"()) WITH CHECK ("private"."is_associate_or_admin"());



ALTER TABLE "public"."fiatt_client_records" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "fiatt_client_records: admin full access" ON "public"."fiatt_client_records" TO "authenticated" USING ("private"."is_admin"()) WITH CHECK ("private"."is_admin"());



ALTER TABLE "public"."fiatt_sessions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "fiatt_sessions: admin full access" ON "public"."fiatt_sessions" TO "authenticated" USING ("private"."is_admin"()) WITH CHECK ("private"."is_admin"());



ALTER TABLE "public"."fiorc_commitments" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "fiorc_commitments: admin full access" ON "public"."fiorc_commitments" TO "authenticated" USING ("private"."is_admin"()) WITH CHECK ("private"."is_admin"());



ALTER TABLE "public"."fiorc_house_settings" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "fiorc_house_settings: admin full access" ON "public"."fiorc_house_settings" TO "authenticated" USING ("private"."is_admin"()) WITH CHECK ("private"."is_admin"());



ALTER TABLE "public"."fiorc_monthly_commitments" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "fiorc_monthly_commitments: admin full access" ON "public"."fiorc_monthly_commitments" TO "authenticated" USING ("private"."is_admin"()) WITH CHECK ("private"."is_admin"());



ALTER TABLE "public"."fiorc_monthly_targets" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "fiorc_monthly_targets: admin full access" ON "public"."fiorc_monthly_targets" TO "authenticated" USING ("private"."is_admin"()) WITH CHECK ("private"."is_admin"());



ALTER TABLE "public"."fiorc_rent_boletos" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "fiorc_rent_boletos: admin full access" ON "public"."fiorc_rent_boletos" TO "authenticated" USING ("private"."is_admin"()) WITH CHECK ("private"."is_admin"());



ALTER TABLE "public"."fiorc_transactions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "fiorc_transactions: admin full access" ON "public"."fiorc_transactions" TO "authenticated" USING ("private"."is_admin"()) WITH CHECK ("private"."is_admin"());



ALTER TABLE "public"."fiteo_attendance" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "fiteo_attendance: associate full access" ON "public"."fiteo_attendance" TO "authenticated" USING ("private"."is_associate_or_admin"()) WITH CHECK ("private"."is_associate_or_admin"());



CREATE POLICY "fiteo_attendance: clerk select" ON "public"."fiteo_attendance" FOR SELECT TO "authenticated" USING ("private"."can_edit_fiteo_ata"());



ALTER TABLE "public"."fiteo_class_schedules" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "fiteo_class_schedules: associate full access" ON "public"."fiteo_class_schedules" TO "authenticated" USING ("private"."is_associate_or_admin"()) WITH CHECK ("private"."is_associate_or_admin"());



CREATE POLICY "fiteo_class_schedules: clerk select" ON "public"."fiteo_class_schedules" FOR SELECT TO "authenticated" USING ("private"."can_edit_fiteo_ata"());



CREATE POLICY "fiteo_class_schedules: clerk update minutes" ON "public"."fiteo_class_schedules" FOR UPDATE TO "authenticated" USING ("private"."can_edit_fiteo_ata"()) WITH CHECK ("private"."can_edit_fiteo_ata"());



ALTER TABLE "public"."fiteo_courses" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "fiteo_courses: anon select" ON "public"."fiteo_courses" FOR SELECT TO "anon" USING (("active" = true));



CREATE POLICY "fiteo_courses: associate full access" ON "public"."fiteo_courses" TO "authenticated" USING ("private"."is_associate_or_admin"()) WITH CHECK ("private"."is_associate_or_admin"());



CREATE POLICY "fiteo_courses: clerk select" ON "public"."fiteo_courses" FOR SELECT TO "authenticated" USING ("private"."can_edit_fiteo_ata"());



ALTER TABLE "public"."legal_terms" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "legal_terms: admin full access" ON "public"."legal_terms" TO "authenticated" USING ("private"."is_admin"()) WITH CHECK ("private"."is_admin"());



CREATE POLICY "legal_terms: anon and authenticated can read active terms" ON "public"."legal_terms" FOR SELECT TO "authenticated", "anon" USING (("is_active" = true));



ALTER TABLE "public"."people" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "people: admin and associate access" ON "public"."people" TO "authenticated" USING ("private"."is_associate_or_admin"()) WITH CHECK ("private"."is_associate_or_admin"());



CREATE POLICY "people: clerk select" ON "public"."people" FOR SELECT TO "authenticated" USING ("private"."can_edit_fiteo_ata"());



ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "profiles: admin full access" ON "public"."profiles" TO "authenticated" USING ("private"."is_admin"()) WITH CHECK ("private"."is_admin"());



CREATE POLICY "profiles: users read own profile" ON "public"."profiles" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "id"));





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";






















































































































































REVOKE ALL ON FUNCTION "private"."can_edit_fiteo_ata"() FROM PUBLIC;
GRANT ALL ON FUNCTION "private"."can_edit_fiteo_ata"() TO "service_role";
GRANT ALL ON FUNCTION "private"."can_edit_fiteo_ata"() TO "authenticated";



REVOKE ALL ON FUNCTION "private"."is_admin"() FROM PUBLIC;
GRANT ALL ON FUNCTION "private"."is_admin"() TO "service_role";
GRANT ALL ON FUNCTION "private"."is_admin"() TO "authenticated";



REVOKE ALL ON FUNCTION "private"."is_associate_or_admin"() FROM PUBLIC;
GRANT ALL ON FUNCTION "private"."is_associate_or_admin"() TO "service_role";
GRANT ALL ON FUNCTION "private"."is_associate_or_admin"() TO "authenticated";



REVOKE ALL ON FUNCTION "public"."confirm_student_registration"("p_token" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."confirm_student_registration"("p_token" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."confirm_student_registration"("p_token" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."confirm_student_registration"("p_token" "uuid") TO "service_role";



GRANT ALL ON TABLE "public"."fiorc_transactions" TO "anon";
GRANT ALL ON TABLE "public"."fiorc_transactions" TO "authenticated";
GRANT ALL ON TABLE "public"."fiorc_transactions" TO "service_role";



GRANT ALL ON FUNCTION "public"."fialn_create_enrollment_financials"("p_person_id" "uuid", "p_enrollment_id" "uuid", "p_category" "public"."transaction_category", "p_payment_method" "text", "p_received_by" "text", "p_total_installments" integer, "p_amount_per_installment" numeric, "p_first_due_date" "date", "p_description" "text", "p_is_partner" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."fialn_create_enrollment_financials"("p_person_id" "uuid", "p_enrollment_id" "uuid", "p_category" "public"."transaction_category", "p_payment_method" "text", "p_received_by" "text", "p_total_installments" integer, "p_amount_per_installment" numeric, "p_first_due_date" "date", "p_description" "text", "p_is_partner" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."fialn_create_enrollment_financials"("p_person_id" "uuid", "p_enrollment_id" "uuid", "p_category" "public"."transaction_category", "p_payment_method" "text", "p_received_by" "text", "p_total_installments" integer, "p_amount_per_installment" numeric, "p_first_due_date" "date", "p_description" "text", "p_is_partner" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."fialn_create_plan_installments"("p_person_id" "uuid", "p_category" "public"."transaction_category", "p_total_installments" integer, "p_amount_per_installment" numeric, "p_first_due_date" "date", "p_description" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."fialn_create_plan_installments"("p_person_id" "uuid", "p_category" "public"."transaction_category", "p_total_installments" integer, "p_amount_per_installment" numeric, "p_first_due_date" "date", "p_description" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."fialn_create_plan_installments"("p_person_id" "uuid", "p_category" "public"."transaction_category", "p_total_installments" integer, "p_amount_per_installment" numeric, "p_first_due_date" "date", "p_description" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."fiorc_confirm_shibari_projection"("p_transaction_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."fiorc_confirm_shibari_projection"("p_transaction_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."fiorc_confirm_shibari_projection"("p_transaction_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."fiorc_get_distinct_tags"() TO "anon";
GRANT ALL ON FUNCTION "public"."fiorc_get_distinct_tags"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."fiorc_get_distinct_tags"() TO "service_role";



GRANT ALL ON FUNCTION "public"."fiorc_settle_fialn_repasses"("p_transaction_ids" "uuid"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."fiorc_settle_fialn_repasses"("p_transaction_ids" "uuid"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."fiorc_settle_fialn_repasses"("p_transaction_ids" "uuid"[]) TO "service_role";



REVOKE ALL ON FUNCTION "public"."generate_student_regularization_token"("p_person_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."generate_student_regularization_token"("p_person_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."generate_student_regularization_token"("p_person_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_student_regularization_token"("p_person_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_student_registration_by_token"("p_token" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_student_registration_by_token"("p_token" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_student_registration_by_token"("p_token" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_student_registration_by_token"("p_token" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_student_regularization_data"("p_token" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_student_regularization_data"("p_token" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_student_regularization_data"("p_token" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_student_regularization_data"("p_token" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."register_student_public"("p_first_name" "text", "p_last_name" "text", "p_phone" "text", "p_email" "text", "p_cpf" "text", "p_course_preference_id" "uuid", "p_shibari_experience" "text", "p_shibari_goals" "text", "p_full_name" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."register_student_public"("p_first_name" "text", "p_last_name" "text", "p_phone" "text", "p_email" "text", "p_cpf" "text", "p_course_preference_id" "uuid", "p_shibari_experience" "text", "p_shibari_goals" "text", "p_full_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."register_student_public"("p_first_name" "text", "p_last_name" "text", "p_phone" "text", "p_email" "text", "p_cpf" "text", "p_course_preference_id" "uuid", "p_shibari_experience" "text", "p_shibari_goals" "text", "p_full_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."register_student_public"("p_first_name" "text", "p_last_name" "text", "p_phone" "text", "p_email" "text", "p_cpf" "text", "p_course_preference_id" "uuid", "p_shibari_experience" "text", "p_shibari_goals" "text", "p_full_name" "text") TO "service_role";



REVOKE ALL ON FUNCTION "public"."submit_student_regularization"("p_token" "uuid", "p_first_name" "text", "p_last_name" "text", "p_email" "text", "p_phone" "text", "p_cpf" "text", "p_shibari_experience" "text", "p_shibari_goals" "text", "p_full_name" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."submit_student_regularization"("p_token" "uuid", "p_first_name" "text", "p_last_name" "text", "p_email" "text", "p_phone" "text", "p_cpf" "text", "p_shibari_experience" "text", "p_shibari_goals" "text", "p_full_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."submit_student_regularization"("p_token" "uuid", "p_first_name" "text", "p_last_name" "text", "p_email" "text", "p_phone" "text", "p_cpf" "text", "p_shibari_experience" "text", "p_shibari_goals" "text", "p_full_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."submit_student_regularization"("p_token" "uuid", "p_first_name" "text", "p_last_name" "text", "p_email" "text", "p_phone" "text", "p_cpf" "text", "p_shibari_experience" "text", "p_shibari_goals" "text", "p_full_name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."sync_people_names"() TO "anon";
GRANT ALL ON FUNCTION "public"."sync_people_names"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_people_names"() TO "service_role";


















GRANT ALL ON TABLE "public"."fialn_enrollments" TO "anon";
GRANT ALL ON TABLE "public"."fialn_enrollments" TO "authenticated";
GRANT ALL ON TABLE "public"."fialn_enrollments" TO "service_role";



GRANT ALL ON TABLE "public"."fialn_groups" TO "anon";
GRANT ALL ON TABLE "public"."fialn_groups" TO "authenticated";
GRANT ALL ON TABLE "public"."fialn_groups" TO "service_role";



GRANT ALL ON TABLE "public"."fialn_lesson_bundles" TO "anon";
GRANT ALL ON TABLE "public"."fialn_lesson_bundles" TO "authenticated";
GRANT ALL ON TABLE "public"."fialn_lesson_bundles" TO "service_role";



GRANT ALL ON TABLE "public"."fialn_lessons" TO "anon";
GRANT ALL ON TABLE "public"."fialn_lessons" TO "authenticated";
GRANT ALL ON TABLE "public"."fialn_lessons" TO "service_role";



GRANT SELECT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."fialn_student_profiles" TO "anon";
GRANT ALL ON TABLE "public"."fialn_student_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."fialn_student_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."fialn_student_transactions" TO "anon";
GRANT ALL ON TABLE "public"."fialn_student_transactions" TO "authenticated";
GRANT ALL ON TABLE "public"."fialn_student_transactions" TO "service_role";



GRANT SELECT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."people" TO "anon";
GRANT ALL ON TABLE "public"."people" TO "authenticated";
GRANT ALL ON TABLE "public"."people" TO "service_role";



GRANT ALL ON TABLE "public"."fialn_students_view" TO "anon";
GRANT ALL ON TABLE "public"."fialn_students_view" TO "authenticated";
GRANT ALL ON TABLE "public"."fialn_students_view" TO "service_role";



GRANT ALL ON TABLE "public"."fiatt_client_records" TO "anon";
GRANT ALL ON TABLE "public"."fiatt_client_records" TO "authenticated";
GRANT ALL ON TABLE "public"."fiatt_client_records" TO "service_role";



GRANT ALL ON TABLE "public"."fiatt_sessions" TO "anon";
GRANT ALL ON TABLE "public"."fiatt_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."fiatt_sessions" TO "service_role";



GRANT ALL ON TABLE "public"."fiorc_commitments" TO "anon";
GRANT ALL ON TABLE "public"."fiorc_commitments" TO "authenticated";
GRANT ALL ON TABLE "public"."fiorc_commitments" TO "service_role";



GRANT ALL ON TABLE "public"."fiorc_house_settings" TO "anon";
GRANT ALL ON TABLE "public"."fiorc_house_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."fiorc_house_settings" TO "service_role";



GRANT ALL ON TABLE "public"."fiorc_monthly_commitments" TO "anon";
GRANT ALL ON TABLE "public"."fiorc_monthly_commitments" TO "authenticated";
GRANT ALL ON TABLE "public"."fiorc_monthly_commitments" TO "service_role";



GRANT ALL ON TABLE "public"."fiorc_monthly_targets" TO "anon";
GRANT ALL ON TABLE "public"."fiorc_monthly_targets" TO "authenticated";
GRANT ALL ON TABLE "public"."fiorc_monthly_targets" TO "service_role";



GRANT ALL ON TABLE "public"."fiorc_rent_boletos" TO "anon";
GRANT ALL ON TABLE "public"."fiorc_rent_boletos" TO "authenticated";
GRANT ALL ON TABLE "public"."fiorc_rent_boletos" TO "service_role";



GRANT ALL ON TABLE "public"."fiteo_attendance" TO "anon";
GRANT ALL ON TABLE "public"."fiteo_attendance" TO "authenticated";
GRANT ALL ON TABLE "public"."fiteo_attendance" TO "service_role";



GRANT ALL ON TABLE "public"."fiteo_class_schedules" TO "anon";
GRANT ALL ON TABLE "public"."fiteo_class_schedules" TO "authenticated";
GRANT ALL ON TABLE "public"."fiteo_class_schedules" TO "service_role";



GRANT ALL ON TABLE "public"."fiteo_courses" TO "anon";
GRANT ALL ON TABLE "public"."fiteo_courses" TO "authenticated";
GRANT ALL ON TABLE "public"."fiteo_courses" TO "service_role";



GRANT ALL ON TABLE "public"."legal_terms" TO "anon";
GRANT ALL ON TABLE "public"."legal_terms" TO "authenticated";
GRANT ALL ON TABLE "public"."legal_terms" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































