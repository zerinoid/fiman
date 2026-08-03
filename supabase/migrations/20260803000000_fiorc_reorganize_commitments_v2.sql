-- ============================================================
-- FIORC — Reorganize Commitment Types (fixed, optional, occasional)
-- Migration: 20260803000000_fiorc_reorganize_commitments_v2
-- ============================================================

-- 1. Create replacement ENUM type to bypass Postgres 55P04 transaction lock on ALTER TYPE ADD VALUE
DROP TYPE IF EXISTS public.commitment_type_v2;
CREATE TYPE public.commitment_type_v2 AS ENUM ('fixed', 'optional', 'occasional');

-- 2. Convert category_type column to TEXT temporarily
ALTER TABLE public.fiorc_commitments
  ALTER COLUMN category_type DROP DEFAULT,
  ALTER COLUMN category_type TYPE TEXT USING category_type::text;

-- 3. Update existing data
UPDATE public.fiorc_commitments
SET category_type = 'optional'
WHERE category_type = 'toggleable';

UPDATE public.fiorc_commitments
SET category_type = 'occasional'
WHERE category_type = 'variable';

-- 4. Change column type to commitment_type_v2
ALTER TABLE public.fiorc_commitments
  ALTER COLUMN category_type TYPE public.commitment_type_v2 USING category_type::public.commitment_type_v2,
  ALTER COLUMN category_type SET DEFAULT 'occasional'::public.commitment_type_v2;

-- 5. Drop old commitment_type enum and rename new enum
DROP TYPE IF EXISTS public.commitment_type;
ALTER TYPE public.commitment_type_v2 RENAME TO commitment_type;

-- 6. Update existing JSONB records in fiorc_monthly_targets.commitments
UPDATE public.fiorc_monthly_targets
SET commitments = (
    SELECT jsonb_agg(
        CASE
            WHEN elem->>'category_type' = 'toggleable' THEN jsonb_set(elem, '{category_type}', '"optional"')
            WHEN elem->>'category_type' = 'variable' THEN jsonb_set(elem, '{category_type}', '"occasional"')
            ELSE elem
        END
    )
    FROM jsonb_array_elements(commitments) AS elem
)
WHERE jsonb_typeof(commitments) = 'array';
