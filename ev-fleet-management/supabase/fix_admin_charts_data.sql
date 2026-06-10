-- ============================================================================
-- Fix Admin Charts and Analytics Data
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- This script:
--   1. Cleanly rebuilds 'maintenance' and 'charging' fleet metrics.
--   2. Fills in missing weekly brand expenses.
--   3. Distributes 'last3months' records to all individual brands.
--   4. Fully seeds missing General Reports metrics.
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

-- ── 1. CLEAN UP INCOMPLETE AND MISSING METRICS ──────────────────────────────

-- Delete existing fleet scope maintenance & charging entries to prevent duplicates
DELETE FROM public.analytics_series
WHERE scope = 'fleet'
  AND metric_type IN ('maintenance', 'charging');

-- Delete weekly brand expenses (since they were only seeded for Monday)
DELETE FROM public.analytics_series
WHERE scope = 'fleet'
  AND scope_id <> 'All'
  AND period_type = 'weekly'
  AND metric_type = 'expenses';

-- Delete last3months brand metrics (since they were completely missing for brands)
DELETE FROM public.analytics_series
WHERE scope = 'fleet'
  AND scope_id <> 'All'
  AND period_type = 'last3months';

-- Delete incomplete general reports metrics
DELETE FROM public.analytics_series
WHERE scope = 'general'
  AND scope_id IS NULL
  AND metric_type IN ('avgHealth', 'distance', 'charging_sessions', 'energy');


-- ── 2. REBUILD WEEKLY EXPENSES FOR INDIVIDUAL BRANDS ─────────────────────────
-- Calculates daily expenses for all days (Mon-Sun) proportional to that day's revenue (39%)
INSERT INTO public.analytics_series (scope, scope_id, period_type, period_label, metric_type, value, recorded_date)
SELECT
  scope,
  scope_id,
  period_type,
  period_label,
  'expenses' AS metric_type,
  ROUND(value * 0.39, 0) AS value,
  recorded_date
FROM public.analytics_series
WHERE scope = 'fleet'
  AND scope_id <> 'All'
  AND period_type = 'weekly'
  AND metric_type = 'revenue';


-- ── 3. DISTRIBUTE LAST 3 MONTHS DATA FOR INDIVIDUAL BRANDS ────────────────────
-- Distributes 'All' last3months data to individual brands based on fleet market shares
INSERT INTO public.analytics_series (scope, scope_id, period_type, period_label, metric_type, value, recorded_date)
SELECT
  a.scope,
  b.brand AS scope_id,
  a.period_type,
  a.period_label,
  a.metric_type,
  ROUND(a.value * b.share, 0) AS value,
  a.recorded_date
FROM public.analytics_series a
CROSS JOIN (
  VALUES
    ('Hyundai',      0.16),
    ('Kia',          0.20),
    ('MG Motor',     0.20),
    ('Mahindra',     0.20),
    ('Tata',         0.24),
    ('BYD',          0.10),
    ('Ola Electric', 0.05),
    ('Volvo',        0.05)
) AS b(brand, share)
WHERE a.scope = 'fleet'
  AND a.scope_id = 'All'
  AND a.period_type = 'last3months'
  AND a.metric_type IN ('revenue', 'target', 'expenses');


-- ── 4. POPULATE FLEET MAINTENANCE & CHARGING COSTS ───────────────────────────
-- Calculates charging (60%) and maintenance (25%) from expenses for all brands, periods, and labels
INSERT INTO public.analytics_series (scope, scope_id, period_type, period_label, metric_type, value, recorded_date)
SELECT
  scope,
  scope_id,
  period_type,
  period_label,
  'maintenance' AS metric_type,
  ROUND(value * 0.25, 0) AS value,
  recorded_date
FROM public.analytics_series
WHERE scope = 'fleet'
  AND metric_type = 'expenses';

INSERT INTO public.analytics_series (scope, scope_id, period_type, period_label, metric_type, value, recorded_date)
SELECT
  scope,
  scope_id,
  period_type,
  period_label,
  'charging' AS metric_type,
  ROUND(value * 0.60, 0) AS value,
  recorded_date
FROM public.analytics_series
WHERE scope = 'fleet'
  AND metric_type = 'expenses';


