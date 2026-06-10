-- ============================================================
-- PATCH: Add last3months expenses/maintenance/charging for
-- all brands and Fleet All.
-- Run in: Supabase Dashboard → SQL Editor
-- Safe to re-run: uses DELETE + re-insert for last3months brand rows.
-- ============================================================

-- Clean existing last3months brand rows so we can fully replace them
DELETE FROM public.analytics_series
WHERE scope = 'fleet'
  AND period_type = 'last3months'
  AND scope_id IN ('All','Hyundai','Kia','MG Motor','Mahindra','Tata');

-- ═══════════════════════════════════════════════════════════════════
-- Fleet All — last3months (Wk1-Wk12)
-- Revenue already in previous seed; add expenses + maintenance + charging
-- ═══════════════════════════════════════════════════════════════════
INSERT INTO public.analytics_series
  (scope,scope_id,period_type,period_label,metric_type,value,recorded_date)
VALUES
('fleet','All','last3months','Wk1', 'revenue',  1080000,'2026-03-07'),('fleet','All','last3months','Wk1', 'target',   980000,'2026-03-07'),
('fleet','All','last3months','Wk1', 'expenses',  421200,'2026-03-07'),('fleet','All','last3months','Wk1', 'maintenance',62000,'2026-03-07'),('fleet','All','last3months','Wk1', 'charging', 359200,'2026-03-07'),
('fleet','All','last3months','Wk2', 'revenue',  1140000,'2026-03-14'),('fleet','All','last3months','Wk2', 'target',  1020000,'2026-03-14'),
('fleet','All','last3months','Wk2', 'expenses',  444600,'2026-03-14'),('fleet','All','last3months','Wk2', 'maintenance',65000,'2026-03-14'),('fleet','All','last3months','Wk2', 'charging', 379600,'2026-03-14'),
('fleet','All','last3months','Wk3', 'revenue',  1110000,'2026-03-21'),('fleet','All','last3months','Wk3', 'target',  1000000,'2026-03-21'),
('fleet','All','last3months','Wk3', 'expenses',  432900,'2026-03-21'),('fleet','All','last3months','Wk3', 'maintenance',63000,'2026-03-21'),('fleet','All','last3months','Wk3', 'charging', 369900,'2026-03-21'),
('fleet','All','last3months','Wk4', 'revenue',  1200000,'2026-03-28'),('fleet','All','last3months','Wk4', 'target',  1060000,'2026-03-28'),
('fleet','All','last3months','Wk4', 'expenses',  468000,'2026-03-28'),('fleet','All','last3months','Wk4', 'maintenance',72000,'2026-03-28'),('fleet','All','last3months','Wk4', 'charging', 396000,'2026-03-28'),
('fleet','All','last3months','Wk5', 'revenue',  1260000,'2026-04-07'),('fleet','All','last3months','Wk5', 'target',  1100000,'2026-04-07'),
('fleet','All','last3months','Wk5', 'expenses',  491400,'2026-04-07'),('fleet','All','last3months','Wk5', 'maintenance',74000,'2026-04-07'),('fleet','All','last3months','Wk5', 'charging', 417400,'2026-04-07'),
('fleet','All','last3months','Wk6', 'revenue',  1310000,'2026-04-14'),('fleet','All','last3months','Wk6', 'target',  1140000,'2026-04-14'),
('fleet','All','last3months','Wk6', 'expenses',  510900,'2026-04-14'),('fleet','All','last3months','Wk6', 'maintenance',78000,'2026-04-14'),('fleet','All','last3months','Wk6', 'charging', 432900,'2026-04-14'),
('fleet','All','last3months','Wk7', 'revenue',  1280000,'2026-04-21'),('fleet','All','last3months','Wk7', 'target',  1120000,'2026-04-21'),
('fleet','All','last3months','Wk7', 'expenses',  499200,'2026-04-21'),('fleet','All','last3months','Wk7', 'maintenance',75000,'2026-04-21'),('fleet','All','last3months','Wk7', 'charging', 424200,'2026-04-21'),
('fleet','All','last3months','Wk8', 'revenue',  1380000,'2026-04-28'),('fleet','All','last3months','Wk8', 'target',  1200000,'2026-04-28'),
('fleet','All','last3months','Wk8', 'expenses',  538200,'2026-04-28'),('fleet','All','last3months','Wk8', 'maintenance',84000,'2026-04-28'),('fleet','All','last3months','Wk8', 'charging', 454200,'2026-04-28'),
('fleet','All','last3months','Wk9', 'revenue',  1440000,'2026-05-07'),('fleet','All','last3months','Wk9', 'target',  1260000,'2026-05-07'),
('fleet','All','last3months','Wk9', 'expenses',  561600,'2026-05-07'),('fleet','All','last3months','Wk9', 'maintenance',88000,'2026-05-07'),('fleet','All','last3months','Wk9', 'charging', 473600,'2026-05-07'),
('fleet','All','last3months','Wk10','revenue',  1490000,'2026-05-14'),('fleet','All','last3months','Wk10','target',  1300000,'2026-05-14'),
('fleet','All','last3months','Wk10','expenses',  581100,'2026-05-14'),('fleet','All','last3months','Wk10','maintenance',92000,'2026-05-14'),('fleet','All','last3months','Wk10','charging', 489100,'2026-05-14'),
('fleet','All','last3months','Wk11','revenue',  1460000,'2026-05-21'),('fleet','All','last3months','Wk11','target',  1280000,'2026-05-21'),
('fleet','All','last3months','Wk11','expenses',  569400,'2026-05-21'),('fleet','All','last3months','Wk11','maintenance',89000,'2026-05-21'),('fleet','All','last3months','Wk11','charging', 480400,'2026-05-21'),
('fleet','All','last3months','Wk12','revenue',  1100000,'2026-06-07'),('fleet','All','last3months','Wk12','target',  1200000,'2026-06-07'),
('fleet','All','last3months','Wk12','expenses',  429000,'2026-06-07'),('fleet','All','last3months','Wk12','maintenance',67000,'2026-06-07'),('fleet','All','last3months','Wk12','charging', 362000,'2026-06-07');

