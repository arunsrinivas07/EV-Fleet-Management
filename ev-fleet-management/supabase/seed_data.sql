-- ============================================================
-- EV Fleet Pro — Full Seed Data (South Indian Names + Indian EVs)
-- Run in: Supabase Dashboard → SQL Editor → New query
-- ORDER: delete dependents first, then re-insert from top
-- ============================================================

-- ── 0. CLEAN EXISTING SEED DATA ──────────────────────────────────────────────
delete from public.analytics_series;
delete from public.revenue_snapshots;
delete from public.charging_stations;
delete from public.trips;
delete from public.alerts;
delete from public.vehicle_expenses;
delete from public.vehicle_maintenance_records;
delete from public.vehicle_service_history;
delete from public.drivers   where id like 'D-%';
delete from public.vehicles  where id like 'EV-%';
delete from public.ev_models;
delete from public.cities;

-- ── 1. VEHICLES (14 cars across 5 brands) ────────────────────────────────────
-- Hyundai x2, Kia x3, MG x3, Mahindra x3, Tata x4 (but we cap at 14 = EV-001..EV-014)
-- Statuses spread: running(5), charging(3), idle(4), workshop(2)

insert into public.vehicles
  (id, model, manufacturer, image_url, battery_capacity,
   status, battery_percent, battery_health, speed,
   location, lat, lng, range_km, revenue, total_distance, is_charging)
values
-- Hyundai
('EV-001','Creta EV',     'Hyundai',
 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=400&h=250&fit=crop',
 '51.4 kWh','running', 74, 95, 52,
 'Anna Nagar, Chennai',         13.0850, 80.2101, 296, 21400, 11230, false),

('EV-002','Ioniq 5',      'Hyundai',
 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=400&h=250&fit=crop',
 '72.6 kWh','charging', 38, 91, 0,
 'Koramangala, Bengaluru',      12.9352, 77.6245, 198, 18700,  8940, true),

-- Kia
('EV-003','Carens Clavis EV','Kia',
 'https://images.unsplash.com/photo-1610777988688-3671e03dbdf1?w=400&h=250&fit=crop',
 '51.4 kWh','running', 81, 97, 47,
 'Jubilee Hills, Hyderabad',    17.4314, 78.4075, 318, 15600,  6780, false),

('EV-004','EV6',          'Kia',
 'https://images.unsplash.com/photo-1610777988688-3671e03dbdf1?w=400&h=250&fit=crop',
 '77.4 kWh','idle',    62, 93, 0,
 'Velachery, Chennai',          12.9819, 80.2205, 351,  9200, 14560, false),

('EV-005','EV9',          'Kia',
 'https://images.unsplash.com/photo-1610777988688-3671e03dbdf1?w=400&h=250&fit=crop',
 '99.8 kWh','workshop', 19, 77, 0,
 'Service Centre, Bengaluru',   12.9716, 77.5946,  82,  7800, 19870, false),

-- MG
('EV-006','Comet EV',     'MG Motor',
 'https://images.unsplash.com/photo-1605559424843-9073730702d0?w=400&h=250&fit=crop',
 '17.3 kWh','running', 67, 88, 38,
 'T. Nagar, Chennai',           13.0418, 80.2341, 148, 11200,  7450, false),

('EV-007','Windsor EV',   'MG Motor',
 'https://images.unsplash.com/photo-1605559424843-9073730702d0?w=400&h=250&fit=crop',
 '38.0 kWh','charging', 51, 90, 0,
 'Electronic City, Bengaluru',  12.8399, 77.6770, 224, 16300,  9120, true),

('EV-008','ZS EV',        'MG Motor',
 'https://images.unsplash.com/photo-1605559424843-9073730702d0?w=400&h=250&fit=crop',
 '50.3 kWh','running', 88, 96, 61,
 'Banjara Hills, Hyderabad',    17.4156, 78.4483, 386, 23100,  5680, false),

-- Mahindra
('EV-009','BE 6',         'Mahindra',
 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop',
 '59.0 kWh','idle',    70, 94, 0,
 'Nungambakkam, Chennai',       13.0569, 80.2425, 340, 13800, 10340, false),

('EV-010','XEV 9e',       'Mahindra',
 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop',
 '79.0 kWh','running', 55, 92, 58,
 'Indiranagar, Bengaluru',      12.9784, 77.6408, 289, 19500,  7230, false),

('EV-011','XUV400 EV',    'Mahindra',
 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop',
 '39.4 kWh','workshop', 28, 82, 0,
 'Service Centre, Hyderabad',   17.3850, 78.4867,  96,  6400, 22100, false),

-- Tata
('EV-012','Curvv EV',     'Tata',
 'https://images.unsplash.com/photo-1593941707882-a56bab827c5e?w=400&h=250&fit=crop',
 '55.0 kWh','running', 79, 98, 63,
 'Adyar, Chennai',              13.0067, 80.2570, 402, 24800,  4960, false),

('EV-013','Nexon EV',     'Tata',
 'https://images.unsplash.com/photo-1593941707882-a56bab827c5e?w=400&h=250&fit=crop',
 '40.5 kWh','idle',    58, 89, 0,
 'Madhapur, Hyderabad',         17.4400, 78.3900, 231, 14100, 13670, false),

('EV-014','Punch EV',     'Tata',
 'https://images.unsplash.com/photo-1593941707882-a56bab827c5e?w=400&h=250&fit=crop',
 '35.0 kWh','charging', 44, 87, 0,
 'Jayanagar, Bengaluru',        12.9250, 77.5938, 196, 10600,  8890, true)
on conflict (id) do update set
  battery_percent = excluded.battery_percent,
  battery_health  = excluded.battery_health,
  speed           = excluded.speed,
  status          = excluded.status,
  updated_at      = now();

-- ── 2. DRIVERS (14 drivers — all with assigned vehicles) ─────────────────────
-- South Indian names: Tamil, Telugu, Kannada, Malayalam mix
-- D-001 to D-011 assigned; D-012 to D-014 unassigned (waiting for vehicle)

insert into public.drivers
  (id, profile_id, name, vehicle_id, avatar,
   trips, overspeed, hard_braking, aggressive_accel,
   safety_score, efficiency_score,
   today_earnings, total_earnings, avg_speed, energy_consumed)