-- ── 5. SEED GENERAL REPORTS METRICS ──────────────────────────────────────────

-- Seed Battery Health Trend (Monthly avgHealth)
INSERT INTO public.analytics_series (scope, scope_id, period_type, period_label, metric_type, value, recorded_date) VALUES
('general', null, 'monthly', 'Jan', 'avgHealth', 95.8, '2026-01-31'),
('general', null, 'monthly', 'Feb', 'avgHealth', 95.2, '2026-02-28'),
('general', null, 'monthly', 'Mar', 'avgHealth', 94.6, '2026-03-31'),
('general', null, 'monthly', 'Apr', 'avgHealth', 94.1, '2026-04-30'),
('general', null, 'monthly', 'May', 'avgHealth', 93.4, '2026-05-31'),
('general', null, 'monthly', 'Jun', 'avgHealth', 92.8, '2026-06-10');

-- Seed Daily Distance Travelled (Weekly distance, total km covered by all vehicles)
INSERT INTO public.analytics_series (scope, scope_id, period_type, period_label, metric_type, value, recorded_date) VALUES
('general', null, 'weekly', 'Mon', 'distance', 2420, '2026-06-01'),
('general', null, 'weekly', 'Tue', 'distance', 2680, '2026-06-02'),
('general', null, 'weekly', 'Wed', 'distance', 2850, '2026-06-03'),
('general', null, 'weekly', 'Thu', 'distance', 3120, '2026-06-04'),
('general', null, 'weekly', 'Fri', 'distance', 3450, '2026-06-05'),
('general', null, 'weekly', 'Sat', 'distance', 3890, '2026-06-06'),
('general', null, 'weekly', 'Sun', 'distance', 2150, '2026-06-07');

-- Seed Charging Session Pattern (Daily charging_sessions)
INSERT INTO public.analytics_series (scope, scope_id, period_type, period_label, metric_type, value, recorded_date) VALUES
('general', null, 'daily', '12AM', 'charging_sessions', 4, '2026-06-10'),
('general', null, 'daily', '2AM',  'charging_sessions', 2, '2026-06-10'),
('general', null, 'daily', '4AM',  'charging_sessions', 3, '2026-06-10'),
('general', null, 'daily', '6AM',  'charging_sessions', 8, '2026-06-10'),
('general', null, 'daily', '8AM',  'charging_sessions', 14, '2026-06-10'),
('general', null, 'daily', '10AM', 'charging_sessions', 12, '2026-06-10'),
('general', null, 'daily', '12PM', 'charging_sessions', 9, '2026-06-10'),
('general', null, 'daily', '2PM',  'charging_sessions', 11, '2026-06-10'),
('general', null, 'daily', '4PM',  'charging_sessions', 15, '2026-06-10'),
('general', null, 'daily', '6PM',  'charging_sessions', 18, '2026-06-10'),
('general', null, 'daily', '8PM',  'charging_sessions', 13, '2026-06-10'),
('general', null, 'daily', '10PM', 'charging_sessions', 7, '2026-06-10');

-- Seed Hourly Energy Consumption (Daily energy)
INSERT INTO public.analytics_series (scope, scope_id, period_type, period_label, metric_type, value, recorded_date) VALUES
('general', null, 'daily', '12AM', 'energy', 45, '2026-06-10'),
('general', null, 'daily', '2AM',  'energy', 30, '2026-06-10'),
('general', null, 'daily', '4AM',  'energy', 65, '2026-06-10'),
('general', null, 'daily', '6AM',  'energy', 180, '2026-06-10'),
('general', null, 'daily', '8AM',  'energy', 340, '2026-06-10'),
('general', null, 'daily', '10AM', 'energy', 410, '2026-06-10'),
('general', null, 'daily', '12PM', 'energy', 290, '2026-06-10'),
('general', null, 'daily', '2PM',  'energy', 310, '2026-06-10'),
('general', null, 'daily', '4PM',  'energy', 380, '2026-06-10'),
('general', null, 'daily', '6PM',  'energy', 490, '2026-06-10'),
('general', null, 'daily', '8PM',  'energy', 220, '2026-06-10'),
('general', null, 'daily', '10PM', 'energy', 95, '2026-06-10');
