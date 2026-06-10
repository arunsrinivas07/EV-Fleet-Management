-- ============================================================================
-- Force-seed Analytics and Trips for ALL Drivers
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- Safe to re-run: deletes existing driver scope records first.
-- ============================================================================

-- ── DROP RESTRICTIVE CONSTRAINTS TO PREVENT SEED FAILURES ─────────────────
DO $$
BEGIN
  -- 1. Drop the period_type check constraints to allow 'last3months'
  BEGIN
    ALTER TABLE public.analytics_series DROP CONSTRAINT IF EXISTS analytics_series_period_type_check;
  EXCEPTION WHEN others THEN NULL;
  END;

  BEGIN
    ALTER TABLE public.analytics_series DROP CONSTRAINT IF EXISTS revenue_snapshots_period_type_check;
  EXCEPTION WHEN others THEN NULL;
  END;

  -- 2. Drop the NOT NULL constraint on period_label to allow NULL labels
  BEGIN
    ALTER TABLE public.analytics_series ALTER COLUMN period_label DROP NOT NULL;
  EXCEPTION WHEN others THEN NULL;
  END;
END $$;

-- ── 0. ENSURE ALL 25 DRIVERS EXIST WITH ASSIGNED VEHICLES ──────────────────
INSERT INTO public.drivers (id, name, vehicle_id, safety_score, total_earnings, avg_speed, energy_consumed)
VALUES
('D-001', 'Arjun', 'EV-001', 92, 485000, 42, 85),
('D-002', 'Priya', 'EV-002', 88, 395000, 38, 90),
('D-003', 'Karthik', 'EV-003', 70, 360000, 48, 96),
('D-004', 'Deepak', 'EV-004', 85, 310000, 41, 84),
('D-005', 'Vikram', 'EV-005', 94, 450000, 45, 88),
('D-006', 'Lakshmi', 'EV-006', 99, 520000, 40, 78),
('D-007', 'Suresh', 'EV-007', 81, 290000, 46, 85),
('D-008', 'Ananya', 'EV-008', 89, 410000, 39, 92),
('D-009', 'Rajan', 'EV-009', 76, 275000, 44, 88),
('D-010', 'Kavitha', 'EV-010', 91, 460000, 43, 82),
('D-011', 'Murugan', 'EV-011', 83, 305000, 42, 86),
('D-012', 'Anand', 'EV-012', 87, 380000, 40, 89),
('D-013', 'Meenakshi', 'EV-013', 95, 490000, 39, 80),
('D-014', 'Senthil', 'EV-014', 80, 295000, 45, 87),
('D-015', 'Bharathi', 'EV-015', 90, 430000, 41, 83),
('D-016', 'Ganesh', 'EV-016', 84, 320000, 43, 85),
('D-017', 'Revathi', 'EV-017', 93, 470000, 38, 81),
('D-018', 'Dinesh', 'EV-018', 78, 280000, 47, 91),
('D-019', 'Nandhini', 'EV-019', 92, 445000, 42, 84),
('D-020', 'Vijayakumar', 'EV-020', 82, 315000, 44, 87),
('D-021', 'Saranya', 'EV-021', 89, 405000, 40, 88),
('D-022', 'Balaji', 'EV-022', 85, 330000, 42, 83),
('D-023', 'Robin', 'EV-023', 91, 425000, 43, 82),
('D-024', 'Vishnu', 'EV-024', 79, 290000, 46, 89),
('D-025', 'Sudha', 'EV-025', 96, 505000, 39, 79)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  vehicle_id = EXCLUDED.vehicle_id,
  safety_score = COALESCE(drivers.safety_score, EXCLUDED.safety_score),
  total_earnings = COALESCE(drivers.total_earnings, EXCLUDED.total_earnings),
  avg_speed = COALESCE(drivers.avg_speed, EXCLUDED.avg_speed),
  energy_consumed = COALESCE(drivers.energy_consumed, EXCLUDED.energy_consumed);

-- ── 1. CLEAN UP EXISTING DRIVER ANALYTICS ───────────────────────────────────
DELETE FROM public.analytics_series WHERE scope = 'driver';
DELETE FROM public.trips WHERE id LIKE 'T-%';

