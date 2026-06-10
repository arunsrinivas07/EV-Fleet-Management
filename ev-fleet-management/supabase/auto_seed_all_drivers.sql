-- ============================================================
-- Auto-seed analytics_series + trips for every driver
-- that currently has NO analytics data.
-- Safe to re-run: skips drivers that already have data.
-- Run in: Supabase Dashboard → SQL Editor
-- ============================================================

DO $$
DECLARE
  drv        RECORD;
  base_earn  numeric;
  base_kwh   numeric;
  base_spd   numeric;
  i          int;
  trip_date  date;
  dist_km    numeric;
  dur_min    int;
  earn_trip  numeric;
  kwh_trip   numeric;
  trip_id    text;

  -- 25 South Indian city locations
  from_cities text[] := ARRAY[
    'Koramangala, Bengaluru',  'Anna Nagar, Chennai',     'Jubilee Hills, Hyderabad',
    'Indiranagar, Bengaluru',  'Velachery, Chennai',      'Banjara Hills, Hyderabad',
    'Whitefield, Bengaluru',   'T. Nagar, Chennai',       'HITEC City, Hyderabad',
    'Electronic City, Bengaluru', 'Adyar, Chennai',       'Madhapur, Hyderabad',
    'Hebbal, Bengaluru',       'OMR, Chennai',            'Gachibowli, Hyderabad'
  ];
  to_cities text[] := ARRAY[
    'MG Road, Bengaluru',      'Egmore, Chennai',         'Secunderabad, Hyderabad',
    'Yelahanka, Bengaluru',    'Porur, Chennai',          'Ameerpet, Hyderabad',
    'Jayanagar, Bengaluru',    'Guindy, Chennai',         'LB Nagar, Hyderabad',
    'HSR Layout, Bengaluru',   'Sholinganallur, Chennai', 'Kukatpally, Hyderabad',
    'Marathahalli, Bengaluru', 'Mylapore, Chennai',       'Dilsukhnagar, Hyderabad'
  ];
BEGIN

FOR drv IN
  SELECT
    d.id, d.name, d.vehicle_id,
    COALESCE(d.safety_score,    85)::numeric  AS safety_score,
    COALESCE(d.total_earnings,  50000)::numeric AS total_earnings,
    COALESCE(d.avg_speed,       45)::numeric  AS avg_speed,
    COALESCE(d.energy_consumed, 120)::numeric AS energy_consumed
  FROM public.drivers d
  WHERE NOT EXISTS (
    SELECT 1 FROM public.analytics_series a
    WHERE a.scope = 'driver' AND a.scope_id = d.id
  )