values
('D-001', null, 'Arjun Krishnamurthy',  'EV-001', 'AK', 142,  2,  4,  3,  91, 89, 2650,  96400, 49, 19.2),
('D-002', null, 'Priya Venkataraman',   'EV-002', 'PV',  98,  0,  1,  1,  99, 96, 1950,  72800, 41, 13.8),
('D-003', null, 'Karthik Subramaniam',  'EV-003', 'KS', 167,  7, 11, 13,  71, 74, 3300, 128500, 54, 27.4),
('D-004', null, 'Deepa Raghunathan',    'EV-004', 'DR',  89,  1,  2,  3,  93, 85,    0,  58200, 45, 21.6),
('D-005', null, 'Vikram Narayanan',     'EV-005', 'VN',  76,  3,  6,  7,  80, 78,    0,  43100, 47, 24.1),
('D-006', null, 'Lakshmi Chandrasekaran','EV-006','LC', 213,  4,  5,  6,  86, 92, 1780, 151200, 44, 14.9),
('D-007', null, 'Suresh Balasubramanian','EV-007','SB', 155,  9, 16, 18,  62, 68, 2100, 109300, 57, 29.8),
('D-008', null, 'Ananya Padmanabhan',   'EV-008', 'AP', 118,  1,  2,  2,  96, 93, 2870,  84600, 44, 14.1),
('D-009', null, 'Rajan Thirumalai',     'EV-009', 'RT', 201,  5,  8,  9,  83, 88, 2040, 143700, 46, 17.3),
('D-010', null, 'Kavitha Sundaram',     'EV-010', 'KV', 134,  3,  6,  5,  85, 91, 2430,  97800, 48, 18.7),
('D-011', null, 'Murugan Selvaraj',     'EV-011', 'MS',  92,  6, 10, 12,  74, 71,    0,  61500, 51, 26.3),
('D-012', null, 'Anand Balakrishnan',   'EV-012', 'AB', 178,  2,  3,  4,  94, 90, 3120, 132400, 52, 20.5),
('D-013', null, 'Meenakshi Iyer',       'EV-013', 'MI', 109,  0,  2,  1,  97, 95, 1680,  79200, 43, 15.6),
('D-014', null, 'Senthil Murugesan',    'EV-014', 'SM', 131,  4,  7,  8,  82, 84, 2210,  93500, 50, 22.4)
on conflict (id) do nothing;

-- ── 3. VEHICLE SERVICE HISTORY ────────────────────────────────────────────────
insert into public.vehicle_service_history (vehicle_id, description, service_date) values
('EV-001','Annual full service completed',              '2025-11-10'),
('EV-001','Tyre rotation and balancing',                '2026-02-18'),
('EV-002','Battery health diagnostic — 91% health',    '2025-10-05'),
('EV-002','AC filter replacement',                     '2026-01-22'),
('EV-003','Full service — all OK',                     '2025-12-14'),
('EV-004','Brake pad inspection — 60% remaining',      '2026-03-08'),
('EV-004','Wheel alignment correction',                '2025-09-30'),
('EV-005','Battery module inspection',                 '2025-08-20'),
('EV-005','Suspension component check',                '2026-01-05'),
('EV-006','Full service — minor wiper replacement',    '2026-02-01'),
('EV-007','Tyre replacement — front pair',             '2025-11-25'),
('EV-008','Annual full service',                       '2026-03-15'),
('EV-009','Battery coolant flush',                     '2025-12-02'),
('EV-010','Brake fluid top-up and check',              '2026-02-10'),
('EV-011','Suspension repair — left strut',            '2025-10-18'),
('EV-011','Post-repair inspection',                    '2025-11-03'),
('EV-012','Full service — all systems nominal',        '2026-04-01'),
('EV-013','Tyre rotation',                             '2026-01-14'),
('EV-014','Battery health check — 87%',                '2026-03-28')
on conflict do nothing;

-- ── 4. VEHICLE MAINTENANCE RECORDS ───────────────────────────────────────────
insert into public.vehicle_maintenance_records (vehicle_id, description, status, scheduled_date) values
('EV-001','Next full service due',                      'pending',     '2026-11-01'),
('EV-002','Battery health re-check scheduled',          'pending',     '2026-10-05'),
('EV-003','Tyre replacement — all four',                'pending',     '2026-06-30'),
('EV-004','Next service due',                           'pending',     '2026-09-08'),
('EV-005','Suspension overhaul — in workshop',          'in_progress',  null),
('EV-005','Battery module replacement evaluation',      'in_progress',  null),
('EV-006','Brake pad replacement scheduled',            'pending',     '2026-08-01'),
('EV-007','Coolant system check',                       'pending',     '2026-07-25'),
('EV-008','Annual service due',                         'pending',     '2027-03-15'),
('EV-009','Software OTA update pending',                'pending',      null),
('EV-010','Next service due',                           'pending',     '2027-02-10'),
('EV-011','Suspension repair completion check',         'in_progress',  null),
('EV-012','Next service due',                           'pending',     '2027-04-01'),
('EV-013','Brake fluid replacement',                    'pending',     '2026-07-14'),
('EV-014','Battery thermal management check',           'pending',     '2026-09-28')
on conflict do nothing;

-- ── 5. VEHICLE EXPENSES ───────────────────────────────────────────────────────
insert into public.vehicle_expenses (vehicle_id, type, amount, note, expense_date) values
-- EV-001
('EV-001','Charging',    2200, 'Monthly home + station charging', '2026-05-01'),
('EV-001','Maintenance', 3800, 'Tyre rotation + alignment',       '2026-02-18'),
('EV-001','Charging',    2050, 'Monthly charging',                '2026-04-01'),
('EV-001','Insurance',   4200, 'Quarterly premium — Hyundai',     '2026-04-01'),
-- EV-002
('EV-002','Charging',    3400, 'Monthly charging',                '2026-05-01'),
('EV-002','Maintenance', 2800, 'AC filter + battery check',       '2026-01-22'),
('EV-002','Insurance',   5100, 'Quarterly premium — Ioniq 5',     '2026-04-01'),
-- EV-003
('EV-003','Charging',    2600, 'Monthly charging',                '2026-05-01'),
('EV-003','Maintenance', 4200, 'Full service',                    '2025-12-14'),
-- EV-004
('EV-004','Charging',    2900, 'Monthly charging',                '2026-05-01'),
('EV-004','Maintenance', 1800, 'Brake inspection',                '2026-03-08'),
('EV-004','Insurance',   5400, 'Quarterly premium — EV6',         '2026-04-01'),
-- EV-005
('EV-005','Maintenance',14500, 'Suspension overhaul',             '2026-05-10'),
('EV-005','Insurance',   5800, 'Quarterly premium — EV9',         '2026-04-01'),
('EV-005','Charging',    1200, 'Partial charge at workshop',      '2026-05-01'),
-- EV-006
('EV-006','Charging',    1450, 'Monthly charging — Comet EV',     '2026-05-01'),
('EV-006','Maintenance', 1200, 'Wiper + full service',            '2026-02-01'),
-- EV-007
('EV-007','Charging',    2100, 'Monthly charging',                '2026-05-01'),
('EV-007','Maintenance', 6800, 'Tyre replacement — front pair',   '2025-11-25'),
('EV-007','Insurance',   3900, 'Quarterly premium — Windsor EV',  '2026-04-01'),
-- EV-008
('EV-008','Charging',    2800, 'Monthly charging',                '2026-05-01'),
('EV-008','Insurance',   4600, 'Quarterly premium — ZS EV',       '2026-04-01'),
('EV-008','Maintenance', 4000, 'Annual service',                  '2026-03-15'),
-- EV-009
('EV-009','Charging',    2400, 'Monthly charging',                '2026-05-01'),
('EV-009','Maintenance', 3200, 'Battery coolant flush',           '2025-12-02'),
-- EV-010
('EV-010','Charging',    2650, 'Monthly charging',                '2026-05-01'),
('EV-010','Insurance',   4900, 'Quarterly premium — XEV 9e',      '2026-04-01'),
('EV-010','Maintenance', 1500, 'Brake fluid check',               '2026-02-10'),
-- EV-011
('EV-011','Maintenance',11800, 'Suspension strut replacement',    '2025-10-18'),
('EV-011','Insurance',   3800, 'Quarterly premium — XUV400',      '2026-04-01'),
('EV-011','Charging',     900, 'Partial charge',                  '2026-05-01'),
-- EV-012
('EV-012','Charging',    2950, 'Monthly charging',                '2026-05-01'),
('EV-012','Insurance',   4700, 'Quarterly premium — Curvv EV',    '2026-04-01'),
-- EV-013
('EV-013','Charging',    2100, 'Monthly charging',                '2026-05-01'),
('EV-013','Maintenance', 1300, 'Tyre rotation',                   '2026-01-14'),
-- EV-014
('EV-014','Charging',    1800, 'Monthly charging',                '2026-05-01'),
('EV-014','Maintenance', 2200, 'Battery thermal check',           '2026-03-28'),
('EV-014','Insurance',   3500, 'Quarterly premium — Punch EV',    '2026-04-01')
on conflict do nothing;

