-- ============================================================
-- Admin Dashboard Analytics Seed
-- Adds monthly, last3months, and yearly data for:
--   - fleet scope (All brands + per brand)
--   - general scope (growth KPIs + general reports)
-- Run in: Supabase Dashboard → SQL Editor
-- Safe to re-run: deletes existing non-weekly entries first.
-- ============================================================

-- ── Clean non-weekly fleet + general series ───────────────────────────────
DELETE FROM public.analytics_series
WHERE scope IN ('fleet','general')
  AND period_type IN ('monthly','last3months','yearly');

-- ═══════════════════════════════════════════════════════════════════
-- FLEET — scope_id = 'All'  (used by AdminDashboard revenue chart)
-- ═══════════════════════════════════════════════════════════════════

-- ── Fleet All — Monthly ───────────────────────────────────────────────────
INSERT INTO public.analytics_series (scope,scope_id,period_type,period_label,metric_type,value,recorded_date) VALUES
('fleet','All','monthly','Jan','revenue',  3180000, '2026-01-31'),
('fleet','All','monthly','Jan','target',   2900000, '2026-01-31'),
('fleet','All','monthly','Jan','expenses', 1240000, '2026-01-31'),
('fleet','All','monthly','Feb','revenue',  2940000, '2026-02-28'),
('fleet','All','monthly','Feb','target',   2800000, '2026-02-28'),
('fleet','All','monthly','Feb','expenses', 1148000, '2026-02-28'),
('fleet','All','monthly','Mar','revenue',  3480000, '2026-03-31'),
('fleet','All','monthly','Mar','target',   3100000, '2026-03-31'),
('fleet','All','monthly','Mar','expenses', 1358000, '2026-03-31'),
('fleet','All','monthly','Apr','revenue',  3620000, '2026-04-30'),
('fleet','All','monthly','Apr','target',   3200000, '2026-04-30'),
('fleet','All','monthly','Apr','expenses', 1412000, '2026-04-30'),
('fleet','All','monthly','May','revenue',  3910000, '2026-05-31'),
('fleet','All','monthly','May','target',   3400000, '2026-05-31'),
('fleet','All','monthly','May','expenses', 1525000, '2026-05-31'),
('fleet','All','monthly','Jun','revenue',  2050000, '2026-06-10'),
('fleet','All','monthly','Jun','target',   3200000, '2026-06-10'),
('fleet','All','monthly','Jun','expenses',  800000, '2026-06-10');