LOOP
  -- Derive per-day base values from cumulative driver stats
  base_earn := GREATEST(500,  ROUND(drv.total_earnings  / 180.0, 0));
  base_kwh  := GREATEST(5.0,  ROUND(drv.energy_consumed / 120.0, 1));
  base_spd  := GREATEST(35,   drv.avg_speed::int);

  RAISE NOTICE 'Seeding driver: % (%)', drv.id, drv.name;

  -- ── WEEKLY (Mon-Sun) — all 5 metrics ──────────────────────────────────────
  INSERT INTO public.analytics_series
    (scope, scope_id, period_type, period_label, metric_type, value, recorded_date)
  VALUES
  -- earnings
  ('driver',drv.id,'weekly','Mon','earnings', ROUND(base_earn*0.82,0),  '2026-06-01'),
  ('driver',drv.id,'weekly','Tue','earnings', ROUND(base_earn*0.98,0),  '2026-06-02'),
  ('driver',drv.id,'weekly','Wed','earnings', ROUND(base_earn*0.88,0),  '2026-06-03'),
  ('driver',drv.id,'weekly','Thu','earnings', ROUND(base_earn*1.10,0),  '2026-06-04'),
  ('driver',drv.id,'weekly','Fri','earnings', ROUND(base_earn*1.25,0),  '2026-06-05'),
  ('driver',drv.id,'weekly','Sat','earnings', ROUND(base_earn*1.40,0),  '2026-06-06'),
  ('driver',drv.id,'weekly','Sun','earnings', ROUND(base_earn*0.90,0),  '2026-06-07'),
  -- energy
  ('driver',drv.id,'weekly','Mon','energy', ROUND(base_kwh*0.80,1),  '2026-06-01'),
  ('driver',drv.id,'weekly','Tue','energy', ROUND(base_kwh*0.94,1),  '2026-06-02'),
  ('driver',drv.id,'weekly','Wed','energy', ROUND(base_kwh*0.86,1),  '2026-06-03'),
  ('driver',drv.id,'weekly','Thu','energy', ROUND(base_kwh*1.06,1),  '2026-06-04'),
  ('driver',drv.id,'weekly','Fri','energy', ROUND(base_kwh*1.20,1),  '2026-06-05'),
  ('driver',drv.id,'weekly','Sat','energy', ROUND(base_kwh*1.34,1),  '2026-06-06'),
  ('driver',drv.id,'weekly','Sun','energy', ROUND(base_kwh*0.86,1),  '2026-06-07'),
  -- safety
  ('driver',drv.id,'weekly','Mon','safety', GREATEST(40, drv.safety_score-3), '2026-06-01'),
  ('driver',drv.id,'weekly','Tue','safety', GREATEST(40, drv.safety_score-1), '2026-06-02'),
  ('driver',drv.id,'weekly','Wed','safety', GREATEST(40, drv.safety_score-2), '2026-06-03'),
  ('driver',drv.id,'weekly','Thu','safety', drv.safety_score,                 '2026-06-04'),
  ('driver',drv.id,'weekly','Fri','safety', LEAST(100, drv.safety_score+1),   '2026-06-05'),
  ('driver',drv.id,'weekly','Sat','safety', LEAST(100, drv.safety_score+2),   '2026-06-06'),
  ('driver',drv.id,'weekly','Sun','safety', drv.safety_score,                 '2026-06-07'),
  -- trips
  ('driver',drv.id,'weekly','Mon','trips', 12, '2026-06-01'),
  ('driver',drv.id,'weekly','Tue','trips', 15, '2026-06-02'),
  ('driver',drv.id,'weekly','Wed','trips', 13, '2026-06-03'),
  ('driver',drv.id,'weekly','Thu','trips', 18, '2026-06-04'),
  ('driver',drv.id,'weekly','Fri','trips', 22, '2026-06-05'),
  ('driver',drv.id,'weekly','Sat','trips', 26, '2026-06-06'),
  ('driver',drv.id,'weekly','Sun','trips', 14, '2026-06-07'),
  -- speed
  ('driver',drv.id,'weekly','Mon','speed', GREATEST(30,base_spd-2), '2026-06-01'),
  ('driver',drv.id,'weekly','Tue','speed', base_spd,                '2026-06-02'),
  ('driver',drv.id,'weekly','Wed','speed', GREATEST(30,base_spd-1), '2026-06-03'),
  ('driver',drv.id,'weekly','Thu','speed', base_spd+1,              '2026-06-04'),
  ('driver',drv.id,'weekly','Fri','speed', base_spd+2,              '2026-06-05'),
  ('driver',drv.id,'weekly','Sat','speed', base_spd+3,              '2026-06-06'),
  ('driver',drv.id,'weekly','Sun','speed', base_spd,                '2026-06-07');

  -- ── MONTHLY (Jan-Jun) ─────────────────────────────────────────────────────
  INSERT INTO public.analytics_series
    (scope, scope_id, period_type, period_label, metric_type, value, recorded_date)
  VALUES
  -- earnings
  ('driver',drv.id,'monthly','Jan','earnings', ROUND(base_earn*26*0.85,0), '2026-01-31'),
  ('driver',drv.id,'monthly','Feb','earnings', ROUND(base_earn*24*0.82,0), '2026-02-28'),
  ('driver',drv.id,'monthly','Mar','earnings', ROUND(base_earn*27*0.90,0), '2026-03-31'),
  ('driver',drv.id,'monthly','Apr','earnings', ROUND(base_earn*28*0.95,0), '2026-04-30'),
  ('driver',drv.id,'monthly','May','earnings', ROUND(base_earn*30*1.00,0), '2026-05-31'),
  ('driver',drv.id,'monthly','Jun','earnings', ROUND(base_earn*7 *1.00,0), '2026-06-07'),
  -- energy
  ('driver',drv.id,'monthly','Jan','energy', ROUND(base_kwh*26*0.85,1), '2026-01-31'),
  ('driver',drv.id,'monthly','Feb','energy', ROUND(base_kwh*24*0.82,1), '2026-02-28'),
  ('driver',drv.id,'monthly','Mar','energy', ROUND(base_kwh*27*0.90,1), '2026-03-31'),
  ('driver',drv.id,'monthly','Apr','energy', ROUND(base_kwh*28*0.95,1), '2026-04-30'),
  ('driver',drv.id,'monthly','May','energy', ROUND(base_kwh*30*1.00,1), '2026-05-31'),
  ('driver',drv.id,'monthly','Jun','energy', ROUND(base_kwh*7 *1.00,1), '2026-06-07'),
  -- safety
  ('driver',drv.id,'monthly','Jan','safety', GREATEST(40,drv.safety_score-2), '2026-01-31'),
  ('driver',drv.id,'monthly','Feb','safety', GREATEST(40,drv.safety_score-1), '2026-02-28'),
  ('driver',drv.id,'monthly','Mar','safety', drv.safety_score,                '2026-03-31'),
  ('driver',drv.id,'monthly','Apr','safety', drv.safety_score,                '2026-04-30'),
  ('driver',drv.id,'monthly','May','safety', LEAST(100,drv.safety_score+1),   '2026-05-31'),
  ('driver',drv.id,'monthly','Jun','safety', drv.safety_score,                '2026-06-07'),
  -- trips
  ('driver',drv.id,'monthly','Jan','trips', 280, '2026-01-31'),
  ('driver',drv.id,'monthly','Feb','trips', 258, '2026-02-28'),
  ('driver',drv.id,'monthly','Mar','trips', 305, '2026-03-31'),
  ('driver',drv.id,'monthly','Apr','trips', 332, '2026-04-30'),
  ('driver',drv.id,'monthly','May','trips', 368, '2026-05-31'),
  ('driver',drv.id,'monthly','Jun','trips', 120, '2026-06-07'),
  -- speed
  ('driver',drv.id,'monthly','Jan','speed', GREATEST(30,base_spd-1), '2026-01-31'),
  ('driver',drv.id,'monthly','Feb','speed', base_spd,                '2026-02-28'),
  ('driver',drv.id,'monthly','Mar','speed', base_spd,                '2026-03-31'),
  ('driver',drv.id,'monthly','Apr','speed', base_spd+1,              '2026-04-30'),
  ('driver',drv.id,'monthly','May','speed', base_spd+1,              '2026-05-31'),
  ('driver',drv.id,'monthly','Jun','speed', base_spd,                '2026-06-07');

  -- ── LAST 3 MONTHS (Wk1-Wk12) ─────────────────────────────────────────────
  INSERT INTO public.analytics_series
    (scope, scope_id, period_type, period_label, metric_type, value, recorded_date)
  VALUES
  ('driver',drv.id,'last3months','Wk1', 'earnings', ROUND(base_earn*26*0.84,0), '2026-03-07'),
  ('driver',drv.id,'last3months','Wk2', 'earnings', ROUND(base_earn*26*0.88,0), '2026-03-14'),
  ('driver',drv.id,'last3months','Wk3', 'earnings', ROUND(base_earn*26*0.86,0), '2026-03-21'),
  ('driver',drv.id,'last3months','Wk4', 'earnings', ROUND(base_earn*27*0.92,0), '2026-03-28'),
  ('driver',drv.id,'last3months','Wk5', 'earnings', ROUND(base_earn*27*0.95,0), '2026-04-07'),
  ('driver',drv.id,'last3months','Wk6', 'earnings', ROUND(base_earn*28*0.98,0), '2026-04-14'),
  ('driver',drv.id,'last3months','Wk7', 'earnings', ROUND(base_earn*28*0.96,0), '2026-04-21'),
  ('driver',drv.id,'last3months','Wk8', 'earnings', ROUND(base_earn*29*1.00,0), '2026-04-28'),
  ('driver',drv.id,'last3months','Wk9', 'earnings', ROUND(base_earn*30*1.02,0), '2026-05-07'),
  ('driver',drv.id,'last3months','Wk10','earnings', ROUND(base_earn*30*1.05,0), '2026-05-14'),
  ('driver',drv.id,'last3months','Wk11','earnings', ROUND(base_earn*30*1.03,0), '2026-05-21'),
  ('driver',drv.id,'last3months','Wk12','earnings', ROUND(base_earn*7 *1.00,0), '2026-06-07'),
  ('driver',drv.id,'last3months','Wk1', 'energy',   ROUND(base_kwh*26*0.84,1), '2026-03-07'),
  ('driver',drv.id,'last3months','Wk2', 'energy',   ROUND(base_kwh*26*0.88,1), '2026-03-14'),
  ('driver',drv.id,'last3months','Wk3', 'energy',   ROUND(base_kwh*26*0.86,1), '2026-03-21'),
  ('driver',drv.id,'last3months','Wk4', 'energy',   ROUND(base_kwh*27*0.92,1), '2026-03-28'),
  ('driver',drv.id,'last3months','Wk5', 'energy',   ROUND(base_kwh*27*0.95,1), '2026-04-07'),
  ('driver',drv.id,'last3months','Wk6', 'energy',   ROUND(base_kwh*28*0.98,1), '2026-04-14'),
  ('driver',drv.id,'last3months','Wk7', 'energy',   ROUND(base_kwh*28*0.96,1), '2026-04-21'),
  ('driver',drv.id,'last3months','Wk8', 'energy',   ROUND(base_kwh*29*1.00,1), '2026-04-28'),
  ('driver',drv.id,'last3months','Wk9', 'energy',   ROUND(base_kwh*30*1.02,1), '2026-05-07'),
  ('driver',drv.id,'last3months','Wk10','energy',   ROUND(base_kwh*30*1.05,1), '2026-05-14'),
  ('driver',drv.id,'last3months','Wk11','energy',   ROUND(base_kwh*30*1.03,1), '2026-05-21'),
  ('driver',drv.id,'last3months','Wk12','energy',   ROUND(base_kwh*7 *1.00,1), '2026-06-07');

  -- ── YEARLY ────────────────────────────────────────────────────────────────
  INSERT INTO public.analytics_series
    (scope, scope_id, period_type, period_label, metric_type, value, recorded_date)
  VALUES
  ('driver',drv.id,'yearly','Jan','earnings', ROUND(base_earn*26*0.85,0), '2026-01-31'),
  ('driver',drv.id,'yearly','Feb','earnings', ROUND(base_earn*24*0.82,0), '2026-02-28'),
  ('driver',drv.id,'yearly','Mar','earnings', ROUND(base_earn*27*0.90,0), '2026-03-31'),
  ('driver',drv.id,'yearly','Apr','earnings', ROUND(base_earn*28*0.95,0), '2026-04-30'),
  ('driver',drv.id,'yearly','May','earnings', ROUND(base_earn*30*1.00,0), '2026-05-31'),
  ('driver',drv.id,'yearly','Jun','earnings', ROUND(base_earn*7 *1.00,0), '2026-06-07'),
  ('driver',drv.id,'yearly','Jan','energy',   ROUND(base_kwh*26*0.85,1), '2026-01-31'),
  ('driver',drv.id,'yearly','Feb','energy',   ROUND(base_kwh*24*0.82,1), '2026-02-28'),
  ('driver',drv.id,'yearly','Mar','energy',   ROUND(base_kwh*27*0.90,1), '2026-03-31'),
  ('driver',drv.id,'yearly','Apr','energy',   ROUND(base_kwh*28*0.95,1), '2026-04-30'),
  ('driver',drv.id,'yearly','May','energy',   ROUND(base_kwh*30*1.00,1), '2026-05-31'),
  ('driver',drv.id,'yearly','Jun','energy',   ROUND(base_kwh*7 *1.00,1), '2026-06-07');

  -- ── TRIPS (10 recent trips per driver) ────────────────────────────────────
  IF drv.vehicle_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.trips WHERE driver_id = drv.id LIMIT 1
  ) THEN
    FOR i IN 1..10 LOOP
      trip_date  := DATE '2026-06-09' - ((i - 1) / 3) * INTERVAL '1 day';
      dist_km    := ROUND((10 + i * 3.8)::numeric, 1);
      dur_min    := (18 + i * 7)::int;
      earn_trip  := ROUND((320 + i * 88)::numeric, 0);
      kwh_trip   := ROUND((3.8 + i * 1.3)::numeric, 1);
      trip_id    := 'T-' || drv.id || '-' || LPAD(i::text, 2, '0');

      INSERT INTO public.trips
        (id, driver_id, vehicle_id, from_location, to_location,
         distance_km, duration_min, earnings, energy_kwh, trip_date)
      VALUES (
        trip_id,
        drv.id,
        drv.vehicle_id,
        from_cities[1 + (i % array_length(from_cities, 1))],
        to_cities[1 + ((i + 4) % array_length(to_cities, 1))],
        dist_km,
        dur_min,
        earn_trip,
        kwh_trip,
        trip_date::date
      )
      ON CONFLICT (id) DO NOTHING;
    END LOOP;
  END IF;

  -- ── Update driver summary totals ──────────────────────────────────────────
  UPDATE public.drivers SET
    trips          = GREATEST(trips, 120),
    today_earnings = ROUND(base_earn * 0.90, 0),
    updated_at     = now()
  WHERE id = drv.id AND trips = 0;

END LOOP;

RAISE NOTICE 'Auto-seed complete for all drivers without analytics data.';
END $$;
