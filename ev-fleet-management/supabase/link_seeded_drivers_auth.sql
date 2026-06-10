-- ============================================================================
-- Link Seeded Drivers to Auth Users & Profiles
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- 
-- This script:
-- 1. Disables the auth trigger temporarily to prevent duplicate driver rows.
-- 2. Creates auth users in auth.users for all 25 seeded drivers (if missing).
--    Default password: 'password123'
--    Emails: lowercased driver name (e.g., priya@evfleet.in)
-- 3. Creates matching profile rows in public.profiles.
-- 4. Links the new profile_id to the existing drivers table row.
-- 5. Re-enables the auth trigger.
-- ============================================================================

-- Disable trigger on auth.users temporarily to prevent double creation of driver rows
ALTER TABLE auth.users DISABLE TRIGGER on_auth_user_created;

DO $$
DECLARE
  drv RECORD;
  new_uid uuid;
  hashed_pwd text;
  driver_email text;
BEGIN
  -- Hashed password for 'password123' using Supabase's default bcrypt (pgcrypto)
  hashed_pwd := extensions.crypt('password123', extensions.gen_salt('bf'));

  FOR drv IN 
    SELECT id, name FROM public.drivers WHERE profile_id IS NULL
  LOOP
    -- Construct email: name without spaces in lowercase + @evfleet.in
    driver_email := lower(replace(drv.name, ' ', '')) || '@evfleet.in';

    -- Generate a new UUID for the user
    new_uid := gen_random_uuid();

    -- Check if the email already exists in auth.users
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = driver_email) THEN
      -- Insert into auth.users
      INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, 
        email_confirmed_at, raw_app_meta_data, raw_user_meta_data, 
        is_super_admin, created_at, updated_at
      )
      VALUES (
        '00000000-0000-0000-0000-000000000000',
        new_uid,
        'authenticated',
        'authenticated',
        driver_email,
        hashed_pwd,
        now(),
        '{"provider": "email", "providers": ["email"]}'::jsonb,
        jsonb_build_object('role', 'driver', 'full_name', drv.name),
        false,
        now(),
        now()
      );

      -- Insert into public.profiles
      INSERT INTO public.profiles (id, full_name, role, created_at, updated_at)
      VALUES (new_uid, drv.name, 'driver', now(), now())
      ON CONFLICT (id) DO NOTHING;

      -- Update the driver table to link to this new profile
      UPDATE public.drivers
      SET profile_id = new_uid
      WHERE id = drv.id;
      
      RAISE NOTICE 'Linked driver % (%) to new user %', drv.id, drv.name, driver_email;
    ELSE
      -- If the user already exists, retrieve their UID
      SELECT id INTO new_uid FROM auth.users WHERE email = driver_email;
      
      -- Ensure profile exists
      INSERT INTO public.profiles (id, full_name, role, created_at, updated_at)
      VALUES (new_uid, drv.name, 'driver', now(), now())
      ON CONFLICT (id) DO UPDATE SET role = 'driver';

      -- Update the driver table to link to this profile
      UPDATE public.drivers
      SET profile_id = new_uid
      WHERE id = drv.id;

      RAISE NOTICE 'Linked existing user % to driver % (%)', driver_email, drv.id, drv.name;
    END IF;

  END LOOP;
END $$;

-- Re-enable the trigger
ALTER TABLE auth.users ENABLE TRIGGER on_auth_user_created;
