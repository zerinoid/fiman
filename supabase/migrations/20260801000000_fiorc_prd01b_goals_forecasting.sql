-- ============================================================
-- FIORC — Goals, Expense Allocations & Forecasting Engine
-- Migration: 20260801000000_fiorc_prd01b_goals_forecasting
-- ============================================================

-- 1. House Settings Table
CREATE TABLE IF NOT EXISTS public.fiorc_house_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    active_roommates_count INT NOT NULL DEFAULT 3 CHECK (active_roommates_count IN (2, 3)),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enums
DO $$ BEGIN
    CREATE TYPE commitment_type AS ENUM ('fixed', 'toggleable', 'variable');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE split_rule_type AS ENUM ('none', 'equal_roommates', 'weighted_rent', 'mobile_shared');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Commitment Templates
CREATE TABLE IF NOT EXISTS public.fiorc_commitments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category_type commitment_type NOT NULL DEFAULT 'fixed',
    split_rule split_rule_type NOT NULL DEFAULT 'none',
    default_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    due_day INT NOT NULL DEFAULT 1 CHECK (due_day BETWEEN 1 AND 31),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Monthly Commitment Instances
CREATE TABLE IF NOT EXISTS public.fiorc_monthly_commitments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    commitment_id UUID REFERENCES public.fiorc_commitments(id) ON DELETE CASCADE,
    month_year DATE NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    user_calculated_share NUMERIC(10, 2) NOT NULL,
    is_paid BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    transaction_id UUID REFERENCES public.fiorc_transactions(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(commitment_id, month_year)
);

-- RLS Enablement
ALTER TABLE public.fiorc_house_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fiorc_commitments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fiorc_monthly_commitments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "fiorc_house_settings: admin full access"
    ON public.fiorc_house_settings FOR ALL
    TO authenticated
    USING (private.is_admin())
    WITH CHECK (private.is_admin());

CREATE POLICY "fiorc_commitments: admin full access"
    ON public.fiorc_commitments FOR ALL
    TO authenticated
    USING (private.is_admin())
    WITH CHECK (private.is_admin());

CREATE POLICY "fiorc_monthly_commitments: admin full access"
    ON public.fiorc_monthly_commitments FOR ALL
    TO authenticated
    USING (private.is_admin())
    WITH CHECK (private.is_admin());

-- Grants
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON
    public.fiorc_house_settings,
    public.fiorc_commitments,
    public.fiorc_monthly_commitments
TO authenticated;