-- ═══════════════════════════════════════════════════════════════════
-- Hyundai — last3months (Wk1-Wk12) ~16% of fleet
-- ═══════════════════════════════════════════════════════════════════
INSERT INTO public.analytics_series
  (scope,scope_id,period_type,period_label,metric_type,value,recorded_date)
VALUES
('fleet','Hyundai','last3months','Wk1', 'revenue', 172800,'2026-03-07'),('fleet','Hyundai','last3months','Wk1', 'expenses', 67392,'2026-03-07'),('fleet','Hyundai','last3months','Wk1', 'maintenance', 9920,'2026-03-07'),('fleet','Hyundai','last3months','Wk1', 'charging', 57472,'2026-03-07'),
('fleet','Hyundai','last3months','Wk2', 'revenue', 182400,'2026-03-14'),('fleet','Hyundai','last3months','Wk2', 'expenses', 71136,'2026-03-14'),('fleet','Hyundai','last3months','Wk2', 'maintenance',10400,'2026-03-14'),('fleet','Hyundai','last3months','Wk2', 'charging', 60736,'2026-03-14'),
('fleet','Hyundai','last3months','Wk3', 'revenue', 177600,'2026-03-21'),('fleet','Hyundai','last3months','Wk3', 'expenses', 69264,'2026-03-21'),('fleet','Hyundai','last3months','Wk3', 'maintenance',10080,'2026-03-21'),('fleet','Hyundai','last3months','Wk3', 'charging', 59184,'2026-03-21'),
('fleet','Hyundai','last3months','Wk4', 'revenue', 192000,'2026-03-28'),('fleet','Hyundai','last3months','Wk4', 'expenses', 74880,'2026-03-28'),('fleet','Hyundai','last3months','Wk4', 'maintenance',11520,'2026-03-28'),('fleet','Hyundai','last3months','Wk4', 'charging', 63360,'2026-03-28'),
('fleet','Hyundai','last3months','Wk5', 'revenue', 201600,'2026-04-07'),('fleet','Hyundai','last3months','Wk5', 'expenses', 78624,'2026-04-07'),('fleet','Hyundai','last3months','Wk5', 'maintenance',11840,'2026-04-07'),('fleet','Hyundai','last3months','Wk5', 'charging', 66784,'2026-04-07'),
('fleet','Hyundai','last3months','Wk6', 'revenue', 209600,'2026-04-14'),('fleet','Hyundai','last3months','Wk6', 'expenses', 81744,'2026-04-14'),('fleet','Hyundai','last3months','Wk6', 'maintenance',12480,'2026-04-14'),('fleet','Hyundai','last3months','Wk6', 'charging', 69264,'2026-04-14'),
('fleet','Hyundai','last3months','Wk7', 'revenue', 204800,'2026-04-21'),('fleet','Hyundai','last3months','Wk7', 'expenses', 79872,'2026-04-21'),('fleet','Hyundai','last3months','Wk7', 'maintenance',12000,'2026-04-21'),('fleet','Hyundai','last3months','Wk7', 'charging', 67872,'2026-04-21'),
('fleet','Hyundai','last3months','Wk8', 'revenue', 220800,'2026-04-28'),('fleet','Hyundai','last3months','Wk8', 'expenses', 86112,'2026-04-28'),('fleet','Hyundai','last3months','Wk8', 'maintenance',13440,'2026-04-28'),('fleet','Hyundai','last3months','Wk8', 'charging', 72672,'2026-04-28'),
('fleet','Hyundai','last3months','Wk9', 'revenue', 230400,'2026-05-07'),('fleet','Hyundai','last3months','Wk9', 'expenses', 89856,'2026-05-07'),('fleet','Hyundai','last3months','Wk9', 'maintenance',14080,'2026-05-07'),('fleet','Hyundai','last3months','Wk9', 'charging', 75776,'2026-05-07'),
('fleet','Hyundai','last3months','Wk10','revenue', 238400,'2026-05-14'),('fleet','Hyundai','last3months','Wk10','expenses', 92976,'2026-05-14'),('fleet','Hyundai','last3months','Wk10','maintenance',14720,'2026-05-14'),('fleet','Hyundai','last3months','Wk10','charging', 78256,'2026-05-14'),
('fleet','Hyundai','last3months','Wk11','revenue', 233600,'2026-05-21'),('fleet','Hyundai','last3months','Wk11','expenses', 91104,'2026-05-21'),('fleet','Hyundai','last3months','Wk11','maintenance',14240,'2026-05-21'),('fleet','Hyundai','last3months','Wk11','charging', 76864,'2026-05-21'),
('fleet','Hyundai','last3months','Wk12','revenue', 176000,'2026-06-07'),('fleet','Hyundai','last3months','Wk12','expenses', 68640,'2026-06-07'),('fleet','Hyundai','last3months','Wk12','maintenance',10720,'2026-06-07'),('fleet','Hyundai','last3months','Wk12','charging', 57920,'2026-06-07');

