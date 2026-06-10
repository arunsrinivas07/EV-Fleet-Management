-- ============================================================
-- Fix: profiles table RLS policies
-- Run this in Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- 1. Drop ALL existing policies on profiles (clean slate)
drop policy if exists "Users can view own profile"       on public.profiles;
drop policy if exists "Users can update own profile"     on public.profiles;
drop policy if exists "Admins can view all profiles"     on public.profiles;
drop policy if exists "Admins can update all profiles"   on public.profiles;
drop policy if exists "Service role can insert profiles" on public.profiles;

-- 2. SELECT: each user can only read their own row
--    (no self-referencing subquery → no recursion)
create policy "Users can view own profile"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

-- 3. UPDATE: each user can only update their own row
create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- 4. INSERT: only allow inserting a row for your own id
--    (the trigger runs as security definer so it bypasses RLS, but this
--     prevents any rogue client from inserting a row for another user's id)
create policy "Users can insert own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

-- 5. Admin SELECT: reads role from JWT user_metadata (no recursive query)
create policy "Admins can view all profiles"
  on public.profiles for select
  to authenticated
  using (
    coalesce(
      (auth.jwt() -> 'user_metadata' ->> 'role'),
      'driver'
    ) = 'admin'
  );

-- 6. Admin UPDATE: same JWT-based check
create policy "Admins can update all profiles"
  on public.profiles for update
  to authenticated
  using (
    coalesce(
      (auth.jwt() -> 'user_metadata' ->> 'role'),
      'driver'
    ) = 'admin'
  );

-- ============================================================
-- Also re-create the trigger function in case it was missing
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  next_driver_id text;
begin
  insert into public.profiles (id, full_name, phone, role)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'phone',
    coalesce(new.raw_user_meta_data ->> 'role', 'driver')
  )
  on conflict (id) do update
    set
      full_name  = excluded.full_name,
      phone      = excluded.phone,
      role       = excluded.role,
      updated_at = now();

  -- If it's a driver, also auto-create a row in public.drivers table
  if coalesce(new.raw_user_meta_data ->> 'role', 'driver') = 'driver' then
    if not exists (select 1 from public.drivers where profile_id = new.id) then
      select 'D-' || lpad((coalesce(max(substring(id from 3)::integer), 0) + 1)::text, 3, '0')
      into next_driver_id
      from public.drivers;

      insert into public.drivers (id, profile_id, name, avatar, vehicle_id)
      values (
        next_driver_id,
        new.id,
        coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
        upper(substring(coalesce(new.raw_user_meta_data ->> 'full_name', new.email), 1, 2)),
        null
      );
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