-- ── Fleet All — Last 3 Months (Wk1-Wk12) ─────────────────────────────────
INSERT INTO public.analytics_series (scope,scope_id,period_type,period_label,metric_type,value,recorded_date) VALUES
('fleet','All','last3months','Wk1', 'revenue',  820000, '2026-03-07'),
('fleet','All','last3months','Wk1', 'target',   750000, '2026-03-07'),
('fleet','All','last3months','Wk1', 'expenses', 320000, '2026-03-07'),
('fleet','All','last3months','Wk2', 'revenue',  860000, '2026-03-14'),
('fleet','All','last3months','Wk2', 'target',   780000, '2026-03-14'),
('fleet','All','last3months','Wk2', 'expenses', 336000, '2026-03-14'),
('fleet','All','last3months','Wk3', 'revenue',  840000, '2026-03-21'),
('fleet','All','last3months','Wk3', 'target',   760000, '2026-03-21'),
('fleet','All','last3months','Wk3', 'expenses', 328000, '2026-03-21'),
('fleet','All','last3months','Wk4', 'revenue',  890000, '2026-03-28'),
('fleet','All','last3months','Wk4', 'target',   800000, '2026-03-28'),
('fleet','All','last3months','Wk4', 'expenses', 347000, '2026-03-28'),
('fleet','All','last3months','Wk5', 'revenue',  920000, '2026-04-07'),
('fleet','All','last3months','Wk5', 'target',   820000, '2026-04-07'),
('fleet','All','last3months','Wk5', 'expenses', 359000, '2026-04-07'),
('fleet','All','last3months','Wk6', 'revenue',  960000, '2026-04-14'),
('fleet','All','last3months','Wk6', 'target',   850000, '2026-04-14'),
('fleet','All','last3months','Wk6', 'expenses', 375000, '2026-04-14'),
('fleet','All','last3months','Wk7', 'revenue',  940000, '2026-04-21'),
('fleet','All','last3months','Wk7', 'target',   840000, '2026-04-21'),
('fleet','All','last3months','Wk7', 'expenses', 367000, '2026-04-21'),
('fleet','All','last3months','Wk8', 'revenue', 1010000, '2026-04-28'),
('fleet','All','last3months','Wk8', 'target',   890000, '2026-04-28'),
('fleet','All','last3months','Wk8', 'expenses', 394000, '2026-04-28'),
('fleet','All','last3months','Wk9', 'revenue', 1050000, '2026-05-07'),
('fleet','All','last3months','Wk9', 'target',   920000, '2026-05-07'),
('fleet','All','last3months','Wk9', 'expenses', 410000, '2026-05-07'),
('fleet','All','last3months','Wk10','revenue', 1090000, '2026-05-14'),
('fleet','All','last3months','Wk10','target',   950000, '2026-05-14'),
('fleet','All','last3months','Wk10','expenses', 425000, '2026-05-14'),
('fleet','All','last3months','Wk11','revenue', 1070000, '2026-05-21'),
('fleet','All','last3months','Wk11','target',   940000, '2026-05-21'),
('fleet','All','last3months','Wk11','expenses', 418000, '2026-05-21'),
('fleet','All','last3months','Wk12','revenue',  800000, '2026-06-07'),
('fleet','All','last3months','Wk12','target',   880000, '2026-06-07'),
('fleet','All','last3months','Wk12','expenses', 312000, '2026-06-07');

-- ── Fleet All — Yearly ────────────────────────────────────────────────────
INSERT INTO public.analytics_series (scope,scope_id,period_type,period_label,metric_type,value,recorded_date) VALUES
('fleet','All','yearly','2023','revenue', 28500000, '2023-12-31'),
('fleet','All','yearly','2023','target',  26000000, '2023-12-31'),
('fleet','All','yearly','2023','expenses',11115000, '2023-12-31'),
('fleet','All','yearly','2024','revenue', 34200000, '2024-12-31'),
('fleet','All','yearly','2024','target',  31000000, '2024-12-31'),
('fleet','All','yearly','2024','expenses',13338000, '2024-12-31'),
('fleet','All','yearly','2025','revenue', 41800000, '2025-12-31'),
('fleet','All','yearly','2025','target',  38000000, '2025-12-31'),
('fleet','All','yearly','2025','expenses',16302000, '2025-12-31'),
('fleet','All','yearly','2026','revenue', 21000000, '2026-06-10'),
('fleet','All','yearly','2026','target',  42000000, '2026-06-10'),
('fleet','All','yearly','2026','expenses', 8190000, '2026-06-10');

-- ═══════════════════════════════════════════════════════════════════
-- FLEET — Per Brand (Hyundai, Kia, MG Motor, Mahindra, Tata)
-- Used by ChartsPage brand filter
-- ═══════════════════════════════════════════════════════════════════

-- Helper macro: each brand gets monthly + last3months + yearly
-- Values are proportional to their vehicle count share