-- ── 6. ALERTS ─────────────────────────────────────────────────────────────────
insert into public.alerts (type, title, message, vehicle_id, severity, resolved) values
('low_battery',   'Critical: Low Battery',           'EV-005 (Kia EV9) battery at 19%. Immediate charging required before any trip.',                          'EV-005','critical',false),
('low_battery',   'Low Battery Warning',             'EV-014 (Tata Punch EV) battery at 44%. Schedule charging within 2 hours.',                               'EV-014','warning', false),
('battery_health','Battery Degradation — EV-007',   'MG Windsor EV battery health dropped to 87%. Schedule inspection within 30 days.',                       'EV-007','warning', false),
('battery_health','Battery Degradation — EV-011',   'Mahindra XUV400 EV battery health at 82%. Workshop evaluation recommended.',                             'EV-011','warning', false),
('overspeed',     'Overspeed Alert — Suresh B.',     'Driver Suresh Balasubramanian (EV-007) exceeded 80 km/h limit (recorded 94 km/h) on ORR Bengaluru.',    'EV-007','critical',false),
('overspeed',     'Overspeed Alert — Murugan S.',    'Driver Murugan Selvaraj (EV-011) recorded 88 km/h in a 60 km/h zone near Madhapur, Hyderabad.',         'EV-011','warning', false),
('offline',       'Vehicle Offline — EV-005',        'EV-005 (Kia EV9) has been at the service centre for 12+ hours with no telemetry.',                       'EV-005','warning', false),
('offline',       'Vehicle Offline — EV-011',        'EV-011 (Mahindra XUV400 EV) offline at workshop. Awaiting suspension repair completion.',                'EV-011','info',    false),
('maintenance',   'Maintenance Due — EV-003',        'Kia Carens Clavis EV (EV-003) tyre replacement due by 30 June 2026. Schedule at earliest convenience.', 'EV-003','info',    false),
('maintenance',   'OTA Update Pending — EV-009',     'Mahindra BE 6 (EV-009) firmware OTA update is pending. Connect to WiFi at depot to update.',            'EV-009','info',    false)
on conflict do nothing;

-- ── 7. TRIPS ──────────────────────────────────────────────────────────────────
-- South Indian city routes: Chennai, Bengaluru, Hyderabad, Coimbatore, Madurai, Mysuru, Vijayawada
insert into public.trips
  (id, driver_id, vehicle_id, from_location, to_location,
   distance_km, duration_min, earnings, energy_kwh, trip_date)
values
-- Arjun Krishnamurthy (D-001, EV-001, Chennai)
('T-001','D-001','EV-001','Anna Nagar, Chennai',       'Chennai Airport',          22, 38,  720, 8.4, '2026-06-08'),
('T-002','D-001','EV-001','Chennai Airport',            'Velachery',                18, 30,  580, 6.8, '2026-06-08'),
('T-003','D-001','EV-001','Velachery',                  'Mylapore',                 12, 22,  390, 4.5, '2026-06-07'),
('T-004','D-001','EV-001','Mylapore',                   'Tambaram',                 24, 45,  780, 9.2, '2026-06-07'),
('T-005','D-001','EV-001','Tambaram',                   'Anna Nagar, Chennai',      28, 52,  900,10.8, '2026-06-06'),
-- Karthik Subramaniam (D-003, EV-003, Hyderabad)
('T-006','D-003','EV-003','Jubilee Hills, Hyderabad',  'HITEC City',               14, 25,  460, 5.6, '2026-06-08'),
('T-007','D-003','EV-003','HITEC City',                 'Gachibowli',                8, 15,  280, 3.2, '2026-06-08'),
('T-008','D-003','EV-003','Gachibowli',                 'Secunderabad',             26, 48,  840, 9.8, '2026-06-07'),
('T-009','D-003','EV-003','Secunderabad',               'Banjara Hills, Hyderabad', 16, 30,  520, 6.1, '2026-06-07'),
('T-010','D-003','EV-003','Banjara Hills, Hyderabad',  'Jubilee Hills, Hyderabad',  7, 14,  230, 2.8, '2026-06-06'),
-- Ananya Padmanabhan (D-008, EV-008, Hyderabad)
('T-011','D-008','EV-008','Banjara Hills, Hyderabad',  'Madhapur',                 12, 22,  390, 4.8, '2026-06-08'),
('T-012','D-008','EV-008','Madhapur',                   'Kukatpally',               18, 34,  580, 7.2, '2026-06-08'),
('T-013','D-008','EV-008','Kukatpally',                 'Secunderabad',             22, 40,  720, 8.6, '2026-06-07'),
-- Arjun Balakrishnan (D-012, EV-012, Chennai)
('T-014','D-012','EV-012','Adyar, Chennai',             'OMR, Chennai',             19, 33,  620, 7.4, '2026-06-08'),
('T-015','D-012','EV-012','OMR, Chennai',               'Porur',                    31, 58, 1010,12.1, '2026-06-08'),
('T-016','D-012','EV-012','Porur',                      'Guindy',                   14, 26,  460, 5.5, '2026-06-07'),
('T-017','D-012','EV-012','Guindy',                     'Adyar, Chennai',            9, 18,  300, 3.6, '2026-06-07'),
-- Meenakshi Iyer (D-013, EV-013, Hyderabad)
('T-018','D-013','EV-013','Madhapur, Hyderabad',        'Ameerpet',                 11, 20,  360, 4.2, '2026-06-08'),
('T-019','D-013','EV-013','Ameerpet',                   'LB Nagar',                 24, 44,  780, 9.4, '2026-06-07'),
('T-020','D-013','EV-013','LB Nagar',                   'Madhapur, Hyderabad',      26, 48,  840,10.1, '2026-06-06'),
-- Senthil Murugesan (D-014, EV-014, Bengaluru)
('T-021','D-014','EV-014','Jayanagar, Bengaluru',       'Koramangala',               8, 16,  270, 3.0, '2026-06-08'),
('T-022','D-014','EV-014','Koramangala',                'Whitefield',               24, 46,  780, 9.0, '2026-06-08'),
('T-023','D-014','EV-014','Whitefield',                 'MG Road, Bengaluru',       20, 38,  650, 7.8, '2026-06-07'),
-- Rajan Thirumalai (D-009, EV-009, Chennai)
('T-024','D-009','EV-009','Nungambakkam, Chennai',      'Egmore',                    6, 12,  200, 2.2, '2026-06-08'),
('T-025','D-009','EV-009','Egmore',                     'Sholinganallur',            28, 52,  910,10.6, '2026-06-08'),
('T-026','D-009','EV-009','Sholinganallur',              'Nungambakkam, Chennai',    29, 55,  940,11.0, '2026-06-07'),
-- Kavitha Sundaram (D-010, EV-010, Bengaluru)
('T-027','D-010','EV-010','Indiranagar, Bengaluru',     'Yelahanka',                22, 40,  720, 8.6, '2026-06-08'),
('T-028','D-010','EV-010','Yelahanka',                  'Hebbal',                    9, 18,  300, 3.5, '2026-06-08'),
('T-029','D-010','EV-010','Hebbal',                     'Indiranagar, Bengaluru',   13, 25,  420, 5.0, '2026-06-07'),
-- Lakshmi Chandrasekaran (D-006, EV-006, Chennai)
('T-030','D-006','EV-006','T. Nagar, Chennai',          'Adyar, Chennai',            7, 14,  230, 2.4, '2026-06-08'),
('T-031','D-006','EV-006','Adyar, Chennai',             'Besant Nagar',              5, 10,  170, 1.8, '2026-06-08'),
('T-032','D-006','EV-006','Besant Nagar',               'Mylapore',                  6, 12,  200, 2.1, '2026-06-07'),
('T-033','D-006','EV-006','Mylapore',                   'T. Nagar, Chennai',         5, 10,  165, 1.7, '2026-06-07')
on conflict (id) do nothing;

