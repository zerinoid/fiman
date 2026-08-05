-- ============================================================
-- FITEO — Class Schedule Highlighted Toggle ("Aula Destaque")
-- Migration: 20260805130000_fiteo_is_highlighted
-- ============================================================

ALTER TABLE public.fiteo_class_schedules
    ADD COLUMN IF NOT EXISTS is_highlighted BOOLEAN DEFAULT FALSE;
