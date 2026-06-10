-- ============================================================
-- Run this FIRST to find your driver ID and vehicle ID.
-- Copy the id value, then update driver_dashboard_seed.sql
-- ============================================================

-- Shows all drivers with their profile linkage
SELECT
  d.id            AS driver_id,
  d.name,
  d.vehicle_id,
  d.profile_id,
  p.role,
  p.full_name,
  d.created_at
FROM public.drivers d
LEFT JOIN public.profiles p ON p.id = d.profile_id
ORDER BY d.created_at DESC;
