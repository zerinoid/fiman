-- ============================================================
-- FITEO — Class Schedule Techniques, Media Toggles & Auto-Planned Past Classes
-- Migration: 20260805120000_fiteo_tags_media_auto_planned
-- ============================================================

-- Add techniques, has_photo_content, and has_video_content columns to fiteo_class_schedules
ALTER TABLE public.fiteo_class_schedules
    ADD COLUMN IF NOT EXISTS techniques TEXT[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS has_photo_content BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS has_video_content BOOLEAN DEFAULT FALSE;

-- Automatically mark past classes as planned in existing DB rows
UPDATE public.fiteo_class_schedules
SET is_planned = TRUE
WHERE class_date < NOW() AND is_planned = FALSE;
