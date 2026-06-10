-- ============================================================
-- EV Fleet Management — Full Supabase Backend Schema
-- Run in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- ── 1. PROFILES (auth extension, already exists from fix_rls.sql) ────────────
-- Skip if already created. Otherwise:
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  phone       text,
  role        text not null default 'driver' check (role in ('admin','driver')),
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ── 2. VEHICLES ──────────────────────────────────────────────────────────────
create table if not exists public.vehicles (
  id               text primary key,              -- 'EV-001'
  model            text not null,
  manufacturer     text not null,
  image_url        text,
  battery_capacity text,
  status           text not null default 'idle'
                   check (status in ('running','charging','idle','workshop')),
  battery_percent  numeric(5,2) not null default 100,
  battery_health   numeric(5,2) not null default 100,
  speed            numeric(6,2) not null default 0,
  location         text,
  lat              numeric(9,6),
  lng              numeric(9,6),
  range_km         numeric(7,2) not null default 0,
  revenue          numeric(12,2) not null default 0,
  total_distance   numeric(10,2) not null default 0,
  is_charging      boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ── 3. DRIVERS ───────────────────────────────────────────────────────────────
create table if not exists public.drivers (
  id                 text primary key,            -- 'D-001'
  profile_id         uuid references public.profiles(id) on delete set null,
  name               text not null,
  vehicle_id         text references public.vehicles(id) on delete set null,
  avatar             text,
  trips              int not null default 0,
  overspeed          int not null default 0,
  hard_braking       int not null default 0,
  aggressive_accel   int not null default 0,
  safety_score       numeric(5,2) not null default 100,
  efficiency_score   numeric(5,2) not null default 100,
  today_earnings     numeric(12,2) not null default 0,
  total_earnings     numeric(12,2) not null default 0,
  avg_speed          numeric(6,2) not null default 0,
  energy_consumed    numeric(8,2) not null default 0,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- ── 4. VEHICLE SERVICE HISTORY ───────────────────────────────────────────────
create table if not exists public.vehicle_service_history (
  id          bigserial primary key,
  vehicle_id  text not null references public.vehicles(id) on delete cascade,
  description text not null,
  service_date date not null default current_date,
  created_at  timestamptz not null default now()
);

-- ── 5. VEHICLE MAINTENANCE RECORDS ───────────────────────────────────────────
create table if not exists public.vehicle_maintenance_records (
  id          bigserial primary key,
  vehicle_id  text not null references public.vehicles(id) on delete cascade,
  description text not null,
  status      text not null default 'pending'
              check (status in ('pending','in_progress','completed')),
  scheduled_date date,
  created_at  timestamptz not null default now()
);

-- ── 6. VEHICLE EXPENSES ──────────────────────────────────────────────────────
create table if not exists public.vehicle_expenses (
  id          bigserial primary key,
  vehicle_id  text not null references public.vehicles(id) on delete cascade,
  type        text not null check (type in ('Charging','Maintenance','Insurance','Misc')),
  amount      numeric(12,2) not null,
  note        text,
  expense_date date not null default current_date,
  created_at  timestamptz not null default now()
);

-- ── 7. ALERTS ────────────────────────────────────────────────────────────────
create table if not exists public.alerts (
  id          bigserial primary key,
  type        text not null,
  title       text not null,
  message     text not null,
  vehicle_id  text references public.vehicles(id) on delete cascade,
  severity    text not null default 'info'
              check (severity in ('critical','warning','info')),
  resolved    boolean not null default false,
  resolved_at timestamptz,
  created_at  timestamptz not null default now()
);

-- ── 8. TRIPS ─────────────────────────────────────────────────────────────────
create table if not exists public.trips (
  id           text primary key,                 -- 'T-001'
  driver_id    text references public.drivers(id) on delete set null,
  vehicle_id   text references public.vehicles(id) on delete set null,
  from_location text not null,
  to_location  text not null,
  distance_km  numeric(8,2) not null default 0,
  duration_min int not null default 0,
  earnings     numeric(12,2) not null default 0,
  energy_kwh   numeric(8,2) not null default 0,
  trip_date    date not null default current_date,
  created_at   timestamptz not null default now()
);

-- ── 9. CHARGING STATIONS ─────────────────────────────────────────────────────
create table if not exists public.charging_stations (
  id          text primary key,
  name        text not null,
  location    text not null,
  lat         numeric(9,6),
  lng         numeric(9,6),
  available   int not null default 0,
  total       int not null default 0,
  power       text,
  created_at  timestamptz not null default now()
);

-- ── 10. REVENUE SNAPSHOTS (for charts) ───────────────────────────────────────
create table if not exists public.revenue_snapshots (
  id          bigserial primary key,
  period_type text not null check (period_type in ('daily','weekly','monthly','yearly')),
  period_label text not null,                    -- 'Mon', 'W1', 'Jan', etc.
  revenue     numeric(14,2) not null default 0,
  target      numeric(14,2) not null default 0,
  snapshot_date date not null default current_date,
  created_at  timestamptz not null default now()
);

-- ── 11. AUTO-UPDATE updated_at ────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

do $$ declare
  t text;
begin
  foreach t in array array['profiles','vehicles','drivers'] loop
    execute format('
      drop trigger if exists set_%I_updated_at on public.%I;
      create trigger set_%I_updated_at
        before update on public.%I
        for each row execute procedure public.set_updated_at();
    ', t, t, t, t);
  end loop;
end $$;

-- ── 12. ROW LEVEL SECURITY ────────────────────────────────────────────────────
alter table public.vehicles                enable row level security;
alter table public.drivers                 enable row level security;
alter table public.vehicle_service_history enable row level security;
alter table public.vehicle_maintenance_records enable row level security;
alter table public.vehicle_expenses        enable row level security;
alter table public.alerts                  enable row level security;
alter table public.trips                   enable row level security;
alter table public.charging_stations       enable row level security;
alter table public.revenue_snapshots       enable row level security;

-- Helper: is the current user an admin?
create or replace function public.is_admin()
returns boolean language sql security definer as $$
  select coalesce(
    (select role = 'admin' from public.profiles where id = auth.uid()),
    false
  );
$$;

-- Vehicles: all authenticated users can read; only admins can write
drop policy if exists "Anyone can read vehicles"   on public.vehicles;
drop policy if exists "Admins can write vehicles"  on public.vehicles;
create policy "Anyone can read vehicles"  on public.vehicles for select to authenticated using (true);
create policy "Admins can write vehicles" on public.vehicles for all    to authenticated using (public.is_admin());

-- Drivers: all can read; only admins can write
drop policy if exists "Anyone can read drivers"   on public.drivers;
drop policy if exists "Admins can write drivers"  on public.drivers;
create policy "Anyone can read drivers"  on public.drivers for select to authenticated using (true);
create policy "Admins can write drivers" on public.drivers for all    to authenticated using (public.is_admin());

-- Service history, maintenance, expenses: read = auth; write = admin
do $$ declare t text; begin
  foreach t in array array[
    'vehicle_service_history','vehicle_maintenance_records','vehicle_expenses'
  ] loop
    execute format('
      drop policy if exists "read_%I" on public.%I;
      drop policy if exists "write_%I" on public.%I;
      create policy "read_%I"  on public.%I for select to authenticated using (true);
      create policy "write_%I" on public.%I for all    to authenticated using (public.is_admin());
    ', t,t,t,t,t,t,t,t);
  end loop;
end $$;

-- Alerts: read = auth; resolve/create = admin
drop policy if exists "read_alerts"   on public.alerts;
drop policy if exists "write_alerts"  on public.alerts;
create policy "read_alerts"  on public.alerts for select to authenticated using (true);
create policy "write_alerts" on public.alerts for all    to authenticated using (public.is_admin());

-- Trips: drivers see own trips; admins see all
drop policy if exists "Drivers see own trips" on public.trips;
drop policy if exists "Admins see all trips"  on public.trips;
create policy "Drivers see own trips" on public.trips for select to authenticated
  using (driver_id = (select d.id from public.drivers d where d.profile_id = auth.uid() limit 1));
create policy "Admins see all trips"  on public.trips for select to authenticated
  using (public.is_admin());
create policy "Admins write trips"    on public.trips for all to authenticated
  using (public.is_admin());

-- Charging stations, revenue: all can read; admins write
drop policy if exists "read_cs"  on public.charging_stations;
drop policy if exists "write_cs" on public.charging_stations;
create policy "read_cs"  on public.charging_stations for select to authenticated using (true);
create policy "write_cs" on public.charging_stations for all    to authenticated using (public.is_admin());

drop policy if exists "read_rev"  on public.revenue_snapshots;
drop policy if exists "write_rev" on public.revenue_snapshots;
create policy "read_rev"  on public.revenue_snapshots for select to authenticated using (true);
create policy "write_rev" on public.revenue_snapshots for all    to authenticated using (public.is_admin());


-- ── 13. SEED DATA ─────────────────────────────────────────────────────────────

-- Vehicles
insert into public.vehicles (id,model,manufacturer,image_url,battery_capacity,status,battery_percent,battery_health,speed,location,lat,lng,range_km,revenue,total_distance,is_charging) values
('EV-001','Tata Nexon EV Max','Tata','https://images.unsplash.com/photo-1593941707882-a56bab827c5e?w=400&h=250&fit=crop','40.5 kWh','running',78,94,54,'Connaught Place, New Delhi',28.6315,77.2167,287,18400,12450,false),
('EV-002','MG ZS EV','MG Motor','https://images.unsplash.com/photo-1605559424843-9073730702d0?w=400&h=250&fit=crop','50.3 kWh','charging',45,88,0,'Bandra, Mumbai',19.0596,72.8295,185,14200,8320,true),
('EV-003','Hyundai Ioniq 5','Hyundai','https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=400&h=250&fit=crop','72.6 kWh','running',91,97,62,'Koramangala, Bengaluru',12.9352,77.6245,481,22100,5780,false),
('EV-004','Kia EV6','Kia','https://images.unsplash.com/photo-1610777988688-3671e03dbdf1?w=400&h=250&fit=crop','77.4 kWh','workshop',23,79,0,'Service Centre, Pune',18.5204,73.8567,92,8450,22340,false),
('EV-005','BYD Atto 3','BYD','https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop','60.48 kWh','idle',65,92,0,'Chennai Airport, Chennai',12.9941,80.1709,320,16800,9870,false),
('EV-006','Tata Tigor EV','Tata','https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=400&h=250&fit=crop','26 kWh','running',55,90,42,'T. Nagar, Chennai',13.0418,80.2341,195,11200,7650,false),
('EV-007','Ola S1 Pro','Ola Electric','https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=250&fit=crop','3.97 kWh','charging',82,85,0,'Charging Hub, Hyderabad',17.3850,78.4867,181,9800,15230,true),
('EV-008','Volvo XC40 Recharge','Volvo','https://images.unsplash.com/photo-1617788138017-80ad40651399?w=400&h=250&fit=crop','78 kWh','running',70,96,58,'Cyber City, Gurugram',28.4595,77.0266,418,24500,6340,false)
on conflict (id) do update set
  battery_percent = excluded.battery_percent,
  battery_health  = excluded.battery_health,
  speed           = excluded.speed,
  status          = excluded.status,
  updated_at      = now();

-- Drivers
insert into public.drivers (id,name,vehicle_id,avatar,trips,overspeed,hard_braking,aggressive_accel,safety_score,efficiency_score,today_earnings,total_earnings,avg_speed,energy_consumed) values
('D-001','Arjun Sharma',  'EV-001','AS',124,2, 5, 3, 92,88,2450, 84200,48,18.4),
('D-002','Priya Nair',    'EV-002','PN',98, 0, 1, 2, 98,95,1800, 68900,42,14.2),
('D-003','Rahul Verma',   'EV-003','RV',156,8, 12,15,68,72,3100,121000,56,28.6),
('D-004','Sneha Patel',   'EV-004','SP',87, 1, 3, 4, 90,82,0,    52300,44,22.1),
('D-005','Vikram Iyer',   'EV-005','VI',203,5, 7, 6, 84,90,1950,145600,46,16.8),
('D-006','Deepa Krishnan','EV-006','DK',142,3, 4, 5, 87,91,2280, 97800,45,15.6),
('D-007','Suresh Kumar',  'EV-007','SK',178,12,18,20,59,65,1480,103400,58,31.2),
('D-008','Ananya Menon',  'EV-008','AM',115,1, 2, 1, 97,94,2670, 78900,43,13.9),
('D-009','Rohan Mehta',   null,    'RM',0,  0, 0, 0, 95,90,0,    0,     0, 0),
('D-010','Kavya Reddy',   null,    'KR',0,  0, 0, 0, 98,92,0,    0,     0, 0),
('D-011','Amit Joshi',    null,    'AJ',0,  0, 0, 0, 88,85,0,    0,     0, 0)
on conflict (id) do nothing;

-- Service history
insert into public.vehicle_service_history (vehicle_id,description,service_date) values
('EV-001','Tyre Rotation','2024-01-15'),('EV-001','Battery Check','2024-03-10'),
('EV-002','Full Service','2024-02-20'),
('EV-003','Brake Check','2024-04-05'),
('EV-004','Major Service','2024-05-01'),('EV-004','Battery Inspection','2024-01-10'),
('EV-005','Tyre Change','2024-03-22'),
('EV-006','Full Service','2024-02-14'),
('EV-007','Battery Health Check','2024-04-18'),
('EV-008','Alignment','2024-05-12')
on conflict do nothing;

-- Maintenance records
insert into public.vehicle_maintenance_records (vehicle_id,description,status,scheduled_date) values
('EV-001','Next service due','pending','2024-08-01'),
('EV-001','Software update pending','pending',null),
('EV-002','Next service due','pending','2024-09-01'),
('EV-003','Next service due','pending','2024-10-01'),
('EV-004','Suspension Repair','in_progress',null),
('EV-004','Alignment check','pending',null),
('EV-005','Next service due','pending','2024-07-01'),
('EV-006','Next service due','pending','2024-08-01'),
('EV-007','Next service due','pending','2024-09-01'),
('EV-008','Next service due','pending','2024-10-01')
on conflict do nothing;

-- Vehicle expenses
insert into public.vehicle_expenses (vehicle_id,type,amount,note,expense_date) values
('EV-001','Charging',   2100,'Monthly charging cost','2024-06-01'),
('EV-001','Maintenance',3400,'Tyre rotation + alignment','2024-05-15'),
('EV-001','Charging',   1950,'Monthly charging cost','2024-05-01'),
('EV-001','Insurance',  3000,'Quarterly premium','2024-04-01'),
('EV-002','Charging',   3100,'Monthly charging cost','2024-06-01'),
('EV-002','Maintenance',6200,'Full service','2024-05-20'),
('EV-003','Charging',   1650,'Monthly charging cost','2024-06-01'),
('EV-004','Maintenance',12000,'Suspension repair','2024-06-10'),
('EV-004','Insurance',  3750,'Quarterly premium','2024-04-01'),
('EV-005','Charging',   2600,'Monthly charging cost','2024-06-01'),
('EV-006','Charging',   1980,'Monthly charging cost','2024-06-01'),
('EV-007','Charging',   3980,'Monthly charging cost','2024-06-01'),
('EV-007','Maintenance',7600,'Battery health check','2024-05-10'),
('EV-008','Charging',   1580,'Monthly charging cost','2024-06-01')
on conflict do nothing;

-- Alerts
insert into public.alerts (type,title,message,vehicle_id,severity,resolved) values
('low_battery',   'Low Battery Alert',          'EV-004 (Kia EV6) battery at 23%. Immediate charging required.',              'EV-004','critical',false),
('battery_health','Battery Health Degradation', 'EV-007 (Ola S1 Pro) battery health dropped to 85%.',                        'EV-007','warning', false),
('offline',       'Vehicle Offline',             'EV-004 is at service centre in Pune.',                                      'EV-004','warning', false),
('maintenance',   'Maintenance Due',             'EV-005 (BYD Atto 3) is due for scheduled maintenance this week.',           'EV-005','info',    false),
('overspeed',     'Over-Speeding Alert',         'Driver Suresh Kumar exceeded speed limit (92 km/h in 60 km/h zone).',      'EV-007','critical',false),
('maintenance',   'Tyre Check Required',         'EV-001 (Tata Nexon EV Max) tyre pressure low on rear-left.',               'EV-001','info',    false)
on conflict do nothing;

-- Trips
insert into public.trips (id,driver_id,vehicle_id,from_location,to_location,distance_km,duration_min,earnings,energy_kwh,trip_date) values
('T-001','D-001','EV-001','Connaught Place','IGI Airport',     22.4,38,680, 8.2,'2024-06-08'),
('T-002','D-001','EV-001','IGI Airport',    'Cyber City',      14.8,26,450, 5.4,'2024-06-08'),
('T-003','D-001','EV-001','Cyber City',     'Saket',           18.6,34,560, 6.8,'2024-06-07'),
('T-004','D-001','EV-001','Saket',          'Noida Sector 18', 28.4,52,840,10.2,'2024-06-07'),
('T-005','D-001','EV-001','Noida',          'Connaught Place', 24.2,44,720, 8.8,'2024-06-06')
on conflict (id) do nothing;

-- Charging stations
insert into public.charging_stations (id,name,location,lat,lng,available,total,power) values
('CS-1','Tata Power EZ Charge','Connaught Place, Delhi', 28.6328,77.2197,3,6,'50 kW'),
('CS-2','EESL Fast Charger',   'IGI Airport, Delhi',     28.5562,77.1000,1,4,'25 kW'),
('CS-3','BPCL EV Station',     'NH-48, Gurugram',        28.4744,77.0266,5,8,'150 kW'),
('CS-4','Ather Grid',          'Cyber City, Gurugram',   28.4950,77.0880,2,4,'22 kW')
on conflict (id) do nothing;

-- Weekly revenue snapshots
insert into public.revenue_snapshots (period_type,period_label,revenue,target,snapshot_date) values
('weekly','Mon',42000,38000,'2024-06-03'),('weekly','Tue',51000,45000,'2024-06-04'),
('weekly','Wed',48000,45000,'2024-06-05'),('weekly','Thu',62000,50000,'2024-06-06'),
('weekly','Fri',71000,60000,'2024-06-07'),('weekly','Sat',84000,70000,'2024-06-08'),
('weekly','Sun',56000,55000,'2024-06-09')
on conflict do nothing;
