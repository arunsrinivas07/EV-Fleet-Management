
import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { fetchAnalyticsSeries } from '../../lib/db';
import { useApp } from '../../context/AppContext';
import { IndianRupee, Zap, Wrench, TrendingUp, Car, BarChart2, Battery } from 'lucide-react';
// ── Constants ────────────────────────────────────────────────────────────────
const PERIODS = [
  { key: 'weekly',      label: 'Weekly'    },
  { key: 'monthly',     label: 'Monthly'   },
  { key: 'last3months', label: 'Last 3 Mo' },
  { key: 'yearly',      label: 'Yearly'    },
];

// ── Helpers ──────────────────────────────────────────────────────────────────
const fmtINR = (v) => {
  if (v >= 1_00_000) return `₹${(v / 1_00_000).toFixed(1)}L`;
  if (v >= 1_000)    return `₹${(v / 1000).toFixed(0)}k`;
  return `₹${v}`;
};

const CustomTooltip = ({ active, payload, label, isRupee = false, suffix = '' }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-3 text-xs min-w-[140px]">
      <p className="font-bold text-gray-700 mb-2">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">
          {p.name}:{' '}
          {isRupee ? `₹${Number(p.value).toLocaleString()}` : `${Number(p.value).toLocaleString()}${suffix}`}
        </p>
      ))}
    </div>
  );
};