-- ── 2. REBUILD CLEAN SEED DATA FOR EVERY DRIVER ──────────────────────────────
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
LOOP
  -- Derive per-day base values from cumulative driver stats
  base_earn := GREATEST(1500,  ROUND(drv.total_earnings  / 30.0, 0)); -- Higher base to reflect realistic weekly stats
  base_kwh  := GREATEST(12.0,  ROUND(drv.energy_consumed / 20.0, 1));
  base_spd  := GREATEST(35,   drv.avg_speed::int);

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
  ('driver',drv.id,'last3months','Wk12','energy',   ROUND(base_kwh*7 *1.00,1), '2026-06-07'),

  ('driver',drv.id,'last3months','Wk1', 'trips',    62, '2026-03-07'),
  ('driver',drv.id,'last3months','Wk2', 'trips',    65, '2026-03-14'),
  ('driver',drv.id,'last3months','Wk3', 'trips',    60, '2026-03-21'),
  ('driver',drv.id,'last3months','Wk4', 'trips',    70, '2026-03-28'),
  ('driver',drv.id,'last3months','Wk5', 'trips',    68, '2026-04-07'),
  ('driver',drv.id,'last3months','Wk6', 'trips',    75, '2026-04-14'),
  ('driver',drv.id,'last3months','Wk7', 'trips',    72, '2026-04-21'),
  ('driver',drv.id,'last3months','Wk8', 'trips',    80, '2026-04-28'),
  ('driver',drv.id,'last3months','Wk9', 'trips',    82, '2026-05-07'),
  ('driver',drv.id,'last3months','Wk10','trips',    85, '2026-05-14'),
  ('driver',drv.id,'last3months','Wk11','trips',    83, '2026-05-21'),
  ('driver',drv.id,'last3months','Wk12','trips',    25, '2026-06-07'),

  ('driver',drv.id,'last3months','Wk1', 'safety',   GREATEST(40, drv.safety_score-2), '2026-03-07'),
  ('driver',drv.id,'last3months','Wk2', 'safety',   GREATEST(40, drv.safety_score-1), '2026-03-14'),
  ('driver',drv.id,'last3months','Wk3', 'safety',   drv.safety_score,                 '2026-03-21'),
  ('driver',drv.id,'last3months','Wk4', 'safety',   drv.safety_score,                 '2026-03-28'),
  ('driver',drv.id,'last3months','Wk5', 'safety',   LEAST(100, drv.safety_score+1),   '2026-04-07'),
  ('driver',drv.id,'last3months','Wk6', 'safety',   LEAST(100, drv.safety_score+2),   '2026-04-14'),
  ('driver',drv.id,'last3months','Wk7', 'safety',   drv.safety_score,                 '2026-04-21'),
  ('driver',drv.id,'last3months','Wk8', 'safety',   drv.safety_score,                 '2026-04-28'),
  ('driver',drv.id,'last3months','Wk9', 'safety',   GREATEST(40, drv.safety_score-1), '2026-05-07'),
  ('driver',drv.id,'last3months','Wk10','safety',   drv.safety_score,                 '2026-05-14'),
  ('driver',drv.id,'last3months','Wk11','safety',   LEAST(100, drv.safety_score+1),   '2026-05-21'),
  ('driver',drv.id,'last3months','Wk12','safety',   drv.safety_score,                 '2026-06-07'),

  ('driver',drv.id,'last3months','Wk1', 'speed',    base_spd, '2026-03-07'),
  ('driver',drv.id,'last3months','Wk2', 'speed',    base_spd, '2026-03-14'),
  ('driver',drv.id,'last3months','Wk3', 'speed',    base_spd, '2026-03-21'),
  ('driver',drv.id,'last3months','Wk4', 'speed',    base_spd, '2026-03-28'),
  ('driver',drv.id,'last3months','Wk5', 'speed',    base_spd, '2026-04-07'),
  ('driver',drv.id,'last3months','Wk6', 'speed',    base_spd, '2026-04-14'),
  ('driver',drv.id,'last3months','Wk7', 'speed',    base_spd, '2026-04-21'),
  ('driver',drv.id,'last3months','Wk8', 'speed',    base_spd, '2026-04-28'),
  ('driver',drv.id,'last3months','Wk9', 'speed',    base_spd, '2026-05-07'),
  ('driver',drv.id,'last3months','Wk10','speed',    base_spd, '2026-05-14'),
  ('driver',drv.id,'last3months','Wk11','speed',    base_spd, '2026-05-21'),
  ('driver',drv.id,'last3months','Wk12','speed',    base_spd, '2026-06-07');

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
  ('driver',drv.id,'yearly','Jun','energy',   ROUND(base_kwh*7 *1.00,1), '2026-06-07'),

  ('driver',drv.id,'yearly','Jan','trips',    280, '2026-01-31'),
  ('driver',drv.id,'yearly','Feb','trips',    258, '2026-02-28'),
  ('driver',drv.id,'yearly','Mar','trips',    305, '2026-03-31'),
  ('driver',drv.id,'yearly','Apr','trips',    332, '2026-04-30'),
  ('driver',drv.id,'yearly','May','trips',    368, '2026-05-31'),
  ('driver',drv.id,'yearly','Jun','trips',    120, '2026-06-07'),

  ('driver',drv.id,'yearly','Jan','safety',   GREATEST(40, drv.safety_score-2), '2026-01-31'),
  ('driver',drv.id,'yearly','Feb','safety',   GREATEST(40, drv.safety_score-1), '2026-02-28'),
  ('driver',drv.id,'yearly','Mar','safety',   drv.safety_score,                 '2026-03-31'),
  ('driver',drv.id,'yearly','Apr','safety',   drv.safety_score,                 '2026-04-30'),
  ('driver',drv.id,'yearly','May','safety',   LEAST(100, drv.safety_score+1),   '2026-05-31'),
  ('driver',drv.id,'yearly','Jun','safety',   drv.safety_score,                 '2026-06-07'),

  ('driver',drv.id,'yearly','Jan','speed',    base_spd, '2026-01-31'),
  ('driver',drv.id,'yearly','Feb','speed',    base_spd, '2026-02-28'),
  ('driver',drv.id,'yearly','Mar','speed',    base_spd, '2026-03-31'),
  ('driver',drv.id,'yearly','Apr','speed',    base_spd, '2026-04-30'),
  ('driver',drv.id,'yearly','May','speed',    base_spd, '2026-05-31'),
  ('driver',drv.id,'yearly','Jun','speed',    base_spd, '2026-06-07');

  -- ── TRIPS (10 recent trips per driver) ────────────────────────────────────
  IF drv.vehicle_id IS NOT NULL THEN
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
  WHERE id = drv.id;

END LOOP;

END $$;
