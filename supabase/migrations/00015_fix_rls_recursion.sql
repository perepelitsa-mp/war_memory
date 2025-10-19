-- =====================================================
-- Fix recursive RLS policies causing PostgREST failures
-- =====================================================
-- File: 00015_fix_rls_recursion.sql
-- Purpose: Break cyclic dependencies between policies on
--          public.fallen and public.editors by introducing
--          helper functions executed with elevated privileges
--          and restructuring the policies to avoid recursion.
-- Date: 2025-10-19

-- Ensure helper functions run with a predictable search path
SET search_path = public;

-- =====================================================
-- Helper functions
-- =====================================================

CREATE OR REPLACE FUNCTION public.has_admin_role(_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users u
    WHERE u.id = _user_id
      AND u.role IN ('admin', 'moderator', 'superadmin')
      AND NOT u.is_deleted
  );
$$;

COMMENT ON FUNCTION public.has_admin_role(uuid) IS
  'Returns true when the given user has an elevated administrative role.';

GRANT EXECUTE ON FUNCTION public.has_admin_role(uuid) TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.is_fallen_editor(_fallen_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.editors e
    WHERE e.fallen_id = _fallen_id
      AND e.user_id = _user_id
      AND NOT e.is_deleted
  );
$$;

COMMENT ON FUNCTION public.is_fallen_editor(uuid, uuid) IS
  'Checks whether the given user is an active editor for the specified fallen record.';

GRANT EXECUTE ON FUNCTION public.is_fallen_editor(uuid, uuid) TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.is_fallen_owner(_fallen_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.fallen f
    WHERE f.id = _fallen_id
      AND f.owner_id = _user_id
      AND NOT f.is_deleted
  );
$$;

COMMENT ON FUNCTION public.is_fallen_owner(uuid, uuid) IS
  'Determines whether the supplied user is the owner of the specified fallen record.';

GRANT EXECUTE ON FUNCTION public.is_fallen_owner(uuid, uuid) TO anon, authenticated, service_role;

-- =====================================================
-- public.fallen policies
-- =====================================================

DROP POLICY IF EXISTS "Public read approved fallen" ON public.fallen;
DROP POLICY IF EXISTS "Owner and editors can update fallen" ON public.fallen;
DROP POLICY IF EXISTS "Owner read own fallen" ON public.fallen;
DROP POLICY IF EXISTS "Editors read assigned fallen" ON public.fallen;
DROP POLICY IF EXISTS "Admins read all fallen" ON public.fallen;

CREATE POLICY "Public read approved fallen"
  ON public.fallen FOR SELECT
  USING (
    status = 'approved'
    AND NOT is_deleted
  );

CREATE POLICY "Owner read own fallen"
  ON public.fallen FOR SELECT
  USING (auth.uid() IS NOT NULL AND owner_id = auth.uid());

CREATE POLICY "Editors read assigned fallen"
  ON public.fallen FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND public.is_fallen_editor(id, auth.uid())
  );

CREATE POLICY "Admins read all fallen"
  ON public.fallen FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND public.has_admin_role(auth.uid())
  );

CREATE POLICY "Owner and editors can update fallen"
  ON public.fallen FOR UPDATE
  USING (
    auth.uid() IS NOT NULL
    AND (
      owner_id = auth.uid()
      OR public.is_fallen_editor(id, auth.uid())
      OR public.has_admin_role(auth.uid())
    )
  )
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND (
      owner_id = auth.uid()
      OR public.is_fallen_editor(id, auth.uid())
      OR public.has_admin_role(auth.uid())
    )
  );

GRANT SELECT ON public.fallen TO anon, authenticated, service_role;
GRANT UPDATE ON public.fallen TO authenticated, service_role;

-- =====================================================
-- public.editors policies
-- =====================================================

DROP POLICY IF EXISTS "Editors read policy" ON public.editors;

CREATE POLICY "Editors read policy"
  ON public.editors FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND (
      user_id = auth.uid()
      OR public.is_fallen_owner(fallen_id, auth.uid())
      OR public.has_admin_role(auth.uid())
    )
  );

DROP POLICY IF EXISTS "Owner can invite editors" ON public.editors;

CREATE POLICY "Owner can invite editors"
  ON public.editors FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND (
      public.is_fallen_owner(fallen_id, auth.uid())
      OR public.has_admin_role(auth.uid())
    )
  );

GRANT SELECT ON public.editors TO authenticated, service_role;
GRANT INSERT ON public.editors TO authenticated, service_role;

-- =====================================================
-- Ensure policy cache reload
-- =====================================================
NOTIFY pgrst, 'reload config';
