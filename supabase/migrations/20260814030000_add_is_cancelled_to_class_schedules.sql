-- Add is_cancelled column to fiteo_class_schedules
ALTER TABLE public.fiteo_class_schedules
    ADD COLUMN IF NOT EXISTS is_cancelled BOOLEAN DEFAULT FALSE;