-- ── Hyundai (2 vehicles, ~15% of fleet) ─────────────────────────────────
INSERT INTO public.analytics_series (scope,scope_id,period_type,period_label,metric_type,value,recorded_date) VALUES
('fleet','Hyundai','monthly','Jan','revenue', 477000,'2026-01-31'),('fleet','Hyundai','monthly','Jan','expenses',186000,'2026-01-31'),('fleet','Hyundai','monthly','Jan','maintenance',38000,'2026-01-31'),('fleet','Hyundai','monthly','Jan','charging',148000,'2026-01-31'),
('fleet','Hyundai','monthly','Feb','revenue', 441000,'2026-02-28'),('fleet','Hyundai','monthly','Feb','expenses',172000,'2026-02-28'),('fleet','Hyundai','monthly','Feb','maintenance',35000,'2026-02-28'),('fleet','Hyundai','monthly','Feb','charging',137000,'2026-02-28'),
('fleet','Hyundai','monthly','Mar','revenue', 522000,'2026-03-31'),('fleet','Hyundai','monthly','Mar','expenses',204000,'2026-03-31'),('fleet','Hyundai','monthly','Mar','maintenance',42000,'2026-03-31'),('fleet','Hyundai','monthly','Mar','charging',162000,'2026-03-31'),
('fleet','Hyundai','monthly','Apr','revenue', 543000,'2026-04-30'),('fleet','Hyundai','monthly','Apr','expenses',212000,'2026-04-30'),('fleet','Hyundai','monthly','Apr','maintenance',43000,'2026-04-30'),('fleet','Hyundai','monthly','Apr','charging',169000,'2026-04-30'),
('fleet','Hyundai','monthly','May','revenue', 587000,'2026-05-31'),('fleet','Hyundai','monthly','May','expenses',229000,'2026-05-31'),('fleet','Hyundai','monthly','May','maintenance',47000,'2026-05-31'),('fleet','Hyundai','monthly','May','charging',182000,'2026-05-31'),
('fleet','Hyundai','monthly','Jun','revenue', 308000,'2026-06-10'),('fleet','Hyundai','monthly','Jun','expenses',120000,'2026-06-10'),('fleet','Hyundai','monthly','Jun','maintenance',25000,'2026-06-10'),('fleet','Hyundai','monthly','Jun','charging', 95000,'2026-06-10'),
('fleet','Hyundai','yearly','2023','revenue',2850000,'2023-12-31'),('fleet','Hyundai','yearly','2023','expenses',1112000,'2023-12-31'),
('fleet','Hyundai','yearly','2024','revenue',3420000,'2024-12-31'),('fleet','Hyundai','yearly','2024','expenses',1334000,'2024-12-31'),
('fleet','Hyundai','yearly','2025','revenue',4180000,'2025-12-31'),('fleet','Hyundai','yearly','2025','expenses',1630000,'2025-12-31'),
('fleet','Hyundai','yearly','2026','revenue',2100000,'2026-06-10'),('fleet','Hyundai','yearly','2026','expenses', 819000,'2026-06-10');

