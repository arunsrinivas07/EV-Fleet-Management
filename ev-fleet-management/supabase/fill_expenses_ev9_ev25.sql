-- ============================================================================
-- SQL PATCH: Seed Expense Breakdown Data for EV-009 to EV-025
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- Safe to re-run: deletes existing expenses for EV-009..EV-025 before inserting.
-- ============================================================================

-- ── 1. CLEAN EXISTING EXPENSES FOR EV-009 TO EV-025 ─────────────────────────
DELETE FROM public.vehicle_expenses 
WHERE vehicle_id IN (
  'EV-009', 'EV-010', 'EV-011', 'EV-012', 'EV-013', 'EV-014', 'EV-015', 
  'EV-016', 'EV-017', 'EV-018', 'EV-019', 'EV-020', 'EV-021', 'EV-022', 
  'EV-023', 'EV-024', 'EV-025'
);

-- ── 2. INSERT REALISTIC EXPENSE DATA ─────────────────────────────────────────
INSERT INTO public.vehicle_expenses (vehicle_id, type, amount, note, expense_date) VALUES
-- EV-009 (Mahindra BE 6)
('EV-009', 'Charging', 2800, 'Monthly fast charging package', '2026-06-08'),
('EV-009', 'Charging', 2400, 'Depot overnight charging', '2026-05-15'),
('EV-009', 'Maintenance', 3200, 'Battery coolant flush', '2026-05-10'),
('EV-009', 'Insurance', 4900, 'Quarterly premium - Mahindra BE6', '2026-04-01'),
('EV-009', 'Misc', 850, 'Fastag wallet top-up', '2026-06-02'),

-- EV-010 (Mahindra XEV 9e)
('EV-010', 'Charging', 3100, 'High-speed public charging', '2026-06-09'),
('EV-010', 'Charging', 2900, 'Home charger reimbursement', '2026-05-20'),
('EV-010', 'Maintenance', 4500, 'Brake pad inspection and cleaning', '2026-05-08'),
('EV-010', 'Insurance', 5600, 'Quarterly premium - XEV 9e', '2026-04-01'),
('EV-010', 'Misc', 1200, 'Premium car wash and interior cleaning', '2026-06-05'),

-- EV-011 (Mahindra XUV400 EV)
('EV-011', 'Charging', 2100, 'Monthly station charging', '2026-06-07'),
('EV-011', 'Charging', 1900, 'Overnight depot charging', '2026-05-18'),
('EV-011', 'Maintenance', 11800, 'Suspension strut replacement', '2026-05-12'),
('EV-011', 'Insurance', 3800, 'Quarterly premium - XUV400', '2026-04-01'),
('EV-011', 'Misc', 500, 'Windshield washer fluid top-up', '2026-06-01'),

-- EV-012 (Tata Curvv EV)
('EV-012', 'Charging', 3200, 'Monthly fast charging', '2026-06-10'),
('EV-012', 'Charging', 2950, 'Depot slow charging', '2026-05-22'),
('EV-012', 'Maintenance', 2400, 'Cabin AC filter replacement', '2026-05-14'),
('EV-012', 'Insurance', 4700, 'Quarterly premium - Curvv EV', '2026-04-01'),
('EV-012', 'Misc', 900, 'Fastag toll auto-debit', '2026-06-03'),

-- EV-013 (Tata Nexon EV)
('EV-013', 'Charging', 2600, 'Monthly charging card', '2026-06-08'),
('EV-013', 'Charging', 2300, 'Home electricity bill allocation', '2026-05-10'),
('EV-013', 'Maintenance', 1300, 'Wheel balancing and rotation', '2026-05-25'),
('EV-013', 'Insurance', 3900, 'Quarterly premium - Nexon EV', '2026-04-01'),
('EV-013', 'Misc', 650, 'Puncture repair and valve replacement', '2026-06-02'),

-- EV-014 (Tata Punch EV)
('EV-014', 'Charging', 2100, 'Monthly charging', '2026-06-07'),
('EV-014', 'Charging', 1800, 'Depot charging', '2026-05-14'),
('EV-014', 'Maintenance', 2200, 'Battery thermal management system check', '2026-05-05'),
('EV-014', 'Insurance', 3500, 'Quarterly premium - Punch EV', '2026-04-01'),
('EV-014', 'Misc', 1100, 'Full body wash and detailing', '2026-05-28'),

-- EV-015 (Tata Tiago EV)
('EV-015', 'Charging', 1950, 'Monthly public charging', '2026-06-09'),
('EV-015', 'Charging', 1600, 'Home charger reimbursement', '2026-05-12'),
('EV-015', 'Maintenance', 3100, 'First year full service and fluid top-up', '2026-05-22'),
('EV-015', 'Insurance', 3200, 'Quarterly premium - Tiago EV', '2026-04-01'),
('EV-015', 'Misc', 450, 'Key fob battery replacement', '2026-06-01'),

-- EV-016 (Hyundai Creta EV)
('EV-016', 'Charging', 2900, 'Monthly fast charging', '2026-06-08'),
('EV-016', 'Charging', 2700, 'Overnight charging depot', '2026-05-20'),
('EV-016', 'Maintenance', 2100, 'Tyre rotation and wheel alignment', '2026-05-18'),
('EV-016', 'Insurance', 4400, 'Quarterly premium - Creta EV', '2026-04-01'),
('EV-016', 'Misc', 950, 'Fastag recharge', '2026-06-02'),

