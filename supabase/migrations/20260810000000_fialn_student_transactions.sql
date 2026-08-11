-- ============================================================
-- Migration: 20260810000000_fialn_student_transactions.sql
-- Description: Nova tabela central de transações financeiras do aluno.
--   Fonte de verdade para FIALN (leitura/escrita por associates).
--   Lida pelo FIORC (admin) para exibição de projeções e repasses.
--   Elimina a necessidade de RPC fialn_create_enrollment_financials
--   para cruzar barreiras de RLS — ambas as tabelas usam a mesma política.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.fialn_student_transactions (
    id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id                 UUID NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
    enrollment_id             UUID REFERENCES public.fialn_enrollments(id) ON DELETE SET NULL,
    bundle_id                 UUID REFERENCES public.fialn_lesson_bundles(id) ON DELETE SET NULL,

    -- Colunas visíveis na tabela FIALN (aba Financeiro do aluno e página Valores)
    transaction_date          DATE NOT NULL,           -- "Data"
    description               TEXT NOT NULL,           -- "Descrição"
    received_by               TEXT NOT NULL
                                CHECK (received_by IN ('foraisso', 'shibarihouse')), -- "Recebedor"
    amount                    NUMERIC(10, 2) NOT NULL, -- "Valor" (bruto recebido)
    payment_method            TEXT NOT NULL
                                CHECK (payment_method IN ('pix', 'credit')),         -- "Tipo de Pagamento"
    due_date                  DATE,                    -- "Vencimento" — NULL para PIX; data da parcela p/ crédito

    -- Campos de split (lidos pelo FIORC para exibição de projeções e repasses)
    split_percent             NUMERIC(5, 2) NOT NULL,  -- 75.00 ou 25.00
    split_amount              NUMERIC(10, 2) NOT NULL, -- valor calculado (75% ou 25% do amount)
    split_type                TEXT NOT NULL
                                CHECK (split_type IN ('receivable', 'debt')),
    -- 'receivable': ShibariHouse recebeu → Foraisso tem a receber 75%
    -- 'debt':       Foraisso recebeu     → Foraisso deve repassar 25% à ShibariHouse

    -- Campos para integração FIORC (calculados no INSERT pelo hook TypeScript)
    fiorc_projection_due_date DATE NOT NULL,           -- sempre dia 5 do mês seguinte à transaction_date ou due_date
    fiorc_status              TEXT NOT NULL DEFAULT 'pending'
                                CHECK (fiorc_status IN ('pending', 'settled')),
    -- 'pending':  aguardando quitação
    -- 'settled':  quitado via botão QUITAR (fiorc_settle_fialn_repasses)

    -- Parcelamento
    installment_index         INT NOT NULL DEFAULT 1,
    total_installments        INT NOT NULL DEFAULT 1,

    notes                     TEXT,

    created_by                UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at                TIMESTAMPTZ DEFAULT NOW(),
    updated_at                TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.fialn_student_transactions ENABLE ROW LEVEL SECURITY;

-- Associates e admin têm acesso total (mesma política das demais tabelas FIALN)
CREATE POLICY "fialn_student_transactions: associate access"
    ON public.fialn_student_transactions FOR ALL
    TO authenticated
    USING (private.is_associate_or_admin())
    WITH CHECK (private.is_associate_or_admin());

-- ============================================================
-- GRANTS
-- ============================================================

GRANT SELECT, INSERT, UPDATE, DELETE
    ON public.fialn_student_transactions
    TO authenticated;