-- ═══════════════════════════════════════════════════════════════════
-- Kia — last3months (~16%)
-- ═══════════════════════════════════════════════════════════════════
INSERT INTO public.analytics_series
  (scope,scope_id,period_type,period_label,metric_type,value,recorded_date)
VALUES
('fleet','Kia','last3months','Wk1', 'revenue', 172800,'2026-03-07'),('fleet','Kia','last3months','Wk1', 'expenses', 67392,'2026-03-07'),('fleet','Kia','last3months','Wk1', 'maintenance',10240,'2026-03-07'),('fleet','Kia','last3months','Wk1', 'charging', 57152,'2026-03-07'),
('fleet','Kia','last3months','Wk2', 'revenue', 182400,'2026-03-14'),('fleet','Kia','last3months','Wk2', 'expenses', 71136,'2026-03-14'),('fleet','Kia','last3months','Wk2', 'maintenance',10720,'2026-03-14'),('fleet','Kia','last3months','Wk2', 'charging', 60416,'2026-03-14'),
('fleet','Kia','last3months','Wk3', 'revenue', 177600,'2026-03-21'),('fleet','Kia','last3months','Wk3', 'expenses', 69264,'2026-03-21'),('fleet','Kia','last3months','Wk3', 'maintenance',10400,'2026-03-21'),('fleet','Kia','last3months','Wk3', 'charging', 58864,'2026-03-21'),
('fleet','Kia','last3months','Wk4', 'revenue', 192000,'2026-03-28'),('fleet','Kia','last3months','Wk4', 'expenses', 74880,'2026-03-28'),('fleet','Kia','last3months','Wk4', 'maintenance',11840,'2026-03-28'),('fleet','Kia','last3months','Wk4', 'charging', 63040,'2026-03-28'),
('fleet','Kia','last3months','Wk5', 'revenue', 201600,'2026-04-07'),('fleet','Kia','last3months','Wk5', 'expenses', 78624,'2026-04-07'),('fleet','Kia','last3months','Wk5', 'maintenance',12160,'2026-04-07'),('fleet','Kia','last3months','Wk5', 'charging', 66464,'2026-04-07'),
('fleet','Kia','last3months','Wk6', 'revenue', 209600,'2026-04-14'),('fleet','Kia','last3months','Wk6', 'expenses', 81744,'2026-04-14'),('fleet','Kia','last3months','Wk6', 'maintenance',12800,'2026-04-14'),('fleet','Kia','last3months','Wk6', 'charging', 68944,'2026-04-14'),
('fleet','Kia','last3months','Wk7', 'revenue', 204800,'2026-04-21'),('fleet','Kia','last3months','Wk7', 'expenses', 79872,'2026-04-21'),('fleet','Kia','last3months','Wk7', 'maintenance',12320,'2026-04-21'),('fleet','Kia','last3months','Wk7', 'charging', 67552,'2026-04-21'),
('fleet','Kia','last3months','Wk8', 'revenue', 220800,'2026-04-28'),('fleet','Kia','last3months','Wk8', 'expenses', 86112,'2026-04-28'),('fleet','Kia','last3months','Wk8', 'maintenance',13760,'2026-04-28'),('fleet','Kia','last3months','Wk8', 'charging', 72352,'2026-04-28'),
('fleet','Kia','last3months','Wk9', 'revenue', 230400,'2026-05-07'),('fleet','Kia','last3months','Wk9', 'expenses', 89856,'2026-05-07'),('fleet','Kia','last3months','Wk9', 'maintenance',14400,'2026-05-07'),('fleet','Kia','last3months','Wk9', 'charging', 75456,'2026-05-07'),
('fleet','Kia','last3months','Wk10','revenue', 238400,'2026-05-14'),('fleet','Kia','last3months','Wk10','expenses', 92976,'2026-05-14'),('fleet','Kia','last3months','Wk10','maintenance',15040,'2026-05-14'),('fleet','Kia','last3months','Wk10','charging', 77936,'2026-05-14'),
('fleet','Kia','last3months','Wk11','revenue', 233600,'2026-05-21'),('fleet','Kia','last3months','Wk11','expenses', 91104,'2026-05-21'),('fleet','Kia','last3months','Wk11','maintenance',14560,'2026-05-21'),('fleet','Kia','last3months','Wk11','charging', 76544,'2026-05-21'),
('fleet','Kia','last3months','Wk12','revenue', 176000,'2026-06-07'),('fleet','Kia','last3months','Wk12','expenses', 68640,'2026-06-07'),('fleet','Kia','last3months','Wk12','maintenance',11040,'2026-06-07'),('fleet','Kia','last3months','Wk12','charging', 57600,'2026-06-07');