-- ── 8. CHARGING STATIONS (South Indian cities) ───────────────────────────────
insert into public.charging_stations (id, name, location, lat, lng, available, total, power) values
('CS-01','Tata Power EZ Charge',        'Anna Nagar, Chennai',          13.0850, 80.2101, 3, 6, '50 kW'),
('CS-02','EESL Fast Charger',           'Velachery, Chennai',           12.9819, 80.2205, 2, 4, '25 kW'),
('CS-03','Ather Grid Hub',              'T. Nagar, Chennai',            13.0418, 80.2341, 4, 8, '22 kW'),
('CS-04','BPCL EV Station',             'OMR, Chennai',                 12.8960, 80.2270, 5, 8,'150 kW'),
('CS-05','Charge Zone',                 'Koramangala, Bengaluru',       12.9352, 77.6245, 2, 6, '60 kW'),
('CS-06','Tata Power EZ Charge',        'Indiranagar, Bengaluru',       12.9784, 77.6408, 1, 4, '50 kW'),
('CS-07','Ather Grid Hub',              'Electronic City, Bengaluru',   12.8399, 77.6770, 3, 6, '22 kW'),
('CS-08','MG Fast Charger',             'Whitefield, Bengaluru',        12.9698, 77.7499, 4, 6,'100 kW'),
('CS-09','HPCL EV Charge',              'HITEC City, Hyderabad',        17.4400, 78.3900, 2, 4, '25 kW'),
('CS-10','Charge Zone',                 'Banjara Hills, Hyderabad',     17.4156, 78.4483, 3, 6, '60 kW'),
('CS-11','Tata Power EZ Charge',        'Jubilee Hills, Hyderabad',     17.4314, 78.4075, 1, 4, '50 kW'),
('CS-12','BPCL EV Station',             'Gachibowli, Hyderabad',        17.4401, 78.3489, 5, 8,'150 kW'),
('CS-13','Charge Zone',                 'Coimbatore RS',                11.0168, 76.9558, 2, 4, '60 kW'),
('CS-14','Tata Power EZ Charge',        'Madurai Airport Road',         9.8251,  78.0700, 2, 4, '50 kW')
on conflict (id) do nothing;

-- ── 9. REVENUE SNAPSHOTS ──────────────────────────────────────────────────────
-- Weekly (Mon–Sun), Monthly (Jan–Jun), Yearly (2023–2026)
insert into public.revenue_snapshots (period_type, period_label, revenue, target, snapshot_date) values
-- Weekly
('weekly','Mon', 48000, 42000,'2026-06-01'),
('weekly','Tue', 55000, 48000,'2026-06-02'),
('weekly','Wed', 61000, 52000,'2026-06-03'),
('weekly','Thu', 74000, 58000,'2026-06-04'),
('weekly','Fri', 83000, 68000,'2026-06-05'),
('weekly','Sat', 92000, 75000,'2026-06-06'),
('weekly','Sun', 67000, 60000,'2026-06-07'),
-- Monthly
('monthly','Jan',320000,290000,'2026-01-31'),
('monthly','Feb',295000,280000,'2026-02-28'),
('monthly','Mar',348000,310000,'2026-03-31'),
('monthly','Apr',362000,320000,'2026-04-30'),
('monthly','May',391000,340000,'2026-05-31'),
('monthly','Jun',205000,320000,'2026-06-10'),
-- Yearly
('yearly','2023',2850000,2600000,'2023-12-31'),
('yearly','2024',3420000,3100000,'2024-12-31'),
('yearly','2025',4180000,3800000,'2025-12-31'),
('yearly','2026',2100000,4200000,'2026-06-10')
on conflict do nothing;

-- ── 10. EV MODELS (for Range Prediction dropdown) ────────────────────────────
insert into public.ev_models (id, base_range) values
('Hyundai Creta EV',        473),
('Hyundai Ioniq 5',         631),
('Kia Carens Clavis EV',    473),
('Kia EV6',                 708),
('Kia EV9',                 561),
('MG Comet EV',             230),
('MG Windsor EV',           331),
('MG ZS EV',                461),
('Mahindra BE 6',           535),
('Mahindra XEV 9e',         656),
('Mahindra XUV400 EV',      456),
('Tata Curvv EV',           585),
('Tata Nexon EV',           465),
('Tata Punch EV',           421),
('Tata Tiago EV',           315)
on conflict (id) do nothing;

-- ── 11. CITIES (for dropdowns) ───────────────────────────────────────────────
insert into public.cities (name) values
('Bengaluru'),('Chennai'),('Hyderabad'),
('Coimbatore'),('Madurai'),('Mysuru'),
('Vijayawada'),('Visakhapatnam'),('Tiruchirappalli'),
('Mangaluru'),('Kochi'),('Thiruvananthapuram'),
('Puducherry'),('Salem'),('Tirunelveli')
on conflict do nothing;

-- ── 12. ANALYTICS SERIES ──────────────────────────────────────────────────────
-- scope = 'driver'  → per driver metrics (earnings, safety, trips, energy, speed)
-- scope = 'fleet'   → per brand revenue/expenses
-- scope = 'general' → growth KPIs + general reports

-- ── 12a. DRIVER series — Weekly (D-001 .. D-014) ────────────────────────────

