import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { fetchAnalyticsSeries } from '../../lib/db';
import { Car, Activity, Wrench, Users, IndianRupee, Zap, Battery, BatteryCharging } from 'lucide-react';
import StatCard from '../../components/shared/StatCard';
import VehicleCard from '../../components/vehicles/VehicleCard';
import LiveMapSection from '../../components/map/LiveMapSection';
import MiniRevenueChart from '../../components/charts/MiniRevenueChart';
import DashboardFilters from '../../components/shared/DashboardFilters';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton';

// ── helpers ──────────────────────────────────────────────────────────────────

/** Return the vehicle-id dropdown options filtered by brand */
function vehicleOptions(brand, vehicleList) {
  const base = brand === 'All Brands'
    ? vehicleList
    : vehicleList.filter(v => v.manufacturer === brand);
  return ['All Vehicles', ...base.map(v => `${v.id} – ${v.model}`)];
}

/** Extract vehicle id from option string "EV-001 – Tesla Model 3" */
function parseVehicleId(opt) {
  if (opt === 'All Vehicles') return null;
  return opt.split(' – ')[0];
}

// ── component ────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const { stats, vehicleList, user, dataLoading, driverList } = useApp();
  const [revenueSeries, setRevenueSeries] = useState([]);
  const [growthSeries, setGrowthSeries] = useState([]);

  // Fetch series on mount
  React.useEffect(() => {
    Promise.all([
      fetchAnalyticsSeries('fleet', 'All'),
      fetchAnalyticsSeries('general', 'growth')
    ]).then(([rev, gro]) => {
      setRevenueSeries(rev);
      setGrowthSeries(gro);
    });
  }, []);

  // Filter state
  const [filters, setFilters] = useState({
    period:  'Weekly',
    brand:   'All Brands',
    vehicle: 'All Vehicles',
  });

  const allBrands = useMemo(() => {
    return ['All Brands', ...new Set(vehicleList.map(v => v.manufacturer))];
  }, [vehicleList]);

  // Derived vehicle options (brand-aware)
  const vehicleOpts = useMemo(() => vehicleOptions(filters.brand, vehicleList), [filters.brand, vehicleList]);

  // Filtered vehicle list for fleet cards + map
  const filteredVehicles = useMemo(() => {
    let list = vehicleList;
    if (filters.brand !== 'All Brands') {
      list = list.filter(v => v.manufacturer === filters.brand);
    }
    const vid = parseVehicleId(filters.vehicle);
    if (vid) list = list.filter(v => v.id === vid);
    return list;
  }, [vehicleList, filters.brand, filters.vehicle]);

  // Period-specific stats & chart data
  const periodKey    = filters.period === 'Last 3 Mo' ? 'last3months' : filters.period.toLowerCase();

  const periodStats = useMemo(() => {
    const periodPoints = growthSeries.filter(pt => pt.period_type === periodKey);
    const fleetRevenuePt = periodPoints.find(pt => pt.metric_type === 'fleetRevenue');
    const energyTodayPt = periodPoints.find(pt => pt.metric_type === 'energyToday');
    const revenueGrowthPt = periodPoints.find(pt => pt.metric_type === 'revenueGrowth');
    const energyGrowthPt = periodPoints.find(pt => pt.metric_type === 'energyGrowth');
    return {
      fleetRevenue: fleetRevenuePt ? parseFloat(fleetRevenuePt.value) : 0,
      energyToday: energyTodayPt ? parseFloat(energyTodayPt.value) : 0,
      revenueGrowth: revenueGrowthPt ? parseFloat(revenueGrowthPt.value) : 0,
      energyGrowth: energyGrowthPt ? parseFloat(energyGrowthPt.value) : 0,
    };
  }, [growthSeries, periodKey]);

  const chartData = useMemo(() => {
    const periodPoints = revenueSeries.filter(pt => pt.period_type === periodKey);
    const labels = [...new Set(periodPoints.map(pt => pt.period_label))];
    return labels.map(label => {
      const revPt = periodPoints.find(pt => pt.period_label === label && pt.metric_type === 'revenue');
      const tgtPt = periodPoints.find(pt => pt.period_label === label && pt.metric_type === 'target');
      return {
        label,
        revenue: revPt ? parseFloat(revPt.value) : 0,
        target: tgtPt ? parseFloat(tgtPt.value) : 0,
      };
    });
  }, [revenueSeries, periodKey]);

  // Scale the revenue/energy stats when a specific brand/vehicle is selected
  const scale = filteredVehicles.length / (vehicleList.length || 1);
  const scaledRevenue = filters.brand === 'All Brands' && filters.vehicle === 'All Vehicles'
    ? periodStats.fleetRevenue
    : Math.round(periodStats.fleetRevenue * scale);
  const scaledEnergy = filters.brand === 'All Brands' && filters.vehicle === 'All Vehicles'
    ? periodStats.energyToday
    : Math.round(periodStats.energyToday * scale * 10) / 10;

  const unassignedDriverCount = driverList.filter(d => !d.vehicle).length;


  // Stat cards
  const statCards = [
    { title: 'Total EV Vehicles',    value: filteredVehicles.length,                                    icon: Car,             trend: 0,                       trendLabel: 'In selected filter',                         gradient: 'gradient-green',  delay: 0    },
    { title: 'Active Vehicles',      value: filteredVehicles.filter(v => v.status === 'running').length, icon: Activity,        trend: stats.activeGrowth,      trendLabel: 'Currently on road',                          gradient: 'gradient-blue',   delay: 0.05 },
    { title: 'In Workshop',          value: filteredVehicles.filter(v => v.status === 'workshop').length,icon: Wrench,          trend: 0,                       trendLabel: 'Under maintenance',                          gradient: 'gradient-orange', delay: 0.1  },
    { title: 'Total Drivers',        value: stats.totalDrivers,                                         icon: Users,           trend: 0,                       trendLabel: `${unassignedDriverCount} awaiting assignment`, gradient: 'gradient-purple', delay: 0.15 },
    { title: 'Fleet Revenue',        value: scaledRevenue,                                              icon: IndianRupee,      trend: periodStats.revenueGrowth,trendLabel: `vs last ${filters.period.toLowerCase()}`,     gradient: 'gradient-teal',   delay: 0.2,  prefix: '₹' },
    { title: `Energy (${filters.period})`, value: scaledEnergy,                                        icon: Zap,             trend: periodStats.energyGrowth, trendLabel: 'kWh consumed',                               gradient: 'gradient-blue',   delay: 0.25, suffix: ' kWh' },
    { title: 'Avg Battery Health',   value: filteredVehicles.length ? Math.round(filteredVehicles.reduce((s, v) => s + v.batteryHealth, 0) / filteredVehicles.length) : 0, icon: Battery, trend: stats.healthGrowth, trendLabel: 'Fleet average', gradient: 'gradient-green', delay: 0.3, suffix: '%' },
    { title: 'Charging Now',         value: filteredVehicles.filter(v => v.status === 'charging').length,icon: BatteryCharging, trend: 0,                       trendLabel: 'At charging stations',                       gradient: 'gradient-teal',   delay: 0.35 },
  ];

  const greetingHour = new Date().getHours();
  const greeting = greetingHour < 12 ? 'Good morning' : greetingHour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-8">

      {/* ── Welcome row + Filters ──────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4"
      >
        {/* Top row: greeting + live badge */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {greeting}, {user?.name?.split(' ')[0]} 👋
            </h2>
            <p className="text-gray-500 mt-1 text-sm">Here's what's happening with your fleet.</p>
          </div>
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-sm font-semibold text-emerald-700">Live Monitoring Active</span>
          </div>
        </div>

        {/* Pending driver assignment banner */}
        <AnimatePresence>
          {unassignedDriverCount > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center justify-between gap-3 p-3 bg-amber-50 border border-amber-200 rounded-2xl overflow-hidden"
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <p className="text-sm font-semibold text-amber-700">
                  {unassignedDriverCount} driver{unassignedDriverCount !== 1 ? 's' : ''} waiting for vehicle assignment
                </p>
              </div>
              <button
                onClick={() => document.querySelector('[aria-label="assign-vehicle"]')?.click()}
                className="text-xs font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-xl transition-colors whitespace-nowrap"
              >
                Assign Now →
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Filter by</span>
          </div>
          <DashboardFilters
            filters={filters}
            onChange={setFilters}
            brands={allBrands}
            vehicleOptions={vehicleOpts}
          />
        </div>

        {/* Active filter summary badge */}
        <AnimatePresence>
          {(filters.brand !== 'All Brands' || filters.vehicle !== 'All Vehicles') && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-wrap items-center gap-2 overflow-hidden"
            >
              {filters.brand !== 'All Brands' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-xs font-semibold text-blue-700">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  Brand: {filters.brand}
                </span>
              )}
              {filters.vehicle !== 'All Vehicles' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 border border-purple-200 rounded-full text-xs font-semibold text-purple-700">
                  <span className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                  Vehicle: {filters.vehicle}
                </span>
              )}
              <span className="text-xs text-gray-400">
                Showing {filteredVehicles.length} of {vehicleList.length} vehicles
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Stats Grid ────────────────────────────────────────────────────── */}
      {dataLoading ? (
        <LoadingSkeleton type="card" count={8} />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card) => (
            <StatCard key={card.title} {...card} />
          ))}
        </div>
      )}

      {/* ── Revenue Chart + Quick panels ──────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MiniRevenueChart
            data={chartData}
            period={filters.period}
            revenueGrowth={periodStats.revenueGrowth}
          />
        </div>
        <div className="space-y-4">
          <QuickAlert />
          <FleetHealth vehicleList={filteredVehicles} />
        </div>
      </div>


      {/* ── Live Fleet Cards ──────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-800">Live Fleet Overview</h3>
            {filteredVehicles.length < vehicleList.length && (
              <p className="text-xs text-gray-400 mt-0.5">{filteredVehicles.length} vehicles match current filter</p>
            )}
          </div>
          <a href="/admin/fleet" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">
            View all →
          </a>
        </div>

        <AnimatePresence mode="wait">
          {filteredVehicles.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="col-span-4 flex flex-col items-center justify-center py-16 text-center bg-white rounded-3xl border border-gray-100"
            >
              <Car className="w-12 h-12 text-gray-300 mb-3" />
              <p className="font-semibold text-gray-400">No vehicles match the selected filters</p>
              <p className="text-sm text-gray-300 mt-1">Try changing brand or vehicle selection</p>
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
            >
              {filteredVehicles.slice(0, 4).map((v, i) => (
                <VehicleCard key={v.id} vehicle={v} delay={i * 0.08} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Map ───────────────────────────────────────────────────────────── */}
      <LiveMapSection filteredVehicles={filteredVehicles} />
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function QuickAlert() {
  const { alertList } = useApp();
  const critical = alertList.filter(a => a.severity === 'critical');
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="card"
    >
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-bold text-gray-800 text-sm">Critical Alerts</h4>
        <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">{critical.length}</span>
      </div>
      <div className="space-y-3">
        {critical.slice(0, 2).map(alert => (
          <div key={alert.id} className="flex items-start gap-3 p-3 bg-red-50 rounded-2xl border border-red-100">
            <div className="w-2 h-2 mt-1.5 bg-red-500 rounded-full animate-pulse flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-red-700">{alert.title}</p>
              <p className="text-xs text-red-500 mt-0.5 line-clamp-2">{alert.message}</p>
              <p className="text-xs text-gray-400 mt-1">{alert.time}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function FleetHealth({ vehicleList }) {
  const statusCounts = vehicleList.reduce((acc, v) => {
    acc[v.status] = (acc[v.status] || 0) + 1;
    return acc;
  }, {});

  const statusItems = [
    { label: 'Running',  key: 'running',  color: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50' },
    { label: 'Charging', key: 'charging', color: 'bg-blue-500',    text: 'text-blue-700',    bg: 'bg-blue-50'    },
    { label: 'Idle',     key: 'idle',     color: 'bg-amber-500',   text: 'text-amber-700',   bg: 'bg-amber-50'   },
    { label: 'Workshop', key: 'workshop', color: 'bg-red-500',     text: 'text-red-700',     bg: 'bg-red-50'     },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="card"
    >
      <h4 className="font-bold text-gray-800 text-sm mb-4">Fleet Status</h4>
      <div className="grid grid-cols-2 gap-2">
        {statusItems.map(s => (
          <div key={s.key} className={`${s.bg} rounded-2xl p-3 flex items-center gap-2`}>
            <div className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
            <div>
              <p className={`text-lg font-bold ${s.text}`}>{statusCounts[s.key] || 0}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}