-- ═══════════════════════════════════════════════════════════════════
-- MG Motor — last3months (~16%)
-- ═══════════════════════════════════════════════════════════════════
INSERT INTO public.analytics_series
  (scope,scope_id,period_type,period_label,metric_type,value,recorded_date)
VALUES
('fleet','MG Motor','last3months','Wk1', 'revenue', 172800,'2026-03-07'),('fleet','MG Motor','last3months','Wk1', 'expenses', 67392,'2026-03-07'),('fleet','MG Motor','last3months','Wk1', 'maintenance', 8640,'2026-03-07'),('fleet','MG Motor','last3months','Wk1', 'charging', 58752,'2026-03-07'),
('fleet','MG Motor','last3months','Wk2', 'revenue', 182400,'2026-03-14'),('fleet','MG Motor','last3months','Wk2', 'expenses', 71136,'2026-03-14'),('fleet','MG Motor','last3months','Wk2', 'maintenance', 9120,'2026-03-14'),('fleet','MG Motor','last3months','Wk2', 'charging', 62016,'2026-03-14'),
('fleet','MG Motor','last3months','Wk3', 'revenue', 177600,'2026-03-21'),('fleet','MG Motor','last3months','Wk3', 'expenses', 69264,'2026-03-21'),('fleet','MG Motor','last3months','Wk3', 'maintenance', 8880,'2026-03-21'),('fleet','MG Motor','last3months','Wk3', 'charging', 60384,'2026-03-21'),
('fleet','MG Motor','last3months','Wk4', 'revenue', 192000,'2026-03-28'),('fleet','MG Motor','last3months','Wk4', 'expenses', 74880,'2026-03-28'),('fleet','MG Motor','last3months','Wk4', 'maintenance', 9600,'2026-03-28'),('fleet','MG Motor','last3months','Wk4', 'charging', 65280,'2026-03-28'),
('fleet','MG Motor','last3months','Wk5', 'revenue', 201600,'2026-04-07'),('fleet','MG Motor','last3months','Wk5', 'expenses', 78624,'2026-04-07'),('fleet','MG Motor','last3months','Wk5', 'maintenance',10080,'2026-04-07'),('fleet','MG Motor','last3months','Wk5', 'charging', 68544,'2026-04-07'),
('fleet','MG Motor','last3months','Wk6', 'revenue', 209600,'2026-04-14'),('fleet','MG Motor','last3months','Wk6', 'expenses', 81744,'2026-04-14'),('fleet','MG Motor','last3months','Wk6', 'maintenance',10560,'2026-04-14'),('fleet','MG Motor','last3months','Wk6', 'charging', 71184,'2026-04-14'),
('fleet','MG Motor','last3months','Wk7', 'revenue', 204800,'2026-04-21'),('fleet','MG Motor','last3months','Wk7', 'expenses', 79872,'2026-04-21'),('fleet','MG Motor','last3months','Wk7', 'maintenance',10240,'2026-04-21'),('fleet','MG Motor','last3months','Wk7', 'charging', 69632,'2026-04-21'),
('fleet','MG Motor','last3months','Wk8', 'revenue', 220800,'2026-04-28'),('fleet','MG Motor','last3months','Wk8', 'expenses', 86112,'2026-04-28'),('fleet','MG Motor','last3months','Wk8', 'maintenance',11200,'2026-04-28'),('fleet','MG Motor','last3months','Wk8', 'charging', 74912,'2026-04-28'),
('fleet','MG Motor','last3months','Wk9', 'revenue', 230400,'2026-05-07'),('fleet','MG Motor','last3months','Wk9', 'expenses', 89856,'2026-05-07'),('fleet','MG Motor','last3months','Wk9', 'maintenance',11520,'2026-05-07'),('fleet','MG Motor','last3months','Wk9', 'charging', 78336,'2026-05-07'),
('fleet','MG Motor','last3months','Wk10','revenue', 238400,'2026-05-14'),('fleet','MG Motor','last3months','Wk10','expenses', 92976,'2026-05-14'),('fleet','MG Motor','last3months','Wk10','maintenance',12000,'2026-05-14'),('fleet','MG Motor','last3months','Wk10','charging', 80976,'2026-05-14'),
('fleet','MG Motor','last3months','Wk11','revenue', 233600,'2026-05-21'),('fleet','MG Motor','last3months','Wk11','expenses', 91104,'2026-05-21'),('fleet','MG Motor','last3months','Wk11','maintenance',11680,'2026-05-21'),('fleet','MG Motor','last3months','Wk11','charging', 79424,'2026-05-21'),
('fleet','MG Motor','last3months','Wk12','revenue', 176000,'2026-06-07'),('fleet','MG Motor','last3months','Wk12','expenses', 68640,'2026-06-07'),('fleet','MG Motor','last3months','Wk12','maintenance', 8800,'2026-06-07'),('fleet','MG Motor','last3months','Wk12','charging', 59840,'2026-06-07');