-- D-001 Arjun Krishnamurthy
insert into public.analytics_series (scope,scope_id,period_type,period_label,metric_type,value,recorded_date) values
('driver','D-001','weekly','Mon','earnings', 2100,'2026-06-01'),('driver','D-001','weekly','Tue','earnings', 2450,'2026-06-02'),
('driver','D-001','weekly','Wed','earnings', 1980,'2026-06-03'),('driver','D-001','weekly','Thu','earnings', 2800,'2026-06-04'),
('driver','D-001','weekly','Fri','earnings', 3100,'2026-06-05'),('driver','D-001','weekly','Sat','earnings', 3400,'2026-06-06'),
('driver','D-001','weekly','Sun','earnings', 2650,'2026-06-07'),
('driver','D-001','weekly','Mon','safety',  89,'2026-06-01'),('driver','D-001','weekly','Tue','safety', 90,'2026-06-02'),
('driver','D-001','weekly','Wed','safety',  91,'2026-06-03'),('driver','D-001','weekly','Thu','safety', 92,'2026-06-04'),
('driver','D-001','weekly','Fri','safety',  91,'2026-06-05'),('driver','D-001','weekly','Sat','safety', 93,'2026-06-06'),
('driver','D-001','weekly','Sun','safety',  91,'2026-06-07'),
('driver','D-001','weekly','Mon','trips',  18,'2026-06-01'),('driver','D-001','weekly','Tue','trips', 21,'2026-06-02'),
('driver','D-001','weekly','Wed','trips',  17,'2026-06-03'),('driver','D-001','weekly','Thu','trips', 24,'2026-06-04'),
('driver','D-001','weekly','Fri','trips',  27,'2026-06-05'),('driver','D-001','weekly','Sat','trips', 29,'2026-06-06'),
('driver','D-001','weekly','Sun','trips',  22,'2026-06-07'),
('driver','D-001','weekly','Mon','energy', 16.2,'2026-06-01'),('driver','D-001','weekly','Tue','energy',18.8,'2026-06-02'),
('driver','D-001','weekly','Wed','energy', 15.4,'2026-06-03'),('driver','D-001','weekly','Thu','energy',21.6,'2026-06-04'),
('driver','D-001','weekly','Fri','energy', 23.8,'2026-06-05'),('driver','D-001','weekly','Sat','energy',26.1,'2026-06-06'),
('driver','D-001','weekly','Sun','energy', 20.3,'2026-06-07'),
('driver','D-001','weekly','Mon','speed',  47,'2026-06-01'),('driver','D-001','weekly','Tue','speed', 49,'2026-06-02'),
('driver','D-001','weekly','Wed','speed',  48,'2026-06-03'),('driver','D-001','weekly','Thu','speed', 51,'2026-06-04'),
('driver','D-001','weekly','Fri','speed',  50,'2026-06-05'),('driver','D-001','weekly','Sat','speed', 52,'2026-06-06'),
('driver','D-001','weekly','Sun','speed',  49,'2026-06-07');

-- D-003 Karthik Subramaniam (lower safety — more variety)
insert into public.analytics_series (scope,scope_id,period_type,period_label,metric_type,value,recorded_date) values
('driver','D-003','weekly','Mon','earnings', 2800,'2026-06-01'),('driver','D-003','weekly','Tue','earnings', 3100,'2026-06-02'),
('driver','D-003','weekly','Wed','earnings', 2500,'2026-06-03'),('driver','D-003','weekly','Thu','earnings', 3400,'2026-06-04'),
('driver','D-003','weekly','Fri','earnings', 3700,'2026-06-05'),('driver','D-003','weekly','Sat','earnings', 4100,'2026-06-06'),
('driver','D-003','weekly','Sun','earnings', 3300,'2026-06-07'),
('driver','D-003','weekly','Mon','safety',  68,'2026-06-01'),('driver','D-003','weekly','Tue','safety', 70,'2026-06-02'),
('driver','D-003','weekly','Wed','safety',  69,'2026-06-03'),('driver','D-003','weekly','Thu','safety', 72,'2026-06-04'),
('driver','D-003','weekly','Fri','safety',  71,'2026-06-05'),('driver','D-003','weekly','Sat','safety', 73,'2026-06-06'),
('driver','D-003','weekly','Sun','safety',  71,'2026-06-07'),
('driver','D-003','weekly','Mon','trips',  22,'2026-06-01'),('driver','D-003','weekly','Tue','trips', 25,'2026-06-02'),
('driver','D-003','weekly','Wed','trips',  20,'2026-06-03'),('driver','D-003','weekly','Thu','trips', 27,'2026-06-04'),
('driver','D-003','weekly','Fri','trips',  30,'2026-06-05'),('driver','D-003','weekly','Sat','trips', 33,'2026-06-06'),
('driver','D-003','weekly','Sun','trips',  26,'2026-06-07'),
('driver','D-003','weekly','Mon','energy', 22.8,'2026-06-01'),('driver','D-003','weekly','Tue','energy',25.2,'2026-06-02'),
('driver','D-003','weekly','Wed','energy', 20.4,'2026-06-03'),('driver','D-003','weekly','Thu','energy',27.6,'2026-06-04'),
('driver','D-003','weekly','Fri','energy', 30.4,'2026-06-05'),('driver','D-003','weekly','Sat','energy',33.5,'2026-06-06'),
('driver','D-003','weekly','Sun','energy', 26.8,'2026-06-07'),
('driver','D-003','weekly','Mon','speed',  52,'2026-06-01'),('driver','D-003','weekly','Tue','speed', 55,'2026-06-02'),
('driver','D-003','weekly','Wed','speed',  53,'2026-06-03'),('driver','D-003','weekly','Thu','speed', 57,'2026-06-04'),
('driver','D-003','weekly','Fri','speed',  56,'2026-06-05'),('driver','D-003','weekly','Sat','speed', 59,'2026-06-06'),
('driver','D-003','weekly','Sun','speed',  54,'2026-06-07');

-- D-006 Lakshmi Chandrasekaran (high trips, efficient)
insert into public.analytics_series (scope,scope_id,period_type,period_label,metric_type,value,recorded_date) values
('driver','D-006','weekly','Mon','earnings', 1400,'2026-06-01'),('driver','D-006','weekly','Tue','earnings', 1650,'2026-06-02'),
('driver','D-006','weekly','Wed','earnings', 1520,'2026-06-03'),('driver','D-006','weekly','Thu','earnings', 1780,'2026-06-04'),
('driver','D-006','weekly','Fri','earnings', 1920,'2026-06-05'),('driver','D-006','weekly','Sat','earnings', 2100,'2026-06-06'),
('driver','D-006','weekly','Sun','earnings', 1780,'2026-06-07'),
('driver','D-006','weekly','Mon','safety',  84,'2026-06-01'),('driver','D-006','weekly','Tue','safety', 86,'2026-06-02'),
('driver','D-006','weekly','Wed','safety',  85,'2026-06-03'),('driver','D-006','weekly','Thu','safety', 87,'2026-06-04'),
('driver','D-006','weekly','Fri','safety',  88,'2026-06-05'),('driver','D-006','weekly','Sat','safety', 86,'2026-06-06'),
('driver','D-006','weekly','Sun','safety',  86,'2026-06-07'),
('driver','D-006','weekly','Mon','trips',  28,'2026-06-01'),('driver','D-006','weekly','Tue','trips', 32,'2026-06-02'),
('driver','D-006','weekly','Wed','trips',  30,'2026-06-03'),('driver','D-006','weekly','Thu','trips', 34,'2026-06-04'),
('driver','D-006','weekly','Fri','trips',  36,'2026-06-05'),('driver','D-006','weekly','Sat','trips', 40,'2026-06-06'),
('driver','D-006','weekly','Sun','trips',  33,'2026-06-07'),
('driver','D-006','weekly','Mon','energy', 11.2,'2026-06-01'),('driver','D-006','weekly','Tue','energy',13.2,'2026-06-02'),
('driver','D-006','weekly','Wed','energy', 12.2,'2026-06-03'),('driver','D-006','weekly','Thu','energy',14.2,'2026-06-04'),
('driver','D-006','weekly','Fri','energy', 15.3,'2026-06-05'),('driver','D-006','weekly','Sat','energy',16.8,'2026-06-06'),
('driver','D-006','weekly','Sun','energy', 14.2,'2026-06-07'),
('driver','D-006','weekly','Mon','speed',  42,'2026-06-01'),('driver','D-006','weekly','Tue','speed', 44,'2026-06-02'),
('driver','D-006','weekly','Wed','speed',  43,'2026-06-03'),('driver','D-006','weekly','Thu','speed', 45,'2026-06-04'),
('driver','D-006','weekly','Fri','speed',  44,'2026-06-05'),('driver','D-006','weekly','Sat','speed', 46,'2026-06-06'),
('driver','D-006','weekly','Sun','speed',  44,'2026-06-07');

