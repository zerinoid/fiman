-- ============================================================
-- FI ECOSYSTEM — Reorganize Roles and Permissions
-- Migration: 20260806000000_reorganize_roles_and_permissions.sql
-- Roles:
--   - 'admin': Leo Zerino — Full RW access total
--   - 'associate': Maia & Mariana Rodeso — Full RW access in FIALN & FITEO + people. Zero access to FIORC & FIATT.
--   - 'clerk': Marina — RW access to edit ATA in FITEO + SELECT on FITEO schedules/courses. Zero access to FIALN, FIORC, FIATT.
-- ============================================================

-- 1. ENUM VALUES
ALTER TYPE public.fi_role_type ADD VALUE IF NOT EXISTS 'associate';
ALTER TYPE public.fi_role_type ADD VALUE IF NOT EXISTS 'clerk';

-- 2. PRIVATE HELPER FUNCTIONS
CREATE SCHEMA IF NOT EXISTS private;

CREATE OR REPLACE FUNCTION private.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  );
END;
$$;

CREATE OR REPLACE FUNCTION private.is_associate_or_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('admin', 'associate')
  );
END;
$$;

CREATE OR REPLACE FUNCTION private.can_edit_fiteo_ata()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('admin', 'associate', 'clerk')
  );
END;
$$;

-- Lock down function executions
REVOKE EXECUTE ON FUNCTION private.is_admin() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION private.is_associate_or_admin() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION private.can_edit_fiteo_ata() FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION private.is_admin() TO postgres, service_role, authenticated;
GRANT EXECUTE ON FUNCTION private.is_associate_or_admin() TO postgres, service_role, authenticated;
GRANT EXECUTE ON FUNCTION private.can_edit_fiteo_ata() TO postgres, service_role, authenticated;

-- 3. DROP OBSOLETE COLLABORATOR POLICIES
DROP POLICY IF EXISTS "fiteo_class_schedules: collaborators select" ON public.fiteo_class_schedules;
DROP POLICY IF EXISTS "fiteo_class_schedules: collaborators update minutes" ON public.fiteo_class_schedules;
DROP POLICY IF EXISTS "fiteo_attendance: collaborators select" ON public.fiteo_attendance;
DROP POLICY IF EXISTS "fiteo_attendance: collaborators insert" ON public.fiteo_attendance;
DROP POLICY IF EXISTS "fiteo_courses: collaborators select" ON public.fiteo_courses;

-- 4. RECONFIGURE POLICIES

-- people (Admin & Associate)
DROP POLICY IF EXISTS "people: admin full access" ON public.people;
DROP POLICY IF EXISTS "people: admin and associate access" ON public.people;

CREATE POLICY "people: admin and associate access"
    ON public.people FOR ALL
    TO authenticated
    USING (private.is_associate_or_admin())
    WITH CHECK (private.is_associate_or_admin());

-- FIALN TABLES (Admin & Associate)
-- fialn_student_profiles
DROP POLICY IF EXISTS "fialn_student_profiles: admin full access" ON public.fialn_student_profiles;
DROP POLICY IF EXISTS "fialn_student_profiles: associate access" ON public.fialn_student_profiles;
CREATE POLICY "fialn_student_profiles: associate access"
    ON public.fialn_student_profiles FOR ALL
    TO authenticated
    USING (private.is_associate_or_admin())
    WITH CHECK (private.is_associate_or_admin());

-- fialn_lessons
DROP POLICY IF EXISTS "fialn_lessons: admin full access" ON public.fialn_lessons;
DROP POLICY IF EXISTS "fialn_lessons: associate access" ON public.fialn_lessons;
CREATE POLICY "fialn_lessons: associate access"
    ON public.fialn_lessons FOR ALL
    TO authenticated
    USING (private.is_associate_or_admin())
    WITH CHECK (private.is_associate_or_admin());