const ChartCard = ({ title, subtitle, children, delay = 0, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className={`card ${className}`}
  >
    <div className="mb-5">
      <h3 className="text-base font-bold text-gray-800">{title}</h3>
      {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
    </div>
    {children}
  </motion.div>
);

// ── Main Component ───────────────────────────────────────────────────────────
export default function ChartsPage() {
  const { vehicleList } = useApp();
  const [period,    setPeriod]    = useState('weekly');
  const [brand,     setBrand]     = useState('All Brands');
  const [activeTab, setActiveTab] = useState('fleet'); // 'fleet' | 'general'

  const [fleetSeries, setFleetSeries] = useState([]);
  const [energyData, setEnergyData] = useState([]);
  const [batteryHealthData, setBatteryHealthData] = useState([]);
  const [distanceData, setDistanceData] = useState([]);
  const [chargingPatternData, setChargingPatternData] = useState([]);
  const [loading, setLoading] = useState(true);

  const periodLabel = PERIODS.find(p => p.key === period)?.label ?? '';

  const BRAND_OPTIONS = useMemo(() => {
    const brands = new Set(vehicleList.map(v => v.manufacturer));
    return ['All Brands', ...brands];
  }, [vehicleList]);

  // Fetch fleet brand series dynamically on brand/period changes
  useEffect(() => {
    setLoading(true);
    fetchAnalyticsSeries('fleet', brand === 'All Brands' ? 'All' : brand, period)
      .then(data => {
        setFleetSeries(data);
        setLoading(false);
      });
  }, [brand, period]);

  // Fetch general reports series when general tab is loaded
  useEffect(() => {
    if (activeTab !== 'general') return;
    fetchAnalyticsSeries('general').then(data => {
      setEnergyData(
        data.filter(x => x.metric_type === 'energy').map(x => ({ time: x.period_label, consumed: parseFloat(x.value) }))
      );
      setBatteryHealthData(
        data.filter(x => x.metric_type === 'avgHealth').map(x => ({ month: x.period_label, avgHealth: parseFloat(x.value) }))
      );
      setDistanceData(
        data.filter(x => x.metric_type === 'distance').map(x => ({ day: x.period_label, distance: parseFloat(x.value) }))
      );
      setChargingPatternData(
        data.filter(x => x.metric_type === 'charging_sessions').map(x => ({ hour: x.period_label, sessions: parseFloat(x.value) }))
      );
    });
  }, [activeTab]);

  // Reconstruct brandData from the fetched fleetSeries rows
  const brandData = useMemo(() => {
    if (fleetSeries.length === 0) return null;
    const labels = [...new Set(fleetSeries.map(pt => pt.period_label))];
    const revenue = labels.map(lbl => {
      const pt = fleetSeries.find(x => x.period_label === lbl && x.metric_type === 'revenue');
      return pt ? parseFloat(pt.value) : 0;
    });
    const expenses = labels.map(lbl => {
      const pt = fleetSeries.find(x => x.period_label === lbl && x.metric_type === 'expenses');
      return pt ? parseFloat(pt.value) : 0;
    });
    const maintenance = labels.map(lbl => {
      const pt = fleetSeries.find(x => x.period_label === lbl && x.metric_type === 'maintenance');
      return pt ? parseFloat(pt.value) : 0;
    });
    const charging = labels.map(lbl => {
      const pt = fleetSeries.find(x => x.period_label === lbl && x.metric_type === 'charging');
      return pt ? parseFloat(pt.value) : 0;
    });
    return { labels, revenue, expenses, maintenance, charging };
  }, [fleetSeries]);

  // Build chart-ready arrays
  const revenueVsExpenses = useMemo(() => {
    if (!brandData) return [];
    return brandData.labels.map((label, i) => ({
      label,
      revenue:     brandData.revenue[i]     || 0,
      expenses:    brandData.expenses[i]    || 0,
      profit:      (brandData.revenue[i]||0) - (brandData.expenses[i]||0),
    }));
  }, [brandData]);

  const maintenanceVsCharging = useMemo(() => {
    if (!brandData) return [];
    return brandData.labels.map((label, i) => ({
      label,
      maintenance: brandData.maintenance[i] || 0,
      charging:    brandData.charging[i]    || 0,
    }));
  }, [brandData]);

  // KPI totals
  const kpis = useMemo(() => {
    if (!brandData) return { revenue: 0, expenses: 0, maintenance: 0, charging: 0 };
    const sum = (arr) => arr.reduce((s, v) => s + (v || 0), 0);
    return {
      revenue:     sum(brandData.revenue),
      expenses:    sum(brandData.expenses),
      maintenance: sum(brandData.maintenance),
      charging:    sum(brandData.charging),
    };
  }, [brandData]);

  // Model breakdown for the selected brand (or all)
  const modelBreakdown = useMemo(() => {
    const targetBrands = brand === 'All Brands'
      ? BRAND_OPTIONS.filter(b => b !== 'All Brands')
      : [brand];
    return targetBrands.flatMap(b => {
      const vList = vehicleList.filter(v => v.manufacturer === b);
      return vList.map(v => ({
        model:    v.model,
        brand:    b,
        revenue:  v.revenue,
        distance: v.totalDistance,
        battery:  v.batteryHealth,
        status:   v.status,
      }));
    });
  }, [brand, BRAND_OPTIONS, vehicleList]);

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Charts & Analytics</h2>
          <p className="text-gray-500 text-sm mt-1">Fleet financial and operational metrics</p>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-2xl">
          <button onClick={() => setActiveTab('fleet')}
            className={`px-4 py-1.5 rounded-xl text-sm font-semibold transition-all ${activeTab === 'fleet' ? 'bg-white text-emerald-700 shadow-md' : 'text-gray-500'}`}>
            Fleet Analytics
          </button>
          <button onClick={() => setActiveTab('general')}
            className={`px-4 py-1.5 rounded-xl text-sm font-semibold transition-all ${activeTab === 'general' ? 'bg-white text-emerald-700 shadow-md' : 'text-gray-500'}`}>
            General Reports
          </button>
        </div>
      </div>

      {activeTab === 'fleet' ? (
        <FleetAnalyticsTab
          period={period}
          setPeriod={setPeriod}
          brand={brand}
          setBrand={setBrand}
          brandOptions={BRAND_OPTIONS}
          periodLabel={periodLabel}
          brandData={brandData}
          revenueVsExpenses={revenueVsExpenses}
          maintenanceVsCharging={maintenanceVsCharging}
          kpis={kpis}
          modelBreakdown={modelBreakdown}
        />
      ) : (
        <GeneralReportsTab
          energyData={energyData}
          batteryHealthData={batteryHealthData}
          distanceData={distanceData}
          chargingPatternData={chargingPatternData}
        />
      )}
    </div>
  );
}

// ── Fleet Analytics Tab ──────────────────────────────────────────────────────
function FleetAnalyticsTab({
  period, setPeriod, brand, setBrand, brandOptions,
  periodLabel, brandData,
  revenueVsExpenses, maintenanceVsCharging,
  kpis, modelBreakdown,
}) {
  const { vehicleList } = useApp();
  const brandModels = useMemo(() => {
    if (brand === 'All Brands') return [];
    return [...new Set(vehicleList.filter(v => v.manufacturer === brand).map(v => v.model))];
  }, [brand, vehicleList]);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Filter by</span>

        {/* Period */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-2xl">
          {PERIODS.map(p => (
            <button key={p.key} onClick={() => setPeriod(p.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                period === p.key ? 'bg-white text-emerald-700 shadow-md' : 'text-gray-500 hover:text-gray-700'
              }`}>
              {p.label}
            </button>
          ))}
        </div>

        {/* Brand */}
        <select
          value={brand}
          onChange={e => setBrand(e.target.value)}
          className="text-sm font-semibold text-gray-700 bg-gray-100 border-0 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer"
        >
          {brandOptions.map(b => <option key={b} value={b}>{b}</option>)}
        </select>

        {brand !== 'All Brands' && brandModels.length > 0 && (
          <span className="text-xs text-gray-400">
            Models: {brandModels.join(', ')}
          </span>
        )}
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: `${periodLabel} Revenue`,     value: fmtINR(kpis.revenue),     full: kpis.revenue,     icon: IndianRupee, color: 'gradient-green',  bg: 'bg-emerald-50', text: 'text-emerald-700' },
          { label: `${periodLabel} Expenses`,    value: fmtINR(kpis.expenses),    full: kpis.expenses,    icon: TrendingUp, color: 'gradient-blue',   bg: 'bg-blue-50',    text: 'text-blue-700'    },
          { label: `${periodLabel} Maintenance`, value: fmtINR(kpis.maintenance), full: kpis.maintenance, icon: Wrench,     color: 'gradient-orange', bg: 'bg-amber-50',   text: 'text-amber-700'   },
          { label: `${periodLabel} Charging`,    value: fmtINR(kpis.charging),    full: kpis.charging,    icon: Zap,        color: 'gradient-teal',   bg: 'bg-teal-50',    text: 'text-teal-700'    },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }} className="card">
            <div className={`w-10 h-10 ${s.color} rounded-2xl flex items-center justify-center mb-3 shadow-md`}>
              <s.icon className="w-5 h-5 text-white" />
            </div>
            <div className="text-xl font-bold text-gray-800">{s.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            <div className="text-xs text-gray-400 mt-0.5">₹{s.full.toLocaleString()}</div>
          </motion.div>
        ))}
      </div>

      {/* Revenue vs Expenses */}
      <ChartCard
        title={`${periodLabel} Revenue vs Expenses`}
        subtitle={`${brand} — revenue, total expenses and profit`}
        delay={0.1}
      >
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={revenueVsExpenses}>
            <defs>
              <linearGradient id="revG"    x1="0" y1="0" x2="0" y2="1"><stop offset="5%"  stopColor="#10b981" stopOpacity={0.2} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} /></linearGradient>
              <linearGradient id="expFlG"  x1="0" y1="0" x2="0" y2="1"><stop offset="5%"  stopColor="#f87171" stopOpacity={0.15}/><stop offset="95%" stopColor="#f87171" stopOpacity={0} /></linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => fmtINR(v)} />
            <Tooltip content={<CustomTooltip isRupee />} />
            <Legend wrapperStyle={{ fontSize: '11px' }} />
            <Area type="monotone" dataKey="revenue"  name="Revenue"  stroke="#10b981" strokeWidth={2.5} fill="url(#revG)"   dot={{ r: 3, fill: '#10b981' }} />
            <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#f87171" strokeWidth={2}   fill="url(#expFlG)" dot={{ r: 3, fill: '#f87171' }} />
            <Line type="monotone" dataKey="profit"   name="Profit"   stroke="#3b82f6" strokeWidth={2} strokeDasharray="6 3" dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Maintenance vs Charging */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title={`${periodLabel} Maintenance Cost`}
          subtitle={`${brand} — maintenance spend over time`}
          delay={0.15}
        >
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={maintenanceVsCharging}>
              <defs>
                <linearGradient id="mntFlG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f59e0b" /><stop offset="100%" stopColor="#d97706" /></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => fmtINR(v)} />
              <Tooltip content={<CustomTooltip isRupee />} />
              <Bar dataKey="maintenance" name="Maintenance" fill="url(#mntFlG)" radius={[5,5,0,0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-3 p-3 bg-amber-50 rounded-2xl flex items-center gap-3">
            <Wrench className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-amber-700">₹{kpis.maintenance.toLocaleString()}</p>
              <p className="text-xs text-amber-500">Total {periodLabel} maintenance</p>
            </div>
          </div>
        </ChartCard>

        <ChartCard
          title={`${periodLabel} Charging Cost`}
          subtitle={`${brand} — energy charging spend`}
          delay={0.2}
        >
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={maintenanceVsCharging}>
              <defs>
                <linearGradient id="chrgFlG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.2} /><stop offset="95%" stopColor="#3b82f6" stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => fmtINR(v)} />
              <Tooltip content={<CustomTooltip isRupee />} />
              <Area type="monotone" dataKey="charging" name="Charging" stroke="#3b82f6" strokeWidth={2.5} fill="url(#chrgFlG)" dot={{ r: 3, fill: '#3b82f6' }} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="mt-3 p-3 bg-blue-50 rounded-2xl flex items-center gap-3">
            <Zap className="w-5 h-5 text-blue-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-blue-700">₹{kpis.charging.toLocaleString()}</p>
              <p className="text-xs text-blue-500">Total {periodLabel} charging cost</p>
            </div>
          </div>
        </ChartCard>
      </div>

      {/* Profit margin */}
      <ChartCard
        title={`${periodLabel} Profit Margin`}
        subtitle="Revenue minus total expenses — positive = profitable"
        delay={0.25}
      >
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={revenueVsExpenses}>
            <defs>
              <linearGradient id="profitPosG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" /><stop offset="100%" stopColor="#059669" /></linearGradient>
              <linearGradient id="profitNegG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f87171" /><stop offset="100%" stopColor="#ef4444" /></linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => fmtINR(v)} />
            <Tooltip content={<CustomTooltip isRupee />} formatter={(v, name) => [`₹${v.toLocaleString()}`, name]} />
            <Bar dataKey="profit" name="Profit" radius={[5,5,0,0]}
              fill="url(#profitPosG)"
              label={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Model breakdown table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card overflow-hidden p-0">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-800">Vehicle Model Breakdown</h3>
          <p className="text-xs text-gray-500 mt-0.5">Revenue, distance and battery health per vehicle</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                {['Model', 'Brand', 'Revenue (₹)', 'Distance (km)', 'Battery Health', 'Status'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {modelBreakdown.map((row, i) => (
                <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 + i * 0.04 }}
                  className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 gradient-green rounded-xl flex items-center justify-center flex-shrink-0">
                        <Car className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="text-sm font-semibold text-gray-700">{row.model}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{row.brand}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-emerald-700">₹{row.revenue.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{row.distance.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${row.battery >= 90 ? 'bg-emerald-500' : row.battery >= 80 ? 'bg-blue-500' : 'bg-amber-400'}`}
                          style={{ width: `${row.battery}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-gray-700">{row.battery}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      row.status === 'running'  ? 'bg-emerald-100 text-emerald-700' :
                      row.status === 'charging' ? 'bg-blue-100 text-blue-700'       :
                      row.status === 'workshop' ? 'bg-red-100 text-red-700'          :
                                                  'bg-amber-100 text-amber-700'
                    }`}>{row.status}</span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

// ── General Reports Tab ──────────────────────────────────────────────────────
function GeneralReportsTab({ energyData, batteryHealthData, distanceData, chargingPatternData }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Energy consumption */}
        <ChartCard title="Energy Consumption" subtitle="Hourly kWh consumed today" delay={0.1}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={energyData} margin={{ top: 5, right: 5, left: -15 }}>
              <defs>
                <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#14b8a6" />
                  <stop offset="100%" stopColor="#0d9488" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip suffix=" kWh" />} />
              <Bar dataKey="consumed" name="Energy" fill="url(#energyGrad)" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Battery Health Trend */}
        <ChartCard title="Battery Health Trend" subtitle="Average fleet battery health (%)" delay={0.15}>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={batteryHealthData} margin={{ top: 5, right: 5, left: -15 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis domain={[85, 100]} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip suffix="%" />} />
              <Line type="monotone" dataKey="avgHealth" name="Avg Health" stroke="#8b5cf6" strokeWidth={3}
                dot={{ r: 5, fill: '#8b5cf6', strokeWidth: 2, stroke: 'white' }} activeDot={{ r: 7 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Distance */}
        <ChartCard title="Daily Distance Travelled" subtitle="Total km covered per day (all vehicles)" delay={0.2}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={distanceData} margin={{ top: 5, right: 5, left: -15 }}>
              <defs>
                <linearGradient id="distGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#2563eb" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip suffix=" km" />} />
              <Bar dataKey="distance" name="Distance" fill="url(#distGrad)" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Charging Pattern */}
        <ChartCard title="Charging Session Pattern" subtitle="Number of charging sessions throughout the day" delay={0.25}>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={chargingPatternData} margin={{ top: 5, right: 10, left: -15 }}>
              <defs>
                <linearGradient id="chargGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip suffix=" sessions" />} />
              <Area type="monotone" dataKey="sessions" name="Sessions" stroke="#f59e0b" strokeWidth={2.5}
                fill="url(#chargGrad)" dot={{ r: 4, fill: '#f59e0b', strokeWidth: 2, stroke: 'white' }}
                activeDot={{ r: 6 }} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