-- EV-017 (Hyundai Ioniq 5)
('EV-017', 'Charging', 3800, 'Supercharger network access', '2026-06-10'),
('EV-017', 'Charging', 3100, 'Overnight AC charging', '2026-05-25'),
('EV-017', 'Maintenance', 5400, 'AC cooling unit service', '2026-05-12'),
('EV-017', 'Insurance', 5800, 'Quarterly premium - Ioniq 5', '2026-04-01'),
('EV-017', 'Misc', 1500, 'Underbody rust protection coating', '2026-06-01'),

-- EV-018 (Kia EV6)
('EV-018', 'Charging', 3600, 'Ultra-fast public charging', '2026-06-09'),
('EV-018', 'Charging', 3200, 'Depot smart charging', '2026-05-18'),
('EV-018', 'Maintenance', 4800, 'Brake pad replacement (front)', '2026-05-02'),
('EV-018', 'Insurance', 5500, 'Quarterly premium - Kia EV6', '2026-04-01'),
('EV-018', 'Misc', 1100, 'Premium car shampoo and wax kit', '2026-06-04'),

-- EV-019 (MG Windsor EV)
('EV-019', 'Charging', 2400, 'Public fast charging sessions', '2026-06-07'),
('EV-019', 'Charging', 1900, 'Overnight charging depot', '2026-05-22'),
('EV-019', 'Maintenance', 2800, 'Battery coolant flush & diagnostic check', '2026-05-15'),
('EV-019', 'Insurance', 3900, 'Quarterly premium - Windsor EV', '2026-04-01'),
('EV-019', 'Misc', 800, 'Toll highway charges', '2026-06-03'),

-- EV-020 (Mahindra BE 6)
('EV-020', 'Charging', 2850, 'Overnight slow charging package', '2026-06-08'),
('EV-020', 'Charging', 2500, 'Monthly public fast charging', '2026-05-14'),
('EV-020', 'Maintenance', 3100, 'Brake calipers cleaning and lubrication', '2026-05-20'),
('EV-020', 'Insurance', 4900, 'Quarterly premium - Mahindra BE6', '2026-04-01'),
('EV-020', 'Misc', 600, 'Fastag toll pass', '2026-06-01'),

-- EV-021 (Tata Nexon EV)
('EV-021', 'Charging', 2700, 'Fast charging top-ups', '2026-06-09'),
('EV-021', 'Charging', 2200, 'Monthly depot charging plan', '2026-05-18'),
('EV-021', 'Maintenance', 4100, 'Scheduled 20,000 km general service', '2026-05-10'),
('EV-021', 'Insurance', 4000, 'Quarterly premium - Nexon EV', '2026-04-01'),
('EV-021', 'Misc', 750, 'Wiper blades replacement', '2026-05-30'),

-- EV-022 (MG Comet EV)
('EV-022', 'Charging', 1550, 'Public station slow charging', '2026-06-07'),
('EV-022', 'Charging', 1350, 'Home charging reimbursement', '2026-05-24'),
('EV-022', 'Maintenance', 1100, 'Wheel alignment and tyre rotation', '2026-05-15'),
('EV-022', 'Insurance', 2800, 'Quarterly premium - Comet EV', '2026-04-01'),
('EV-022', 'Misc', 400, 'Car wash', '2026-06-02'),

-- EV-023 (Kia Carens Clavis EV)
('EV-023', 'Charging', 2900, 'Monthly fast charging card', '2026-06-10'),
('EV-023', 'Charging', 2600, 'Overnight AC charging depot', '2026-05-19'),
('EV-023', 'Maintenance', 4100, 'Suspension lubrication and checkup', '2026-05-12'),
('EV-023', 'Insurance', 4800, 'Quarterly premium - Carens Clavis EV', '2026-04-01'),
('EV-023', 'Misc', 900, 'Highway Fastag usage', '2026-06-04'),

-- EV-024 (Mahindra XUV400 EV)
('EV-024', 'Charging', 2300, 'Public charger network', '2026-06-09'),
('EV-024', 'Charging', 2000, 'Overnight charging depot', '2026-05-16'),
('EV-024', 'Maintenance', 8200, 'Brake rotor resurfacing & new pads', '2026-05-08'),
('EV-024', 'Insurance', 3800, 'Quarterly premium - XUV400', '2026-04-01'),
('EV-024', 'Misc', 550, 'Cabin air fresheners and dashboard wipes', '2026-05-25'),

-- EV-025 (Tata Curvv EV)
('EV-025', 'Charging', 3150, 'High-speed public charging', '2026-06-08'),
('EV-025', 'Charging', 2400, 'Depot overnight slow charging', '2026-05-11'),
('EV-025', 'Maintenance', 5600, 'Tyre replacement (Single rear-left)', '2026-05-04'),
('EV-025', 'Insurance', 4300, 'Quarterly premium - Curvv EV', '2026-04-01'),
('EV-025', 'Misc', 1250, 'GPS tracking system subscription renewal', '2026-06-03');
