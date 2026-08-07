-- ============================================================
-- FI ECOSYSTEM — Grant Read-Only Attendance Access to Clerk
-- Migration: 20260807010000_clerk_read_attendance.sql
-- ============================================================

-- 1. SELECT POLICY ON fiteo_attendance FOR CLERK
DROP POLICY IF EXISTS "fiteo_attendance: clerk select" ON public.fiteo_attendance;

CREATE POLICY "fiteo_attendance: clerk select"
    ON public.fiteo_attendance FOR SELECT
    TO authenticated
    USING (private.can_edit_fiteo_ata());

-- 2. SELECT POLICY ON people FOR CLERK (Required for joining student names in FITEO attendance)
DROP POLICY IF EXISTS "people: clerk select" ON public.people;

CREATE POLICY "people: clerk select"
    ON public.people FOR SELECT
    TO authenticated
    USING (private.can_edit_fiteo_ata());

-- 3. SELECT POLICIES ON fialn_enrollments AND fialn_groups FOR CLERK (Required for querying enrolled students in FITEO)
DROP POLICY IF EXISTS "fialn_enrollments: clerk select" ON public.fialn_enrollments;

CREATE POLICY "fialn_enrollments: clerk select"
    ON public.fialn_enrollments FOR SELECT
    TO authenticated
    USING (private.can_edit_fiteo_ata());

DROP POLICY IF EXISTS "fialn_groups: clerk select" ON public.fialn_groups;

CREATE POLICY "fialn_groups: clerk select"
    ON public.fialn_groups FOR SELECT
    TO authenticated
    USING (private.can_edit_fiteo_ata());
