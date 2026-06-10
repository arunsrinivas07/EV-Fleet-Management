import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, AlertTriangle, TrendingUp, Award, ChevronUp, ChevronDown,
  Users, Zap, IndianRupee, Gauge, Activity, Car,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell,
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { fetchAnalyticsSeries } from '../../lib/db';

// ── Constants ────────────────────────────────────────────────────────────────
const PERIODS = [
  { key: 'weekly',      label: 'Weekly'     },
  { key: 'monthly',     label: 'Monthly'    },
  { key: 'last3months', label: 'Last 3 Mo'  },
  { key: 'yearly',      label: 'Yearly'     },
];

// ── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (v) => typeof v === 'number' ? v.toLocaleString() : v;

const fmtINR = (v) => {
  if (v >= 1_00_000) return `₹${(v / 1_00_000).toFixed(1)}L`;
  if (v >= 1_000)    return `₹${(v / 1000).toFixed(0)}k`;
  return `₹${v}`;
};

const safetyColor = (score) =>
  score >= 90 ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
  : score >= 75 ? 'text-blue-700 bg-blue-50 border-blue-200'
  : score >= 60 ? 'text-amber-700 bg-amber-50 border-amber-200'
               : 'text-red-700 bg-red-50 border-red-200';

const avgEnergyCostPerKwh = 8;
const calcProfit = (d) => {
  const expense = (d.energyConsumed || 0) * avgEnergyCostPerKwh;
  return Math.round((d.totalEarnings || 0) - expense);
};

// Custom Tooltip
const RupeeTooltip = ({ active, payload, label, suffix = '' }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-3 text-xs min-w-[130px]">
      <p className="font-bold text-gray-700 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-semibold">
          {p.name}:{' '}
          {p.name === 'Earnings' || p.name === 'Expenses' ? '₹' : ''}
          {fmt(p.value)}{suffix}
        </p>
      ))}
    </div>
  );
};

// Score bar used in the table
const ScoreBar = ({ value, max = 100, color }) => (
  <div className="flex items-center gap-2">
    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${(value / max) * 100}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className={`h-full rounded-full ${color}`}
      />
    </div>
    <span className="text-xs font-bold text-gray-700 w-8 text-right">{value}</span>
  </div>
);

