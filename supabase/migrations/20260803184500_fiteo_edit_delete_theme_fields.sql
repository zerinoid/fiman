-- ============================================================
-- FITEO — Edit/Delete Schedules & Theme Title/Description Fields
-- Migration: 20260803184500_fiteo_edit_delete_theme_fields
-- ============================================================

-- Add theme_description column to fiteo_class_schedules
ALTER TABLE public.fiteo_class_schedules
    ADD COLUMN IF NOT EXISTS theme_description TEXT;