-- ── Kia (3 vehicles, ~21%) ───────────────────────────────────────────────
INSERT INTO public.analytics_series (scope,scope_id,period_type,period_label,metric_type,value,recorded_date) VALUES
('fleet','Kia','monthly','Jan','revenue', 668000,'2026-01-31'),('fleet','Kia','monthly','Jan','expenses',261000,'2026-01-31'),('fleet','Kia','monthly','Jan','maintenance',55000,'2026-01-31'),('fleet','Kia','monthly','Jan','charging',206000,'2026-01-31'),
('fleet','Kia','monthly','Feb','revenue', 617000,'2026-02-28'),('fleet','Kia','monthly','Feb','expenses',241000,'2026-02-28'),('fleet','Kia','monthly','Feb','maintenance',51000,'2026-02-28'),('fleet','Kia','monthly','Feb','charging',190000,'2026-02-28'),
('fleet','Kia','monthly','Mar','revenue', 731000,'2026-03-31'),('fleet','Kia','monthly','Mar','expenses',285000,'2026-03-31'),('fleet','Kia','monthly','Mar','maintenance',60000,'2026-03-31'),('fleet','Kia','monthly','Mar','charging',225000,'2026-03-31'),
('fleet','Kia','monthly','Apr','revenue', 760000,'2026-04-30'),('fleet','Kia','monthly','Apr','expenses',297000,'2026-04-30'),('fleet','Kia','monthly','Apr','maintenance',63000,'2026-04-30'),('fleet','Kia','monthly','Apr','charging',234000,'2026-04-30'),
('fleet','Kia','monthly','May','revenue', 821000,'2026-05-31'),('fleet','Kia','monthly','May','expenses',320000,'2026-05-31'),('fleet','Kia','monthly','May','maintenance',67000,'2026-05-31'),('fleet','Kia','monthly','May','charging',253000,'2026-05-31'),
('fleet','Kia','monthly','Jun','revenue', 431000,'2026-06-10'),('fleet','Kia','monthly','Jun','expenses',168000,'2026-06-10'),('fleet','Kia','monthly','Jun','maintenance',35000,'2026-06-10'),('fleet','Kia','monthly','Jun','charging',133000,'2026-06-10'),
('fleet','Kia','yearly','2023','revenue',3990000,'2023-12-31'),('fleet','Kia','yearly','2023','expenses',1557000,'2023-12-31'),
('fleet','Kia','yearly','2024','revenue',4788000,'2024-12-31'),('fleet','Kia','yearly','2024','expenses',1867000,'2024-12-31'),
('fleet','Kia','yearly','2025','revenue',5852000,'2025-12-31'),('fleet','Kia','yearly','2025','expenses',2283000,'2025-12-31'),
('fleet','Kia','yearly','2026','revenue',2940000,'2026-06-10'),('fleet','Kia','yearly','2026','expenses',1147000,'2026-06-10');

-- ── MG Motor (3 vehicles, ~21%) ──────────────────────────────────────────
INSERT INTO public.analytics_series (scope,scope_id,period_type,period_label,metric_type,value,recorded_date) VALUES
('fleet','MG Motor','monthly','Jan','revenue', 612000,'2026-01-31'),('fleet','MG Motor','monthly','Jan','expenses',239000,'2026-01-31'),('fleet','MG Motor','monthly','Jan','maintenance',48000,'2026-01-31'),('fleet','MG Motor','monthly','Jan','charging',191000,'2026-01-31'),
('fleet','MG Motor','monthly','Feb','revenue', 566000,'2026-02-28'),('fleet','MG Motor','monthly','Feb','expenses',221000,'2026-02-28'),('fleet','MG Motor','monthly','Feb','maintenance',44000,'2026-02-28'),('fleet','MG Motor','monthly','Feb','charging',177000,'2026-02-28'),
('fleet','MG Motor','monthly','Mar','revenue', 670000,'2026-03-31'),('fleet','MG Motor','monthly','Mar','expenses',261000,'2026-03-31'),('fleet','MG Motor','monthly','Mar','maintenance',52000,'2026-03-31'),('fleet','MG Motor','monthly','Mar','charging',209000,'2026-03-31'),
('fleet','MG Motor','monthly','Apr','revenue', 696000,'2026-04-30'),('fleet','MG Motor','monthly','Apr','expenses',272000,'2026-04-30'),('fleet','MG Motor','monthly','Apr','maintenance',54000,'2026-04-30'),('fleet','MG Motor','monthly','Apr','charging',218000,'2026-04-30'),
('fleet','MG Motor','monthly','May','revenue', 752000,'2026-05-31'),('fleet','MG Motor','monthly','May','expenses',293000,'2026-05-31'),('fleet','MG Motor','monthly','May','maintenance',59000,'2026-05-31'),('fleet','MG Motor','monthly','May','charging',234000,'2026-05-31'),
('fleet','MG Motor','monthly','Jun','revenue', 395000,'2026-06-10'),('fleet','MG Motor','monthly','Jun','expenses',154000,'2026-06-10'),('fleet','MG Motor','monthly','Jun','maintenance',31000,'2026-06-10'),('fleet','MG Motor','monthly','Jun','charging',123000,'2026-06-10'),
('fleet','MG Motor','yearly','2023','revenue',3657000,'2023-12-31'),('fleet','MG Motor','yearly','2023','expenses',1426000,'2023-12-31'),
('fleet','MG Motor','yearly','2024','revenue',4389000,'2024-12-31'),('fleet','MG Motor','yearly','2024','expenses',1712000,'2024-12-31'),
('fleet','MG Motor','yearly','2025','revenue',5366000,'2025-12-31'),('fleet','MG Motor','yearly','2025','expenses',2093000,'2025-12-31'),
('fleet','MG Motor','yearly','2026','revenue',2695000,'2026-06-10'),('fleet','MG Motor','yearly','2026','expenses',1051000,'2026-06-10');

