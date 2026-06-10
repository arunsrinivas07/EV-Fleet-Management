-- ============================================================
-- EV Fleet Setup — Grants and Realtime Replication
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- 1. Grant usage and access permissions to Supabase roles
grant usage on schema public to anon, authenticated;
grant select on all tables in schema public to anon, authenticated;
grant insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to anon, authenticated;

-- Ensure these privileges apply automatically to future tables
alter default privileges in schema public grant select on tables to anon, authenticated;
alter default privileges in schema public grant insert, update, delete on tables to authenticated;
alter default privileges in schema public grant usage, select on sequences to anon, authenticated;

-- 2. Configure Realtime Replication (supabase_realtime publication)
do $$
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;
end $$;

-- Safely add vehicles to the replication list
do $$
begin
  if not exists (
    select 1 from pg_publication_rel pr 
    join pg_class c on pr.prrelid = c.oid 
    join pg_namespace n on c.relnamespace = n.oid 
    where pr.prpubid = (select oid from pg_publication where pubname = 'supabase_realtime')
    and n.nspname = 'public' and c.relname = 'vehicles'
  ) then
    alter publication supabase_realtime add table public.vehicles;
  end if;
end $$;

-- Safely add alerts to the replication list
do $$
begin
  if not exists (
    select 1 from pg_publication_rel pr 
    join pg_class c on pr.prrelid = c.oid 
    join pg_namespace n on c.relnamespace = n.oid 
    where pr.prpubid = (select oid from pg_publication where pubname = 'supabase_realtime')
    and n.nspname = 'public' and c.relname = 'alerts'
  ) then
    alter publication supabase_realtime add table public.alerts;
  end if;
end $$;

-- 3. Configure Replica Identity for proper realtime payloads during updates
alter table public.vehicles replica identity full;
alter table public.alerts replica identity full;
