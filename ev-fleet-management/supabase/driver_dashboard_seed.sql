-- ============================================================
-- Driver Dashboard Seed
-- Populates analytics_series + trips for a specific driver.
--
-- HOW TO USE:
-- 1. Find your driver ID:
--    SELECT id, name, profile_id, vehicle_id FROM public.drivers;
--
-- 2. Replace 'YOUR_DRIVER_ID' below with the actual value
--    e.g. 'D-002' or whatever ID the trigger assigned.
--
-- 3. Run this script in Supabase SQL Editor.
-- ============================================================

-- ── STEP 1: Find your driver ID ───────────────────────────────────────────────
-- Run this first to see your driver row:
-- SELECT id, name, profile_id, vehicle_id FROM public.drivers ORDER BY created_at DESC LIMIT 10;

-- ── STEP 2: Set this to your actual driver ID ─────────────────────────────────
-- Replace the value in the DO block below.

DO $$
DECLARE
  d_id   text := 'D-002';   -- ← CHANGE THIS to your driver's id from the drivers table
  v_id   text;
BEGIN
  -- Auto-detect vehicle_id for this driver
  SELECT vehicle_id INTO v_id FROM public.drivers WHERE id = d_id;

  -- ── Clean old data for this driver ──────────────────────────────────────────
  DELETE FROM public.analytics_series WHERE scope = 'driver' AND scope_id = d_id;
  DELETE FROM public.trips WHERE driver_id = d_id;

  -- ── Weekly earnings series ───────────────────────────────────────────────────
  INSERT INTO public.analytics_series (scope, scope_id, period_type, period_label, metric_type, value, recorded_date) VALUES
  ('driver', d_id, 'weekly', 'Mon', 'earnings', 1850, '2026-06-01'),
  ('driver', d_id, 'weekly', 'Tue', 'earnings', 2240, '2026-06-02'),
  ('driver', d_id, 'weekly', 'Wed', 'earnings', 1980, '2026-06-03'),
  ('driver', d_id, 'weekly', 'Thu', 'earnings', 2650, '2026-06-04'),
  ('driver', d_id, 'weekly', 'Fri', 'earnings', 3100, '2026-06-05'),
  ('driver', d_id, 'weekly', 'Sat', 'earnings', 3420, '2026-06-06'),
  ('driver', d_id, 'weekly', 'Sun', 'earnings', 1950, '2026-06-07');

  -- ── Weekly energy series (used to derive charging cost) ────────────────────
  INSERT INTO public.analytics_series (scope, scope_id, period_type, period_label, metric_type, value, recorded_date) VALUES
  ('driver', d_id, 'weekly', 'Mon', 'energy', 14.2, '2026-06-01'),
  ('driver', d_id, 'weekly', 'Tue', 'energy', 17.6, '2026-06-02'),
  ('driver', d_id, 'weekly', 'Wed', 'energy', 15.4, '2026-06-03'),
  ('driver', d_id, 'weekly', 'Thu', 'energy', 20.8, '2026-06-04'),
  ('driver', d_id, 'weekly', 'Fri', 'energy', 24.2, '2026-06-05'),
  ('driver', d_id, 'weekly', 'Sat', 'energy', 26.8, '2026-06-06'),
  ('driver', d_id, 'weekly', 'Sun', 'energy', 15.3, '2026-06-07');

  -- ── Weekly safety score ───────────────────────────────────────────────────
  INSERT INTO public.analytics_series (scope, scope_id, period_type, period_label, metric_type, value, recorded_date) VALUES
  ('driver', d_id, 'weekly', 'Mon', 'safety', 92, '2026-06-01'),
  ('driver', d_id, 'weekly', 'Tue', 'safety', 94, '2026-06-02'),
  ('driver', d_id, 'weekly', 'Wed', 'safety', 91, '2026-06-03'),
  ('driver', d_id, 'weekly', 'Thu', 'safety', 95, '2026-06-04'),
  ('driver', d_id, 'weekly', 'Fri', 'safety', 93, '2026-06-05'),
  ('driver', d_id, 'weekly', 'Sat', 'safety', 96, '2026-06-06'),
  ('driver', d_id, 'weekly', 'Sun', 'safety', 92, '2026-06-07');

  -- ── Weekly trips count ────────────────────────────────────────────────────
  INSERT INTO public.analytics_series (scope, scope_id, period_type, period_label, metric_type, value, recorded_date) VALUES
  ('driver', d_id, 'weekly', 'Mon', 'trips', 14, '2026-06-01'),
  ('driver', d_id, 'weekly', 'Tue', 'trips', 17, '2026-06-02'),
  ('driver', d_id, 'weekly', 'Wed', 'trips', 15, '2026-06-03'),
  ('driver', d_id, 'weekly', 'Thu', 'trips', 20, '2026-06-04'),
  ('driver', d_id, 'weekly', 'Fri', 'trips', 23, '2026-06-05'),
  ('driver', d_id, 'weekly', 'Sat', 'trips', 26, '2026-06-06'),
  ('driver', d_id, 'weekly', 'Sun', 'trips', 16, '2026-06-07');

  -- ── Weekly speed series ───────────────────────────────────────────────────
  INSERT INTO public.analytics_series (scope, scope_id, period_type, period_label, metric_type, value, recorded_date) VALUES
  ('driver', d_id, 'weekly', 'Mon', 'speed', 44, '2026-06-01'),
  ('driver', d_id, 'weekly', 'Tue', 'speed', 46, '2026-06-02'),
  ('driver', d_id, 'weekly', 'Wed', 'speed', 43, '2026-06-03'),
  ('driver', d_id, 'weekly', 'Thu', 'speed', 47, '2026-06-04'),
  ('driver', d_id, 'weekly', 'Fri', 'speed', 45, '2026-06-05'),
  ('driver', d_id, 'weekly', 'Sat', 'speed', 48, '2026-06-06'),
  ('driver', d_id, 'weekly', 'Sun', 'speed', 44, '2026-06-07');

  -- ── Monthly earnings ──────────────────────────────────────────────────────
  INSERT INTO public.analytics_series (scope, scope_id, period_type, period_label, metric_type, value, recorded_date) VALUES
  ('driver', d_id, 'monthly', 'Jan', 'earnings', 48200, '2026-01-31'),
  ('driver', d_id, 'monthly', 'Feb', 'earnings', 44800, '2026-02-28'),
  ('driver', d_id, 'monthly', 'Mar', 'earnings', 52400, '2026-03-31'),
  ('driver', d_id, 'monthly', 'Apr', 'earnings', 56100, '2026-04-30'),
  ('driver', d_id, 'monthly', 'May', 'earnings', 61800, '2026-05-31'),
  ('driver', d_id, 'monthly', 'Jun', 'earnings', 17190, '2026-06-07');

  -- ── Monthly energy ────────────────────────────────────────────────────────
  INSERT INTO public.analytics_series (scope, scope_id, period_type, period_label, metric_type, value, recorded_date) VALUES
  ('driver', d_id, 'monthly', 'Jan', 'energy', 380, '2026-01-31'),
  ('driver', d_id, 'monthly', 'Feb', 'energy', 352, '2026-02-28'),
  ('driver', d_id, 'monthly', 'Mar', 'energy', 412, '2026-03-31'),
  ('driver', d_id, 'monthly', 'Apr', 'energy', 441, '2026-04-30'),
  ('driver', d_id, 'monthly', 'May', 'energy', 486, '2026-05-31'),
  ('driver', d_id, 'monthly', 'Jun', 'energy', 134, '2026-06-07');

  -- ── Monthly safety ────────────────────────────────────────────────────────
  INSERT INTO public.analytics_series (scope, scope_id, period_type, period_label, metric_type, value, recorded_date) VALUES
  ('driver', d_id, 'monthly', 'Jan', 'safety', 90, '2026-01-31'),
  ('driver', d_id, 'monthly', 'Feb', 'safety', 91, '2026-02-28'),
  ('driver', d_id, 'monthly', 'Mar', 'safety', 93, '2026-03-31'),
  ('driver', d_id, 'monthly', 'Apr', 'safety', 94, '2026-04-30'),
  ('driver', d_id, 'monthly', 'May', 'safety', 95, '2026-05-31'),
  ('driver', d_id, 'monthly', 'Jun', 'safety', 93, '2026-06-07');

  -- ── Monthly trips ─────────────────────────────────────────────────────────
  INSERT INTO public.analytics_series (scope, scope_id, period_type, period_label, metric_type, value, recorded_date) VALUES
  ('driver', d_id, 'monthly', 'Jan', 'trips', 312, '2026-01-31'),
  ('driver', d_id, 'monthly', 'Feb', 'trips', 289, '2026-02-28'),
  ('driver', d_id, 'monthly', 'Mar', 'trips', 341, '2026-03-31'),
  ('driver', d_id, 'monthly', 'Apr', 'trips', 368, '2026-04-30'),
  ('driver', d_id, 'monthly', 'May', 'trips', 402, '2026-05-31'),
  ('driver', d_id, 'monthly', 'Jun', 'trips', 131, '2026-06-07');

  -- ── Last 3 months earnings ────────────────────────────────────────────────
  INSERT INTO public.analytics_series (scope, scope_id, period_type, period_label, metric_type, value, recorded_date) VALUES
  ('driver', d_id, 'last3months', 'Wk1', 'earnings', 14200, '2026-03-07'),
  ('driver', d_id, 'last3months', 'Wk2', 'earnings', 15800, '2026-03-14'),
  ('driver', d_id, 'last3months', 'Wk3', 'earnings', 13400, '2026-03-21'),
  ('driver', d_id, 'last3months', 'Wk4', 'earnings', 16200, '2026-03-28'),
  ('driver', d_id, 'last3months', 'Wk5', 'earnings', 17100, '2026-04-07'),
  ('driver', d_id, 'last3months', 'Wk6', 'earnings', 18600, '2026-04-14'),
  ('driver', d_id, 'last3months', 'Wk7', 'earnings', 16400, '2026-04-21'),
  ('driver', d_id, 'last3months', 'Wk8', 'earnings', 19200, '2026-04-28'),
  ('driver', d_id, 'last3months', 'Wk9', 'earnings', 20100, '2026-05-07'),
  ('driver', d_id, 'last3months', 'Wk10','earnings', 21400, '2026-05-14'),
  ('driver', d_id, 'last3months', 'Wk11','earnings', 19800, '2026-05-21'),
  ('driver', d_id, 'last3months', 'Wk12','earnings', 17190, '2026-06-07');

  -- ── Last 3 months energy ──────────────────────────────────────────────────
  INSERT INTO public.analytics_series (scope, scope_id, period_type, period_label, metric_type, value, recorded_date) VALUES
  ('driver', d_id, 'last3months', 'Wk1', 'energy', 112, '2026-03-07'),
  ('driver', d_id, 'last3months', 'Wk2', 'energy', 124, '2026-03-14'),
  ('driver', d_id, 'last3months', 'Wk3', 'energy', 106, '2026-03-21'),
  ('driver', d_id, 'last3months', 'Wk4', 'energy', 128, '2026-03-28'),
  ('driver', d_id, 'last3months', 'Wk5', 'energy', 135, '2026-04-07'),
  ('driver', d_id, 'last3months', 'Wk6', 'energy', 146, '2026-04-14'),
  ('driver', d_id, 'last3months', 'Wk7', 'energy', 129, '2026-04-21'),
  ('driver', d_id, 'last3months', 'Wk8', 'energy', 151, '2026-04-28'),
  ('driver', d_id, 'last3months', 'Wk9', 'energy', 158, '2026-05-07'),
  ('driver', d_id, 'last3months', 'Wk10','energy', 168, '2026-05-14'),
  ('driver', d_id, 'last3months', 'Wk11','energy', 156, '2026-05-21'),
  ('driver', d_id, 'last3months', 'Wk12','energy', 134, '2026-06-07');

  -- ── Yearly earnings ───────────────────────────────────────────────────────
  INSERT INTO public.analytics_series (scope, scope_id, period_type, period_label, metric_type, value, recorded_date) VALUES
  ('driver', d_id, 'yearly', 'Jan', 'earnings', 48200,  '2026-01-31'),
  ('driver', d_id, 'yearly', 'Feb', 'earnings', 44800,  '2026-02-28'),
  ('driver', d_id, 'yearly', 'Mar', 'earnings', 52400,  '2026-03-31'),
  ('driver', d_id, 'yearly', 'Apr', 'earnings', 56100,  '2026-04-30'),
  ('driver', d_id, 'yearly', 'May', 'earnings', 61800,  '2026-05-31'),
  ('driver', d_id, 'yearly', 'Jun', 'earnings', 17190,  '2026-06-07');

  -- ── Yearly energy ─────────────────────────────────────────────────────────
  INSERT INTO public.analytics_series (scope, scope_id, period_type, period_label, metric_type, value, recorded_date) VALUES
  ('driver', d_id, 'yearly', 'Jan', 'energy', 380,  '2026-01-31'),
  ('driver', d_id, 'yearly', 'Feb', 'energy', 352,  '2026-02-28'),
  ('driver', d_id, 'yearly', 'Mar', 'energy', 412,  '2026-03-31'),
  ('driver', d_id, 'yearly', 'Apr', 'energy', 441,  '2026-04-30'),
  ('driver', d_id, 'yearly', 'May', 'energy', 486,  '2026-05-31'),
  ('driver', d_id, 'yearly', 'Jun', 'energy', 134,  '2026-06-07');

  -- ── Recent trips (using vehicle_id if available, else skip) ───────────────
  IF v_id IS NOT NULL THEN
    INSERT INTO public.trips (id, driver_id, vehicle_id, from_location, to_location, distance_km, duration_min, earnings, energy_kwh, trip_date)
    VALUES
    ('T-D02-01', d_id, v_id, 'Koramangala, Bengaluru',    'Whitefield',              24, 46, 780, 9.2,  '2026-06-09'),
    ('T-D02-02', d_id, v_id, 'Whitefield',                 'MG Road, Bengaluru',      20, 38, 640, 7.8,  '2026-06-09'),
    ('T-D02-03', d_id, v_id, 'MG Road, Bengaluru',         'Indiranagar',              6, 14, 210, 2.4,  '2026-06-08'),
    ('T-D02-04', d_id, v_id, 'Indiranagar',                'Electronic City',         28, 54, 890, 10.8, '2026-06-08'),
    ('T-D02-05', d_id, v_id, 'Electronic City',            'Koramangala, Bengaluru',  18, 34, 580, 7.0,  '2026-06-07'),
    ('T-D02-06', d_id, v_id, 'Koramangala, Bengaluru',     'Hebbal',                  22, 42, 710, 8.6,  '2026-06-07'),
    ('T-D02-07', d_id, v_id, 'Hebbal',                     'Yelahanka',                9, 18, 300, 3.4,  '2026-06-06'),
    ('T-D02-08', d_id, v_id, 'Yelahanka',                  'Koramangala, Bengaluru',  31, 58, 990, 12.0, '2026-06-06'),
    ('T-D02-09', d_id, v_id, 'Koramangala, Bengaluru',     'Jayanagar',                8, 16, 270, 3.1,  '2026-06-05'),
    ('T-D02-10', d_id, v_id, 'Jayanagar',                  'HSR Layout',               7, 14, 240, 2.8,  '2026-06-05')
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- ── Update driver totals to reflect new data ──────────────────────────────
  UPDATE public.drivers SET
    trips             = 131,
    today_earnings    = 1950,
    total_earnings    = 280490,
    avg_speed         = 45,
    energy_consumed   = 134,
    updated_at        = now()
  WHERE id = d_id;

  RAISE NOTICE 'Dashboard data seeded for driver % (vehicle: %)', d_id, v_id;
END $$;
