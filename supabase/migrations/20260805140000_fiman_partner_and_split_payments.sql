-- Migration: 20260805140000_fiman_partner_and_split_payments.sql
-- Description: Adds partner toggle, split payment recipient, payment method, and financial RPC for FIALN enrollments & FIORC integration

-- 1. Add new fields to fialn_enrollments
ALTER TABLE public.fialn_enrollments
    ADD COLUMN IF NOT EXISTS is_partner BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS partner_details TEXT,
    ADD COLUMN IF NOT EXISTS received_by TEXT CHECK (received_by IN ('foraisso', 'shibarihouse')),
    ADD COLUMN IF NOT EXISTS payment_method TEXT CHECK (payment_method IN ('pix', 'credit'));

-- 2. Add received_by and enrollment_id to fiorc_transactions
ALTER TABLE public.fiorc_transactions
    ADD COLUMN IF NOT EXISTS received_by TEXT CHECK (received_by IN ('foraisso', 'shibarihouse')),
    ADD COLUMN IF NOT EXISTS enrollment_id UUID REFERENCES public.fialn_enrollments(id) ON DELETE SET NULL;

-- 3. Atomic RPC Function for generating financial projections (75%) or debts/repasses (25% on 5th of next month)
CREATE OR REPLACE FUNCTION public.fialn_create_enrollment_financials(
    p_person_id UUID,
    p_enrollment_id UUID,
    p_category public.transaction_category,
    p_payment_method TEXT,        -- 'pix' | 'credit'
    p_received_by TEXT,            -- 'foraisso' | 'shibarihouse'
    p_total_installments INT,
    p_amount_per_installment NUMERIC(10, 2),
    p_first_due_date DATE,
    p_description TEXT,
    p_is_partner BOOLEAN DEFAULT FALSE
) RETURNS SETOF public.fiorc_transactions AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.fialn_create_enrollment_financials TO authenticated;
