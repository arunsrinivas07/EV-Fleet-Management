import { supabase } from './supabase';

// ── helper ───────────────────────────────────────────────────────────────────
function log(fn, err) {
  console.warn(`[db.${fn}] falling back to mock data:`, err?.message ?? err);
}

// ── VEHICLES ─────────────────────────────────────────────────────────────────

export async function fetchVehicles() {
  try {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .order('id');
    if (error) throw error;
    // Map snake_case DB columns → camelCase used in the UI
    return data.map(mapVehicle);
  } catch (e) {
    log('fetchVehicles', e);
    return [];
  }
}

export async function updateVehicle(id, patch) {
  try {
    const { data, error } = await supabase
      .from('vehicles')
      .update({
        battery_percent: patch.batteryPercent,
        battery_health: patch.batteryHealth,
        speed: patch.speed,
        status: patch.status,
        location: patch.location,
        lat: patch.lat,
        lng: patch.lng,
        range_km: patch.range,
        revenue: patch.revenue,
        is_charging: patch.isCharging,
      })
      .eq('id', id)
      .select();
    if (error) throw error;
    return data && data.length > 0;
  } catch (e) { log('updateVehicle', e); return false; }
}

export async function addVehicle(v) {
  try {
    const { data, error } = await supabase
      .from('vehicles')
      .insert({
        id: v.id,
        model: v.model,
        manufacturer: v.manufacturer,
        image_url: v.imageUrl || 'https://images.unsplash.com/photo-1593941707882-a56bab827c5e?w=400&h=250&fit=crop',
        battery_capacity: v.batteryCapacity || '75 kWh',
        status: v.status || 'idle',
        battery_percent: v.batteryPercent ?? 100,
        battery_health: v.batteryHealth ?? 100,
        speed: v.speed ?? 0,
        location: v.location || 'Fleet Depot',
        lat: v.lat ?? 41.8781,
        lng: v.lng ?? -87.6298,
        range_km: v.range ?? 450,
        revenue: v.revenue ?? 0,
        total_distance: v.totalDistance ?? 0,
        is_charging: v.isCharging ?? false,
      })
      .select();
    if (error) throw error;
    return { success: true, data };
  } catch (e) {
    console.error('addVehicle', e);
    return { success: false, error: e.message };
  }
}


function mapVehicle(v) {
  return {
    id: v.id,
    model: v.model,
    manufacturer: v.manufacturer,
    image: v.image_url || 'https://images.unsplash.com/photo-1593941707882-a56bab827c5e?w=400&h=250&fit=crop',
    batteryCapacity: v.battery_capacity,
    status: v.status,
    batteryPercent: parseFloat(v.battery_percent),
    batteryHealth: parseFloat(v.battery_health),
    speed: parseFloat(v.speed),
    location: v.location,
    lat: parseFloat(v.lat),
    lng: parseFloat(v.lng),
    range: parseFloat(v.range_km),
    revenue: parseFloat(v.revenue),
    totalDistance: parseFloat(v.total_distance),
    isCharging: v.is_charging,
    driver: '',        // joined separately
    driverId: '',
    serviceHistory: [],        // fetched separately
    maintenanceRecords: [],
  };
}

// ── DRIVERS ───────────────────────────────────────────────────────────────────

export async function fetchDrivers() {
  try {
    const { data, error } = await supabase
      .from('drivers')
      .select('*')
      .order('id');
    if (error) throw error;
    return data.map(mapDriver);
  } catch (e) {
    log('fetchDrivers', e);
    return [];
  }
}

export async function fetchVehiclesWithDrivers() {
  try {
    const [vehicles, drivers] = await Promise.all([fetchVehicles(), fetchDrivers()]);
    return vehicles.map(v => {
      const driver = drivers.find(d => d.vehicle === v.id);
      // A vehicle with no driver cannot be 'running' — force to 'idle'
      const status = (!driver && v.status === 'running') ? 'idle' : v.status;
      return { ...v, status, driver: driver?.name || '', driverId: driver?.id || '' };
    });
  } catch (e) {
    log('fetchVehiclesWithDrivers', e);
    return [];
  }
}

