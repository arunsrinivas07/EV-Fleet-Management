import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Grid, List, BarChart2, Award, TrendingUp, DollarSign, Activity, Battery, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { fetchAnalyticsSeries } from '../../lib/db';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, ComposedChart, Cell, PieChart, Pie
} from 'recharts';
import VehicleCard from '../../components/vehicles/VehicleCard';
import LiveMapSection from '../../components/map/LiveMapSection';

const statusFilters = ['all', 'running', 'charging', 'idle', 'workshop'];
const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4', '#14b8a6', '#6b7280'];

export default function FleetMonitor() {
  const { vehicleList } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list' | 'analytics'
  const [fleetSeries, setFleetSeries] = useState([]);
  const [loadingCharts, setLoadingCharts] = useState(true);

  // Sorting states for brand and model tables
  const [brandSortBy, setBrandSortBy] = useState('revenue');
  const [brandSortDir, setBrandSortDir] = useState('desc');
  const [modelSortBy, setModelSortBy] = useState('revenue');
  const [modelSortDir, setModelSortDir] = useState('desc');

  // Fetch all fleet brand metrics
  useEffect(() => {
    fetchAnalyticsSeries('fleet', 'all')
      .then(data => {
        setFleetSeries(data);
      })
      .finally(() => setLoadingCharts(false));
  }, []);

  // ── Brand Aggregations (from vehicleList) ──────────────────────────────────
  const brandStats = useMemo(() => {
    const stats = {};
    vehicleList.forEach(v => {
      if (!stats[v.manufacturer]) {
        stats[v.manufacturer] = { brand: v.manufacturer, revenue: 0, distance: 0, count: 0, runningCount: 0, sumBattery: 0, avgBattery: 0 };
      }
      stats[v.manufacturer].revenue += v.revenue;
      stats[v.manufacturer].distance += v.totalDistance;
      stats[v.manufacturer].count += 1;
      if (v.status === 'running') stats[v.manufacturer].runningCount += 1;
      stats[v.manufacturer].sumBattery += v.batteryHealth;
    });
    Object.values(stats).forEach(b => {
      b.avgBattery = Math.round(b.sumBattery / b.count);
    });
    return Object.values(stats);
  }, [vehicleList]);

  // ── Model Aggregations (from vehicleList) ──────────────────────────────────
  const modelStats = useMemo(() => {
    const stats = {};
    vehicleList.forEach(v => {
      if (!stats[v.model]) {
        stats[v.model] = { model: v.model, brand: v.manufacturer, revenue: 0, distance: 0, count: 0, sumBattery: 0, avgBattery: 0 };
      }
      stats[v.model].revenue += v.revenue;
      stats[v.model].distance += v.totalDistance;
      stats[v.model].count += 1;
      stats[v.model].sumBattery += v.batteryHealth;
    });
    Object.values(stats).forEach(m => {
      m.avgBattery = Math.round(m.sumBattery / m.count);
    });
    return Object.values(stats);
  }, [vehicleList]);
  // Sorted Brand Stats
  const sortedBrandStats = useMemo(() => {
    return [...brandStats].sort((a, b) => {
      const dir = brandSortDir === 'desc' ? -1 : 1;
      let aVal = a[brandSortBy];
      let bVal = b[brandSortBy];
      if (typeof aVal === 'string') {
        return dir * aVal.localeCompare(bVal);
      }
      return dir * (aVal - bVal);
    });
  }, [brandStats, brandSortBy, brandSortDir]);

  // Sorted Model Stats
  const sortedModelStats = useMemo(() => {
    return [...modelStats].sort((a, b) => {
      const dir = modelSortDir === 'desc' ? -1 : 1;
      let aVal = a[modelSortBy];
      let bVal = b[modelSortBy];
      if (typeof aVal === 'string') {
        return dir * aVal.localeCompare(bVal);
      }
      return dir * (aVal - bVal);
    });
  }, [modelStats, modelSortBy, modelSortDir]);

  const handleBrandSort = (key) => {
    if (brandSortBy === key) {
      setBrandSortDir(d => d === 'desc' ? 'asc' : 'desc');
    } else {
      setBrandSortBy(key);
      setBrandSortDir('desc');
    }
  };

  const handleModelSort = (key) => {
    if (modelSortBy === key) {
      setModelSortDir(d => d === 'desc' ? 'asc' : 'desc');
    } else {
      setModelSortBy(key);
      setModelSortDir('desc');
    }
  };

  const BrandSortIcon = ({ col }) => {
    if (brandSortBy !== col) return null;
    return brandSortDir === 'desc' ? <ChevronDown className="w-3.5 h-3.5 inline ml-1" /> : <ChevronUp className="w-3.5 h-3.5 inline ml-1" />;
  };

  const ModelSortIcon = ({ col }) => {
    if (modelSortBy !== col) return null;
    return modelSortDir === 'desc' ? <ChevronDown className="w-3.5 h-3.5 inline ml-1" /> : <ChevronUp className="w-3.5 h-3.5 inline ml-1" />;
  };
  // Highlights
  const bestBrand = useMemo(() => {
    if (brandStats.length === 0) return null;
    return [...brandStats].sort((a, b) => b.revenue - a.revenue)[0];
  }, [brandStats]);

  const bestModel = useMemo(() => {
    if (modelStats.length === 0) return null;
    return [...modelStats].sort((a, b) => b.revenue - a.revenue)[0];
  }, [modelStats]);

  // Brand-wise expenses from db/fleetSeries (yearly points)
  const brandExpensesData = useMemo(() => {
    const expensesByBrand = {};
    const yearlyPoints = fleetSeries.filter(pt => pt.period_type === 'yearly');
    
    yearlyPoints.forEach(pt => {
      const brandName = pt.scope_id;
      if (brandName === 'All' || brandName === 'all') return;
      if (!expensesByBrand[brandName]) {
        expensesByBrand[brandName] = { name: brandName, expenses: 0, charging: 0, maintenance: 0, revenue: 0 };
      }
      const val = parseFloat(pt.value) || 0;
      if (pt.metric_type === 'expenses') expensesByBrand[brandName].expenses += val;
      else if (pt.metric_type === 'charging') expensesByBrand[brandName].charging += val;
      else if (pt.metric_type === 'maintenance') expensesByBrand[brandName].maintenance += val;
      else if (pt.metric_type === 'revenue') expensesByBrand[brandName].revenue += val;
    });
    
    return Object.values(expensesByBrand);
  }, [fleetSeries]);

  const filtered = vehicleList.filter(v => {
    const matchSearch = v.model.toLowerCase().includes(search.toLowerCase()) ||
      v.driver.toLowerCase().includes(search.toLowerCase()) ||
      v.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || v.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Fleet Monitor</h2>
          <p className="text-gray-500 text-sm mt-1">{vehicleList.length} vehicles · {vehicleList.filter(v => v.status === 'running').length} active</p>
        </div>
        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            title="Grid View"
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            title="Table List View"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('analytics')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'analytics' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            title="Fleet Analytics & Comparison"
          >
            <BarChart2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {viewMode !== 'analytics' ? (
        <>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search vehicles, drivers..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input-field pl-11 text-sm"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {statusFilters.map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-4 py-2 rounded-2xl text-sm font-medium transition-all ${
                    statusFilter === s
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-emerald-300'
                  }`}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                  {s !== 'all' && (
                    <span className="ml-1.5 text-xs opacity-70">
                      ({vehicleList.filter(v => v.status === s).length})
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Results */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map((v, i) => (
                <VehicleCard key={v.id} vehicle={v} delay={i * 0.05} />
              ))}
              {filtered.length === 0 && (
                <div className="col-span-full text-center py-16 text-gray-400">
                  <p className="text-lg font-medium">No vehicles found</p>
                  <p className="text-sm mt-1">Try adjusting your search or filters</p>
                </div>
              )}
            </div>
          ) : (
            <VehicleTable vehicles={filtered} navigate={navigate} />
          )}

          {/* Map */}
          <LiveMapSection />
        </>
      ) : (
        <div className="space-y-6">
          {/* Highlights Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {bestBrand && (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="card flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl gradient-green flex items-center justify-center text-white shadow-md">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Overall Best Brand</p>
                  <p className="text-lg font-bold text-gray-800">{bestBrand.brand}</p>
                  <p className="text-xs text-emerald-600 font-semibold">₹{bestBrand.revenue.toLocaleString()} Total Revenue</p>
                </div>
              </motion.div>
            )}

            {bestModel && (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="card flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl gradient-blue flex items-center justify-center text-white shadow-md">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Top Performing Model</p>
                  <p className="text-lg font-bold text-gray-800 truncate max-w-[180px]">{bestModel.model}</p>
                  <p className="text-xs text-blue-600 font-semibold">₹{bestModel.revenue.toLocaleString()} Total Revenue</p>
                </div>
              </motion.div>
            )}

            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl gradient-purple flex items-center justify-center text-white shadow-md">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Active Fleet Size</p>
                <p className="text-lg font-bold text-gray-800">{vehicleList.length} Vehicles</p>
                <p className="text-xs text-purple-600 font-semibold">
                  {vehicleList.filter(v => v.status === 'running').length} running right now
                </p>
              </div>
            </motion.div>
          </div>

          {/* Visualizations Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Brand Revenue and Distance */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card">
              <div className="mb-4">
                <h3 className="font-bold text-gray-800">Brand Operational Metrics</h3>
                <p className="text-xs text-gray-400 mt-0.5">Total Revenue (₹) vs Total Distance (km) by manufacturer</p>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={brandStats} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="brand" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" orientation="left" tick={{ fontSize: 10, fill: '#10b981' }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: '#3b82f6' }} tickFormatter={v => `${v.toLocaleString()} km`} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #f3f4f6', fontSize: '11px' }} />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                  <Bar yAxisId="left" dataKey="revenue" name="Total Revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="distance" name="Total Distance" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Expenses Comparison by Brand */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="card">
              <div className="mb-4">
                <h3 className="font-bold text-gray-800">Annual Expenses Comparison</h3>
                <p className="text-xs text-gray-400 mt-0.5">Maintenance vs. Charging costs by brand (Yearly aggregate)</p>
              </div>
              {loadingCharts ? (
                <div className="flex items-center justify-center h-60">
                  <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : brandExpensesData.length === 0 ? (
                <div className="flex items-center justify-center h-60 text-gray-400 text-sm">
                  No yearly expense snapshot metrics available.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={brandExpensesData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} axisLine={false} tickLine={false} />
                    <Tooltip formatter={v => `₹${Number(v).toLocaleString()}`} contentStyle={{ borderRadius: '12px', border: '1px solid #f3f4f6', fontSize: '11px' }} />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                    <Bar dataKey="charging" name="Charging Cost" fill="#3b82f6" stackId="expensesStack" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="maintenance" name="Maintenance Cost" fill="#f59e0b" stackId="expensesStack" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </motion.div>

            {/* Model Revenue Shares */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card">
              <div className="mb-4">
                <h3 className="font-bold text-gray-800">Model Revenue breakdown</h3>
                <p className="text-xs text-gray-400 mt-0.5">Contribution of each vehicle model to the overall fleet revenue</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4">
                <div className="h-[220px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={modelStats}
                        dataKey="revenue"
                        nameKey="model"
                        cx="50%"
                        cy="50%"
                        outerRadius={75}
                        innerRadius={45}
                        paddingAngle={3}
                      >
                        {modelStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={v => `₹${Number(v).toLocaleString()}`} contentStyle={{ borderRadius: '12px', border: '1px solid #f3f4f6', fontSize: '10px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="max-h-[220px] overflow-y-auto pr-2 space-y-1.5 custom-scrollbar">
                  {modelStats.map((m, i) => (
                    <div key={m.model} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                        <span className="text-gray-600 font-medium truncate max-w-[140px]" title={m.model}>{m.model}</span>
                      </div>
                      <span className="font-bold text-gray-800">₹{m.revenue.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Model Battery Health & Counts */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card">
              <div className="mb-4">
                <h3 className="font-bold text-gray-800">Model Health & Fleet Share</h3>
                <p className="text-xs text-gray-400 mt-0.5">Average battery health (%) and vehicle counts per model</p>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <ComposedChart data={modelStats} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="model" tick={{ fontSize: 9, fill: '#6b7280' }} interval={0} angle={-15} textAnchor="end" height={40} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" domain={[0, 100]} tick={{ fontSize: 10, fill: '#8b5cf6' }} tickFormatter={v => `${v}%`} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: '#f59e0b' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #f3f4f6', fontSize: '11px' }} />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                  <Bar yAxisId="right" dataKey="count" name="Vehicle Count" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={30} />
                  <Line yAxisId="left" type="monotone" dataKey="avgBattery" name="Avg Battery Health" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 1 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* Metrics Data Tables */}
          <div className="grid grid-cols-1 gap-6">
            {/* Brand Metrics Table */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card p-0 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <h3 className="font-bold text-gray-800 text-sm">Manufacturer (Brand) Performance</h3>
                <p className="text-xs text-gray-400 mt-0.5">Aggregated metrics grouped by vehicle brand (click headers to sort)</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th onClick={() => handleBrandSort('brand')} className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-700 select-none">
                        Brand <BrandSortIcon col="brand" />
                      </th>
                      <th onClick={() => handleBrandSort('count')} className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center cursor-pointer hover:text-gray-700 select-none">
                        Vehicles <BrandSortIcon col="count" />
                      </th>
                      <th onClick={() => handleBrandSort('runningCount')} className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center cursor-pointer hover:text-gray-700 select-none">
                        Active <BrandSortIcon col="runningCount" />
                      </th>
                      <th onClick={() => handleBrandSort('distance')} className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-700 select-none">
                        Distance <BrandSortIcon col="distance" />
                      </th>
                      <th onClick={() => handleBrandSort('revenue')} className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-700 select-none">
                        Revenue <BrandSortIcon col="revenue" />
                      </th>
                      <th onClick={() => handleBrandSort('avgBattery')} className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center cursor-pointer hover:text-gray-700 select-none">
                        Avg Battery <BrandSortIcon col="avgBattery" />
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {sortedBrandStats.map(b => (
                      <tr key={b.brand} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3 font-semibold text-gray-700 text-sm">{b.brand}</td>
                        <td className="px-4 py-3 text-center text-gray-600 text-sm">{b.count}</td>
                        <td className="px-4 py-3 text-center text-emerald-600 text-sm font-semibold">{b.runningCount}</td>
                        <td className="px-4 py-3 text-gray-600 text-sm">{b.distance.toLocaleString()} km</td>
                        <td className="px-4 py-3 text-emerald-700 font-bold text-sm">₹{b.revenue.toLocaleString()}</td>
                        <td className="px-4 py-3 text-center text-sm font-semibold text-gray-700">{b.avgBattery}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* Model Metrics Table */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="card p-0 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <h3 className="font-bold text-gray-800 text-sm">Vehicle Model Performance</h3>
                <p className="text-xs text-gray-400 mt-0.5">Aggregated metrics grouped by vehicle model (click headers to sort)</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th onClick={() => handleModelSort('model')} className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-700 select-none">
                        Model <ModelSortIcon col="model" />
                      </th>
                      <th onClick={() => handleModelSort('brand')} className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-700 select-none">
                        Brand <ModelSortIcon col="brand" />
                      </th>
                      <th onClick={() => handleModelSort('count')} className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center cursor-pointer hover:text-gray-700 select-none">
                        Count <ModelSortIcon col="count" />
                      </th>
                      <th onClick={() => handleModelSort('distance')} className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-700 select-none">
                        Distance <ModelSortIcon col="distance" />
                      </th>
                      <th onClick={() => handleModelSort('revenue')} className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-700 select-none">
                        Revenue <ModelSortIcon col="revenue" />
                      </th>
                      <th onClick={() => handleModelSort('avgBattery')} className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center cursor-pointer hover:text-gray-700 select-none">
                        Avg Battery <ModelSortIcon col="avgBattery" />
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {sortedModelStats.map(m => (
                      <tr key={m.model} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3 font-semibold text-gray-700 text-sm truncate max-w-[120px]" title={m.model}>{m.model}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{m.brand}</td>
                        <td className="px-4 py-3 text-center text-gray-600 text-sm">{m.count}</td>
                        <td className="px-4 py-3 text-gray-600 text-sm">{m.distance.toLocaleString()} km</td>
                        <td className="px-4 py-3 text-emerald-700 font-bold text-sm">₹{m.revenue.toLocaleString()}</td>
                        <td className="px-4 py-3 text-center text-sm font-semibold text-gray-700">{m.avgBattery}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
}

function VehicleTable({ vehicles, navigate }) {
  return (
    <div className="card overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {['Vehicle', 'Driver', 'Battery', 'Health', 'Speed', 'Location', 'Range', 'Status'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {vehicles.map((v, i) => (
              <motion.tr
                key={v.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => navigate(`/admin/fleet/${v.id}`)}
                className="hover:bg-gray-50/70 transition-colors cursor-pointer"
              >
                <td className="px-4 py-3">
                  <div className="font-semibold text-sm text-gray-700">{v.model}</div>
                  <div className="text-xs text-gray-400">{v.id}</div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{v.driver}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 max-w-[80px] h-1.5 bg-gray-200 rounded-full">
                      <div
                        className={`h-full rounded-full ${v.batteryPercent >= 50 ? 'bg-emerald-500' : v.batteryPercent >= 25 ? 'bg-amber-400' : 'bg-red-500'}`}
                        style={{ width: `${v.batteryPercent}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-gray-600">{Math.round(v.batteryPercent)}%</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold ${v.batteryHealth >= 90 ? 'text-emerald-600' : v.batteryHealth >= 75 ? 'text-amber-600' : 'text-red-600'}`}>
                    {v.batteryHealth}%
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{Math.round(v.speed)} km/h</td>
                <td className="px-4 py-3 text-xs text-gray-500 max-w-[120px] truncate">{v.location}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{Math.round(v.range)} km</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                    v.status === 'running' ? 'bg-emerald-100 text-emerald-700' :
                    v.status === 'charging' ? 'bg-blue-100 text-blue-700' :
                    v.status === 'idle' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                  }`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                    {v.status}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
