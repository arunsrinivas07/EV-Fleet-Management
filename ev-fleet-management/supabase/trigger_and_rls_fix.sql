-- ============================================================
-- Complete fix: Trigger + RLS for driver registration flow
-- Run in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- ── 1. Recreate handle_new_user trigger (robust ID generation) ────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  next_driver_id text;
  max_num        int;
BEGIN
  -- ── Create/update profile row ──────────────────────────────────────────────
  INSERT INTO public.profiles (id, full_name, phone, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data ->> 'phone', ''),
    COALESCE(new.raw_user_meta_data ->> 'role', 'driver')
  )
  ON CONFLICT (id) DO UPDATE
    SET full_name  = EXCLUDED.full_name,
        phone      = EXCLUDED.phone,
        role       = EXCLUDED.role,
        updated_at = now();

  -- ── If driver role, create drivers row with vehicle_id = NULL ─────────────
  IF COALESCE(new.raw_user_meta_data ->> 'role', 'driver') = 'driver' THEN

    -- Only create if not already exists for this profile_id
    IF NOT EXISTS (SELECT 1 FROM public.drivers WHERE profile_id = new.id) THEN

      -- Generate next D-NNN id safely
      SELECT COALESCE(
        MAX(
          CASE
            WHEN id ~ '^D-[0-9]+$'
            THEN substring(id FROM 3)::int
            ELSE 0
          END
        ), 0
      ) + 1
      INTO max_num
      FROM public.drivers;

      next_driver_id := 'D-' || LPAD(max_num::text, 3, '0');

      INSERT INTO public.drivers (
        id, profile_id, name, avatar, vehicle_id,
        trips, overspeed, hard_braking, aggressive_accel,
        safety_score, efficiency_score,
        today_earnings, total_earnings, avg_speed, energy_consumed
      ) VALUES (
        next_driver_id,
        new.id,
        COALESCE(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
        UPPER(SUBSTRING(COALESCE(new.raw_user_meta_data ->> 'full_name', new.email), 1, 2)),
        NULL,   -- ← vehicle_id starts as NULL, assigned by admin later
        0, 0, 0, 0,
        100, 100,
        0, 0, 0, 0
      );

    END IF;
  END IF;

  RETURN new;
END;
$$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- ── 2. RLS: drivers table ─────────────────────────────────────────────────────

-- Drop ALL existing driver policies
DROP POLICY IF EXISTS "Anyone can read drivers"   ON public.drivers;
DROP POLICY IF EXISTS "Admins can write drivers"  ON public.drivers;
DROP POLICY IF EXISTS "Admins write drivers"      ON public.drivers;
DROP POLICY IF EXISTS "Drivers read own"          ON public.drivers;

-- All authenticated users can read all drivers (needed for assignment panel)
CREATE POLICY "Anyone can read drivers"
  ON public.drivers FOR SELECT
  TO authenticated
  USING (true);

-- Admins can insert/update/delete any driver row
-- Uses JWT user_metadata check — no recursive profile lookup
CREATE POLICY "Admins can write drivers"
  ON public.drivers FOR ALL
  TO authenticated
  USING (
    COALESCE(
      (auth.jwt() -> 'user_metadata' ->> 'role'),
      (auth.jwt() -> 'app_metadata'  ->> 'role'),
      'driver'
    ) = 'admin'
  )
  WITH CHECK (
    COALESCE(
      (auth.jwt() -> 'user_metadata' ->> 'role'),
      (auth.jwt() -> 'app_metadata'  ->> 'role'),
      'driver'
    ) = 'admin'
  );


-- ── 3. RLS: vehicles table ────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Anyone can read vehicles"  ON public.vehicles;
DROP POLICY IF EXISTS "Admins can write vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Admins write vehicles"     ON public.vehicles;

CREATE POLICY "Anyone can read vehicles"
  ON public.vehicles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can write vehicles"
  ON public.vehicles FOR ALL
  TO authenticated
  USING (
    COALESCE(
      (auth.jwt() -> 'user_metadata' ->> 'role'),
      (auth.jwt() -> 'app_metadata'  ->> 'role'),
      'driver'
    ) = 'admin'
  )
  WITH CHECK (
    COALESCE(
      (auth.jwt() -> 'user_metadata' ->> 'role'),
      (auth.jwt() -> 'app_metadata'  ->> 'role'),
      'driver'
    ) = 'admin'
  );


-- ── 4. is_admin() helper (used elsewhere) ────────────────────────────────────
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin',
    (auth.jwt() -> 'app_metadata'  ->> 'role') = 'admin',
    false
  );
$$;


-- ── 5. Verify: check existing drivers without vehicle ─────────────────────────
-- Run this after applying to confirm trigger-created drivers appear:
-- SELECT id, name, profile_id, vehicle_id, created_at
-- FROM public.drivers
-- WHERE vehicle_id IS NULL
-- ORDER BY created_at DESC
-- LIMIT 10;
