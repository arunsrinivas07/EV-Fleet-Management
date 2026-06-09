-- ============================================================
-- EV Fleet Management — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- 1. Profiles table (extends auth.users with fleet-specific data)
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  phone       text,
  role        text not null default 'driver' check (role in ('admin', 'driver')),
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- 2. Enable Row Level Security
alter table public.profiles enable row level security;

-- 3. Drop any old policies first (safe to re-run)
drop policy if exists "Users can view own profile"     on public.profiles;
drop policy if exists "Users can update own profile"   on public.profiles;
drop policy if exists "Admins can view all profiles"   on public.profiles;
drop policy if exists "Admins can update all profiles" on public.profiles;

-- 4. RLS Policies (no self-referencing queries — avoids infinite recursion)

-- Every authenticated user can read their own row
create policy "Users can view own profile"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

-- Every authenticated user can update their own row
create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Admins: use auth.jwt() to read the role from the JWT metadata
-- (set via user_metadata on sign-up — no recursive table lookup needed)
create policy "Admins can view all profiles"
  on public.profiles for select
  to authenticated
  using (
    coalesce(auth.jwt() -> 'user_metadata' ->> 'role', 'driver') = 'admin'
  );

create policy "Admins can update all profiles"
  on public.profiles for update
  to authenticated
  using (
    coalesce(auth.jwt() -> 'user_metadata' ->> 'role', 'driver') = 'admin'
  );

-- 5. Service-role INSERT (used by the trigger below — runs as definer)
create policy "Service role can insert profiles"
  on public.profiles for insert
  with check (true);

-- 6. Auto-create a profile row when a new user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone, role)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'phone',
    coalesce(new.raw_user_meta_data ->> 'role', 'driver')
  )
  on conflict (id) do nothing;   -- safe to re-run
  return new;
end;
$$;

-- 7. Trigger fires after every new auth.users insert
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 8. Auto-update updated_at timestamp
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();