-- ── Mahindra (3 vehicles, ~21%) ──────────────────────────────────────────
INSERT INTO public.analytics_series (scope,scope_id,period_type,period_label,metric_type,value,recorded_date) VALUES
('fleet','Mahindra','monthly','Jan','revenue', 545000,'2026-01-31'),('fleet','Mahindra','monthly','Jan','expenses',213000,'2026-01-31'),('fleet','Mahindra','monthly','Jan','maintenance',62000,'2026-01-31'),('fleet','Mahindra','monthly','Jan','charging',151000,'2026-01-31'),
('fleet','Mahindra','monthly','Feb','revenue', 504000,'2026-02-28'),('fleet','Mahindra','monthly','Feb','expenses',197000,'2026-02-28'),('fleet','Mahindra','monthly','Feb','maintenance',57000,'2026-02-28'),('fleet','Mahindra','monthly','Feb','charging',140000,'2026-02-28'),
('fleet','Mahindra','monthly','Mar','revenue', 597000,'2026-03-31'),('fleet','Mahindra','monthly','Mar','expenses',233000,'2026-03-31'),('fleet','Mahindra','monthly','Mar','maintenance',68000,'2026-03-31'),('fleet','Mahindra','monthly','Mar','charging',165000,'2026-03-31'),
('fleet','Mahindra','monthly','Apr','revenue', 620000,'2026-04-30'),('fleet','Mahindra','monthly','Apr','expenses',242000,'2026-04-30'),('fleet','Mahindra','monthly','Apr','maintenance',71000,'2026-04-30'),('fleet','Mahindra','monthly','Apr','charging',171000,'2026-04-30'),
('fleet','Mahindra','monthly','May','revenue', 670000,'2026-05-31'),('fleet','Mahindra','monthly','May','expenses',261000,'2026-05-31'),('fleet','Mahindra','monthly','May','maintenance',76000,'2026-05-31'),('fleet','Mahindra','monthly','May','charging',185000,'2026-05-31'),
('fleet','Mahindra','monthly','Jun','revenue', 352000,'2026-06-10'),('fleet','Mahindra','monthly','Jun','expenses',137000,'2026-06-10'),('fleet','Mahindra','monthly','Jun','maintenance',40000,'2026-06-10'),('fleet','Mahindra','monthly','Jun','charging', 97000,'2026-06-10'),
('fleet','Mahindra','yearly','2023','revenue',3255000,'2023-12-31'),('fleet','Mahindra','yearly','2023','expenses',1270000,'2023-12-31'),
('fleet','Mahindra','yearly','2024','revenue',3906000,'2024-12-31'),('fleet','Mahindra','yearly','2024','expenses',1523000,'2024-12-31'),
('fleet','Mahindra','yearly','2025','revenue',4777000,'2025-12-31'),('fleet','Mahindra','yearly','2025','expenses',1863000,'2025-12-31'),
('fleet','Mahindra','yearly','2026','revenue',2401000,'2026-06-10'),('fleet','Mahindra','yearly','2026','expenses', 937000,'2026-06-10');