-- D-008 Ananya Padmanabhan (top safety)
insert into public.analytics_series (scope,scope_id,period_type,period_label,metric_type,value,recorded_date) values
('driver','D-008','weekly','Mon','earnings', 2300,'2026-06-01'),('driver','D-008','weekly','Tue','earnings', 2600,'2026-06-02'),
('driver','D-008','weekly','Wed','earnings', 2100,'2026-06-03'),('driver','D-008','weekly','Thu','earnings', 2900,'2026-06-04'),
('driver','D-008','weekly','Fri','earnings', 3200,'2026-06-05'),('driver','D-008','weekly','Sat','earnings', 3600,'2026-06-06'),
('driver','D-008','weekly','Sun','earnings', 2870,'2026-06-07'),
('driver','D-008','weekly','Mon','safety',  94,'2026-06-01'),('driver','D-008','weekly','Tue','safety', 96,'2026-06-02'),
('driver','D-008','weekly','Wed','safety',  95,'2026-06-03'),('driver','D-008','weekly','Thu','safety', 97,'2026-06-04'),
('driver','D-008','weekly','Fri','safety',  96,'2026-06-05'),('driver','D-008','weekly','Sat','safety', 97,'2026-06-06'),
('driver','D-008','weekly','Sun','safety',  96,'2026-06-07'),
('driver','D-008','weekly','Mon','trips',  17,'2026-06-01'),('driver','D-008','weekly','Tue','trips', 19,'2026-06-02'),
('driver','D-008','weekly','Wed','trips',  15,'2026-06-03'),('driver','D-008','weekly','Thu','trips', 21,'2026-06-04'),
('driver','D-008','weekly','Fri','trips',  23,'2026-06-05'),('driver','D-008','weekly','Sat','trips', 26,'2026-06-06'),
('driver','D-008','weekly','Sun','trips',  21,'2026-06-07'),
('driver','D-008','weekly','Mon','energy', 12.2,'2026-06-01'),('driver','D-008','weekly','Tue','energy',13.8,'2026-06-02'),
('driver','D-008','weekly','Wed','energy', 11.2,'2026-06-03'),('driver','D-008','weekly','Thu','energy',15.3,'2026-06-04'),
('driver','D-008','weekly','Fri','energy', 16.9,'2026-06-05'),('driver','D-008','weekly','Sat','energy',19.0,'2026-06-06'),
('driver','D-008','weekly','Sun','energy', 15.2,'2026-06-07'),
('driver','D-008','weekly','Mon','speed',  42,'2026-06-01'),('driver','D-008','weekly','Tue','speed', 44,'2026-06-02'),
('driver','D-008','weekly','Wed','speed',  43,'2026-06-03'),('driver','D-008','weekly','Thu','speed', 45,'2026-06-04'),
('driver','D-008','weekly','Fri','speed',  44,'2026-06-05'),('driver','D-008','weekly','Sat','speed', 46,'2026-06-06'),
('driver','D-008','weekly','Sun','speed',  44,'2026-06-07');

-- D-012 Anand Balakrishnan (high earner)
insert into public.analytics_series (scope,scope_id,period_type,period_label,metric_type,value,recorded_date) values
('driver','D-012','weekly','Mon','earnings', 2700,'2026-06-01'),('driver','D-012','weekly','Tue','earnings', 3000,'2026-06-02'),
('driver','D-012','weekly','Wed','earnings', 2600,'2026-06-03'),('driver','D-012','weekly','Thu','earnings', 3300,'2026-06-04'),
('driver','D-012','weekly','Fri','earnings', 3600,'2026-06-05'),('driver','D-012','weekly','Sat','earnings', 4000,'2026-06-06'),
('driver','D-012','weekly','Sun','earnings', 3120,'2026-06-07'),
('driver','D-012','weekly','Mon','safety',  92,'2026-06-01'),('driver','D-012','weekly','Tue','safety', 93,'2026-06-02'),
('driver','D-012','weekly','Wed','safety',  92,'2026-06-03'),('driver','D-012','weekly','Thu','safety', 94,'2026-06-04'),
('driver','D-012','weekly','Fri','safety',  95,'2026-06-05'),('driver','D-012','weekly','Sat','safety', 94,'2026-06-06'),
('driver','D-012','weekly','Sun','safety',  94,'2026-06-07'),
('driver','D-012','weekly','Mon','trips',  23,'2026-06-01'),('driver','D-012','weekly','Tue','trips', 26,'2026-06-02'),
('driver','D-012','weekly','Wed','trips',  22,'2026-06-03'),('driver','D-012','weekly','Thu','trips', 28,'2026-06-04'),
('driver','D-012','weekly','Fri','trips',  31,'2026-06-05'),('driver','D-012','weekly','Sat','trips', 34,'2026-06-06'),
('driver','D-012','weekly','Sun','trips',  27,'2026-06-07'),
('driver','D-012','weekly','Mon','energy', 17.8,'2026-06-01'),('driver','D-012','weekly','Tue','energy',19.8,'2026-06-02'),
('driver','D-012','weekly','Wed','energy', 17.1,'2026-06-03'),('driver','D-012','weekly','Thu','energy',21.8,'2026-06-04'),
('driver','D-012','weekly','Fri','energy', 23.8,'2026-06-05'),('driver','D-012','weekly','Sat','energy',26.4,'2026-06-06'),
('driver','D-012','weekly','Sun','energy', 21.0,'2026-06-07'),
('driver','D-012','weekly','Mon','speed',  50,'2026-06-01'),('driver','D-012','weekly','Tue','speed', 52,'2026-06-02'),
('driver','D-012','weekly','Wed','speed',  51,'2026-06-03'),('driver','D-012','weekly','Thu','speed', 53,'2026-06-04'),
('driver','D-012','weekly','Fri','speed',  52,'2026-06-05'),('driver','D-012','weekly','Sat','speed', 55,'2026-06-06'),
('driver','D-012','weekly','Sun','speed',  52,'2026-06-07');