// Chart card wrapper
const ChartCard = ({ title, subtitle, extra, children, delay = 0, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className={`card ${className}`}
  >
    <div className="flex items-start justify-between flex-wrap gap-2 mb-4">
      <div>
        <h3 className="font-bold text-gray-800">{title}</h3>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {extra}
    </div>
    {children}
  </motion.div>
);

// ── Main Component ───────────────────────────────────────────────────────────
export default function DriverAnalytics() {
  const { driverList } = useApp();
  const list = driverList;

  const [period,     setPeriod]     = useState('weekly');
  const [selectedId, setSelectedId] = useState(null);   // null = show overview
  const [sortBy,     setSortBy]     = useState('safetyScore');
  const [sortDir,    setSortDir]    = useState('desc');
  const [compareMode, setCompareMode] = useState(false);
  const [compareIds,  setCompareIds]  = useState([]);

  const maxProfit = useMemo(() => {
    if (!list.length) return 1;
    return Math.max(...list.map(d => Math.abs(calcProfit(d))), 1);
  }, [list]);
  const [allDriversSeries, setAllDriversSeries] = useState([]);
  const [loadingSeries,    setLoadingSeries]    = useState(true);

  useEffect(() => {
    setLoadingSeries(true);
    fetchAnalyticsSeries('driver', 'all').then(data => {
      setAllDriversSeries(data);
      setLoadingSeries(false);
    });
  }, []);

  // Sorted table
  const sorted = useMemo(() => [...list].sort((a, b) => {
    const dir = sortDir === 'desc' ? -1 : 1;
    let aVal = a[sortBy] ?? 0;
    let bVal = b[sortBy] ?? 0;
    if (sortBy === 'profit') {
      aVal = calcProfit(a);
      bVal = calcProfit(b);
    }
    return dir * (aVal - bVal);
  }), [list, sortBy, sortDir]);

  const handleSort = (key) => {
    if (sortBy === key) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    else { setSortBy(key); setSortDir('desc'); }
  };

  const SortIcon = ({ col }) => sortBy === col
    ? (sortDir === 'desc' ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />)
    : null;

  const selectedDriver = selectedId ? list.find(d => d.id === selectedId) : null;

  if (loadingSeries) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Driver Performance Analytics</h2>
          <p className="text-gray-500 text-sm mt-1">
            {selectedDriver
              ? `Detailed view for ${selectedDriver.name}`
              : 'Fleet-wide driver safety and efficiency metrics'}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Compare toggle button */}
          {!selectedDriver && (
            <button
              onClick={() => {
                setCompareMode(!compareMode);
                if (!compareMode && compareIds.length === 0 && list.length >= 2) {
                  setCompareIds([list[0].id, list[1].id]);
                }
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                compareMode
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {compareMode ? 'Exit Comparison' : 'Compare Drivers ⇄'}
            </button>
          )}

          {/* Period selector */}
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

          {/* Back button when driver selected */}
          {selectedDriver && (
            <button
              onClick={() => setSelectedId(null)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-semibold text-gray-600 transition-all"
            >
              ← All Drivers
            </button>
          )}
        </div>
      </div>

      {/* ── Summary cards (hidden when a specific driver is selected) ── */}
      {!selectedDriver && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: 'Top Performer',
              value: list.length ? [...list].sort((a,b) => b.safetyScore - a.safetyScore)[0]?.name ?? '—' : '—',
              sub: `Score: ${list.length ? Math.max(...list.map(d=>d.safetyScore)) : '—'}`,
              icon: Award, color: 'gradient-green',
            },
            {
              label: 'Needs Attention',
              value: `${list.filter(d=>d.safetyScore<70).length} Drivers`,
              sub: 'Safety score below 70',
              icon: AlertTriangle, color: 'gradient-orange',
            },
            {
              label: 'Avg Safety Score',
              value: list.length ? (list.reduce((s,d)=>s+d.safetyScore,0)/list.length).toFixed(1) : '—',
              sub: 'Fleet average',
              icon: Shield, color: 'gradient-blue',
            },
            {
              label: 'Total Trips',
              value: fmt(list.reduce((s,d)=>s+d.trips,0)),
              sub: 'All-time combined',
              icon: TrendingUp, color: 'gradient-purple',
            },
          ].map((card, i) => (
            <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }} className="card">
              <div className={`w-10 h-10 ${card.color} rounded-2xl flex items-center justify-center mb-3 shadow-md`}>
                <card.icon className="w-5 h-5 text-white" />
              </div>
              <div className="text-xl font-bold text-gray-800">{card.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{card.label}</div>
              <div className="text-xs text-gray-400 mt-0.5">{card.sub}</div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        {selectedDriver ? (
          <DriverDetail
            key={selectedDriver.id}
            driver={selectedDriver}
            period={period}
            allDriversSeries={allDriversSeries}
          />
        ) : compareMode ? (
          <DriverComparison
            key="comparison"
            drivers={list}
            compareIds={compareIds}
            onAdd={(id) => setCompareIds(prev => [...prev, id])}
            onRemove={(id) => setCompareIds(prev => prev.filter(x => x !== id))}
            onClear={() => setCompareIds([])}
            period={period}
            allDriversSeries={allDriversSeries}
          />
        ) : (
          <motion.div
            key="overview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* ── Sortable table (Moved above charts) ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card overflow-hidden p-0"
            >
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-gray-800">All Drivers — Click a row for detailed graphs</h3>
                <span className="text-xs text-gray-400">Click columns to sort</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-100">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Driver</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Vehicle</th>
                      {[
                        { key: 'trips',           label: 'Trips'       },
                        { key: 'overspeed',       label: 'Overspeed'   },
                        { key: 'hardBraking',     label: 'Hard Braking'},
                        { key: 'aggressiveAccel', label: 'Aggr. Accel' },
                        { key: 'safetyScore',     label: 'Safety'      },
                        { key: 'efficiencyScore', label: 'Efficiency'  },
                        { key: 'totalEarnings',   label: 'Earnings'    },
                        { key: 'profit',          label: 'Profit / Loss'},
                      ].map(col => (
                        <th key={col.key}
                          className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-700 select-none"
                          onClick={() => handleSort(col.key)}
                        >
                          <div className="flex items-center gap-1">{col.label}<SortIcon col={col.key} /></div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {sorted.map((d, i) => {
                      const isRisky = d.safetyScore < 70;
                      return (
                        <motion.tr
                          key={d.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.04 }}
                          onClick={() => setSelectedId(d.id)}
                          className={`cursor-pointer hover:bg-emerald-50/40 transition-colors ${isRisky ? 'bg-red-50/30' : ''}`}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${isRisky ? 'bg-red-500' : 'gradient-green'}`}>
                                {d.avatar}
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                                  {d.name}
                                  {isRisky && <AlertTriangle className="w-3 h-3 text-red-500" />}
                                </div>
                                <div className="text-xs text-gray-400">{d.id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-500">{d.vehicleModel}</td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-700">{d.trips}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${d.overspeed > 5 ? 'bg-red-100 text-red-600' : d.overspeed > 0 ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                              {d.overspeed}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${d.hardBraking > 10 ? 'bg-red-100 text-red-600' : d.hardBraking > 3 ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                              {d.hardBraking}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${d.aggressiveAccel > 10 ? 'bg-red-100 text-red-600' : d.aggressiveAccel > 3 ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                              {d.aggressiveAccel}
                            </span>
                          </td>
                          <td className="px-4 py-3 w-36">
                            <ScoreBar value={d.safetyScore} color={d.safetyScore >= 80 ? 'bg-emerald-500' : d.safetyScore >= 60 ? 'bg-amber-400' : 'bg-red-500'} />
                          </td>
                          <td className="px-4 py-3 w-36">
                            <ScoreBar value={d.efficiencyScore} color="bg-blue-500" />
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-emerald-700">
                            ₹{d.totalEarnings.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 min-w-[150px]">
                            {(() => {
                              const profit = calcProfit(d);
                              const barWidth = Math.min((Math.abs(profit) / maxProfit) * 100, 100);
                              return (
                                <div className="flex flex-col gap-1">
                                  <div className="flex items-center justify-between text-xs font-semibold">
                                    <span className={profit >= 0 ? "text-emerald-600" : "text-red-500"}>
                                      {profit >= 0 ? '+' : ''}₹{profit.toLocaleString()}
                                    </span>
                                    <span className="text-[10px] text-gray-400">
                                      Cost: ₹{Math.round((d.energyConsumed || 0) * avgEnergyCostPerKwh).toLocaleString()}
                                    </span>
                                  </div>
                                  <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden flex">
                                    {profit >= 0 ? (
                                      <>
                                        <div className="w-1/2 bg-transparent" />
                                        <div style={{ width: `${barWidth / 2}%` }} className="h-full bg-emerald-500 rounded-r-full" />
                                      </>
                                    ) : (
                                      <>
                                        <div className="w-1/2 flex justify-end">
                                          <div style={{ width: `${barWidth / 2}%` }} className="h-full bg-red-400 rounded-l-full" />
                                        </div>
                                        <div className="w-1/2 bg-transparent" />
                                      </>
                                    )}
                                  </div>
                                </div>
                              );
                            })()}
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-3 bg-gray-50/50 border-t border-gray-100 flex items-center gap-6 text-xs text-gray-500">
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-red-400 rounded-full" />High Risk (&lt;70)</div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-amber-400 rounded-full" />Moderate (70–79)</div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-emerald-500 rounded-full" />Good (80+)</div>
                <div className="flex items-center gap-1.5 ml-auto text-emerald-600 font-medium">Click any row for detailed charts →</div>
              </div>
            </motion.div>

            {/* ── Fleet comparison charts (Moved below table) ── */}
            <FleetComparisonCharts drivers={list} period={period} allDriversSeries={allDriversSeries} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Fleet-wide comparison charts ─────────────────────────────────────────────
function FleetComparisonCharts({ drivers, period, allDriversSeries }) {
  // Local period filters
  const [earnPeriod, setEarnPeriod] = React.useState(period);
  const [tripsPeriod, setTripsPeriod] = React.useState(period);
  const [energyPeriod, setEnergyPeriod] = React.useState(period);

  // Pagination states (8 drivers per page)
  const PAGE_SIZE = 8;
  const [earnPage, setEarnPage] = React.useState(0);
  const [safetyPage, setSafetyPage] = React.useState(0);
  const [tripsPage, setTripsPage] = React.useState(0);
  const [energyPage, setEnergyPage] = React.useState(0);

  // Reset page when period changes
  React.useEffect(() => { setEarnPage(0); }, [earnPeriod]);
  React.useEffect(() => { setSafetyPage(0); }, [period]);
  React.useEffect(() => { setTripsPage(0); }, [tripsPeriod]);
  React.useEffect(() => { setEnergyPage(0); }, [energyPeriod]);

  // Sync with parent period when it changes
  React.useEffect(() => {
    setEarnPeriod(period);
    setTripsPeriod(period);
    setEnergyPeriod(period);
  }, [period]);

  // Build comparison data from allDriversSeries
  const getSeries = (driverId, metricType, pKey) => {
    return allDriversSeries.filter(
      pt => pt.scope_id === driverId && pt.period_type === pKey && pt.metric_type === metricType
    );
  };

  const earningsCompare = React.useMemo(() => drivers.map(d => {
    const series = getSeries(d.id, 'earnings', earnPeriod);
    // Fallback: use stored total_earnings scaled by period when no series data exists
    const periodScale = { weekly: 1/52, monthly: 1/12, last3months: 3/12, yearly: 1 };
    const fallback = Math.round(d.totalEarnings * (periodScale[earnPeriod] ?? 1/52));
    const total = series.length > 0
      ? series.reduce((s, pt) => s + parseFloat(pt.value || 0), 0)
      : fallback;
    return { name: d.name.split(' ')[0], full: d.name, total, avatar: d.avatar, id: d.id };
  }).sort((a,b) => b.total - a.total), [drivers, earnPeriod, allDriversSeries]);

  const safetyCompare = React.useMemo(() => drivers.map(d => {
    const series = getSeries(d.id, 'safety', period);
    // Fallback: use stored safetyScore when no series data exists
    const avg = series.filter(pt => parseFloat(pt.value) > 0).length
      ? Math.round(series.filter(pt=>parseFloat(pt.value)>0).reduce((s,pt) => s + parseFloat(pt.value), 0) / series.filter(pt=>parseFloat(pt.value)>0).length)
      : d.safetyScore;
    return { name: d.name.split(' ')[0], avg, score: d.safetyScore };
  }), [drivers, period, allDriversSeries]);

  const tripsCompare = React.useMemo(() => drivers.map(d => {
    const series = getSeries(d.id, 'trips', tripsPeriod);
    const periodScale = { weekly: 1/52, monthly: 1/12, last3months: 3/12, yearly: 1 };
    const fallback = Math.round(d.trips * (periodScale[tripsPeriod] ?? 1/52));
    const total = series.length > 0
      ? series.reduce((s, pt) => s + parseFloat(pt.value || 0), 0)
      : fallback;
    return { name: d.name.split(' ')[0], total };
  }).sort((a,b) => b.total - a.total), [drivers, tripsPeriod, allDriversSeries]);

  const energyCompare = React.useMemo(() => drivers.map(d => {
    const series = getSeries(d.id, 'energy', energyPeriod);
    const periodScale = { weekly: 1/52, monthly: 1/12, last3months: 3/12, yearly: 1 };
    const fallback = parseFloat((d.energyConsumed * (periodScale[energyPeriod] ?? 1/52)).toFixed(1));
    const total = series.length > 0
      ? parseFloat(series.reduce((s, pt) => s + parseFloat(pt.value || 0), 0).toFixed(1))
      : fallback;
    return { name: d.name.split(' ')[0], total, efficiency: d.efficiencyScore };
  }).sort((a,b) => b.total - a.total), [drivers, energyPeriod, allDriversSeries]);

  // Paginated Slices
  const paginatedEarnings = React.useMemo(() => earningsCompare.slice(earnPage * PAGE_SIZE, (earnPage + 1) * PAGE_SIZE), [earningsCompare, earnPage]);
  const paginatedSafety = React.useMemo(() => safetyCompare.slice(safetyPage * PAGE_SIZE, (safetyPage + 1) * PAGE_SIZE), [safetyCompare, safetyPage]);
  const paginatedTrips = React.useMemo(() => tripsCompare.slice(tripsPage * PAGE_SIZE, (tripsPage + 1) * PAGE_SIZE), [tripsCompare, tripsPage]);
  const paginatedEnergy = React.useMemo(() => energyCompare.slice(energyPage * PAGE_SIZE, (energyPage + 1) * PAGE_SIZE), [energyCompare, energyPage]);

  // Pagination Helper Component
  const ChartPagination = ({ page, setPage, totalCount }) => {
    const maxPage = Math.ceil(totalCount / PAGE_SIZE) - 1;
    if (maxPage <= 0) return null;
    return (
      <div className="flex items-center justify-end gap-2 mt-3 text-xs text-gray-500">
        <span>
          {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, totalCount)} of {totalCount}
        </span>
        <div className="flex gap-1">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="p-1 px-2 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed text-[10px] font-bold text-gray-700 transition-colors"
          >
            Prev
          </button>
          <button
            onClick={() => setPage(p => Math.min(maxPage, p + 1))}
            disabled={page >= maxPage}
            className="p-1 px-2 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed text-[10px] font-bold text-gray-700 transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

      {/* Earnings comparison */}
      <ChartCard
        title="Driver Earnings Comparison"
        subtitle={`${PERIODS.find(p=>p.key===earnPeriod)?.label} total earnings (₹)`}
        delay={0.1}
        extra={
          <div className="flex gap-1 p-0.5 bg-gray-100 rounded-xl">
            {PERIODS.map(p => (
              <button
                key={p.key}
                onClick={() => setEarnPeriod(p.key)}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                  earnPeriod === p.key ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        }
      >
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={paginatedEarnings} margin={{ top: 10, right: 10, left: -15, bottom: 5 }}>
            <defs>
              <linearGradient id="earnCompG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#374151', fontWeight: 600 }} axisLine={false} tickLine={false} interval={0} angle={-35} textAnchor="end" height={45} />
            <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => fmtINR(v)} />
            <Tooltip formatter={(v) => [`₹${v.toLocaleString()}`, 'Earnings']} contentStyle={{ borderRadius: '12px', border: '1px solid #f3f4f6', fontSize: '12px' }} />
            <Bar dataKey="total" name="Earnings" fill="url(#earnCompG)" radius={[5,5,0,0]} />
          </BarChart>
        </ResponsiveContainer>
        <ChartPagination page={earnPage} setPage={setEarnPage} totalCount={earningsCompare.length} />
      </ChartCard>

      {/* Safety score comparison */}
      <ChartCard title="Safety Score Comparison" subtitle="Current safety score vs period average" delay={0.15}>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={paginatedSafety} margin={{ top: 5, right: 10, bottom: 5 }}>
            <defs>
              <linearGradient id="safetyG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#6d28d9" />
              </linearGradient>
              <linearGradient id="safetyAvgG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#c4b5fd" />
                <stop offset="100%" stopColor="#a78bfa" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#374151' }} axisLine={false} tickLine={false} interval={0} angle={-35} textAnchor="end" height={45} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #f3f4f6', fontSize: '12px' }} />
            <Legend wrapperStyle={{ fontSize: '11px' }} />
            <Bar dataKey="score" name="Current Score" fill="url(#safetyG)" radius={[4,4,0,0]} />
            <Bar dataKey="avg"   name="Period Avg"    fill="url(#safetyAvgG)" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
        <ChartPagination page={safetyPage} setPage={setSafetyPage} totalCount={safetyCompare.length} />
      </ChartCard>

      {/* Trips comparison */}
      <ChartCard
        title="Trips Completed"
        subtitle={`${PERIODS.find(p=>p.key===tripsPeriod)?.label} trip count per driver`}
        delay={0.2}
        extra={
          <div className="flex gap-1 p-0.5 bg-gray-100 rounded-xl">
            {PERIODS.map(p => (
              <button
                key={p.key}
                onClick={() => setTripsPeriod(p.key)}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                  tripsPeriod === p.key ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        }
      >
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={paginatedTrips} margin={{ top: 5, right: 10, bottom: 5 }}>
            <defs>
              <linearGradient id="tripsG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#2563eb" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#374151' }} axisLine={false} tickLine={false} interval={0} angle={-35} textAnchor="end" height={45} />
            <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #f3f4f6', fontSize: '12px' }} />
            <Bar dataKey="total" name="Trips" fill="url(#tripsG)" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
        <ChartPagination page={tripsPage} setPage={setTripsPage} totalCount={tripsCompare.length} />
      </ChartCard>

      {/* Energy consumption */}
      <ChartCard
        title="Energy Consumed"
        subtitle={`${PERIODS.find(p=>p.key===energyPeriod)?.label} kWh per driver`}
        delay={0.25}
        extra={
          <div className="flex gap-1 p-0.5 bg-gray-100 rounded-xl">
            {PERIODS.map(p => (
              <button
                key={p.key}
                onClick={() => setEnergyPeriod(p.key)}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                  energyPeriod === p.key ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        }
      >
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={paginatedEnergy} margin={{ top: 5, right: 10, bottom: 5 }}>
            <defs>
              <linearGradient id="energyCompG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#374151' }} axisLine={false} tickLine={false} interval={0} angle={-35} textAnchor="end" height={45} />
            <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #f3f4f6', fontSize: '12px' }} />
            <Bar dataKey="total" name="kWh" fill="url(#energyCompG)" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
        <ChartPagination page={energyPage} setPage={setEnergyPage} totalCount={energyCompare.length} />
      </ChartCard>
    </div>
  );
}

// ── Driver Detail View ───────────────────────────────────────────────────────
function DriverDetail({ driver, period, allDriversSeries }) {
  const pKey   = period;

  const getSeries = (metricType) => {
    return allDriversSeries
      .filter(pt => pt.scope_id === driver.id && pt.period_type === period && pt.metric_type === metricType)
      .map(pt => ({ label: pt.period_label, value: parseFloat(pt.value) }));
  };

  const tripsData    = getSeries('trips');
  const earningsData = getSeries('earnings');
  const safetyData   = getSeries('safety');
  const energyData   = getSeries('energy');
  const speedData    = getSeries('speed');

  const periodScale = { weekly: 1/52, monthly: 1/12, last3months: 3/12, yearly: 1 };
  const scale = periodScale[period] ?? 1/52;

  // When no series data exists, build synthetic chart points from stored driver stats
  const syntheticLabels = {
    weekly:      ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
    monthly:     ['Jan','Feb','Mar','Apr','May','Jun'],
    last3months: ['Wk1','Wk3','Wk5','Wk7','Wk9','Wk11','Wk12'],
    yearly:      ['2023','2024','2025','2026'],
  }[period] || ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

  const makeSynthetic = (total, multipliers) =>
    syntheticLabels.map((label, i) => ({
      label,
      value: Math.round(total * scale * (multipliers[i % multipliers.length] ?? 1)),
    }));

  const earnMult  = [0.82, 0.98, 0.88, 1.10, 1.25, 1.40, 0.90];
  const energyMult = [0.80, 0.94, 0.86, 1.06, 1.20, 1.34, 0.86];
  const safetyMult = [0.97, 0.98, 0.99, 1.00, 1.01, 1.02, 1.00];
  const tripsMult  = [0.80, 0.96, 0.87, 1.09, 1.24, 1.38, 0.89];
  const speedMult  = [0.95, 1.00, 0.97, 1.03, 1.04, 1.07, 1.00];

  const resolvedEarnings = earningsData.length > 0 ? earningsData : makeSynthetic(driver.totalEarnings, earnMult);
  const resolvedTrips    = tripsData.length    > 0 ? tripsData    : makeSynthetic(driver.trips, tripsMult);
  const resolvedSafety   = safetyData.length   > 0 ? safetyData   : syntheticLabels.map(label => ({ label, value: driver.safetyScore + Math.round((Math.random() - 0.5) * 4) }));
  const resolvedEnergy   = energyData.length   > 0 ? energyData   : makeSynthetic(driver.energyConsumed, energyMult);
  const resolvedSpeed    = speedData.length    > 0 ? speedData    : syntheticLabels.map((label, i) => ({ label, value: Math.round(driver.avgSpeed * speedMult[i % speedMult.length]) }));

  // Combine into combo chart: earnings + trips
  const comboData = resolvedEarnings.map((pt, i) => ({
    label:    pt.label,
    earnings: pt.value,
    trips:    resolvedTrips[i]?.value ?? 0,
  }));

  const safetyChartData = resolvedSafety.map(pt => ({ label: pt.label, score: pt.value }));

  const radarData = [
    { subject: 'Safety',     value: driver.safetyScore    },
    { subject: 'Efficiency', value: driver.efficiencyScore },
    { subject: 'Smoothness', value: Math.max(0, 100 - driver.hardBraking * 4)       },
    { subject: 'Speed Ctrl', value: Math.max(0, 100 - driver.overspeed * 6)         },
    { subject: 'Eco Drive',  value: driver.efficiencyScore                           },
    { subject: 'Braking',    value: Math.max(0, 100 - driver.aggressiveAccel * 3)   },
  ];

  const periodLabel = PERIODS.find(p => p.key === period)?.label ?? '';
  const totalEarnings = resolvedEarnings.reduce((s,pt) => s + (pt.value||0), 0);
  const totalTrips    = resolvedTrips.reduce((s,pt)    => s + (pt.value||0), 0);
  const totalEnergy   = resolvedEnergy.reduce((s,pt)   => s + (pt.value||0), 0);
  const avgSafety     = resolvedSafety.filter(pt=>pt.value>0).length
    ? Math.round(resolvedSafety.filter(pt=>pt.value>0).reduce((s,pt) => s + pt.value, 0) / resolvedSafety.filter(pt=>pt.value>0).length)
    : driver.safetyScore;
  const avgSpeed = resolvedSpeed.filter(pt=>pt.value>0).length
    ? Math.round(resolvedSpeed.filter(pt=>pt.value>0).reduce((s,pt) => s + pt.value, 0) / resolvedSpeed.filter(pt=>pt.value>0).length)
    : driver.avgSpeed;

  const profitTrendData = resolvedEarnings.map((pt, i) => {
    const revenue = pt.value;
    const energy = resolvedEnergy[i]?.value ?? 0;
    const expense = energy * avgEnergyCostPerKwh;
    const profit = revenue - expense;
    return {
      label: pt.label,
      revenue: Math.round(revenue),
      expense: Math.round(expense),
      profit: Math.round(profit),
    };
  });

  const netProfit = totalEarnings - (totalEnergy * avgEnergyCostPerKwh);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Driver header banner */}
      <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500 rounded-3xl p-6 text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg ${driver.safetyScore < 70 ? 'bg-red-500' : 'bg-white/30 backdrop-blur-sm'}`}>
              {driver.avatar}
            </div>
            <div>
              <h3 className="text-2xl font-bold">{driver.name}</h3>
              <p className="text-emerald-100 text-sm">{driver.id} · {driver.vehicleModel}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${safetyColor(driver.safetyScore)}`}>
                  Safety {driver.safetyScore}
                </span>
                <span className="bg-white/20 backdrop-blur-sm text-xs px-2 py-0.5 rounded-full font-semibold">
                  Efficiency {driver.efficiencyScore}%
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-3 flex-wrap">
            {[
              { label: `${periodLabel} Trips`,    value: totalTrips },
              { label: `${periodLabel} Earnings`, value: `₹${totalEarnings.toLocaleString()}` },
              { label: 'Avg Safety',              value: avgSafety  },
              { label: 'Avg Speed',               value: `${avgSpeed} km/h` },
            ].map(s => (
              <div key={s.label} className="bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-3 text-center min-w-[90px]">
                <p className="text-xl font-bold">{s.value}</p>
                <p className="text-emerald-100 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {[
          { label: `${periodLabel} Earnings`, value: `₹${totalEarnings.toLocaleString()}`,    icon: IndianRupee, color: 'gradient-green'  },
          { label: 'Net Profit/Loss',         value: `${netProfit >= 0 ? '+' : ''}₹${Math.round(netProfit).toLocaleString()}`, icon: IndianRupee, color: netProfit >= 0 ? 'gradient-green' : 'bg-red-500' },
          { label: `${periodLabel} Trips`,    value: totalTrips,                               icon: Car,        color: 'gradient-blue'   },
          { label: 'Total Distance',          value: `${driver.totalEarnings ? Math.round(driver.totalEarnings/6.5).toLocaleString() : '—'} km`, icon: Gauge, color: 'gradient-purple'  },
          { label: 'Energy Used',             value: `${totalEnergy} kWh`,                    icon: Zap,        color: 'gradient-orange' },
          { label: 'Avg Speed',               value: `${avgSpeed} km/h`,                      icon: Activity,   color: 'gradient-teal'   },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }} className="card">
            <div className={`w-9 h-9 ${s.color} rounded-xl flex items-xl-center justify-center mb-2 shadow-md flex items-center`}>
              <s.icon className="w-4 h-4 text-white" />
            </div>
            <div className="text-lg font-bold text-gray-800">{s.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Earnings + Trips combo */}
      <ChartCard title={`${periodLabel} Earnings & Trips`} subtitle="Revenue earned and number of trips completed" delay={0.2}>
        <ResponsiveContainer width="100%" height={240}>
          <ComposedChart data={comboData}>
            <defs>
              <linearGradient id="dEarnG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#10b981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}   />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="left"  tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <Tooltip content={<RupeeTooltip />} />
            <Legend wrapperStyle={{ fontSize: '11px' }} />
            <Area yAxisId="left"  type="monotone" dataKey="earnings" name="Earnings" stroke="#10b981" strokeWidth={2.5} fill="url(#dEarnG)" dot={{ r: 3, fill: '#10b981' }} />
            <Bar  yAxisId="right" dataKey="trips"    name="Trips"    fill="#3b82f6" radius={[4,4,0,0]} fillOpacity={0.75} />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Safety score trend */}
        <ChartCard title="Safety Score Trend" subtitle={`${periodLabel} safety score over time`} delay={0.25}>
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={safetyChartData}>
              <defs>
                <linearGradient id="safetyTrendG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#8b5cf6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={v => [v, 'Safety Score']} contentStyle={{ borderRadius: '12px', border: '1px solid #f3f4f6', fontSize: '12px' }} />
              <Area type="monotone" dataKey="score" name="Safety Score" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#safetyTrendG)" dot={{ r: 3, fill: '#8b5cf6' }} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Profitability Trend */}
        <ChartCard title="Net Profitability Trend" subtitle={`${periodLabel} operating profit/loss (₹)`} delay={0.27}>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={profitTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={v => [`₹${v.toLocaleString()}`, 'Net Profit']} contentStyle={{ borderRadius: '12px', border: '1px solid #f3f4f6', fontSize: '12px' }} />
              <Bar dataKey="profit" name="Net Profit" fill="#10b981">
                {profitTrendData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.profit >= 0 ? '#10b981' : '#f87171'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Energy consumption */}
        <ChartCard title="Energy Consumption" subtitle={`${periodLabel} kWh consumed`} delay={0.3}>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={resolvedEnergy.map(pt => ({ label: pt.label, kWh: pt.value }))}>
              <defs>
                <linearGradient id="dEnergyG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#d97706" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={v => [`${v} kWh`, 'Energy']} contentStyle={{ borderRadius: '12px', border: '1px solid #f3f4f6', fontSize: '12px' }} />
              <Bar dataKey="kWh" name="kWh" fill="url(#dEnergyG)" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Speed trend */}
        <ChartCard title="Average Speed Trend" subtitle={`${periodLabel} avg speed (km/h)`} delay={0.35}>
          <ResponsiveContainer width="100%" height={210}>
            <LineChart data={resolvedSpeed.map(pt => ({ label: pt.label, speed: pt.value }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={v => [`${v} km/h`, 'Avg Speed']} contentStyle={{ borderRadius: '12px', border: '1px solid #f3f4f6', fontSize: '12px' }} />
              <Line type="monotone" dataKey="speed" name="Avg Speed" stroke="#14b8a6" strokeWidth={2.5}
                dot={{ r: 4, fill: '#14b8a6', strokeWidth: 2, stroke: 'white' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Driving profile radar */}
        <ChartCard title="Driving Profile Radar" subtitle="Multi-dimensional performance breakdown" delay={0.4}>
          <ResponsiveContainer width="100%" height={210}>
            <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
              <PolarGrid stroke="#f3f4f6" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#9ca3af' }} />
              <Radar name={driver.name.split(' ')[0]} dataKey="value"
                stroke="#10b981" fill="#10b981" fillOpacity={0.15}
                strokeWidth={2} dot={{ r: 3, fill: '#10b981' }} />
            </RadarChart>
          </ResponsiveContainer>
          {/* Behavior counters */}
          <div className="grid grid-cols-3 gap-2 mt-3">
            {[
              { label: 'Overspeed',    value: driver.overspeed,       good: driver.overspeed <= 2,       bg: 'bg-red-50',    text: 'text-red-600'    },
              { label: 'Hard Braking', value: driver.hardBraking,     good: driver.hardBraking <= 3,     bg: 'bg-amber-50',  text: 'text-amber-600'  },
              { label: 'Aggr. Accel.', value: driver.aggressiveAccel, good: driver.aggressiveAccel <= 3, bg: 'bg-orange-50', text: 'text-orange-600' },
            ].map(item => (
              <div key={item.label} className={`${item.bg} rounded-2xl p-3 text-center`}>
                <p className={`text-xl font-bold ${item.text}`}>{item.value}</p>
                <p className="text-xs text-gray-500">{item.label}</p>
                <p className={`text-xs font-semibold mt-0.5 ${item.good ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {item.good ? '✓ Good' : '⚠ Improve'}
                </p>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Trips trend */}
      <ChartCard title="Trips Over Time" subtitle={`${periodLabel} trip volume trend`} delay={0.45}>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={resolvedTrips.map(pt => ({ label: pt.label, trips: pt.value }))}>
            <defs>
              <linearGradient id="tripsAreaG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}   />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <Tooltip formatter={v => [v, 'Trips']} contentStyle={{ borderRadius: '12px', border: '1px solid #f3f4f6', fontSize: '12px' }} />
            <Area type="monotone" dataKey="trips" name="Trips" stroke="#3b82f6" strokeWidth={2.5} fill="url(#tripsAreaG)" dot={{ r: 3, fill: '#3b82f6' }} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>
    </motion.div>
  );
}

// ── Driver Comparison View ──────────────────────────────────────────────────
const COMPARE_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899'];

function DriverComparison({ drivers, compareIds, onAdd, onRemove, onClear, period, allDriversSeries }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const comparedDrivers = useMemo(() => drivers.filter(d => compareIds.includes(d.id)), [drivers, compareIds]);
  const availableDrivers = useMemo(() => {
    return drivers.filter(d => !compareIds.includes(d.id) && d.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [drivers, compareIds, searchQuery]);

  const radarData = useMemo(() => {
    const subjects = [
      { key: 'safety', label: 'Safety' },
      { key: 'efficiency', label: 'Efficiency' },
      { key: 'smoothness', label: 'Smoothness' },
      { key: 'speedCtrl', label: 'Speed Control' },
      { key: 'braking', label: 'Braking Control' }
    ];

    return subjects.map(sub => {
      const row = { subject: sub.label };
      comparedDrivers.forEach(d => {
        let val = 0;
        if (sub.key === 'safety') val = d.safetyScore;
        else if (sub.key === 'efficiency') val = d.efficiencyScore;
        else if (sub.key === 'smoothness') val = Math.max(0, 100 - d.hardBraking * 4);
        else if (sub.key === 'speedCtrl') val = Math.max(0, 100 - d.overspeed * 6);
        else if (sub.key === 'braking') val = Math.max(0, 100 - d.aggressiveAccel * 3);
        row[d.name.split(' ')[0]] = val;
      });
      return row;
    });
  }, [comparedDrivers]);

  const barData = useMemo(() => {
    return comparedDrivers.map(d => {
      const profit = calcProfit(d);
      return {
        name: d.name.split(' ')[0],
        Earnings: d.totalEarnings,
        Expenses: Math.round(d.energyConsumed * avgEnergyCostPerKwh),
        Profit: profit,
      };
    });
  }, [comparedDrivers]);

  const periodLabel = PERIODS.find(p => p.key === period)?.label ?? '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-6"
    >
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-800">Select Drivers to Compare</h3>
            <p className="text-xs text-gray-500 mt-0.5">Add drivers by name to view comparative charts and tables side-by-side.</p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5"
              >
                + Add Driver Name
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl z-30 p-2 space-y-1">
                  <input
                    type="text"
                    placeholder="Search name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 border border-gray-150 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 mb-1"
                  />
                  <div className="max-h-48 overflow-y-auto space-y-0.5">
                    {availableDrivers.map(d => (
                      <button
                        key={d.id}
                        onClick={() => {
                          onAdd(d.id);
                          setSearchQuery('');
                          setDropdownOpen(false);
                        }}
                        className="w-full text-left text-xs font-medium text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 px-2.5 py-2 rounded-xl transition-all flex items-center gap-2"
                      >
                        <span className="w-5 h-5 rounded-lg bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">{d.avatar}</span>
                        {d.name}
                      </button>
                    ))}
                    {availableDrivers.length === 0 && (
                      <p className="text-center text-xs text-gray-400 py-3">No drivers found</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {compareIds.length > 0 && (
              <button onClick={onClear} className="text-xs text-gray-400 hover:text-gray-600 font-semibold">
                Clear All
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-50">
          {comparedDrivers.map((d, index) => (
            <div
              key={d.id}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-100 text-xs font-semibold text-gray-700 bg-gray-50/50"
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COMPARE_COLORS[index % COMPARE_COLORS.length] }} />
              <span>{d.name}</span>
              <button
                onClick={() => onRemove(d.id)}
                className="w-4 h-4 rounded-full bg-gray-205 hover:bg-gray-300 text-gray-500 flex items-center justify-center text-[10px] ml-1 transition-colors"
              >
                ✕
              </button>
            </div>
          ))}
          {comparedDrivers.length === 0 && (
            <span className="text-xs text-gray-400 italic">No drivers selected. Add some drivers to start comparison.</span>
          )}
        </div>
      </div>

      {comparedDrivers.length > 0 && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Driving Behavior Profile Overlay" subtitle="Comparative analysis across key driving aspects" delay={0.1}>
              <ResponsiveContainer width="100%" height={260}>
                <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                  <PolarGrid stroke="#f3f4f6" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#9ca3af' }} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  {comparedDrivers.map((d, idx) => (
                    <Radar
                      key={d.id}
                      name={d.name.split(' ')[0]}
                      dataKey={d.name.split(' ')[0]}
                      stroke={COMPARE_COLORS[idx % COMPARE_COLORS.length]}
                      fill={COMPARE_COLORS[idx % COMPARE_COLORS.length]}
                      fillOpacity={0.08}
                      strokeWidth={2}
                    />
                  ))}
                </RadarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Earnings & Profitability Comparison" subtitle={`${periodLabel} earnings, expenses, and net profit side-by-side (₹)`} delay={0.15}>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={barData} margin={{ top: 5, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={v => `₹${v.toLocaleString()}`} contentStyle={{ borderRadius: '12px', border: '1px solid #f3f4f6', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="Earnings" fill="#10b981" radius={[4,4,0,0]} />
                  <Bar dataKey="Expenses" fill="#f59e0b" radius={[4,4,0,0]} />
                  <Bar dataKey="Profit" fill="#3b82f6" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <div className="card overflow-hidden p-0">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-800">Side-by-Side Comparison Matrix</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    <th className="px-6 py-4">Metric</th>
                    {comparedDrivers.map((d, idx) => (
                      <th key={d.id} className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COMPARE_COLORS[idx % COMPARE_COLORS.length] }} />
                          <span>{d.name}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-gray-700">
                  {[
                    { label: 'Vehicle Assigned', render: d => d.vehicleModel || 'Unassigned' },
                    { label: 'Safety Score', render: d => <ScoreBar value={d.safetyScore} color={d.safetyScore >= 80 ? 'bg-emerald-500' : d.safetyScore >= 60 ? 'bg-amber-400' : 'bg-red-500'} /> },
                    { label: 'Efficiency Score', render: d => <ScoreBar value={d.efficiencyScore} color="bg-blue-500" /> },
                    { label: 'Completed Trips', render: d => d.trips },
                    { label: 'Overspeeds', render: d => d.overspeed },
                    { label: 'Hard Braking Events', render: d => d.hardBraking },
                    { label: 'Aggressive Accelerations', render: d => d.aggressiveAccel },
                    { label: 'Total Earnings', render: d => `₹${d.totalEarnings.toLocaleString()}` },
                    { label: 'Operating Costs', render: d => `₹${Math.round(d.energyConsumed * avgEnergyCostPerKwh).toLocaleString()}` },
                    { label: 'Net Profit / Loss', render: d => {
                      const p = calcProfit(d);
                      return (
                        <span className={`font-semibold ${p >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                          {p >= 0 ? '+' : ''}₹{p.toLocaleString()}
                        </span>
                      );
                    }}
                  ].map((row) => (
                    <tr key={row.label} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">{row.label}</td>
                      {comparedDrivers.map(d => (
                        <td key={d.id} className="px-6 py-4">{row.render(d)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}