function mapDriver(d) {
  return {
    id: d.id,
    profileId: d.profile_id || null,
    name: d.name,
    vehicle: d.vehicle_id || '',
    vehicleModel: '',         // join from vehicles if needed
    avatar: d.avatar || d.name?.split(' ').map(w => w[0]).join('').toUpperCase() || 'XX',
    trips: d.trips,
    overspeed: d.overspeed,
    hardBraking: d.hard_braking,
    aggressiveAccel: d.aggressive_accel,
    safetyScore: parseFloat(d.safety_score),
    efficiencyScore: parseFloat(d.efficiency_score),
    todayEarnings: parseFloat(d.today_earnings),
    totalEarnings: parseFloat(d.total_earnings),
    avgSpeed: parseFloat(d.avg_speed),
    energyConsumed: parseFloat(d.energy_consumed),
    email: d.email || `${d.name.toLowerCase().replace(/\s+/g, '')}@evfleet.in`,
    joined: d.created_at ? new Date(d.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'Jun 2026',
  };
}

// ── VEHICLE DETAILS ───────────────────────────────────────────────────────────

export async function fetchVehicleDetails(vehicleId) {
  try {
    const [{ data: svc }, { data: mnt }] = await Promise.all([
      supabase.from('vehicle_service_history').select('description,service_date').eq('vehicle_id', vehicleId).order('service_date', { ascending: false }),
      supabase.from('vehicle_maintenance_records').select('description,status').eq('vehicle_id', vehicleId).order('created_at', { ascending: false }),
    ]);
    return {
      serviceHistory: (svc || []).map(r => `${r.description} - ${new Date(r.service_date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}`),
      maintenanceRecords: (mnt || []).map(r => `${r.description}${r.status !== 'pending' ? ` (${r.status})` : ''}`),
    };
  } catch (e) {
    log('fetchVehicleDetails', e);
    return { serviceHistory: [], maintenanceRecords: [] };
  }
}

// ── EXPENSES ────────────────────────────────────────────────────────────────

export async function fetchVehicleExpenses(vehicleId) {
  try {
    const { data, error } = await supabase
      .from('vehicle_expenses')
      .select('*')
      .eq('vehicle_id', vehicleId)
      .order('expense_date', { ascending: false });
    if (error) throw error;

    const history = data.map(r => ({
      date: new Date(r.expense_date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
      type: r.type,
      amount: parseFloat(r.amount),
      note: r.note || '',
      rawDate: r.expense_date,
    }));

    const sum = (type) => data.filter(r => r.type === type).reduce((s, r) => s + parseFloat(r.amount), 0);
    return {
      total: data.reduce((s, r) => s + parseFloat(r.amount), 0),
      charging: sum('Charging'),
      maintenance: sum('Maintenance'),
      insurance: sum('Insurance'),
      misc: sum('Misc'),
      history,
    };
  } catch (e) {
    log('fetchVehicleExpenses', e);
    return { total: 0, charging: 0, maintenance: 0, insurance: 0, misc: 0, history: [] };
  }
}

// ── ALERTS ────────────────────────────────────────────────────────────────────

export async function fetchAlerts() {
  try {
    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .eq('resolved', false)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data.map(a => ({
      id: a.id,
      type: a.type,
      title: a.title,
      message: a.message,
      vehicle: a.vehicle_id,
      severity: a.severity,
      time: timeAgo(a.created_at),
    }));
  } catch (e) {
    log('fetchAlerts', e);
    return [];
  }
}

export async function resolveAlert(id) {
  try {
    const { data, error } = await supabase
      .from('alerts')
      .update({ resolved: true, resolved_at: new Date().toISOString() })
      .eq('id', id)
      .select();
    if (error) throw error;
    return data && data.length > 0;
  } catch (e) { log('resolveAlert', e); return false; }
}

// ── TRIPS ─────────────────────────────────────────────────────────────────────

export async function fetchTrips(driverId = null) {
  try {
    let q = supabase.from('trips').select('*').order('trip_date', { ascending: false });
    if (driverId) q = q.eq('driver_id', driverId);
    const { data, error } = await q;
    if (error) throw error;
    return data.map(t => ({
      id: t.id,
      date: t.trip_date,
      from: t.from_location,
      to: t.to_location,
      distance: parseFloat(t.distance_km),
      duration: `${t.duration_min} min`,
      earnings: parseFloat(t.earnings),
      energyUsed: parseFloat(t.energy_kwh),
    }));
  } catch (e) {
    log('fetchTrips', e);
    return [];
  }
}

// ── REVENUE SNAPSHOTS ─────────────────────────────────────────────────────────

export async function fetchRevenue(periodType = 'weekly') {
  try {
    const { data, error } = await supabase
      .from('revenue_snapshots')
      .select('period_label,revenue,target')
      .eq('period_type', periodType)
      .order('snapshot_date');
    if (error) throw error;
    return data.map(r => ({ label: r.period_label, revenue: parseFloat(r.revenue), target: parseFloat(r.target) }));
  } catch (e) {
    log('fetchRevenue', e);
    return [];
  }
}

// ── CHARGING STATIONS ─────────────────────────────────────────────────────────

export async function fetchChargingStations() {
  try {
    const { data, error } = await supabase.from('charging_stations').select('*');
    if (error) throw error;
    return data.map(s => ({
      id: s.id,
      name: s.name,
      location: s.location,
      lat: parseFloat(s.lat),
      lng: parseFloat(s.lng),
      available: s.available,
      total: s.total,
      power: s.power,
      distance: null,
    }));
  } catch (e) {
    log('fetchChargingStations', e);
    return [];
  }
}

// ── ASSIGN VEHICLE ─────────────────────────────────────────────────────────────

export async function assignVehicleToDriver(driverId, vehicleId) {
  try {
    // 1. Get driver's current vehicle to release it
    const { data: driverData, error: fetchErr } = await supabase
      .from('drivers')
      .select('vehicle_id')
      .eq('id', driverId)
      .maybeSingle();

    if (fetchErr) throw fetchErr;

    const previousVehicleId = driverData?.vehicle_id;

    // 2. Assign vehicle to driver
    const { error: driverError, count } = await supabase
      .from('drivers')
      .update({ vehicle_id: vehicleId })
      .eq('id', driverId);

    if (driverError) throw driverError;
    // count = 0 means RLS blocked the update
    if (count === 0) throw new Error('No rows updated — check RLS policies (run trigger_and_rls_fix.sql).');

    // 3. Set new vehicle status to idle
    const { error: vehicleError } = await supabase
      .from('vehicles')
      .update({ status: 'idle' })
      .eq('id', vehicleId);

    if (vehicleError) throw vehicleError;

    // 4. Release previous vehicle back to idle
    if (previousVehicleId && previousVehicleId !== vehicleId) {
      await supabase
        .from('vehicles')
        .update({ status: 'idle' })
        .eq('id', previousVehicleId);
    }

    return { success: true };
  } catch (e) {
    log('assignVehicleToDriver', e);
    return { success: false, error: e?.message ?? String(e) };
  }
}

// ── REALTIME SUBSCRIPTION ────────────────────────────────────────────────────

/**
 * Subscribe to live vehicle updates.
 * callback receives the updated vehicle (camelCase).
 * Returns an unsubscribe function.
 */
export function subscribeToVehicles(callback) {
  const channel = supabase
    .channel('vehicles-realtime')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'vehicles' },
      (payload) => {
        if (payload.new) callback(mapVehicle(payload.new));
      }
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}

/**
 * Subscribe to new/resolved alerts.
 */
export function subscribeToAlerts(callback) {
  const channel = supabase
    .channel('alerts-realtime')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'alerts' },
      callback
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}