-- ═══════════════════════════════════════════════════════════════════
-- Mahindra — last3months (~16%)
-- ═══════════════════════════════════════════════════════════════════
INSERT INTO public.analytics_series
  (scope,scope_id,period_type,period_label,metric_type,value,recorded_date)
VALUES
('fleet','Mahindra','last3months','Wk1', 'revenue', 172800,'2026-03-07'),('fleet','Mahindra','last3months','Wk1', 'expenses', 67392,'2026-03-07'),('fleet','Mahindra','last3months','Wk1', 'maintenance',14080,'2026-03-07'),('fleet','Mahindra','last3months','Wk1', 'charging', 53312,'2026-03-07'),
('fleet','Mahindra','last3months','Wk2', 'revenue', 182400,'2026-03-14'),('fleet','Mahindra','last3months','Wk2', 'expenses', 71136,'2026-03-14'),('fleet','Mahindra','last3months','Wk2', 'maintenance',14880,'2026-03-14'),('fleet','Mahindra','last3months','Wk2', 'charging', 56256,'2026-03-14'),
('fleet','Mahindra','last3months','Wk3', 'revenue', 177600,'2026-03-21'),('fleet','Mahindra','last3months','Wk3', 'expenses', 69264,'2026-03-21'),('fleet','Mahindra','last3months','Wk3', 'maintenance',14400,'2026-03-21'),('fleet','Mahindra','last3months','Wk3', 'charging', 54864,'2026-03-21'),
('fleet','Mahindra','last3months','Wk4', 'revenue', 192000,'2026-03-28'),('fleet','Mahindra','last3months','Wk4', 'expenses', 74880,'2026-03-28'),('fleet','Mahindra','last3months','Wk4', 'maintenance',16000,'2026-03-28'),('fleet','Mahindra','last3months','Wk4', 'charging', 58880,'2026-03-28'),
('fleet','Mahindra','last3months','Wk5', 'revenue', 201600,'2026-04-07'),('fleet','Mahindra','last3months','Wk5', 'expenses', 78624,'2026-04-07'),('fleet','Mahindra','last3months','Wk5', 'maintenance',16640,'2026-04-07'),('fleet','Mahindra','last3months','Wk5', 'charging', 61984,'2026-04-07'),
('fleet','Mahindra','last3months','Wk6', 'revenue', 209600,'2026-04-14'),('fleet','Mahindra','last3months','Wk6', 'expenses', 81744,'2026-04-14'),('fleet','Mahindra','last3months','Wk6', 'maintenance',17280,'2026-04-14'),('fleet','Mahindra','last3months','Wk6', 'charging', 64464,'2026-04-14'),
('fleet','Mahindra','last3months','Wk7', 'revenue', 204800,'2026-04-21'),('fleet','Mahindra','last3months','Wk7', 'expenses', 79872,'2026-04-21'),('fleet','Mahindra','last3months','Wk7', 'maintenance',16800,'2026-04-21'),('fleet','Mahindra','last3months','Wk7', 'charging', 63072,'2026-04-21'),
('fleet','Mahindra','last3months','Wk8', 'revenue', 220800,'2026-04-28'),('fleet','Mahindra','last3months','Wk8', 'expenses', 86112,'2026-04-28'),('fleet','Mahindra','last3months','Wk8', 'maintenance',18560,'2026-04-28'),('fleet','Mahindra','last3months','Wk8', 'charging', 67552,'2026-04-28'),
('fleet','Mahindra','last3months','Wk9', 'revenue', 230400,'2026-05-07'),('fleet','Mahindra','last3months','Wk9', 'expenses', 89856,'2026-05-07'),('fleet','Mahindra','last3months','Wk9', 'maintenance',19200,'2026-05-07'),('fleet','Mahindra','last3months','Wk9', 'charging', 70656,'2026-05-07'),
('fleet','Mahindra','last3months','Wk10','revenue', 238400,'2026-05-14'),('fleet','Mahindra','last3months','Wk10','expenses', 92976,'2026-05-14'),('fleet','Mahindra','last3months','Wk10','maintenance',20000,'2026-05-14'),('fleet','Mahindra','last3months','Wk10','charging', 72976,'2026-05-14'),
('fleet','Mahindra','last3months','Wk11','revenue', 233600,'2026-05-21'),('fleet','Mahindra','last3months','Wk11','expenses', 91104,'2026-05-21'),('fleet','Mahindra','last3months','Wk11','maintenance',19520,'2026-05-21'),('fleet','Mahindra','last3months','Wk11','charging', 71584,'2026-05-21'),
('fleet','Mahindra','last3months','Wk12','revenue', 176000,'2026-06-07'),('fleet','Mahindra','last3months','Wk12','expenses', 68640,'2026-06-07'),('fleet','Mahindra','last3months','Wk12','maintenance',14720,'2026-06-07'),('fleet','Mahindra','last3months','Wk12','charging', 53920,'2026-06-07');

