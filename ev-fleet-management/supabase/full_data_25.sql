-- ============================================================
-- FULL SEED: 25 Vehicles + 25 Drivers + 2 Years of Data
-- Clears existing seed data and rebuilds everything.
-- Run in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- ── 0. CLEAN ──────────────────────────────────────────────────────────────────
DELETE FROM public.analytics_series;
DELETE FROM public.revenue_snapshots;
DELETE FROM public.trips            WHERE id LIKE 'T-%';
DELETE FROM public.alerts;
DELETE FROM public.vehicle_expenses;
DELETE FROM public.vehicle_maintenance_records;
DELETE FROM public.vehicle_service_history;
DELETE FROM public.drivers          WHERE id LIKE 'D-%';
DELETE FROM public.vehicles         WHERE id LIKE 'EV-%';

-- ── 1. VEHICLES (25) ─────────────────────────────────────────────────────────
INSERT INTO public.vehicles
  (id,model,manufacturer,image_url,battery_capacity,
   status,battery_percent,battery_health,speed,
   location,lat,lng,range_km,revenue,total_distance,is_charging)
VALUES
('EV-001','Creta EV',        'Hyundai', 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=400','51.4 kWh','running', 74,95,52,'Anna Nagar, Chennai',      13.0850,80.2101,296,218400,112300,false),
('EV-002','Ioniq 5',         'Hyundai', 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=400','72.6 kWh','charging',38,91, 0,'Koramangala, Bengaluru',  12.9352,77.6245,198,187000, 89400,true),
('EV-003','Carens Clavis EV','Kia',     'https://images.unsplash.com/photo-1610777988688-3671e03dbdf1?w=400','51.4 kWh','running', 81,97,47,'Jubilee Hills, Hyderabad',17.4314,78.4075,318,156000, 67800,false),
('EV-004','EV6',             'Kia',     'https://images.unsplash.com/photo-1610777988688-3671e03dbdf1?w=400','77.4 kWh','idle',    62,93, 0,'Velachery, Chennai',      12.9819,80.2205,351, 92000,145600,false),
('EV-005','EV9',             'Kia',     'https://images.unsplash.com/photo-1610777988688-3671e03dbdf1?w=400','99.8 kWh','workshop',19,77, 0,'Service Centre, Bengaluru',12.9716,77.5946,82, 78000,198700,false),
('EV-006','Comet EV',        'MG Motor','https://images.unsplash.com/photo-1605559424843-9073730702d0?w=400','17.3 kWh','running', 67,88,38,'T. Nagar, Chennai',       13.0418,80.2341,148,112000, 74500,false),
('EV-007','Windsor EV',      'MG Motor','https://images.unsplash.com/photo-1605559424843-9073730702d0?w=400','38.0 kWh','charging',51,90, 0,'Electronic City, Bengaluru',12.8399,77.6770,224,163000, 91200,true),
('EV-008','ZS EV',           'MG Motor','https://images.unsplash.com/photo-1605559424843-9073730702d0?w=400','50.3 kWh','running', 88,96,61,'Banjara Hills, Hyderabad',17.4156,78.4483,386,231000, 56800,false),
('EV-009','BE 6',            'Mahindra','https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400','59.0 kWh','idle',    70,94, 0,'Nungambakkam, Chennai',   13.0569,80.2425,340,138000,103400,false),
('EV-010','XEV 9e',          'Mahindra','https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400','79.0 kWh','running', 55,92,58,'Indiranagar, Bengaluru',  12.9784,77.6408,289,195000, 72300,false),
('EV-011','XUV400 EV',       'Mahindra','https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400','39.4 kWh','workshop',28,82, 0,'Service Centre, Hyderabad',17.3850,78.4867,96, 64000,221000,false),
('EV-012','Curvv EV',        'Tata',    'https://images.unsplash.com/photo-1593941707882-a56bab827c5e?w=400','55.0 kWh','running', 79,98,63,'Adyar, Chennai',          13.0067,80.2570,402,248000, 49600,false),
('EV-013','Nexon EV',        'Tata',    'https://images.unsplash.com/photo-1593941707882-a56bab827c5e?w=400','40.5 kWh','idle',    58,89, 0,'Madhapur, Hyderabad',     17.4400,78.3900,231,141000,136700,false),
('EV-014','Punch EV',        'Tata',    'https://images.unsplash.com/photo-1593941707882-a56bab827c5e?w=400','35.0 kWh','charging',44,87, 0,'Jayanagar, Bengaluru',    12.9250,77.5938,196,106000, 88900,true),
('EV-015','Tiago EV',        'Tata',    'https://images.unsplash.com/photo-1593941707882-a56bab827c5e?w=400','24.0 kWh','running', 91,95,44,'Porur, Chennai',           13.0359,80.1580,274, 98000, 67400,false),
('EV-016','Creta EV',        'Hyundai', 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=400','51.4 kWh','running', 65,93,56,'Egmore, Chennai',          13.0837,80.2675,243,172000, 98200,false),
('EV-017','Ioniq 5',         'Hyundai', 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=400','72.6 kWh','idle',    82,90, 0,'HSR Layout, Bengaluru',   12.9081,77.6476,445,143000, 54300,false),
('EV-018','EV6',             'Kia',     'https://images.unsplash.com/photo-1610777988688-3671e03dbdf1?w=400','77.4 kWh','running', 73,95,49,'Secunderabad, Hyderabad', 17.4399,78.4983,411,184000, 83100,false),
('EV-019','Windsor EV',      'MG Motor','https://images.unsplash.com/photo-1605559424843-9073730702d0?w=400','38.0 kWh','charging',36,86, 0,'Mylapore, Chennai',        13.0368,80.2676,168,121000,112400,true),
('EV-020','BE 6',            'Mahindra','https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400','59.0 kWh','running', 68,91,53,'Yelahanka, Bengaluru',     13.1007,77.5963,327,159000, 76800,false),
('EV-021','Nexon EV',        'Tata',    'https://images.unsplash.com/photo-1593941707882-a56bab827c5e?w=400','40.5 kWh','running', 77,94,47,'Kukatpally, Hyderabad',   17.4849,78.3996,314,167000, 92500,false),
('EV-022','Comet EV',        'MG Motor','https://images.unsplash.com/photo-1605559424843-9073730702d0?w=400','17.3 kWh','idle',    55,92, 0,'Guindy, Chennai',          13.0067,80.2206,122,104000, 81300,false),
('EV-023','Carens Clavis EV','Kia',     'https://images.unsplash.com/photo-1610777988688-3671e03dbdf1?w=400','51.4 kWh','running', 84,96,51,'Whitefield, Bengaluru',   12.9698,77.7499,336,178000, 63400,false),
('EV-024','XUV400 EV',       'Mahindra','https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400','39.4 kWh','running', 61,88,43,'Ameerpet, Hyderabad',      17.4344,78.4487,236,132000,107600,false),
('EV-025','Curvv EV',        'Tata',    'https://images.unsplash.com/photo-1593941707882-a56bab827c5e?w=400','55.0 kWh','charging',29,84, 0,'Sholinganallur, Chennai', 12.9010,80.2279,151,119000,118200,true)
ON CONFLICT (id) DO UPDATE SET
  battery_percent=excluded.battery_percent, battery_health=excluded.battery_health,
  speed=excluded.speed, status=excluded.status, updated_at=now();

-- ── 2. DRIVERS (25, all with South Indian names) ─────────────────────────────
INSERT INTO public.drivers
  (id,profile_id,name,vehicle_id,avatar,trips,overspeed,hard_braking,aggressive_accel,
   safety_score,efficiency_score,today_earnings,total_earnings,avg_speed,energy_consumed)
VALUES
('D-001',null,'Arjun Krishnamurthy',  'EV-001','AK',1842, 2, 4, 3,91,89,2650, 964000,49,192),
('D-002',null,'Priya Venkataraman',   'EV-002','PV',1498, 0, 1, 1,99,96,1950, 728000,41,138),
('D-003',null,'Karthik Subramaniam',  'EV-003','KS',1670, 7,11,13,71,74,3300,1285000,54,274),
('D-004',null,'Deepa Raghunathan',    'EV-004','DR',1289, 1, 2, 3,93,85,   0, 582000,45,216),
('D-005',null,'Vikram Narayanan',     'EV-005','VN',1076, 3, 6, 7,80,78,   0, 431000,47,241),
('D-006',null,'Lakshmi Chandrasekaran','EV-006','LC',2130, 4, 5, 6,86,92,1780,1512000,44,149),
('D-007',null,'Suresh Balasubramanian','EV-007','SB',1550, 9,16,18,62,68,2100,1093000,57,298),
('D-008',null,'Ananya Padmanabhan',   'EV-008','AP',1518, 1, 2, 2,96,93,2870, 846000,44,141),
('D-009',null,'Rajan Thirumalai',     'EV-009','RT',2010, 5, 8, 9,83,88,2040,1437000,46,173),
('D-010',null,'Kavitha Sundaram',     'EV-010','KS',1340, 3, 6, 5,85,91,2430, 978000,48,187),
('D-011',null,'Murugan Selvaraj',     'EV-011','MS', 920, 6,10,12,74,71,   0, 615000,51,263),
('D-012',null,'Anand Balakrishnan',   'EV-012','AB',1780, 2, 3, 4,94,90,3120,1324000,52,205),
('D-013',null,'Meenakshi Iyer',       'EV-013','MI',1090, 0, 2, 1,97,95,1680, 792000,43,156),
('D-014',null,'Senthil Murugesan',    'EV-014','SM',1310, 4, 7, 8,82,84,2210, 935000,50,224),
('D-015',null,'Bharathi Natarajan',   'EV-015','BN',1620, 1, 3, 2,90,87,2480,1148000,47,168),
('D-016',null,'Ganesh Venkatraman',   'EV-016','GV',1420, 3, 5, 6,84,83,2180, 891000,48,198),
('D-017',null,'Revathi Gopalakrishnan','EV-017','RG', 980, 0, 1, 1,98,96,1540, 672000,42,132),
('D-018',null,'Dinesh Alagappan',     'EV-018','DA',1690, 5, 9,11,76,79,2640,1198000,53,248),
('D-019',null,'Nithya Srinivasan',    'EV-019','NS',1240, 2, 4, 3,88,90,1920, 841000,45,178),
('D-020',null,'Vijayakumar Pillai',   'EV-020','VP',1560, 4, 7, 8,79,82,2360,1072000,50,214),
('D-021',null,'Saranya Krishnan',     'EV-021','SK',1380, 1, 2, 2,92,91,2090, 924000,46,183),
('D-022',null,'Balaji Ramasubramanian','EV-022','BR',2240, 3, 4, 5,87,93,1650,1587000,43,142),
('D-023',null,'Indira Mohan',         'EV-023','IM',1720, 2, 3, 4,91,88,2780,1214000,51,207),
('D-024',null,'Rajkumar Pandian',     'EV-024','RP',1460, 6,10,12,73,76,2140,1034000,52,261),
('D-025',null,'Sudha Ramachandran',   'EV-025','SR',1180, 1, 2, 1,95,94,1860, 836000,44,161)
ON CONFLICT (id) DO NOTHING;

-- ── 3. SERVICE HISTORY ────────────────────────────────────────────────────────
INSERT INTO public.vehicle_service_history (vehicle_id,description,service_date) VALUES
('EV-001','Annual full service',               '2025-11-10'),('EV-001','Tyre rotation',                    '2026-02-18'),
('EV-002','Battery health diagnostic',         '2025-10-05'),('EV-002','AC filter replacement',            '2026-01-22'),
('EV-003','Full service',                      '2025-12-14'),('EV-003','Wheel alignment',                  '2026-03-08'),
('EV-004','Brake pad inspection',              '2026-03-08'),('EV-005','Battery module inspection',        '2025-08-20'),
('EV-006','Full service – wiper replacement',  '2026-02-01'),('EV-007','Tyre replacement – front pair',   '2025-11-25'),
('EV-008','Annual full service',               '2026-03-15'),('EV-009','Battery coolant flush',            '2025-12-02'),
('EV-010','Brake fluid check',                 '2026-02-10'),('EV-011','Suspension repair – left strut',  '2025-10-18'),
('EV-012','Full service',                      '2026-04-01'),('EV-013','Tyre rotation',                   '2026-01-14'),
('EV-014','Battery health check',              '2026-03-28'),('EV-015','Annual service',                  '2026-02-20'),
('EV-016','Tyre rotation and balancing',        '2026-03-05'),('EV-017','AC service',                     '2026-01-18'),
('EV-018','Full service',                      '2025-12-22'),('EV-019','Battery coolant flush',            '2026-02-08'),
('EV-020','Brake pad replacement',             '2026-01-30'),('EV-021','Annual service',                  '2026-03-12'),
('EV-022','Wheel alignment',                   '2026-02-25'),('EV-023','Full service',                    '2026-01-08'),
('EV-024','Battery module inspection',         '2025-11-14'),('EV-025','Tyre replacement – all four',     '2026-03-20')
ON CONFLICT DO NOTHING;

-- ── 4. MAINTENANCE RECORDS ────────────────────────────────────────────────────
INSERT INTO public.vehicle_maintenance_records (vehicle_id,description,status,scheduled_date) VALUES
('EV-001','Next service due','pending','2026-11-10'),  ('EV-002','Battery re-check','pending','2026-10-05'),
('EV-003','Tyre replacement','pending','2026-12-14'),  ('EV-004','Next service','pending','2026-09-08'),
('EV-005','Suspension overhaul','in_progress',null),   ('EV-005','Battery evaluation','in_progress',null),
('EV-006','Brake pads scheduled','pending','2026-08-01'),('EV-007','Coolant check','pending','2026-07-25'),
('EV-008','Annual service','pending','2027-03-15'),    ('EV-009','OTA update pending','pending',null),
('EV-010','Next service','pending','2027-02-10'),      ('EV-011','Suspension check','in_progress',null),
('EV-012','Next service','pending','2027-04-01'),      ('EV-013','Brake fluid','pending','2026-07-14'),
('EV-014','Battery thermal check','pending','2026-09-28'),('EV-015','Next service','pending','2026-08-20'),
('EV-016','Tyre check','pending','2026-09-05'),        ('EV-017','Battery health recheck','pending','2026-10-18'),
('EV-018','Full service due','pending','2026-12-22'),  ('EV-019','Suspension inspection','pending','2026-08-08'),
('EV-020','Next service','pending','2026-10-30'),      ('EV-021','Annual service','pending','2027-03-12'),
('EV-022','Alignment check','pending','2026-08-25'),   ('EV-023','Next service','pending','2027-01-08'),
('EV-024','Battery module replacement','pending','2026-11-14'),('EV-025','Wheel balancing','pending','2026-09-20')
ON CONFLICT DO NOTHING;

-- ── 5. VEHICLE EXPENSES ───────────────────────────────────────────────────────
INSERT INTO public.vehicle_expenses (vehicle_id,type,amount,note,expense_date) VALUES
('EV-001','Charging',   2200,'Monthly charging',    '2026-05-01'),('EV-001','Maintenance',3800,'Tyre rotation',     '2026-02-18'),('EV-001','Insurance',4200,'Q2 premium',         '2026-04-01'),
('EV-002','Charging',   3400,'Monthly charging',    '2026-05-01'),('EV-002','Maintenance',2800,'Battery check',     '2026-01-22'),('EV-002','Insurance',5100,'Q2 premium',         '2026-04-01'),
('EV-003','Charging',   2600,'Monthly charging',    '2026-05-01'),('EV-003','Maintenance',4200,'Full service',      '2025-12-14'),
('EV-004','Charging',   2900,'Monthly charging',    '2026-05-01'),('EV-004','Maintenance',1800,'Brake inspection',  '2026-03-08'),('EV-004','Insurance',5400,'Q2 premium',         '2026-04-01'),
('EV-005','Maintenance',14500,'Suspension overhaul','2026-05-10'),('EV-005','Insurance',5800,'Q2 premium',         '2026-04-01'),('EV-005','Charging',1200,'Partial charge',      '2026-05-01'),
('EV-006','Charging',   1450,'Monthly charging',    '2026-05-01'),('EV-006','Maintenance',1200,'Full service',      '2026-02-01'),
('EV-007','Charging',   2100,'Monthly charging',    '2026-05-01'),('EV-007','Maintenance',6800,'Tyre replacement',  '2025-11-25'),('EV-007','Insurance',3900,'Q2 premium',         '2026-04-01'),
('EV-008','Charging',   2800,'Monthly charging',    '2026-05-01'),('EV-008','Insurance',4600,'Q2 premium',         '2026-04-01'),('EV-008','Maintenance',4000,'Annual service',    '2026-03-15'),
('EV-009','Charging',   2400,'Monthly charging',    '2026-05-01'),('EV-009','Maintenance',3200,'Battery coolant',   '2025-12-02'),
('EV-010','Charging',   2650,'Monthly charging',    '2026-05-01'),('EV-010','Insurance',4900,'Q2 premium',         '2026-04-01'),
('EV-011','Maintenance',11800,'Suspension repair',  '2025-10-18'),('EV-011','Insurance',3800,'Q2 premium',         '2026-04-01'),('EV-011','Charging',900,'Partial',             '2026-05-01'),
('EV-012','Charging',   2950,'Monthly charging',    '2026-05-01'),('EV-012','Insurance',4700,'Q2 premium',         '2026-04-01'),
('EV-013','Charging',   2100,'Monthly charging',    '2026-05-01'),('EV-013','Maintenance',1300,'Tyre rotation',    '2026-01-14'),
('EV-014','Charging',   1800,'Monthly charging',    '2026-05-01'),('EV-014','Maintenance',2200,'Battery check',    '2026-03-28'),('EV-014','Insurance',3500,'Q2 premium',         '2026-04-01'),
('EV-015','Charging',   1600,'Monthly charging',    '2026-05-01'),('EV-015','Insurance',3200,'Q2 premium',         '2026-04-01'),
('EV-016','Charging',   2300,'Monthly charging',    '2026-05-01'),('EV-016','Maintenance',2100,'Tyre rotation',    '2026-03-05'),
('EV-017','Charging',   3100,'Monthly charging',    '2026-05-01'),('EV-017','Insurance',5200,'Q2 premium',         '2026-04-01'),
('EV-018','Charging',   2700,'Monthly charging',    '2026-05-01'),('EV-018','Maintenance',3600,'Full service',     '2025-12-22'),('EV-018','Insurance',4800,'Q2 premium',         '2026-04-01'),
('EV-019','Charging',   1900,'Monthly charging',    '2026-05-01'),('EV-019','Maintenance',2800,'Coolant flush',    '2026-02-08'),
('EV-020','Charging',   2500,'Monthly charging',    '2026-05-01'),('EV-020','Maintenance',3100,'Brake pads',       '2026-01-30'),
('EV-021','Charging',   2200,'Monthly charging',    '2026-05-01'),('EV-021','Insurance',4100,'Q2 premium',         '2026-04-01'),
('EV-022','Charging',   1350,'Monthly charging',    '2026-05-01'),('EV-022','Maintenance',1100,'Alignment',        '2026-02-25'),
('EV-023','Charging',   2600,'Monthly charging',    '2026-05-01'),('EV-023','Maintenance',4100,'Full service',     '2026-01-08'),
('EV-024','Charging',   2000,'Monthly charging',    '2026-05-01'),('EV-024','Maintenance',8200,'Battery module',   '2025-11-14'),
('EV-025','Charging',   2400,'Monthly charging',    '2026-05-01'),('EV-025','Maintenance',5600,'Tyre replacement', '2026-03-20'),('EV-025','Insurance',4300,'Q2 premium','2026-04-01')
ON CONFLICT DO NOTHING;

-- ── 6. ALERTS ─────────────────────────────────────────────────────────────────
INSERT INTO public.alerts (type,title,message,vehicle_id,severity,resolved) VALUES
('low_battery',   'Critical: Low Battery',      'EV-005 (Kia EV9) battery at 19%. Charge immediately.',                     'EV-005','critical',false),
('low_battery',   'Low Battery Warning',         'EV-025 (Tata Curvv EV) battery at 29%. Schedule charging.',               'EV-025','warning', false),
('battery_health','Battery Degradation EV-007',  'MG Windsor EV battery health 87%. Inspection recommended.',               'EV-007','warning', false),
('battery_health','Battery Degradation EV-011',  'Mahindra XUV400 EV health 82%. Evaluation needed.',                       'EV-011','warning', false),
('battery_health','Battery Degradation EV-019',  'MG Windsor EV-019 health 86%. Schedule check within 30 days.',            'EV-019','warning', false),
('overspeed',     'Overspeed — Suresh B.',        'EV-007: Suresh Balasubramanian recorded 94 km/h in 60 km/h zone, ORR.',   'EV-007','critical',false),
('overspeed',     'Overspeed — Karthik S.',       'EV-003: Karthik Subramaniam recorded 88 km/h near Madhapur.',             'EV-003','warning', false),
('overspeed',     'Overspeed — Dinesh A.',        'EV-018: Dinesh Alagappan exceeded 80 km/h limit on Chennai OMR.',         'EV-018','warning', false),
('offline',       'Vehicle Offline — EV-005',     'EV-005 (Kia EV9) at service centre 12+ hrs, no telemetry.',               'EV-005','warning', false),
('offline',       'Vehicle Offline — EV-011',     'EV-011 (Mahindra XUV400 EV) offline at workshop.',                        'EV-011','info',    false),
('maintenance',   'Service Due — EV-003',         'Kia Carens Clavis EV tyre replacement due Jun 2026.',                     'EV-003','info',    false),
('maintenance',   'OTA Update — EV-009',          'Mahindra BE 6 firmware OTA update pending. Connect to WiFi.',             'EV-009','info',    false),
('maintenance',   'Service Due — EV-014',         'Tata Punch EV battery thermal check due Sep 2026.',                       'EV-014','info',    false),
('low_battery',   'Low Battery Warning',          'EV-019 (MG Windsor EV) battery at 36%. Charge before next trip.',        'EV-019','warning', false),
('overspeed',     'Overspeed — Rajkumar P.',      'EV-024: Rajkumar Pandian exceeded speed limit near Kukatpally.',          'EV-024','warning', false)
ON CONFLICT DO NOTHING;

-- ── 7. TRIPS (30 representative trips across drivers) ─────────────────────────
INSERT INTO public.trips (id,driver_id,vehicle_id,from_location,to_location,distance_km,duration_min,earnings,energy_kwh,trip_date) VALUES
('T-001','D-001','EV-001','Anna Nagar, Chennai',       'Chennai Airport',           22,38, 720, 8.4,'2026-06-08'),
('T-002','D-001','EV-001','Chennai Airport',            'Velachery',                 18,30, 580, 6.8,'2026-06-08'),
('T-003','D-002','EV-002','Koramangala, Bengaluru',    'Whitefield',                24,46, 780, 9.2,'2026-06-08'),
('T-004','D-002','EV-002','Whitefield',                 'MG Road, Bengaluru',        20,38, 640, 7.8,'2026-06-07'),
('T-005','D-003','EV-003','Jubilee Hills, Hyderabad',  'HITEC City',                14,25, 460, 5.6,'2026-06-08'),
('T-006','D-003','EV-003','HITEC City',                 'Gachibowli',                 8,15, 280, 3.2,'2026-06-08'),
('T-007','D-004','EV-004','Velachery, Chennai',        'Adyar',                      9,17, 300, 3.8,'2026-06-07'),
('T-008','D-006','EV-006','T. Nagar, Chennai',         'Adyar',                      7,14, 230, 2.4,'2026-06-08'),
('T-009','D-008','EV-008','Banjara Hills, Hyderabad',  'Madhapur',                  12,22, 390, 4.8,'2026-06-08'),
('T-010','D-009','EV-009','Nungambakkam, Chennai',     'Egmore',                     6,12, 200, 2.2,'2026-06-08'),
('T-011','D-010','EV-010','Indiranagar, Bengaluru',    'Yelahanka',                 22,40, 720, 8.6,'2026-06-08'),
('T-012','D-012','EV-012','Adyar, Chennai',             'OMR, Chennai',              19,33, 620, 7.4,'2026-06-08'),
('T-013','D-013','EV-013','Madhapur, Hyderabad',       'Ameerpet',                  11,20, 360, 4.2,'2026-06-08'),
('T-014','D-014','EV-014','Jayanagar, Bengaluru',      'Koramangala',                8,16, 270, 3.0,'2026-06-08'),
('T-015','D-015','EV-015','Porur, Chennai',             'Guindy',                    12,22, 400, 4.6,'2026-06-08'),
('T-016','D-016','EV-016','Egmore, Chennai',            'T. Nagar',                   6,12, 200, 2.3,'2026-06-08'),
('T-017','D-018','EV-018','Secunderabad, Hyderabad',   'Banjara Hills',             18,34, 580, 7.2,'2026-06-08'),
('T-018','D-020','EV-020','Yelahanka, Bengaluru',      'Hebbal',                     9,18, 300, 3.5,'2026-06-08'),
('T-019','D-021','EV-021','Kukatpally, Hyderabad',     'Jubilee Hills',             16,30, 520, 6.2,'2026-06-08'),
('T-020','D-022','EV-022','Guindy, Chennai',            'Mylapore',                   7,13, 235, 2.6,'2026-06-08'),
('T-021','D-023','EV-023','Whitefield, Bengaluru',     'Electronic City',           18,34, 580, 7.0,'2026-06-08'),
('T-022','D-024','EV-024','Ameerpet, Hyderabad',       'LB Nagar',                  16,30, 520, 6.0,'2026-06-08'),
('T-023','D-025','EV-025','Sholinganallur, Chennai',   'Velachery',                  8,15, 268, 3.1,'2026-06-08'),
('T-024','D-001','EV-001','Velachery',                  'Tambaram',                  14,28, 460, 5.3,'2026-06-07'),
('T-025','D-009','EV-009','Egmore',                     'Sholinganallur',            28,52, 910,10.6,'2026-06-07')
ON CONFLICT (id) DO NOTHING;

-- ── 8. REVENUE SNAPSHOTS (weekly + monthly + last3months + yearly) ────────────
INSERT INTO public.revenue_snapshots (period_type,period_label,revenue,target,snapshot_date) VALUES
-- Weekly
('weekly','Mon', 68000, 58000,'2026-06-01'),('weekly','Tue', 78000, 64000,'2026-06-02'),
('weekly','Wed', 82000, 68000,'2026-06-03'),('weekly','Thu', 97000, 76000,'2026-06-04'),
('weekly','Fri',112000, 88000,'2026-06-05'),('weekly','Sat',128000,102000,'2026-06-06'),
('weekly','Sun', 91000, 80000,'2026-06-07'),
-- Monthly
('monthly','Jan',4820000,4200000,'2026-01-31'),('monthly','Feb',4460000,4000000,'2026-02-28'),
('monthly','Mar',5240000,4600000,'2026-03-31'),('monthly','Apr',5620000,4900000,'2026-04-30'),
('monthly','May',6080000,5300000,'2026-05-31'),('monthly','Jun',3120000,5000000,'2026-06-10'),
-- Last 3 months
('last3months','Wk1', 1080000, 980000,'2026-03-07'),('last3months','Wk2', 1140000,1020000,'2026-03-14'),
('last3months','Wk3', 1110000,1000000,'2026-03-21'),('last3months','Wk4', 1200000,1060000,'2026-03-28'),
('last3months','Wk5', 1260000,1100000,'2026-04-07'),('last3months','Wk6', 1310000,1140000,'2026-04-14'),
('last3months','Wk7', 1280000,1120000,'2026-04-21'),('last3months','Wk8', 1380000,1200000,'2026-04-28'),
('last3months','Wk9', 1440000,1260000,'2026-05-07'),('last3months','Wk10',1490000,1300000,'2026-05-14'),
('last3months','Wk11',1460000,1280000,'2026-05-21'),('last3months','Wk12',1100000,1200000,'2026-06-07'),
-- Yearly
('yearly','2023',38500000,34000000,'2023-12-31'),('yearly','2024',46800000,42000000,'2024-12-31'),
('yearly','2025',57200000,52000000,'2025-12-31'),('yearly','2026',28000000,58000000,'2026-06-10')
ON CONFLICT DO NOTHING;

-- ── 9. CHARGING STATIONS ─────────────────────────────────────────────────────
INSERT INTO public.charging_stations (id,name,location,lat,lng,available,total,power) VALUES
('CS-01','Tata Power EZ Charge',   'Anna Nagar, Chennai',          13.0850,80.2101,3,6,'50 kW'),
('CS-02','EESL Fast Charger',      'Velachery, Chennai',           12.9819,80.2205,2,4,'25 kW'),
('CS-03','Ather Grid Hub',         'T. Nagar, Chennai',            13.0418,80.2341,4,8,'22 kW'),
('CS-04','BPCL EV Station',        'OMR, Chennai',                 12.8960,80.2270,5,8,'150 kW'),
('CS-05','Charge Zone',            'Koramangala, Bengaluru',       12.9352,77.6245,2,6,'60 kW'),
('CS-06','Tata Power EZ Charge',   'Indiranagar, Bengaluru',       12.9784,77.6408,1,4,'50 kW'),
('CS-07','Ather Grid Hub',         'Electronic City, Bengaluru',   12.8399,77.6770,3,6,'22 kW'),
('CS-08','MG Fast Charger',        'Whitefield, Bengaluru',        12.9698,77.7499,4,6,'100 kW'),
('CS-09','HPCL EV Charge',         'HITEC City, Hyderabad',        17.4400,78.3900,2,4,'25 kW'),
('CS-10','Charge Zone',            'Banjara Hills, Hyderabad',     17.4156,78.4483,3,6,'60 kW'),
('CS-11','Tata Power EZ Charge',   'Jubilee Hills, Hyderabad',     17.4314,78.4075,1,4,'50 kW'),
('CS-12','BPCL EV Station',        'Gachibowli, Hyderabad',        17.4401,78.3489,5,8,'150 kW'),
('CS-13','Charge Zone',            'Porur, Chennai',               13.0359,80.1580,2,4,'60 kW'),
('CS-14','Tata Power EZ Charge',   'Guindy, Chennai',              13.0067,80.2206,1,4,'50 kW'),
('CS-15','Ather Grid Hub',         'HSR Layout, Bengaluru',        12.9081,77.6476,3,6,'22 kW')
ON CONFLICT (id) DO NOTHING;

-- ── 10. ANALYTICS SERIES — FLEET (All + per brand, all period types) ──────────

-- ─── Fleet All — Weekly ──────────────────────────────────────────────────────
INSERT INTO public.analytics_series (scope,scope_id,period_type,period_label,metric_type,value,recorded_date) VALUES
('fleet','All','weekly','Mon','revenue', 68000,'2026-06-01'),('fleet','All','weekly','Mon','target', 58000,'2026-06-01'),('fleet','All','weekly','Mon','expenses',26600,'2026-06-01'),
('fleet','All','weekly','Tue','revenue', 78000,'2026-06-02'),('fleet','All','weekly','Tue','target', 64000,'2026-06-02'),('fleet','All','weekly','Tue','expenses',30400,'2026-06-02'),
('fleet','All','weekly','Wed','revenue', 82000,'2026-06-03'),('fleet','All','weekly','Wed','target', 68000,'2026-06-03'),('fleet','All','weekly','Wed','expenses',32000,'2026-06-03'),
('fleet','All','weekly','Thu','revenue', 97000,'2026-06-04'),('fleet','All','weekly','Thu','target', 76000,'2026-06-04'),('fleet','All','weekly','Thu','expenses',37800,'2026-06-04'),
('fleet','All','weekly','Fri','revenue',112000,'2026-06-05'),('fleet','All','weekly','Fri','target', 88000,'2026-06-05'),('fleet','All','weekly','Fri','expenses',43700,'2026-06-05'),
('fleet','All','weekly','Sat','revenue',128000,'2026-06-06'),('fleet','All','weekly','Sat','target',102000,'2026-06-06'),('fleet','All','weekly','Sat','expenses',49900,'2026-06-06'),
('fleet','All','weekly','Sun','revenue', 91000,'2026-06-07'),('fleet','All','weekly','Sun','target', 80000,'2026-06-07'),('fleet','All','weekly','Sun','expenses',35500,'2026-06-07');

-- ─── Fleet All — Monthly ─────────────────────────────────────────────────────
INSERT INTO public.analytics_series (scope,scope_id,period_type,period_label,metric_type,value,recorded_date) VALUES
('fleet','All','monthly','Jan','revenue',4820000,'2026-01-31'),('fleet','All','monthly','Jan','target',4200000,'2026-01-31'),('fleet','All','monthly','Jan','expenses',1880000,'2026-01-31'),
('fleet','All','monthly','Feb','revenue',4460000,'2026-02-28'),('fleet','All','monthly','Feb','target',4000000,'2026-02-28'),('fleet','All','monthly','Feb','expenses',1740000,'2026-02-28'),
('fleet','All','monthly','Mar','revenue',5240000,'2026-03-31'),('fleet','All','monthly','Mar','target',4600000,'2026-03-31'),('fleet','All','monthly','Mar','expenses',2044000,'2026-03-31'),
('fleet','All','monthly','Apr','revenue',5620000,'2026-04-30'),('fleet','All','monthly','Apr','target',4900000,'2026-04-30'),('fleet','All','monthly','Apr','expenses',2192000,'2026-04-30'),
('fleet','All','monthly','May','revenue',6080000,'2026-05-31'),('fleet','All','monthly','May','target',5300000,'2026-05-31'),('fleet','All','monthly','May','expenses',2371000,'2026-05-31'),
('fleet','All','monthly','Jun','revenue',3120000,'2026-06-10'),('fleet','All','monthly','Jun','target',5000000,'2026-06-10'),('fleet','All','monthly','Jun','expenses',1217000,'2026-06-10');

-- ─── Fleet All — Last 3 months ───────────────────────────────────────────────
INSERT INTO public.analytics_series (scope,scope_id,period_type,period_label,metric_type,value,recorded_date) VALUES
('fleet','All','last3months','Wk1', 'revenue',1080000,'2026-03-07'),('fleet','All','last3months','Wk1', 'target', 980000,'2026-03-07'),
('fleet','All','last3months','Wk2', 'revenue',1140000,'2026-03-14'),('fleet','All','last3months','Wk2', 'target',1020000,'2026-03-14'),
('fleet','All','last3months','Wk3', 'revenue',1110000,'2026-03-21'),('fleet','All','last3months','Wk3', 'target',1000000,'2026-03-21'),
('fleet','All','last3months','Wk4', 'revenue',1200000,'2026-03-28'),('fleet','All','last3months','Wk4', 'target',1060000,'2026-03-28'),
('fleet','All','last3months','Wk5', 'revenue',1260000,'2026-04-07'),('fleet','All','last3months','Wk5', 'target',1100000,'2026-04-07'),
('fleet','All','last3months','Wk6', 'revenue',1310000,'2026-04-14'),('fleet','All','last3months','Wk6', 'target',1140000,'2026-04-14'),
('fleet','All','last3months','Wk7', 'revenue',1280000,'2026-04-21'),('fleet','All','last3months','Wk7', 'target',1120000,'2026-04-21'),
('fleet','All','last3months','Wk8', 'revenue',1380000,'2026-04-28'),('fleet','All','last3months','Wk8', 'target',1200000,'2026-04-28'),
('fleet','All','last3months','Wk9', 'revenue',1440000,'2026-05-07'),('fleet','All','last3months','Wk9', 'target',1260000,'2026-05-07'),
('fleet','All','last3months','Wk10','revenue',1490000,'2026-05-14'),('fleet','All','last3months','Wk10','target',1300000,'2026-05-14'),
('fleet','All','last3months','Wk11','revenue',1460000,'2026-05-21'),('fleet','All','last3months','Wk11','target',1280000,'2026-05-21'),
('fleet','All','last3months','Wk12','revenue',1100000,'2026-06-07'),('fleet','All','last3months','Wk12','target',1200000,'2026-06-07');

-- ─── Fleet All — Yearly ──────────────────────────────────────────────────────
INSERT INTO public.analytics_series (scope,scope_id,period_type,period_label,metric_type,value,recorded_date) VALUES
('fleet','All','yearly','2023','revenue',38500000,'2023-12-31'),('fleet','All','yearly','2023','target',34000000,'2023-12-31'),('fleet','All','yearly','2023','expenses',15015000,'2023-12-31'),
('fleet','All','yearly','2024','revenue',46800000,'2024-12-31'),('fleet','All','yearly','2024','target',42000000,'2024-12-31'),('fleet','All','yearly','2024','expenses',18252000,'2024-12-31'),
('fleet','All','yearly','2025','revenue',57200000,'2025-12-31'),('fleet','All','yearly','2025','target',52000000,'2025-12-31'),('fleet','All','yearly','2025','expenses',22308000,'2025-12-31'),
('fleet','All','yearly','2026','revenue',28000000,'2026-06-10'),('fleet','All','yearly','2026','target',58000000,'2026-06-10'),('fleet','All','yearly','2026','expenses',10920000,'2026-06-10');

-- ─── Per-brand series (monthly + yearly, all 5 brands) ───────────────────────
-- Hyundai (4 vehicles ~16%)
INSERT INTO public.analytics_series (scope,scope_id,period_type,period_label,metric_type,value,recorded_date) VALUES
('fleet','Hyundai','weekly','Mon','revenue', 10880,'2026-06-01'),('fleet','Hyundai','weekly','Tue','revenue', 12480,'2026-06-02'),('fleet','Hyundai','weekly','Wed','revenue', 13120,'2026-06-03'),('fleet','Hyundai','weekly','Thu','revenue', 15520,'2026-06-04'),('fleet','Hyundai','weekly','Fri','revenue', 17920,'2026-06-05'),('fleet','Hyundai','weekly','Sat','revenue', 20480,'2026-06-06'),('fleet','Hyundai','weekly','Sun','revenue', 14560,'2026-06-07'),
('fleet','Hyundai','weekly','Mon','expenses',4246,'2026-06-01'),('fleet','Hyundai','weekly','Sat','expenses',7987,'2026-06-06'),('fleet','Hyundai','weekly','Mon','maintenance',860,'2026-06-01'),('fleet','Hyundai','weekly','Mon','charging',3386,'2026-06-01'),
('fleet','Hyundai','monthly','Jan','revenue', 771200,'2026-01-31'),('fleet','Hyundai','monthly','Jan','expenses',300768,'2026-01-31'),('fleet','Hyundai','monthly','Jan','maintenance',58000,'2026-01-31'),('fleet','Hyundai','monthly','Jan','charging',242768,'2026-01-31'),
('fleet','Hyundai','monthly','Feb','revenue', 713600,'2026-02-28'),('fleet','Hyundai','monthly','Feb','expenses',278304,'2026-02-28'),('fleet','Hyundai','monthly','Mar','revenue', 838400,'2026-03-31'),('fleet','Hyundai','monthly','Mar','expenses',327024,'2026-03-31'),
('fleet','Hyundai','monthly','Apr','revenue', 899200,'2026-04-30'),('fleet','Hyundai','monthly','Apr','expenses',350688,'2026-04-30'),('fleet','Hyundai','monthly','May','revenue', 972800,'2026-05-31'),('fleet','Hyundai','monthly','May','expenses',379392,'2026-05-31'),
('fleet','Hyundai','monthly','Jun','revenue', 499200,'2026-06-10'),('fleet','Hyundai','monthly','Jun','expenses',194688,'2026-06-10'),
('fleet','Hyundai','yearly','2023','revenue',6160000,'2023-12-31'),('fleet','Hyundai','yearly','2023','expenses',2402400,'2023-12-31'),
('fleet','Hyundai','yearly','2024','revenue',7488000,'2024-12-31'),('fleet','Hyundai','yearly','2024','expenses',2920320,'2024-12-31'),
('fleet','Hyundai','yearly','2025','revenue',9152000,'2025-12-31'),('fleet','Hyundai','yearly','2025','expenses',3569280,'2025-12-31'),
('fleet','Hyundai','yearly','2026','revenue',4480000,'2026-06-10'),('fleet','Hyundai','yearly','2026','expenses',1747200,'2026-06-10');

-- Kia (4 vehicles ~16%)
INSERT INTO public.analytics_series (scope,scope_id,period_type,period_label,metric_type,value,recorded_date) VALUES
('fleet','Kia','weekly','Mon','revenue', 10880,'2026-06-01'),('fleet','Kia','weekly','Tue','revenue', 12480,'2026-06-02'),('fleet','Kia','weekly','Wed','revenue', 13120,'2026-06-03'),('fleet','Kia','weekly','Thu','revenue', 15520,'2026-06-04'),('fleet','Kia','weekly','Fri','revenue', 17920,'2026-06-05'),('fleet','Kia','weekly','Sat','revenue', 20480,'2026-06-06'),('fleet','Kia','weekly','Sun','revenue', 14560,'2026-06-07'),
('fleet','Kia','weekly','Mon','expenses',4246,'2026-06-01'),('fleet','Kia','weekly','Mon','maintenance',920,'2026-06-01'),('fleet','Kia','weekly','Mon','charging',3326,'2026-06-01'),
('fleet','Kia','monthly','Jan','revenue', 771200,'2026-01-31'),('fleet','Kia','monthly','Jan','expenses',300768,'2026-01-31'),('fleet','Kia','monthly','Jan','maintenance',62000,'2026-01-31'),('fleet','Kia','monthly','Jan','charging',238768,'2026-01-31'),
('fleet','Kia','monthly','Feb','revenue', 713600,'2026-02-28'),('fleet','Kia','monthly','Feb','expenses',278304,'2026-02-28'),('fleet','Kia','monthly','Mar','revenue', 838400,'2026-03-31'),('fleet','Kia','monthly','Mar','expenses',327024,'2026-03-31'),
('fleet','Kia','monthly','Apr','revenue', 899200,'2026-04-30'),('fleet','Kia','monthly','Apr','expenses',350688,'2026-04-30'),('fleet','Kia','monthly','May','revenue', 972800,'2026-05-31'),('fleet','Kia','monthly','May','expenses',379392,'2026-05-31'),
('fleet','Kia','monthly','Jun','revenue', 499200,'2026-06-10'),('fleet','Kia','monthly','Jun','expenses',194688,'2026-06-10'),
('fleet','Kia','yearly','2023','revenue',6160000,'2023-12-31'),('fleet','Kia','yearly','2023','expenses',2402400,'2023-12-31'),
('fleet','Kia','yearly','2024','revenue',7488000,'2024-12-31'),('fleet','Kia','yearly','2024','expenses',2920320,'2024-12-31'),
('fleet','Kia','yearly','2025','revenue',9152000,'2025-12-31'),('fleet','Kia','yearly','2025','expenses',3569280,'2025-12-31'),
('fleet','Kia','yearly','2026','revenue',4480000,'2026-06-10'),('fleet','Kia','yearly','2026','expenses',1747200,'2026-06-10');

-- MG Motor (4 vehicles ~16%)
INSERT INTO public.analytics_series (scope,scope_id,period_type,period_label,metric_type,value,recorded_date) VALUES
('fleet','MG Motor','weekly','Mon','revenue', 10880,'2026-06-01'),('fleet','MG Motor','weekly','Tue','revenue', 12480,'2026-06-02'),('fleet','MG Motor','weekly','Wed','revenue', 13120,'2026-06-03'),('fleet','MG Motor','weekly','Thu','revenue', 15520,'2026-06-04'),('fleet','MG Motor','weekly','Fri','revenue', 17920,'2026-06-05'),('fleet','MG Motor','weekly','Sat','revenue', 20480,'2026-06-06'),('fleet','MG Motor','weekly','Sun','revenue', 14560,'2026-06-07'),
('fleet','MG Motor','weekly','Mon','expenses',4246,'2026-06-01'),('fleet','MG Motor','weekly','Mon','maintenance',780,'2026-06-01'),('fleet','MG Motor','weekly','Mon','charging',3466,'2026-06-01'),
('fleet','MG Motor','monthly','Jan','revenue', 771200,'2026-01-31'),('fleet','MG Motor','monthly','Jan','expenses',300768,'2026-01-31'),('fleet','MG Motor','monthly','Feb','revenue', 713600,'2026-02-28'),('fleet','MG Motor','monthly','Feb','expenses',278304,'2026-02-28'),
('fleet','MG Motor','monthly','Mar','revenue', 838400,'2026-03-31'),('fleet','MG Motor','monthly','Mar','expenses',327024,'2026-03-31'),('fleet','MG Motor','monthly','Apr','revenue', 899200,'2026-04-30'),('fleet','MG Motor','monthly','Apr','expenses',350688,'2026-04-30'),
('fleet','MG Motor','monthly','May','revenue', 972800,'2026-05-31'),('fleet','MG Motor','monthly','May','expenses',379392,'2026-05-31'),('fleet','MG Motor','monthly','Jun','revenue', 499200,'2026-06-10'),('fleet','MG Motor','monthly','Jun','expenses',194688,'2026-06-10'),
('fleet','MG Motor','yearly','2023','revenue',6160000,'2023-12-31'),('fleet','MG Motor','yearly','2023','expenses',2402400,'2023-12-31'),
('fleet','MG Motor','yearly','2024','revenue',7488000,'2024-12-31'),('fleet','MG Motor','yearly','2024','expenses',2920320,'2024-12-31'),
('fleet','MG Motor','yearly','2025','revenue',9152000,'2025-12-31'),('fleet','MG Motor','yearly','2025','expenses',3569280,'2025-12-31'),
('fleet','MG Motor','yearly','2026','revenue',4480000,'2026-06-10'),('fleet','MG Motor','yearly','2026','expenses',1747200,'2026-06-10');

-- Mahindra (4 vehicles ~16%)
INSERT INTO public.analytics_series (scope,scope_id,period_type,period_label,metric_type,value,recorded_date) VALUES
('fleet','Mahindra','weekly','Mon','revenue', 10880,'2026-06-01'),('fleet','Mahindra','weekly','Tue','revenue', 12480,'2026-06-02'),('fleet','Mahindra','weekly','Wed','revenue', 13120,'2026-06-03'),('fleet','Mahindra','weekly','Thu','revenue', 15520,'2026-06-04'),('fleet','Mahindra','weekly','Fri','revenue', 17920,'2026-06-05'),('fleet','Mahindra','weekly','Sat','revenue', 20480,'2026-06-06'),('fleet','Mahindra','weekly','Sun','revenue', 14560,'2026-06-07'),
('fleet','Mahindra','weekly','Mon','expenses',4246,'2026-06-01'),('fleet','Mahindra','weekly','Mon','maintenance',1240,'2026-06-01'),('fleet','Mahindra','weekly','Mon','charging',3006,'2026-06-01'),
('fleet','Mahindra','monthly','Jan','revenue', 771200,'2026-01-31'),('fleet','Mahindra','monthly','Jan','expenses',300768,'2026-01-31'),('fleet','Mahindra','monthly','Feb','revenue', 713600,'2026-02-28'),('fleet','Mahindra','monthly','Feb','expenses',278304,'2026-02-28'),
('fleet','Mahindra','monthly','Mar','revenue', 838400,'2026-03-31'),('fleet','Mahindra','monthly','Mar','expenses',327024,'2026-03-31'),('fleet','Mahindra','monthly','Apr','revenue', 899200,'2026-04-30'),('fleet','Mahindra','monthly','Apr','expenses',350688,'2026-04-30'),
('fleet','Mahindra','monthly','May','revenue', 972800,'2026-05-31'),('fleet','Mahindra','monthly','May','expenses',379392,'2026-05-31'),('fleet','Mahindra','monthly','Jun','revenue', 499200,'2026-06-10'),('fleet','Mahindra','monthly','Jun','expenses',194688,'2026-06-10'),
('fleet','Mahindra','yearly','2023','revenue',6160000,'2023-12-31'),('fleet','Mahindra','yearly','2023','expenses',2402400,'2023-12-31'),
('fleet','Mahindra','yearly','2024','revenue',7488000,'2024-12-31'),('fleet','Mahindra','yearly','2024','expenses',2920320,'2024-12-31'),
('fleet','Mahindra','yearly','2025','revenue',9152000,'2025-12-31'),('fleet','Mahindra','yearly','2025','expenses',3569280,'2025-12-31'),
('fleet','Mahindra','yearly','2026','revenue',4480000,'2026-06-10'),('fleet','Mahindra','yearly','2026','expenses',1747200,'2026-06-10');

-- Tata (9 vehicles ~36%)
INSERT INTO public.analytics_series (scope,scope_id,period_type,period_label,metric_type,value,recorded_date) VALUES
('fleet','Tata','weekly','Mon','revenue', 24480,'2026-06-01'),('fleet','Tata','weekly','Tue','revenue', 28080,'2026-06-02'),('fleet','Tata','weekly','Wed','revenue', 29520,'2026-06-03'),('fleet','Tata','weekly','Thu','revenue', 34920,'2026-06-04'),('fleet','Tata','weekly','Fri','revenue', 40320,'2026-06-05'),('fleet','Tata','weekly','Sat','revenue', 46080,'2026-06-06'),('fleet','Tata','weekly','Sun','revenue', 32760,'2026-06-07'),
('fleet','Tata','weekly','Mon','expenses',9554,'2026-06-01'),('fleet','Tata','weekly','Mon','maintenance',1380,'2026-06-01'),('fleet','Tata','weekly','Mon','charging',8174,'2026-06-01'),
('fleet','Tata','monthly','Jan','revenue',1735200,'2026-01-31'),('fleet','Tata','monthly','Jan','expenses',676728,'2026-01-31'),('fleet','Tata','monthly','Feb','revenue',1605600,'2026-02-28'),('fleet','Tata','monthly','Feb','expenses',626184,'2026-02-28'),
('fleet','Tata','monthly','Mar','revenue',1886400,'2026-03-31'),('fleet','Tata','monthly','Mar','expenses',735696,'2026-03-31'),('fleet','Tata','monthly','Apr','revenue',2023200,'2026-04-30'),('fleet','Tata','monthly','Apr','expenses',789048,'2026-04-30'),
('fleet','Tata','monthly','May','revenue',2188800,'2026-05-31'),('fleet','Tata','monthly','May','expenses',853632,'2026-05-31'),('fleet','Tata','monthly','Jun','revenue',1123200,'2026-06-10'),('fleet','Tata','monthly','Jun','expenses',438048,'2026-06-10'),
('fleet','Tata','yearly','2023','revenue',13860000,'2023-12-31'),('fleet','Tata','yearly','2023','expenses',5405400,'2023-12-31'),
('fleet','Tata','yearly','2024','revenue',16848000,'2024-12-31'),('fleet','Tata','yearly','2024','expenses',6570720,'2024-12-31'),
('fleet','Tata','yearly','2025','revenue',20592000,'2025-12-31'),('fleet','Tata','yearly','2025','expenses',8030880,'2025-12-31'),
('fleet','Tata','yearly','2026','revenue',10080000,'2026-06-10'),('fleet','Tata','yearly','2026','expenses',3931200,'2026-06-10');

-- ── 11. ANALYTICS SERIES — GENERAL (growth KPIs + reports, all periods) ───────
INSERT INTO public.analytics_series (scope,scope_id,period_type,period_label,metric_type,value,recorded_date) VALUES
-- Weekly growth
('general','growth','weekly',null,'fleetRevenue',  656000,'2026-06-07'),
('general','growth','weekly',null,'energyToday',    2480,'2026-06-07'),
('general','growth','weekly',null,'revenueGrowth',  14.2,'2026-06-07'),
('general','growth','weekly',null,'energyGrowth',   -2.8,'2026-06-07'),
('general','growth','weekly',null,'healthGrowth',   -0.9,'2026-06-07'),
('general','growth','weekly',null,'activeGrowth',    8.0,'2026-06-07'),
-- Monthly growth
('general','growth','monthly',null,'fleetRevenue',  28340000,'2026-05-31'),
('general','growth','monthly',null,'energyToday',     107400,'2026-05-31'),
('general','growth','monthly',null,'revenueGrowth',     11.8,'2026-05-31'),
('general','growth','monthly',null,'energyGrowth',      -1.4,'2026-05-31'),
('general','growth','monthly',null,'healthGrowth',      -0.6,'2026-05-31'),
('general','growth','monthly',null,'activeGrowth',       6.2,'2026-05-31'),
-- Last 3 months growth
('general','growth','last3months',null,'fleetRevenue',  84900000,'2026-06-07'),
('general','growth','last3months',null,'energyToday',    322200,'2026-06-07'),
('general','growth','last3months',null,'revenueGrowth',    13.1,'2026-06-07'),
('general','growth','last3months',null,'energyGrowth',     -2.1,'2026-06-07'),
('general','growth','last3months',null,'healthGrowth',     -0.8,'2026-06-07'),
('general','growth','last3months',null,'activeGrowth',      7.4,'2026-06-07'),
-- Yearly growth
('general','growth','yearly',null,'fleetRevenue',  170500000,'2026-06-07'),
('general','growth','yearly',null,'energyToday',    1290000,'2026-06-07'),
('general','growth','yearly',null,'revenueGrowth',     22.1,'2026-06-07'),
('general','growth','yearly',null,'energyGrowth',      -3.5,'2026-06-07'),
('general','growth','yearly',null,'healthGrowth',      -1.2,'2026-06-07'),
('general','growth','yearly',null,'activeGrowth',      11.8,'2026-06-07');

-- General reports — hourly energy, battery health, daily distance, charging sessions
INSERT INTO public.analytics_series (scope,scope_id,period_type,period_label,metric_type,value,recorded_date) VALUES
('general',null,'daily','6AM', 'energy', 168,'2026-06-07'),('general',null,'daily','7AM', 'energy', 296,'2026-06-07'),
('general',null,'daily','8AM', 'energy', 462,'2026-06-07'),('general',null,'daily','9AM', 'energy', 558,'2026-06-07'),
('general',null,'daily','10AM','energy', 522,'2026-06-07'),('general',null,'daily','11AM','energy', 433,'2026-06-07'),
('general',null,'daily','12PM','energy', 376,'2026-06-07'),('general',null,'daily','1PM', 'energy', 352,'2026-06-07'),
('general',null,'daily','2PM', 'energy', 420,'2026-06-07'),('general',null,'daily','3PM', 'energy', 514,'2026-06-07'),
('general',null,'daily','4PM', 'energy', 598,'2026-06-07'),('general',null,'daily','5PM', 'energy', 657,'2026-06-07'),
('general',null,'daily','6PM', 'energy', 565,'2026-06-07'),('general',null,'daily','7PM', 'energy', 489,'2026-06-07'),
('general',null,'daily','8PM', 'energy', 403,'2026-06-07'),('general',null,'daily','9PM', 'energy', 268,'2026-06-07'),
('general',null,'daily','10PM','energy', 192,'2026-06-07'),
('general',null,'monthly','Jan','avgHealth', 94.8,'2026-01-31'),('general',null,'monthly','Feb','avgHealth', 94.2,'2026-02-28'),
('general',null,'monthly','Mar','avgHealth', 93.6,'2026-03-31'),('general',null,'monthly','Apr','avgHealth', 93.1,'2026-04-30'),
('general',null,'monthly','May','avgHealth', 92.4,'2026-05-31'),('general',null,'monthly','Jun','avgHealth', 91.8,'2026-06-07'),
('general',null,'daily','Mon','distance', 6820,'2026-06-01'),('general',null,'daily','Tue','distance', 7340,'2026-06-02'),
('general',null,'daily','Wed','distance', 6980,'2026-06-03'),('general',null,'daily','Thu','distance', 8260,'2026-06-04'),
('general',null,'daily','Fri','distance', 9420,'2026-06-05'),('general',null,'daily','Sat','distance',10180,'2026-06-06'),
('general',null,'daily','Sun','distance', 7640,'2026-06-07'),
('general',null,'daily','6AM', 'charging_sessions',  4,'2026-06-07'),('general',null,'daily','7AM', 'charging_sessions', 11,'2026-06-07'),
('general',null,'daily','8AM', 'charging_sessions', 16,'2026-06-07'),('general',null,'daily','9AM', 'charging_sessions', 12,'2026-06-07'),
('general',null,'daily','10AM','charging_sessions',  8,'2026-06-07'),('general',null,'daily','12PM','charging_sessions', 15,'2026-06-07'),
('general',null,'daily','1PM', 'charging_sessions', 19,'2026-06-07'),('general',null,'daily','2PM', 'charging_sessions', 11,'2026-06-07'),
('general',null,'daily','4PM', 'charging_sessions',  9,'2026-06-07'),('general',null,'daily','5PM', 'charging_sessions', 22,'2026-06-07'),
('general',null,'daily','6PM', 'charging_sessions', 28,'2026-06-07'),('general',null,'daily','7PM', 'charging_sessions', 24,'2026-06-07'),
('general',null,'daily','8PM', 'charging_sessions', 18,'2026-06-07'),('general',null,'daily','9PM', 'charging_sessions', 12,'2026-06-07'),
('general',null,'daily','10PM','charging_sessions',  7,'2026-06-07');

-- ── 12. DRIVER ANALYTICS (weekly for all 25 drivers) ─────────────────────────
-- Each driver gets earnings, energy, safety, trips, speed for the current week.
-- Values derived proportionally from their safety_score and total_earnings.
INSERT INTO public.analytics_series (scope,scope_id,period_type,period_label,metric_type,value,recorded_date) VALUES
-- D-001 Arjun (safety 91, earnings base ~5356/day)
('driver','D-001','weekly','Mon','earnings',4392,'2026-06-01'),('driver','D-001','weekly','Tue','earnings',5249,'2026-06-02'),('driver','D-001','weekly','Wed','earnings',4714,'2026-06-03'),('driver','D-001','weekly','Thu','earnings',5892,'2026-06-04'),('driver','D-001','weekly','Fri','earnings',6695,'2026-06-05'),('driver','D-001','weekly','Sat','earnings',7497,'2026-06-06'),('driver','D-001','weekly','Sun','earnings',4821,'2026-06-07'),
('driver','D-001','weekly','Mon','energy',18.2,'2026-06-01'),('driver','D-001','weekly','Tue','energy',21.8,'2026-06-02'),('driver','D-001','weekly','Wed','energy',19.6,'2026-06-03'),('driver','D-001','weekly','Thu','energy',24.4,'2026-06-04'),('driver','D-001','weekly','Fri','energy',27.8,'2026-06-05'),('driver','D-001','weekly','Sat','energy',31.1,'2026-06-06'),('driver','D-001','weekly','Sun','energy',20.0,'2026-06-07'),
('driver','D-001','weekly','Mon','safety',89,'2026-06-01'),('driver','D-001','weekly','Tue','safety',90,'2026-06-02'),('driver','D-001','weekly','Wed','safety',91,'2026-06-03'),('driver','D-001','weekly','Thu','safety',92,'2026-06-04'),('driver','D-001','weekly','Fri','safety',91,'2026-06-05'),('driver','D-001','weekly','Sat','safety',93,'2026-06-06'),('driver','D-001','weekly','Sun','safety',91,'2026-06-07'),
('driver','D-001','weekly','Mon','trips',18,'2026-06-01'),('driver','D-001','weekly','Tue','trips',22,'2026-06-02'),('driver','D-001','weekly','Wed','trips',19,'2026-06-03'),('driver','D-001','weekly','Thu','trips',25,'2026-06-04'),('driver','D-001','weekly','Fri','trips',28,'2026-06-05'),('driver','D-001','weekly','Sat','trips',31,'2026-06-06'),('driver','D-001','weekly','Sun','trips',20,'2026-06-07'),
('driver','D-001','weekly','Mon','speed',47,'2026-06-01'),('driver','D-001','weekly','Tue','speed',49,'2026-06-02'),('driver','D-001','weekly','Wed','speed',48,'2026-06-03'),('driver','D-001','weekly','Thu','speed',51,'2026-06-04'),('driver','D-001','weekly','Fri','speed',50,'2026-06-05'),('driver','D-001','weekly','Sat','speed',52,'2026-06-06'),('driver','D-001','weekly','Sun','speed',49,'2026-06-07'),
-- D-003 Karthik (safety 71, higher earnings)
('driver','D-003','weekly','Mon','earnings',5990,'2026-06-01'),('driver','D-003','weekly','Tue','earnings',7165,'2026-06-02'),('driver','D-003','weekly','Wed','earnings',6436,'2026-06-03'),('driver','D-003','weekly','Thu','earnings',8031,'2026-06-04'),('driver','D-003','weekly','Fri','earnings',9140,'2026-06-05'),('driver','D-003','weekly','Sat','earnings',10234,'2026-06-06'),('driver','D-003','weekly','Sun','earnings',6580,'2026-06-07'),
('driver','D-003','weekly','Mon','energy',24.8,'2026-06-01'),('driver','D-003','weekly','Tue','energy',29.7,'2026-06-02'),('driver','D-003','weekly','Wed','energy',26.7,'2026-06-03'),('driver','D-003','weekly','Thu','energy',33.3,'2026-06-04'),('driver','D-003','weekly','Fri','energy',37.9,'2026-06-05'),('driver','D-003','weekly','Sat','energy',42.4,'2026-06-06'),('driver','D-003','weekly','Sun','energy',27.3,'2026-06-07'),
('driver','D-003','weekly','Mon','safety',69,'2026-06-01'),('driver','D-003','weekly','Tue','safety',70,'2026-06-02'),('driver','D-003','weekly','Wed','safety',70,'2026-06-03'),('driver','D-003','weekly','Thu','safety',72,'2026-06-04'),('driver','D-003','weekly','Fri','safety',71,'2026-06-05'),('driver','D-003','weekly','Sat','safety',73,'2026-06-06'),('driver','D-003','weekly','Sun','safety',71,'2026-06-07'),
('driver','D-003','weekly','Mon','trips',24,'2026-06-01'),('driver','D-003','weekly','Tue','trips',28,'2026-06-02'),('driver','D-003','weekly','Wed','trips',25,'2026-06-03'),('driver','D-003','weekly','Thu','trips',31,'2026-06-04'),('driver','D-003','weekly','Fri','trips',35,'2026-06-05'),('driver','D-003','weekly','Sat','trips',39,'2026-06-06'),('driver','D-003','weekly','Sun','trips',26,'2026-06-07'),
('driver','D-003','weekly','Mon','speed',52,'2026-06-01'),('driver','D-003','weekly','Tue','speed',55,'2026-06-02'),('driver','D-003','weekly','Wed','speed',53,'2026-06-03'),('driver','D-003','weekly','Thu','speed',57,'2026-06-04'),('driver','D-003','weekly','Fri','speed',56,'2026-06-05'),('driver','D-003','weekly','Sat','speed',59,'2026-06-06'),('driver','D-003','weekly','Sun','speed',54,'2026-06-07'),
-- D-006 Lakshmi (safety 86, very high trips)
('driver','D-006','weekly','Mon','earnings',2996,'2026-06-01'),('driver','D-006','weekly','Tue','earnings',3582,'2026-06-02'),('driver','D-006','weekly','Wed','earnings',3218,'2026-06-03'),('driver','D-006','weekly','Thu','earnings',4020,'2026-06-04'),('driver','D-006','weekly','Fri','earnings',4572,'2026-06-05'),('driver','D-006','weekly','Sat','earnings',5118,'2026-06-06'),('driver','D-006','weekly','Sun','earnings',3290,'2026-06-07'),
('driver','D-006','weekly','Mon','energy',12.4,'2026-06-01'),('driver','D-006','weekly','Tue','energy',14.8,'2026-06-02'),('driver','D-006','weekly','Wed','energy',13.3,'2026-06-03'),('driver','D-006','weekly','Thu','energy',16.6,'2026-06-04'),('driver','D-006','weekly','Fri','energy',18.9,'2026-06-05'),('driver','D-006','weekly','Sat','energy',21.2,'2026-06-06'),('driver','D-006','weekly','Sun','energy',13.6,'2026-06-07'),
('driver','D-006','weekly','Mon','safety',84,'2026-06-01'),('driver','D-006','weekly','Tue','safety',86,'2026-06-02'),('driver','D-006','weekly','Wed','safety',85,'2026-06-03'),('driver','D-006','weekly','Thu','safety',87,'2026-06-04'),('driver','D-006','weekly','Fri','safety',88,'2026-06-05'),('driver','D-006','weekly','Sat','safety',86,'2026-06-06'),('driver','D-006','weekly','Sun','safety',86,'2026-06-07'),
('driver','D-006','weekly','Mon','trips',30,'2026-06-01'),('driver','D-006','weekly','Tue','trips',36,'2026-06-02'),('driver','D-006','weekly','Wed','trips',32,'2026-06-03'),('driver','D-006','weekly','Thu','trips',40,'2026-06-04'),('driver','D-006','weekly','Fri','trips',46,'2026-06-05'),('driver','D-006','weekly','Sat','trips',51,'2026-06-06'),('driver','D-006','weekly','Sun','trips',33,'2026-06-07'),
('driver','D-006','weekly','Mon','speed',42,'2026-06-01'),('driver','D-006','weekly','Tue','speed',44,'2026-06-02'),('driver','D-006','weekly','Wed','speed',43,'2026-06-03'),('driver','D-006','weekly','Thu','speed',45,'2026-06-04'),('driver','D-006','weekly','Fri','speed',44,'2026-06-05'),('driver','D-006','weekly','Sat','speed',46,'2026-06-06'),('driver','D-006','weekly','Sun','speed',44,'2026-06-07'),
-- D-008 Ananya (safety 96, top performer)
('driver','D-008','weekly','Mon','earnings',4929,'2026-06-01'),('driver','D-008','weekly','Tue','earnings',5893,'2026-06-02'),('driver','D-008','weekly','Wed','earnings',5294,'2026-06-03'),('driver','D-008','weekly','Thu','earnings',6616,'2026-06-04'),('driver','D-008','weekly','Fri','earnings',7523,'2026-06-05'),('driver','D-008','weekly','Sat','earnings',8424,'2026-06-06'),('driver','D-008','weekly','Sun','earnings',5415,'2026-06-07'),
('driver','D-008','weekly','Mon','energy',13.4,'2026-06-01'),('driver','D-008','weekly','Tue','energy',16.0,'2026-06-02'),('driver','D-008','weekly','Wed','energy',14.4,'2026-06-03'),('driver','D-008','weekly','Thu','energy',18.0,'2026-06-04'),('driver','D-008','weekly','Fri','energy',20.4,'2026-06-05'),('driver','D-008','weekly','Sat','energy',22.9,'2026-06-06'),('driver','D-008','weekly','Sun','energy',14.7,'2026-06-07'),
('driver','D-008','weekly','Mon','safety',94,'2026-06-01'),('driver','D-008','weekly','Tue','safety',96,'2026-06-02'),('driver','D-008','weekly','Wed','safety',95,'2026-06-03'),('driver','D-008','weekly','Thu','safety',97,'2026-06-04'),('driver','D-008','weekly','Fri','safety',96,'2026-06-05'),('driver','D-008','weekly','Sat','safety',97,'2026-06-06'),('driver','D-008','weekly','Sun','safety',96,'2026-06-07'),
('driver','D-008','weekly','Mon','trips',19,'2026-06-01'),('driver','D-008','weekly','Tue','trips',23,'2026-06-02'),('driver','D-008','weekly','Wed','trips',20,'2026-06-03'),('driver','D-008','weekly','Thu','trips',25,'2026-06-04'),('driver','D-008','weekly','Fri','trips',29,'2026-06-05'),('driver','D-008','weekly','Sat','trips',32,'2026-06-06'),('driver','D-008','weekly','Sun','trips',21,'2026-06-07'),
('driver','D-008','weekly','Mon','speed',42,'2026-06-01'),('driver','D-008','weekly','Tue','speed',44,'2026-06-02'),('driver','D-008','weekly','Wed','speed',43,'2026-06-03'),('driver','D-008','weekly','Thu','speed',45,'2026-06-04'),('driver','D-008','weekly','Fri','speed',44,'2026-06-05'),('driver','D-008','weekly','Sat','speed',46,'2026-06-06'),('driver','D-008','weekly','Sun','speed',44,'2026-06-07'),
-- D-012 Anand (high earner)
('driver','D-012','weekly','Mon','earnings',5773,'2026-06-01'),('driver','D-012','weekly','Tue','earnings',6904,'2026-06-02'),('driver','D-012','weekly','Wed','earnings',6201,'2026-06-03'),('driver','D-012','weekly','Thu','earnings',7752,'2026-06-04'),('driver','D-012','weekly','Fri','earnings',8812,'2026-06-05'),('driver','D-012','weekly','Sat','earnings',9866,'2026-06-06'),('driver','D-012','weekly','Sun','earnings',6345,'2026-06-07'),
('driver','D-012','weekly','Mon','energy',19.8,'2026-06-01'),('driver','D-012','weekly','Tue','energy',23.7,'2026-06-02'),('driver','D-012','weekly','Wed','energy',21.3,'2026-06-03'),('driver','D-012','weekly','Thu','energy',26.6,'2026-06-04'),('driver','D-012','weekly','Fri','energy',30.2,'2026-06-05'),('driver','D-012','weekly','Sat','energy',33.8,'2026-06-06'),('driver','D-012','weekly','Sun','energy',21.8,'2026-06-07'),
('driver','D-012','weekly','Mon','safety',92,'2026-06-01'),('driver','D-012','weekly','Tue','safety',93,'2026-06-02'),('driver','D-012','weekly','Wed','safety',92,'2026-06-03'),('driver','D-012','weekly','Thu','safety',94,'2026-06-04'),('driver','D-012','weekly','Fri','safety',95,'2026-06-05'),('driver','D-012','weekly','Sat','safety',94,'2026-06-06'),('driver','D-012','weekly','Sun','safety',94,'2026-06-07'),
('driver','D-012','weekly','Mon','trips',24,'2026-06-01'),('driver','D-012','weekly','Tue','trips',28,'2026-06-02'),('driver','D-012','weekly','Wed','trips',25,'2026-06-03'),('driver','D-012','weekly','Thu','trips',31,'2026-06-04'),('driver','D-012','weekly','Fri','trips',35,'2026-06-05'),('driver','D-012','weekly','Sat','trips',40,'2026-06-06'),('driver','D-012','weekly','Sun','trips',26,'2026-06-07'),
('driver','D-012','weekly','Mon','speed',50,'2026-06-01'),('driver','D-012','weekly','Tue','speed',52,'2026-06-02'),('driver','D-012','weekly','Wed','speed',51,'2026-06-03'),('driver','D-012','weekly','Thu','speed',54,'2026-06-04'),('driver','D-012','weekly','Fri','speed',53,'2026-06-05'),('driver','D-012','weekly','Sat','speed',55,'2026-06-06'),('driver','D-012','weekly','Sun','speed',52,'2026-06-07');

-- ── 13. MONTHLY analytics for top 5 drivers (all others auto-seeded via auto_seed_all_drivers.sql) ─
INSERT INTO public.analytics_series (scope,scope_id,period_type,period_label,metric_type,value,recorded_date) VALUES
('driver','D-001','monthly','Jan','earnings',140000,'2026-01-31'),('driver','D-001','monthly','Feb','earnings',128000,'2026-02-28'),('driver','D-001','monthly','Mar','earnings',156000,'2026-03-31'),('driver','D-001','monthly','Apr','earnings',164000,'2026-04-30'),('driver','D-001','monthly','May','earnings',182000,'2026-05-31'),('driver','D-001','monthly','Jun','earnings', 43260,'2026-06-07'),
('driver','D-001','monthly','Jan','energy',1400,'2026-01-31'),('driver','D-001','monthly','Feb','energy',1290,'2026-02-28'),('driver','D-001','monthly','Mar','energy',1570,'2026-03-31'),('driver','D-001','monthly','Apr','energy',1650,'2026-04-30'),('driver','D-001','monthly','May','energy',1830,'2026-05-31'),('driver','D-001','monthly','Jun','energy', 432,'2026-06-07'),
('driver','D-001','monthly','Jan','safety',89,'2026-01-31'),('driver','D-001','monthly','Feb','safety',90,'2026-02-28'),('driver','D-001','monthly','Mar','safety',91,'2026-03-31'),('driver','D-001','monthly','Apr','safety',91,'2026-04-30'),('driver','D-001','monthly','May','safety',92,'2026-05-31'),('driver','D-001','monthly','Jun','safety',91,'2026-06-07'),
('driver','D-001','monthly','Jan','trips',310,'2026-01-31'),('driver','D-001','monthly','Feb','trips',288,'2026-02-28'),('driver','D-001','monthly','Mar','trips',342,'2026-03-31'),('driver','D-001','monthly','Apr','trips',368,'2026-04-30'),('driver','D-001','monthly','May','trips',402,'2026-05-31'),('driver','D-001','monthly','Jun','trips',143,'2026-06-07'),
('driver','D-008','monthly','Jan','earnings',160000,'2026-01-31'),('driver','D-008','monthly','Feb','earnings',148000,'2026-02-28'),('driver','D-008','monthly','Mar','earnings',174000,'2026-03-31'),('driver','D-008','monthly','Apr','earnings',182000,'2026-04-30'),('driver','D-008','monthly','May','earnings',198000,'2026-05-31'),('driver','D-008','monthly','Jun','earnings', 54450,'2026-06-07'),
('driver','D-008','monthly','Jan','energy', 840,'2026-01-31'),('driver','D-008','monthly','Feb','energy', 775,'2026-02-28'),('driver','D-008','monthly','Mar','energy', 912,'2026-03-31'),('driver','D-008','monthly','Apr','energy', 956,'2026-04-30'),('driver','D-008','monthly','May','energy',1040,'2026-05-31'),('driver','D-008','monthly','Jun','energy', 280,'2026-06-07'),
('driver','D-008','monthly','Jan','safety',94,'2026-01-31'),('driver','D-008','monthly','Feb','safety',95,'2026-02-28'),('driver','D-008','monthly','Mar','safety',96,'2026-03-31'),('driver','D-008','monthly','Apr','safety',96,'2026-04-30'),('driver','D-008','monthly','May','safety',97,'2026-05-31'),('driver','D-008','monthly','Jun','safety',96,'2026-06-07'),
('driver','D-008','monthly','Jan','trips',254,'2026-01-31'),('driver','D-008','monthly','Feb','trips',236,'2026-02-28'),('driver','D-008','monthly','Mar','trips',278,'2026-03-31'),('driver','D-008','monthly','Apr','trips',294,'2026-04-30'),('driver','D-008','monthly','May','trips',322,'2026-05-31'),('driver','D-008','monthly','Jun','trips',149,'2026-06-07'),
('driver','D-012','monthly','Jan','earnings',180000,'2026-01-31'),('driver','D-012','monthly','Feb','earnings',166000,'2026-02-28'),('driver','D-012','monthly','Mar','earnings',196000,'2026-03-31'),('driver','D-012','monthly','Apr','earnings',206000,'2026-04-30'),('driver','D-012','monthly','May','earnings',226000,'2026-05-31'),('driver','D-012','monthly','Jun','earnings', 55260,'2026-06-07'),
('driver','D-012','monthly','Jan','energy',1100,'2026-01-31'),('driver','D-012','monthly','Feb','energy',1016,'2026-02-28'),('driver','D-012','monthly','Mar','energy',1198,'2026-03-31'),('driver','D-012','monthly','Apr','energy',1258,'2026-04-30'),('driver','D-012','monthly','May','energy',1380,'2026-05-31'),('driver','D-012','monthly','Jun','energy', 336,'2026-06-07'),
('driver','D-012','monthly','Jan','safety',92,'2026-01-31'),('driver','D-012','monthly','Feb','safety',93,'2026-02-28'),('driver','D-012','monthly','Mar','safety',94,'2026-03-31'),('driver','D-012','monthly','Apr','safety',94,'2026-04-30'),('driver','D-012','monthly','May','safety',95,'2026-05-31'),('driver','D-012','monthly','Jun','safety',94,'2026-06-07'),
('driver','D-012','monthly','Jan','trips',348,'2026-01-31'),('driver','D-012','monthly','Feb','trips',322,'2026-02-28'),('driver','D-012','monthly','Mar','trips',380,'2026-03-31'),('driver','D-012','monthly','Apr','trips',400,'2026-04-30'),('driver','D-012','monthly','May','trips',438,'2026-05-31'),('driver','D-012','monthly','Jun','trips',178,'2026-06-07');

-- ── 14. EV MODELS + CITIES ────────────────────────────────────────────────────
INSERT INTO public.ev_models (id,base_range) VALUES
('Hyundai Creta EV',473),('Hyundai Ioniq 5',631),('Kia Carens Clavis EV',473),
('Kia EV6',708),('Kia EV9',561),('MG Comet EV',230),('MG Windsor EV',331),
('MG ZS EV',461),('Mahindra BE 6',535),('Mahindra XEV 9e',656),('Mahindra XUV400 EV',456),
('Tata Curvv EV',585),('Tata Nexon EV',465),('Tata Punch EV',421),('Tata Tiago EV',315)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.cities (name) VALUES
('Bengaluru'),('Chennai'),('Hyderabad'),('Coimbatore'),('Madurai'),('Mysuru'),
('Vijayawada'),('Visakhapatnam'),('Tiruchirappalli'),('Mangaluru'),('Kochi'),
('Thiruvananthapuram'),('Puducherry'),('Salem'),('Tirunelveli')
ON CONFLICT DO NOTHING;

-- Done!
-- After running this, also run: supabase/auto_seed_all_drivers.sql
-- to fill weekly analytics for drivers D-002 through D-025.
