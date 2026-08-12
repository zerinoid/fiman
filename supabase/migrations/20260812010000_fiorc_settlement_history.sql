-- ============================================================
-- Migration: 20260812010000_fiorc_settlement_history.sql
-- Description: Adiciona colunas settled_at e settlement_batch_id na tabela
--   fialn_student_transactions e atualiza a RPC fiorc_settle_fialn_repasses
--   para registrar dados permanentes do lote de quitação.
-- ============================================================

ALTER TABLE public.fialn_student_transactions
    ADD COLUMN IF NOT EXISTS settled_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS settlement_batch_id UUID;

-- Backfill settled_at para registros que eventualmente já estavam marcados como settled
UPDATE public.fialn_student_transactions
SET settled_at = updated_at
WHERE fiorc_status = 'settled' AND settled_at IS NULL;

-- Atualizar RPC para gravar settled_at e settlement_batch_id no momento da quitação
CREATE OR REPLACE FUNCTION public.fiorc_settle_fialn_repasses(
    p_transaction_ids UUID[] DEFAULT NULL
)
RETURNS JSON AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Conceder execução a authenticated
GRANT EXECUTE ON FUNCTION public.fiorc_settle_fialn_repasses(UUID[]) TO authenticated;