-- ── Tata (4 vehicles, ~29%) ──────────────────────────────────────────────
INSERT INTO public.analytics_series (scope,scope_id,period_type,period_label,metric_type,value,recorded_date) VALUES
('fleet','Tata','monthly','Jan','revenue', 762000,'2026-01-31'),('fleet','Tata','monthly','Jan','expenses',297000,'2026-01-31'),('fleet','Tata','monthly','Jan','maintenance',60000,'2026-01-31'),('fleet','Tata','monthly','Jan','charging',237000,'2026-01-31'),
('fleet','Tata','monthly','Feb','revenue', 705000,'2026-02-28'),('fleet','Tata','monthly','Feb','expenses',275000,'2026-02-28'),('fleet','Tata','monthly','Feb','maintenance',55000,'2026-02-28'),('fleet','Tata','monthly','Feb','charging',220000,'2026-02-28'),
('fleet','Tata','monthly','Mar','revenue', 835000,'2026-03-31'),('fleet','Tata','monthly','Mar','expenses',326000,'2026-03-31'),('fleet','Tata','monthly','Mar','maintenance',66000,'2026-03-31'),('fleet','Tata','monthly','Mar','charging',260000,'2026-03-31'),
('fleet','Tata','monthly','Apr','revenue', 868000,'2026-04-30'),('fleet','Tata','monthly','Apr','expenses',339000,'2026-04-30'),('fleet','Tata','monthly','Apr','maintenance',69000,'2026-04-30'),('fleet','Tata','monthly','Apr','charging',270000,'2026-04-30'),
('fleet','Tata','monthly','May','revenue', 938000,'2026-05-31'),('fleet','Tata','monthly','May','expenses',366000,'2026-05-31'),('fleet','Tata','monthly','May','maintenance',75000,'2026-05-31'),('fleet','Tata','monthly','May','charging',291000,'2026-05-31'),
('fleet','Tata','monthly','Jun','revenue', 493000,'2026-06-10'),('fleet','Tata','monthly','Jun','expenses',192000,'2026-06-10'),('fleet','Tata','monthly','Jun','maintenance',39000,'2026-06-10'),('fleet','Tata','monthly','Jun','charging',153000,'2026-06-10'),
('fleet','Tata','yearly','2023','revenue',4560000,'2023-12-31'),('fleet','Tata','yearly','2023','expenses',1778000,'2023-12-31'),
('fleet','Tata','yearly','2024','revenue',5472000,'2024-12-31'),('fleet','Tata','yearly','2024','expenses',2134000,'2024-12-31'),
('fleet','Tata','yearly','2025','revenue',6688000,'2025-12-31'),('fleet','Tata','yearly','2025','expenses',2608000,'2025-12-31'),
('fleet','Tata','yearly','2026','revenue',3360000,'2026-06-10'),('fleet','Tata','yearly','2026','expenses',1310000,'2026-06-10');

-- ═══════════════════════════════════════════════════════════════════
-- GENERAL — growth KPIs for all period types
-- ═══════════════════════════════════════════════════════════════════
INSERT INTO public.analytics_series (scope,scope_id,period_type,period_label,metric_type,value,recorded_date) VALUES
-- Monthly growth KPIs
('general','growth','monthly',null,'fleetRevenue',  19210000, '2026-05-31'),
('general','growth','monthly',null,'energyToday',      73400, '2026-05-31'),
('general','growth','monthly',null,'revenueGrowth',     11.8, '2026-05-31'),
('general','growth','monthly',null,'energyGrowth',      -1.4, '2026-05-31'),
('general','growth','monthly',null,'healthGrowth',      -0.6, '2026-05-31'),
('general','growth','monthly',null,'activeGrowth',       6.2, '2026-05-31'),
-- Last 3 months growth KPIs
('general','growth','last3months',null,'fleetRevenue', 57630000, '2026-06-07'),
('general','growth','last3months',null,'energyToday',    220200, '2026-06-07'),
('general','growth','last3months',null,'revenueGrowth',    13.1, '2026-06-07'),
('general','growth','last3months',null,'energyGrowth',     -2.1, '2026-06-07'),
('general','growth','last3months',null,'healthGrowth',     -0.8, '2026-06-07'),
('general','growth','last3months',null,'activeGrowth',      7.4, '2026-06-07'),
-- Yearly growth KPIs
('general','growth','yearly',null,'fleetRevenue',  104500000, '2026-06-07'),
('general','growth','yearly',null,'energyToday',      880000, '2026-06-07'),
('general','growth','yearly',null,'revenueGrowth',      22.1, '2026-06-07'),
('general','growth','yearly',null,'energyGrowth',       -3.5, '2026-06-07'),
('general','growth','yearly',null,'healthGrowth',       -1.2, '2026-06-07'),
('general','growth','yearly',null,'activeGrowth',       11.8, '2026-06-07');

