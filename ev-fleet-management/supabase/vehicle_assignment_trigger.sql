-- ============================================================
-- Vehicle Assignment Trigger
-- Automatically sets unassigned vehicles to 'idle' status
-- Run in: Supabase Dashboard → SQL Editor
-- ============================================================

-- Function: when a driver's vehicle_id changes, update vehicle statuses
create or replace function public.handle_vehicle_assignment()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  -- If vehicle was unassigned (vehicle_id set to null or changed)
  if OLD.vehicle_id is not null and OLD.vehicle_id is distinct from NEW.vehicle_id then
    -- Set the old vehicle back to idle (no longer has a driver)
    update public.vehicles
    set status = 'idle', updated_at = now()
    where id = OLD.vehicle_id
      and status not in ('workshop', 'charging'); -- don't override workshop/charging
  end if;

  -- If a new vehicle was just assigned, ensure it's at least idle
  if NEW.vehicle_id is not null and NEW.vehicle_id is distinct from OLD.vehicle_id then
    update public.vehicles
    set status = 'idle', updated_at = now()
    where id = NEW.vehicle_id
      and status not in ('workshop', 'charging', 'running');
  end if;

  return NEW;
end;
$$;

-- Attach trigger to drivers table
drop trigger if exists on_driver_vehicle_assignment on public.drivers;
create trigger on_driver_vehicle_assignment
  after update of vehicle_id on public.drivers
  for each row execute procedure public.handle_vehicle_assignment();

-- One-time cleanup: set all currently unassigned vehicles to idle
-- (only those stuck as 'running' with no driver)
update public.vehicles v
set status = 'idle', updated_at = now()
where v.status = 'running'
  and not exists (
    select 1 from public.drivers d where d.vehicle_id = v.id
  );