-- ═══════════════════════════════════════════════════════════════════
-- Tata — last3months (~36%)
-- ═══════════════════════════════════════════════════════════════════
INSERT INTO public.analytics_series
  (scope,scope_id,period_type,period_label,metric_type,value,recorded_date)
VALUES
('fleet','Tata','last3months','Wk1', 'revenue', 388800,'2026-03-07'),('fleet','Tata','last3months','Wk1', 'expenses', 151632,'2026-03-07'),('fleet','Tata','last3months','Wk1', 'maintenance',18720,'2026-03-07'),('fleet','Tata','last3months','Wk1', 'charging', 132912,'2026-03-07'),
('fleet','Tata','last3months','Wk2', 'revenue', 410400,'2026-03-14'),('fleet','Tata','last3months','Wk2', 'expenses', 160056,'2026-03-14'),('fleet','Tata','last3months','Wk2', 'maintenance',19760,'2026-03-14'),('fleet','Tata','last3months','Wk2', 'charging', 140296,'2026-03-14'),
('fleet','Tata','last3months','Wk3', 'revenue', 399600,'2026-03-21'),('fleet','Tata','last3months','Wk3', 'expenses', 155844,'2026-03-21'),('fleet','Tata','last3months','Wk3', 'maintenance',19240,'2026-03-21'),('fleet','Tata','last3months','Wk3', 'charging', 136604,'2026-03-21'),
('fleet','Tata','last3months','Wk4', 'revenue', 432000,'2026-03-28'),('fleet','Tata','last3months','Wk4', 'expenses', 168480,'2026-03-28'),('fleet','Tata','last3months','Wk4', 'maintenance',21360,'2026-03-28'),('fleet','Tata','last3months','Wk4', 'charging', 147120,'2026-03-28'),
('fleet','Tata','last3months','Wk5', 'revenue', 453600,'2026-04-07'),('fleet','Tata','last3months','Wk5', 'expenses', 176904,'2026-04-07'),('fleet','Tata','last3months','Wk5', 'maintenance',22320,'2026-04-07'),('fleet','Tata','last3months','Wk5', 'charging', 154584,'2026-04-07'),
('fleet','Tata','last3months','Wk6', 'revenue', 471600,'2026-04-14'),('fleet','Tata','last3months','Wk6', 'expenses', 183924,'2026-04-14'),('fleet','Tata','last3months','Wk6', 'maintenance',23280,'2026-04-14'),('fleet','Tata','last3months','Wk6', 'charging', 160644,'2026-04-14'),
('fleet','Tata','last3months','Wk7', 'revenue', 460800,'2026-04-21'),('fleet','Tata','last3months','Wk7', 'expenses', 179712,'2026-04-21'),('fleet','Tata','last3months','Wk7', 'maintenance',22560,'2026-04-21'),('fleet','Tata','last3months','Wk7', 'charging', 157152,'2026-04-21'),
('fleet','Tata','last3months','Wk8', 'revenue', 496800,'2026-04-28'),('fleet','Tata','last3months','Wk8', 'expenses', 193752,'2026-04-28'),('fleet','Tata','last3months','Wk8', 'maintenance',24720,'2026-04-28'),('fleet','Tata','last3months','Wk8', 'charging', 169032,'2026-04-28'),
('fleet','Tata','last3months','Wk9', 'revenue', 518400,'2026-05-07'),('fleet','Tata','last3months','Wk9', 'expenses', 202176,'2026-05-07'),('fleet','Tata','last3months','Wk9', 'maintenance',25680,'2026-05-07'),('fleet','Tata','last3months','Wk9', 'charging', 176496,'2026-05-07'),
('fleet','Tata','last3months','Wk10','revenue', 536400,'2026-05-14'),('fleet','Tata','last3months','Wk10','expenses', 209196,'2026-05-14'),('fleet','Tata','last3months','Wk10','maintenance',26640,'2026-05-14'),('fleet','Tata','last3months','Wk10','charging', 182556,'2026-05-14'),
('fleet','Tata','last3months','Wk11','revenue', 525600,'2026-05-21'),('fleet','Tata','last3months','Wk11','expenses', 204984,'2026-05-21'),('fleet','Tata','last3months','Wk11','maintenance',26000,'2026-05-21'),('fleet','Tata','last3months','Wk11','charging', 178984,'2026-05-21'),
('fleet','Tata','last3months','Wk12','revenue', 396000,'2026-06-07'),('fleet','Tata','last3months','Wk12','expenses', 154440,'2026-06-07'),('fleet','Tata','last3months','Wk12','maintenance',19560,'2026-06-07'),('fleet','Tata','last3months','Wk12','charging', 134880,'2026-06-07');