-- ── 12b. FLEET series — per brand, weekly ────────────────────────────────────
insert into public.analytics_series (scope,scope_id,period_type,period_label,metric_type,value,recorded_date) values
-- Hyundai
('fleet','Hyundai','weekly','Mon','revenue', 14200,'2026-06-01'),('fleet','Hyundai','weekly','Tue','revenue', 16800,'2026-06-02'),
('fleet','Hyundai','weekly','Wed','revenue', 15400,'2026-06-03'),('fleet','Hyundai','weekly','Thu','revenue', 19200,'2026-06-04'),
('fleet','Hyundai','weekly','Fri','revenue', 22100,'2026-06-05'),('fleet','Hyundai','weekly','Sat','revenue', 24600,'2026-06-06'),
('fleet','Hyundai','weekly','Sun','revenue', 18400,'2026-06-07'),
('fleet','Hyundai','weekly','Mon','expenses',5800,'2026-06-01'), ('fleet','Hyundai','weekly','Tue','expenses',6100,'2026-06-02'),
('fleet','Hyundai','weekly','Wed','expenses',5600,'2026-06-03'), ('fleet','Hyundai','weekly','Thu','expenses',6800,'2026-06-04'),
('fleet','Hyundai','weekly','Fri','expenses',7200,'2026-06-05'), ('fleet','Hyundai','weekly','Sat','expenses',8100,'2026-06-06'),
('fleet','Hyundai','weekly','Sun','expenses',6400,'2026-06-07'),
('fleet','Hyundai','weekly','Mon','maintenance',1200,'2026-06-01'),('fleet','Hyundai','weekly','Sat','maintenance',1800,'2026-06-06'),
('fleet','Hyundai','weekly','Mon','charging',4600,'2026-06-01'),  ('fleet','Hyundai','weekly','Sat','charging',6300,'2026-06-06'),
-- Kia
('fleet','Kia','weekly','Mon','revenue', 12600,'2026-06-01'),('fleet','Kia','weekly','Tue','revenue', 14200,'2026-06-02'),
('fleet','Kia','weekly','Wed','revenue', 13100,'2026-06-03'),('fleet','Kia','weekly','Thu','revenue', 16400,'2026-06-04'),
('fleet','Kia','weekly','Fri','revenue', 18900,'2026-06-05'),('fleet','Kia','weekly','Sat','revenue', 21200,'2026-06-06'),
('fleet','Kia','weekly','Sun','revenue', 15800,'2026-06-07'),
('fleet','Kia','weekly','Mon','expenses',5200,'2026-06-01'), ('fleet','Kia','weekly','Tue','expenses',5600,'2026-06-02'),
('fleet','Kia','weekly','Wed','expenses',5000,'2026-06-03'), ('fleet','Kia','weekly','Thu','expenses',6200,'2026-06-04'),
('fleet','Kia','weekly','Fri','expenses',6900,'2026-06-05'), ('fleet','Kia','weekly','Sat','expenses',7800,'2026-06-06'),
('fleet','Kia','weekly','Sun','expenses',5900,'2026-06-07'),
('fleet','Kia','weekly','Mon','maintenance',1500,'2026-06-01'),('fleet','Kia','weekly','Sat','maintenance',2200,'2026-06-06'),
('fleet','Kia','weekly','Mon','charging',3700,'2026-06-01'),  ('fleet','Kia','weekly','Sat','charging',5600,'2026-06-06'),
-- MG Motor
('fleet','MG Motor','weekly','Mon','revenue', 11400,'2026-06-01'),('fleet','MG Motor','weekly','Tue','revenue', 13200,'2026-06-02'),
('fleet','MG Motor','weekly','Wed','revenue', 12100,'2026-06-03'),('fleet','MG Motor','weekly','Thu','revenue', 15300,'2026-06-04'),
('fleet','MG Motor','weekly','Fri','revenue', 17800,'2026-06-05'),('fleet','MG Motor','weekly','Sat','revenue', 19900,'2026-06-06'),
('fleet','MG Motor','weekly','Sun','revenue', 14600,'2026-06-07'),
('fleet','MG Motor','weekly','Mon','expenses',4600,'2026-06-01'), ('fleet','MG Motor','weekly','Tue','expenses',5000,'2026-06-02'),
('fleet','MG Motor','weekly','Wed','expenses',4400,'2026-06-03'), ('fleet','MG Motor','weekly','Thu','expenses',5600,'2026-06-04'),
('fleet','MG Motor','weekly','Fri','expenses',6200,'2026-06-05'), ('fleet','MG Motor','weekly','Sat','expenses',7000,'2026-06-06'),
('fleet','MG Motor','weekly','Sun','expenses',5300,'2026-06-07'),
('fleet','MG Motor','weekly','Mon','maintenance',900,'2026-06-01'), ('fleet','MG Motor','weekly','Sat','maintenance',1600,'2026-06-06'),
('fleet','MG Motor','weekly','Mon','charging',3700,'2026-06-01'),   ('fleet','MG Motor','weekly','Sat','charging',5400,'2026-06-06'),
-- Mahindra
('fleet','Mahindra','weekly','Mon','revenue', 10200,'2026-06-01'),('fleet','Mahindra','weekly','Tue','revenue', 11800,'2026-06-02'),
('fleet','Mahindra','weekly','Wed','revenue', 10900,'2026-06-03'),('fleet','Mahindra','weekly','Thu','revenue', 13600,'2026-06-04'),
('fleet','Mahindra','weekly','Fri','revenue', 15700,'2026-06-05'),('fleet','Mahindra','weekly','Sat','revenue', 17600,'2026-06-06'),
('fleet','Mahindra','weekly','Sun','revenue', 13100,'2026-06-07'),
('fleet','Mahindra','weekly','Mon','expenses',4900,'2026-06-01'), ('fleet','Mahindra','weekly','Tue','expenses',5300,'2026-06-02'),
('fleet','Mahindra','weekly','Wed','expenses',4700,'2026-06-03'), ('fleet','Mahindra','weekly','Thu','expenses',6000,'2026-06-04'),
('fleet','Mahindra','weekly','Fri','expenses',6800,'2026-06-05'), ('fleet','Mahindra','weekly','Sat','expenses',7600,'2026-06-06'),
('fleet','Mahindra','weekly','Sun','expenses',5700,'2026-06-07'),
('fleet','Mahindra','weekly','Mon','maintenance',2100,'2026-06-01'),('fleet','Mahindra','weekly','Sat','maintenance',3100,'2026-06-06'),
('fleet','Mahindra','weekly','Mon','charging',2800,'2026-06-01'),  ('fleet','Mahindra','weekly','Sat','charging',4500,'2026-06-06'),
-- Tata
('fleet','Tata','weekly','Mon','revenue', 9600,'2026-06-01'), ('fleet','Tata','weekly','Tue','revenue', 11000,'2026-06-02'),
('fleet','Tata','weekly','Wed','revenue', 10100,'2026-06-03'),('fleet','Tata','weekly','Thu','revenue', 12700,'2026-06-04'),
('fleet','Tata','weekly','Fri','revenue', 14700,'2026-06-05'),('fleet','Tata','weekly','Sat','revenue', 16500,'2026-06-06'),
('fleet','Tata','weekly','Sun','revenue', 12200,'2026-06-07'),
('fleet','Tata','weekly','Mon','expenses',3900,'2026-06-01'), ('fleet','Tata','weekly','Tue','expenses',4300,'2026-06-02'),
('fleet','Tata','weekly','Wed','expenses',3800,'2026-06-03'), ('fleet','Tata','weekly','Thu','expenses',4800,'2026-06-04'),
('fleet','Tata','weekly','Fri','expenses',5500,'2026-06-05'), ('fleet','Tata','weekly','Sat','expenses',6200,'2026-06-06'),
('fleet','Tata','weekly','Sun','expenses',4600,'2026-06-07'),
('fleet','Tata','weekly','Mon','maintenance',800,'2026-06-01'), ('fleet','Tata','weekly','Sat','maintenance',1400,'2026-06-06'),
('fleet','Tata','weekly','Mon','charging',3100,'2026-06-01'),   ('fleet','Tata','weekly','Sat','charging',4800,'2026-06-06'),
-- All brands combined (scope_id = 'All') for default dashboard chart
('fleet','All','weekly','Mon','revenue', 48000,'2026-06-01'),('fleet','All','weekly','Tue','revenue', 57000,'2026-06-02'),
('fleet','All','weekly','Wed','revenue', 61600,'2026-06-03'),('fleet','All','weekly','Thu','revenue', 74200,'2026-06-04'),
('fleet','All','weekly','Fri','revenue', 83200,'2026-06-05'),('fleet','All','weekly','Sat','revenue', 99800,'2026-06-06'),
('fleet','All','weekly','Sun','revenue', 74100,'2026-06-07'),
('fleet','All','weekly','Mon','target',  42000,'2026-06-01'),('fleet','All','weekly','Tue','target',  48000,'2026-06-02'),
('fleet','All','weekly','Wed','target',  52000,'2026-06-03'),('fleet','All','weekly','Thu','target',  58000,'2026-06-04'),
('fleet','All','weekly','Fri','target',  68000,'2026-06-05'),('fleet','All','weekly','Sat','target',  82000,'2026-06-06'),
('fleet','All','weekly','Sun','target',  65000,'2026-06-07'),
('fleet','All','weekly','Mon','expenses',24400,'2026-06-01'),('fleet','All','weekly','Tue','expenses',26300,'2026-06-02'),
('fleet','All','weekly','Wed','expenses',23500,'2026-06-03'),('fleet','All','weekly','Thu','expenses',29400,'2026-06-04'),
('fleet','All','weekly','Fri','expenses',32600,'2026-06-05'),('fleet','All','weekly','Sat','expenses',36500,'2026-06-06'),
('fleet','All','weekly','Sun','expenses',27900,'2026-06-07');

