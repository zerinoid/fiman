-- ============================================================
-- Migration: 20260814020000_add_codigo_to_student_transactions.sql
-- Description: Adiciona o campo codigo para identificar concisamente planos e turmas.
-- ============================================================

-- 1. Adicionar coluna codigo como TEXT (temporariamente aceitando NULL para possibilitar backfill)
ALTER TABLE public.fialn_student_transactions
    ADD COLUMN IF NOT EXISTS codigo TEXT;

-- 2. Atualizar transações existentes com base na descrição
UPDATE public.fialn_student_transactions
SET codigo = 
  CASE
    WHEN description ILIKE '%sobre n%' OR description ILIKE '%sobre nos%' THEN
      CASE
        WHEN description ILIKE '%mensal%' THEN 'SOBME'
        WHEN description ILIKE '%trimestral%' THEN 'SOBTR'
        WHEN description ILIKE '%avulsa%' OR description ILIKE '%avulso%' THEN 'SOBAV'
        ELSE 'SOB'
      END
    WHEN description ILIKE '%teoria das cordas%' THEN
      CASE
        WHEN description ILIKE '%mensal%' THEN 'TEOME'
        WHEN description ILIKE '%trimestral%' THEN 'TEOTR'
        WHEN description ILIKE '%avulsa%' OR description ILIKE '%avulso%' THEN 'TEOAV'
        ELSE 'TEO'
      END
    ELSE 'OUT'
  END;

-- 3. Definir codigo como NOT NULL
ALTER TABLE public.fialn_student_transactions
    ALTER COLUMN codigo SET NOT NULL;

-- 4. Adicionar CONSTRAINT CHECK para garantir integridade dos códigos
ALTER TABLE public.fialn_student_transactions
    ADD CONSTRAINT fialn_student_transactions_codigo_check
    CHECK (codigo IN ('SOBME', 'SOBTR', 'SOBAV', 'TEOME', 'TEOTR', 'TEOAV'));
