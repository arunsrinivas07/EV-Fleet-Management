-- ============================================================
-- Fix: Admin write permissions for drivers/vehicles/alerts
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- PROBLEM:
-- The is_admin() function only checks profiles.role, but some admin
-- users have role='driver' in the profiles table despite signing up
-- as admin (their JWT user_metadata.role is correct).
-- This causes silent RLS write failures on drivers/vehicles/alerts.

-- FIX 1: Update is_admin() to also accept JWT user_metadata.role
-- This makes it consistent with the profiles table policies that
-- already use auth.jwt() -> 'user_metadata' ->> 'role'.
create or replace function public.is_admin()
returns boolean language sql security definer as $$
  select
    coalesce(
      (select role = 'admin' from public.profiles where id = auth.uid()),
      false
    )
    OR
    coalesce(auth.jwt() -> 'user_metadata' ->> 'role', 'driver') = 'admin';
$$;

-- FIX 2: Sync profiles.role for any user whose JWT says 'admin'
-- but profiles table says 'driver'. This fixes the root data mismatch.
-- (One-time cleanup — the updated is_admin() handles future cases.)
UPDATE public.profiles p
SET role = 'admin', updated_at = now()
FROM auth.users u
WHERE p.id = u.id
  AND p.role = 'driver'
  AND coalesce(u.raw_user_meta_data ->> 'role', 'driver') = 'admin';

-- FIX 3: Vehicles without a driver should never be 'running'.
-- One-time cleanup for any currently broken data.
UPDATE public.vehicles v
SET status = 'idle', updated_at = now()
WHERE v.status = 'running'
  AND NOT EXISTS (
    SELECT 1 FROM public.drivers d WHERE d.vehicle_id = v.id
  );

-- FIX 4: When a driver row is DELETED, set their vehicle back to idle.
-- (The existing trigger only handles UPDATEs on vehicle_id.)
CREATE OR REPLACE FUNCTION public.handle_driver_deleted()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF OLD.vehicle_id IS NOT NULL THEN
    UPDATE public.vehicles
    SET status = 'idle', updated_at = now()
    WHERE id = OLD.vehicle_id
      AND status NOT IN ('workshop', 'charging');
  END IF;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS on_driver_deleted ON public.drivers;
CREATE TRIGGER on_driver_deleted
  AFTER DELETE ON public.drivers
  FOR EACH ROW EXECUTE PROCEDURE public.handle_driver_deleted();