-- ═══════════════════════════════════════════════════════════════════
-- Also patch yearly maintenance + charging for all brands
-- (previously only revenue + expenses were seeded for yearly)
-- ═══════════════════════════════════════════════════════════════════
INSERT INTO public.analytics_series
  (scope,scope_id,period_type,period_label,metric_type,value,recorded_date)
VALUES
-- Hyundai yearly maintenance + charging
('fleet','Hyundai','yearly','2023','maintenance', 620000,'2023-12-31'),('fleet','Hyundai','yearly','2023','charging',1782400,'2023-12-31'),
('fleet','Hyundai','yearly','2024','maintenance', 752000,'2024-12-31'),('fleet','Hyundai','yearly','2024','charging',2168320,'2024-12-31'),
('fleet','Hyundai','yearly','2025','maintenance', 919000,'2025-12-31'),('fleet','Hyundai','yearly','2025','charging',2650280,'2025-12-31'),
('fleet','Hyundai','yearly','2026','maintenance', 450000,'2026-06-10'),('fleet','Hyundai','yearly','2026','charging',1297200,'2026-06-10'),
-- Kia
('fleet','Kia','yearly','2023','maintenance', 720000,'2023-12-31'),('fleet','Kia','yearly','2023','charging',1682400,'2023-12-31'),
('fleet','Kia','yearly','2024','maintenance', 874000,'2024-12-31'),('fleet','Kia','yearly','2024','charging',2046320,'2024-12-31'),
('fleet','Kia','yearly','2025','maintenance',1068000,'2025-12-31'),('fleet','Kia','yearly','2025','charging',2501280,'2025-12-31'),
('fleet','Kia','yearly','2026','maintenance', 524000,'2026-06-10'),('fleet','Kia','yearly','2026','charging',1223200,'2026-06-10'),
-- MG Motor
('fleet','MG Motor','yearly','2023','maintenance', 560000,'2023-12-31'),('fleet','MG Motor','yearly','2023','charging',1842400,'2023-12-31'),
('fleet','MG Motor','yearly','2024','maintenance', 680000,'2024-12-31'),('fleet','MG Motor','yearly','2024','charging',2240320,'2024-12-31'),
('fleet','MG Motor','yearly','2025','maintenance', 831000,'2025-12-31'),('fleet','MG Motor','yearly','2025','charging',2738280,'2025-12-31'),
('fleet','MG Motor','yearly','2026','maintenance', 407000,'2026-06-10'),('fleet','MG Motor','yearly','2026','charging',1340200,'2026-06-10'),
-- Mahindra
('fleet','Mahindra','yearly','2023','maintenance', 810000,'2023-12-31'),('fleet','Mahindra','yearly','2023','charging',1592400,'2023-12-31'),
('fleet','Mahindra','yearly','2024','maintenance', 984000,'2024-12-31'),('fleet','Mahindra','yearly','2024','charging',1936320,'2024-12-31'),
('fleet','Mahindra','yearly','2025','maintenance',1203000,'2025-12-31'),('fleet','Mahindra','yearly','2025','charging',2366280,'2025-12-31'),
('fleet','Mahindra','yearly','2026','maintenance', 590000,'2026-06-10'),('fleet','Mahindra','yearly','2026','charging',1157200,'2026-06-10'),
-- Tata
('fleet','Tata','yearly','2023','maintenance', 720000,'2023-12-31'),('fleet','Tata','yearly','2023','charging',4685400,'2023-12-31'),
('fleet','Tata','yearly','2024','maintenance', 874000,'2024-12-31'),('fleet','Tata','yearly','2024','charging',5696320,'2024-12-31'),
('fleet','Tata','yearly','2025','maintenance',1068000,'2025-12-31'),('fleet','Tata','yearly','2025','charging',6962880,'2025-12-31'),
('fleet','Tata','yearly','2026','maintenance', 524000,'2026-06-10'),('fleet','Tata','yearly','2026','charging',3407200,'2026-06-10');
