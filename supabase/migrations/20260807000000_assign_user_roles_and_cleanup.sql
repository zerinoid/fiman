-- ============================================================
-- FI ECOSYSTEM — Assign User Roles & Cleanup Obsolete Types
-- Migration: 20260807000000_assign_user_roles_and_cleanup.sql
-- ============================================================

-- 1. DROP OBSOLETE TYPE IF IT EXISTS IN POSTGRES
DROP TYPE IF EXISTS public.user_role_type CASCADE;

-- 2. ALTER DEFAULT ROLE ON PROFILES TABLE
ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'associate';

-- 3. ASSIGN ROLES TO EXISTING PROFILES BY NAME
-- Leo Zerino -> admin
UPDATE public.profiles
SET role = 'admin'
WHERE full_name ILIKE '%Leo%'
   OR full_name ILIKE '%Zerino%';

-- Maia e Mariana Rodeso -> associate
UPDATE public.profiles
SET role = 'associate'
WHERE full_name ILIKE '%Maia%'
   OR full_name ILIKE '%Mariana%'
   OR full_name ILIKE '%Rodeso%';

-- Marina -> clerk
UPDATE public.profiles
SET role = 'clerk'
WHERE full_name ILIKE '%Marina%';

-- 4. ASSIGN ROLES BY AUTH.USERS EMAIL (IF APPLICABLE)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'auth' AND table_name = 'users'
  ) THEN
    UPDATE public.profiles p
    SET role = 'admin'
    FROM auth.users u
    WHERE p.id = u.id
      AND (u.email ILIKE '%leo%' OR u.email ILIKE '%zerino%');

    UPDATE public.profiles p
    SET role = 'associate'
    FROM auth.users u
    WHERE p.id = u.id
      AND (u.email ILIKE '%maia%' OR u.email ILIKE '%mari%')
      AND u.email NOT ILIKE '%marina%';

    UPDATE public.profiles p
    SET role = 'clerk'
    FROM auth.users u
    WHERE p.id = u.id
      AND u.email ILIKE '%marina%';
  END IF;
END $$;
