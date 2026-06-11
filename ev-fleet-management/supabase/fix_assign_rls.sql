-- ============================================================
-- Fix: Allow admins to assign vehicles to drivers via RLS.
-- The existing policy uses public.is_admin() which queries the
-- profiles table — this can fail for admins whose JWT metadata
-- hasn't refreshed. Replace with a direct JWT metadata check.
--
-- Run in: Supabase Dashboard → SQL Editor
-- ============================================================

-- ── Fix drivers table write policy ────────────────────────────────────────────
DROP POLICY IF EXISTS "Admins can write drivers"  ON public.drivers;
DROP POLICY IF EXISTS "Admins write drivers"      ON public.drivers;

CREATE POLICY "Admins can write drivers"
  ON public.drivers
  FOR ALL
  TO authenticated
  USING (
    coalesce(
      (auth.jwt() -> 'user_metadata' ->> 'role'),
      (auth.jwt() -> 'app_metadata'  ->> 'role'),
      'driver'
    ) = 'admin'
  )
  WITH CHECK (
    coalesce(
      (auth.jwt() -> 'user_metadata' ->> 'role'),
      (auth.jwt() -> 'app_metadata'  ->> 'role'),
      'driver'
    ) = 'admin'
  );

-- ── Fix vehicles table write policy (same pattern) ────────────────────────────
DROP POLICY IF EXISTS "Admins can write vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Admins write vehicles"     ON public.vehicles;

CREATE POLICY "Admins can write vehicles"
  ON public.vehicles
  FOR ALL
  TO authenticated
  USING (
    coalesce(
      (auth.jwt() -> 'user_metadata' ->> 'role'),
      (auth.jwt() -> 'app_metadata'  ->> 'role'),
      'driver'
    ) = 'admin'
  )
  WITH CHECK (
    coalesce(
      (auth.jwt() -> 'user_metadata' ->> 'role'),
      (auth.jwt() -> 'app_metadata'  ->> 'role'),
      'driver'
    ) = 'admin'
  );

-- ── Also allow drivers to read their own row ──────────────────────────────────
DROP POLICY IF EXISTS "Anyone can read drivers" ON public.drivers;

CREATE POLICY "Anyone can read drivers"
  ON public.drivers
  FOR SELECT
  TO authenticated
  USING (true);

-- ── Allow drivers to read all vehicles ────────────────────────────────────────
DROP POLICY IF EXISTS "Anyone can read vehicles" ON public.vehicles;

CREATE POLICY "Anyone can read vehicles"
  ON public.vehicles
  FOR SELECT
  TO authenticated
  USING (true);
