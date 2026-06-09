import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Grid, List } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import VehicleCard from '../../components/vehicles/VehicleCard';
import LiveMapSection from '../../components/map/LiveMapSection';

const statusFilters = ['all', 'running', 'charging', 'idle', 'workshop'];

export default function FleetMonitor() {
  const { vehicleList } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

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
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-xl transition-colors ${viewMode === 'grid' ? 'bg-emerald-100 text-emerald-600' : 'text-gray-400 hover:bg-gray-100'}`}
          >
            <Grid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-xl transition-colors ${viewMode === 'list' ? 'bg-emerald-100 text-emerald-600' : 'text-gray-400 hover:bg-gray-100'}`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

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
        <VehicleTable vehicles={filtered} />
      )}

      {/* Map */}
      <LiveMapSection />
    </div>
  );
}

function VehicleTable({ vehicles }) {
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