-- ── 12c. GENERAL series — growth KPIs, energy, battery, distance ─────────────
insert into public.analytics_series (scope,scope_id,period_type,period_label,metric_type,value,recorded_date) values
-- Growth KPIs (weekly)
('general','growth','weekly',null,'fleetRevenue',  498900, '2026-06-07'),
('general','growth','weekly',null,'energyToday',    1847.6,'2026-06-07'),
('general','growth','weekly',null,'revenueGrowth',    14.2,'2026-06-07'),
('general','growth','weekly',null,'energyGrowth',     -2.8,'2026-06-07'),
('general','growth','weekly',null,'healthGrowth',     -0.9,'2026-06-07'),
('general','growth','weekly',null,'activeGrowth',      8.0,'2026-06-07'),
-- Growth KPIs (monthly)
('general','growth','monthly',null,'fleetRevenue',  1921000,'2026-05-31'),
('general','growth','monthly',null,'energyToday',     7340.0,'2026-05-31'),
('general','growth','monthly',null,'revenueGrowth',    11.8,'2026-05-31'),
('general','growth','monthly',null,'energyGrowth',     -1.4,'2026-05-31'),
-- Hourly energy consumption (general reports)
('general',null,'daily','6AM', 'energy', 124.2,'2026-06-07'),
('general',null,'daily','7AM', 'energy', 218.6,'2026-06-07'),
('general',null,'daily','8AM', 'energy', 342.4,'2026-06-07'),
('general',null,'daily','9AM', 'energy', 412.8,'2026-06-07'),
('general',null,'daily','10AM','energy', 386.2,'2026-06-07'),
('general',null,'daily','11AM','energy', 320.4,'2026-06-07'),
('general',null,'daily','12PM','energy', 278.6,'2026-06-07'),
('general',null,'daily','1PM', 'energy', 260.0,'2026-06-07'),
('general',null,'daily','2PM', 'energy', 310.4,'2026-06-07'),
('general',null,'daily','3PM', 'energy', 380.8,'2026-06-07'),
('general',null,'daily','4PM', 'energy', 442.2,'2026-06-07'),
('general',null,'daily','5PM', 'energy', 486.4,'2026-06-07'),
('general',null,'daily','6PM', 'energy', 418.6,'2026-06-07'),
('general',null,'daily','7PM', 'energy', 362.2,'2026-06-07'),
('general',null,'daily','8PM', 'energy', 298.4,'2026-06-07'),
('general',null,'daily','9PM', 'energy', 198.6,'2026-06-07'),
('general',null,'daily','10PM','energy', 142.4,'2026-06-07'),
-- Monthly battery health trend
('general',null,'monthly','Jan','avgHealth', 94.8,'2026-01-31'),
('general',null,'monthly','Feb','avgHealth', 94.2,'2026-02-28'),
('general',null,'monthly','Mar','avgHealth', 93.6,'2026-03-31'),
('general',null,'monthly','Apr','avgHealth', 93.1,'2026-04-30'),
('general',null,'monthly','May','avgHealth', 92.4,'2026-05-31'),
('general',null,'monthly','Jun','avgHealth', 91.8,'2026-06-07'),
-- Daily distance (km, all vehicles combined)
('general',null,'daily','Mon','distance', 4820,'2026-06-01'),
('general',null,'daily','Tue','distance', 5340,'2026-06-02'),
('general',null,'daily','Wed','distance', 4980,'2026-06-03'),
('general',null,'daily','Thu','distance', 5860,'2026-06-04'),
('general',null,'daily','Fri','distance', 6420,'2026-06-05'),
('general',null,'daily','Sat','distance', 7180,'2026-06-06'),
('general',null,'daily','Sun','distance', 5640,'2026-06-07'),
-- Charging session pattern (hourly)
('general',null,'daily','6AM', 'charging_sessions',  3,'2026-06-07'),
('general',null,'daily','7AM', 'charging_sessions',  8,'2026-06-07'),
('general',null,'daily','8AM', 'charging_sessions', 12,'2026-06-07'),
('general',null,'daily','9AM', 'charging_sessions',  9,'2026-06-07'),
('general',null,'daily','10AM','charging_sessions',  6,'2026-06-07'),
('general',null,'daily','12PM','charging_sessions', 11,'2026-06-07'),
('general',null,'daily','1PM', 'charging_sessions', 14,'2026-06-07'),
('general',null,'daily','2PM', 'charging_sessions',  8,'2026-06-07'),
('general',null,'daily','4PM', 'charging_sessions',  7,'2026-06-07'),
('general',null,'daily','5PM', 'charging_sessions', 16,'2026-06-07'),
('general',null,'daily','6PM', 'charging_sessions', 21,'2026-06-07'),
('general',null,'daily','7PM', 'charging_sessions', 18,'2026-06-07'),
('general',null,'daily','8PM', 'charging_sessions', 13,'2026-06-07'),
('general',null,'daily','9PM', 'charging_sessions',  9,'2026-06-07'),
('general',null,'daily','10PM','charging_sessions',  5,'2026-06-07');
