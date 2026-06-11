-- ============================================================
-- SQL Patch: Fix Missing Drivers & Table Privileges
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- NOTE: If the trigger 'on_auth_user_created' on 'auth.users' table is disabled,
-- please enable it in your Supabase Dashboard UI under (Database → Triggers)
-- rather than running ALTER TABLE, since ALTER TABLE requires superuser/owner privileges.

-- 1. Backfill missing profiles for existing auth users who registered as drivers
INSERT INTO public.profiles (id, full_name, phone, role, created_at, updated_at)
SELECT 
  u.id, 
  COALESCE(u.raw_user_meta_data ->> 'full_name', split_part(u.email, '@', 1)),
  COALESCE(u.raw_user_meta_data ->> 'phone', ''),
  COALESCE(u.raw_user_meta_data ->> 'role', 'driver'),
  u.created_at,
  u.updated_at
FROM auth.users u
WHERE COALESCE(u.raw_user_meta_data ->> 'role', 'driver') = 'driver'
  AND NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id)
ON CONFLICT (id) DO NOTHING;

-- 2. Backfill missing drivers for existing profiles who do not have a driver row
DO $$
DECLARE
  usr RECORD;
  next_driver_id text;
BEGIN
  FOR usr IN 
    SELECT 
      u.id, 
      COALESCE(u.raw_user_meta_data ->> 'full_name', split_part(u.email, '@', 1)) AS name
    FROM auth.users u
    WHERE COALESCE(u.raw_user_meta_data ->> 'role', 'driver') = 'driver'
      AND NOT EXISTS (SELECT 1 FROM public.drivers d WHERE d.profile_id = u.id)
  LOOP
    -- Generate the next D-XXX sequential ID
    SELECT 'D-' || LPAD((COALESCE(MAX(SUBSTRING(id FROM 3)::INTEGER), 0) + 1)::TEXT, 3, '0')
    INTO next_driver_id
    FROM public.drivers;

    INSERT INTO public.drivers (
      id, profile_id, name, avatar, vehicle_id, 
      trips, overspeed, hard_braking, aggressive_accel, 
      safety_score, efficiency_score, today_earnings, total_earnings, 
      avg_speed, energy_consumed, created_at, updated_at
    )
    VALUES (
      next_driver_id,
      usr.id,
      usr.name,
      UPPER(SUBSTRING(usr.name, 1, 2)),
      NULL,
      0, 0, 0, 0,
      95, 90, 0, 0,
      0, 0,
      now(),
      now()
    );
  END LOOP;
END $$;

-- 3. Grant table privileges to service_role to prevent permission denied errors in admin scripts
GRANT USAGE ON SCHEMA public TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;
