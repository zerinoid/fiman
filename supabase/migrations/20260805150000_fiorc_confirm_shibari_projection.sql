-- Migration: 20260805150000_fiorc_confirm_shibari_projection.sql
-- Description: RPC function to confirm Shibari House projections/repasses and sync student financial status in FIALN

CREATE OR REPLACE FUNCTION public.fiorc_confirm_shibari_projection(
    p_transaction_id UUID
) RETURNS public.fiorc_transactions AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.fiorc_confirm_shibari_projection TO authenticated;