-- ═══════════════════════════════════════════════════════════════════
-- GENERAL — monthly + yearly battery health, distance, energy
-- (used by ChartsPage General Reports tab)
-- ═══════════════════════════════════════════════════════════════════
INSERT INTO public.analytics_series (scope,scope_id,period_type,period_label,metric_type,value,recorded_date) VALUES
-- Battery health trend — monthly (already has Jun in seed_data, add rest)
('general',null,'monthly','Jan','avgHealth', 94.8,'2026-01-31'),
('general',null,'monthly','Feb','avgHealth', 94.2,'2026-02-28'),
('general',null,'monthly','Mar','avgHealth', 93.6,'2026-03-31'),
('general',null,'monthly','Apr','avgHealth', 93.1,'2026-04-30'),
('general',null,'monthly','May','avgHealth', 92.4,'2026-05-31'),
('general',null,'monthly','Jun','avgHealth', 91.8,'2026-06-07')
ON CONFLICT DO NOTHING;

-- ── Revenue snapshots — monthly + yearly (used by MiniRevenueChart) ─────────
INSERT INTO public.revenue_snapshots (period_type,period_label,revenue,target,snapshot_date) VALUES
('monthly','Jan',3180000,2900000,'2026-01-31'),
('monthly','Feb',2940000,2800000,'2026-02-28'),
('monthly','Mar',3480000,3100000,'2026-03-31'),
('monthly','Apr',3620000,3200000,'2026-04-30'),
('monthly','May',3910000,3400000,'2026-05-31'),
('monthly','Jun',2050000,3200000,'2026-06-10'),
('yearly','2023',28500000,26000000,'2023-12-31'),
('yearly','2024',34200000,31000000,'2024-12-31'),
('yearly','2025',41800000,38000000,'2025-12-31'),
('yearly','2026',21000000,42000000,'2026-06-10')
ON CONFLICT DO NOTHING;

-- Also add last3months revenue snapshots
INSERT INTO public.revenue_snapshots (period_type,period_label,revenue,target,snapshot_date) VALUES
('last3months','Wk1',  820000, 750000,'2026-03-07'),
('last3months','Wk2',  860000, 780000,'2026-03-14'),
('last3months','Wk3',  840000, 760000,'2026-03-21'),
('last3months','Wk4',  890000, 800000,'2026-03-28'),
('last3months','Wk5',  920000, 820000,'2026-04-07'),
('last3months','Wk6',  960000, 850000,'2026-04-14'),
('last3months','Wk7',  940000, 840000,'2026-04-21'),
('last3months','Wk8', 1010000, 890000,'2026-04-28'),
('last3months','Wk9', 1050000, 920000,'2026-05-07'),
('last3months','Wk10',1090000, 950000,'2026-05-14'),
('last3months','Wk11',1070000, 940000,'2026-05-21'),
('last3months','Wk12', 800000, 880000,'2026-06-07')
ON CONFLICT DO NOTHING;