// ── UTIL ─────────────────────────────────────────────────────────────────────


// ── ANALYTICS SERIES ─────────────────────────────────────────────────────────

export async function fetchAnalyticsSeries(scope, scopeId = null, periodType = null) {
  try {
    let q = supabase
      .from('analytics_series')
      .select('period_type, period_label, metric_type, value, scope_id')
      .eq('scope', scope);

    if (scopeId !== 'all') {
      if (scopeId) {
        q = q.eq('scope_id', scopeId);
      } else {
        q = q.is('scope_id', null);
      }
    }

    if (periodType) {
      q = q.eq('period_type', periodType);
    }

    const { data, error } = await q;
    if (error) throw error;
    return data;
  } catch (e) {
    log('fetchAnalyticsSeries', e);
    return [];
  }
}

export async function fetchEvModels() {
  try {
    const { data, error } = await supabase
      .from('ev_models')
      .select('*')
      .order('id');
    if (error) throw error;
    return data;
  } catch (e) {
    log('fetchEvModels', e);
    return [];
  }
}

export async function fetchCities() {
  try {
    const { data, error } = await supabase
      .from('cities')
      .select('name')
      .order('name');
    if (error) throw error;
    return data.map(c => c.name);
  } catch (e) {
    log('fetchCities', e);
    return [];
  }
}

function timeAgo(isoString) {
  const diff = Math.floor((Date.now() - new Date(isoString)) / 1000);
  if (diff < 60) return `${diff} sec ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  return `${Math.floor(diff / 86400)} days ago`;
}

