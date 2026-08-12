-- ============================================================
-- Migration: 20260812000000_update_fiorc_settle_rpc_with_ids.sql
-- Description: Atualização da RPC fiorc_settle_fialn_repasses para aceitar
--   uma lista opcional de IDs de transações (p_transaction_ids UUID[]).
--   Permite a quitação seletiva de repasses no FIORC.
-- ============================================================

-- Drop old zero-argument version if exists to avoid signature collisions
DROP FUNCTION IF EXISTS public.fiorc_settle_fialn_repasses();

CREATE OR REPLACE FUNCTION public.fiorc_settle_fialn_repasses(
    p_transaction_ids UUID[] DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_total_debt        NUMERIC := 0;
    v_total_receivable  NUMERIC := 0;
    v_net               NUMERIC := 0;
    v_settled_count     INT := 0;
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

    -- Marcar as pendências selecionadas como settled
    UPDATE public.fialn_student_transactions
    SET fiorc_status = 'settled',
        updated_at   = NOW()
    WHERE fiorc_status = 'pending'
      AND (p_transaction_ids IS NULL OR array_length(p_transaction_ids, 1) IS NULL OR id = ANY(p_transaction_ids));

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
        );
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
        );
    END IF;
    -- v_net = 0: cancelamento mútuo exato, nenhuma transação de acerto necessária

    v_result := json_build_object(
        'settled', TRUE,
        'settled_count', v_settled_count,
        'total_debt', v_total_debt,
        'total_receivable', v_total_receivable,
        'net', v_net
    );

    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Conceder execução a authenticated
GRANT EXECUTE ON FUNCTION public.fiorc_settle_fialn_repasses(UUID[]) TO authenticated;