-- fialn_groups
DROP POLICY IF EXISTS "fialn_groups: admin full access" ON public.fialn_groups;
DROP POLICY IF EXISTS "fialn_groups: authenticated read" ON public.fialn_groups;
DROP POLICY IF EXISTS "fialn_groups: associate access" ON public.fialn_groups;
CREATE POLICY "fialn_groups: associate access"
    ON public.fialn_groups FOR ALL
    TO authenticated
    USING (private.is_associate_or_admin())
    WITH CHECK (private.is_associate_or_admin());

-- fialn_enrollments
DROP POLICY IF EXISTS "fialn_enrollments: admin full access" ON public.fialn_enrollments;
DROP POLICY IF EXISTS "fialn_enrollments: associate access" ON public.fialn_enrollments;
CREATE POLICY "fialn_enrollments: associate access"
    ON public.fialn_enrollments FOR ALL
    TO authenticated
    USING (private.is_associate_or_admin())
    WITH CHECK (private.is_associate_or_admin());

-- fialn_lesson_bundles
DROP POLICY IF EXISTS "fialn_lesson_bundles: admin full access" ON public.fialn_lesson_bundles;
DROP POLICY IF EXISTS "fialn_lesson_bundles: authenticated read" ON public.fialn_lesson_bundles;
DROP POLICY IF EXISTS "fialn_lesson_bundles: associate access" ON public.fialn_lesson_bundles;
CREATE POLICY "fialn_lesson_bundles: associate access"
    ON public.fialn_lesson_bundles FOR ALL
    TO authenticated
    USING (private.is_associate_or_admin())
    WITH CHECK (private.is_associate_or_admin());

-- FITEO TABLES
-- fiteo_courses (Admin & Associate FULL, Clerk SELECT)
DROP POLICY IF EXISTS "fiteo_courses: admin full access" ON public.fiteo_courses;
DROP POLICY IF EXISTS "fiteo_courses: associate full access" ON public.fiteo_courses;
DROP POLICY IF EXISTS "fiteo_courses: clerk select" ON public.fiteo_courses;

CREATE POLICY "fiteo_courses: associate full access"
    ON public.fiteo_courses FOR ALL
    TO authenticated
    USING (private.is_associate_or_admin())
    WITH CHECK (private.is_associate_or_admin());

CREATE POLICY "fiteo_courses: clerk select"
    ON public.fiteo_courses FOR SELECT
    TO authenticated
    USING (private.can_edit_fiteo_ata());

-- fiteo_class_schedules (Admin & Associate FULL, Clerk SELECT & UPDATE minutes_and_notes)
DROP POLICY IF EXISTS "fiteo_class_schedules: admin full access" ON public.fiteo_class_schedules;
DROP POLICY IF EXISTS "fiteo_class_schedules: associate full access" ON public.fiteo_class_schedules;
DROP POLICY IF EXISTS "fiteo_class_schedules: clerk select" ON public.fiteo_class_schedules;
DROP POLICY IF EXISTS "fiteo_class_schedules: clerk update minutes" ON public.fiteo_class_schedules;

CREATE POLICY "fiteo_class_schedules: associate full access"
    ON public.fiteo_class_schedules FOR ALL
    TO authenticated
    USING (private.is_associate_or_admin())
    WITH CHECK (private.is_associate_or_admin());

CREATE POLICY "fiteo_class_schedules: clerk select"
    ON public.fiteo_class_schedules FOR SELECT
    TO authenticated
    USING (private.can_edit_fiteo_ata());

CREATE POLICY "fiteo_class_schedules: clerk update minutes"
    ON public.fiteo_class_schedules FOR UPDATE
    TO authenticated
    USING (private.can_edit_fiteo_ata())
    WITH CHECK (private.can_edit_fiteo_ata());

-- fiteo_attendance (Admin & Associate FULL)
DROP POLICY IF EXISTS "fiteo_attendance: admin full access" ON public.fiteo_attendance;
DROP POLICY IF EXISTS "fiteo_attendance: associate full access" ON public.fiteo_attendance;

CREATE POLICY "fiteo_attendance: associate full access"
    ON public.fiteo_attendance FOR ALL
    TO authenticated
    USING (private.is_associate_or_admin())
    WITH CHECK (private.is_associate_or_admin());
