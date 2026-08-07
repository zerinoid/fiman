-- ============================================================
-- Migration: Populate end_date for fialn_enrollments & update expired statuses
-- ============================================================

-- 1. Populate end_date where it is NULL based on modality
UPDATE public.fialn_enrollments
SET end_date = CASE
    WHEN modality = 'monthly_group' THEN start_date + INTERVAL '1 month'
    WHEN modality = 'quarterly_group' THEN start_date + INTERVAL '3 months'
    WHEN modality IN ('single_group', 'single_private') THEN start_date
    WHEN modality = 'private_bundle' THEN start_date + INTERVAL '3 months'
    ELSE start_date + INTERVAL '1 month'
END
WHERE end_date IS NULL;
-- 2. Mark active enrollments whose end_date is in the past as 'completed'
UPDATE public.fialn_enrollments
SET status = 'completed',
    updated_at = NOW()
WHERE status = 'active'
  AND end_date < CURRENT_DATE;
