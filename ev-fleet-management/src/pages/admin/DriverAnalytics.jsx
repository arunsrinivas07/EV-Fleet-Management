import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, TrendingUp, Award, ChevronUp, ChevronDown } from 'lucide-react';
import { useApp } from '../../context/AppContext';

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

const safetyClass = (score) => {
  if (score >= 90) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  if (score >= 75) return 'bg-blue-100 text-blue-700 border-blue-200';
  if (score >= 60) return 'bg-amber-100 text-amber-700 border-amber-200';
  return 'bg-red-100 text-red-700 border-red-200';
};

export default function DriverAnalytics() {
  const { driverList } = useApp();
  const [sortBy, setSortBy] = useState('safetyScore');
  const [sortDir, setSortDir] = useState('desc');

  const sorted = [...driverList].sort((a, b) => {
    const dir = sortDir === 'desc' ? -1 : 1;
    return dir * (a[sortBy] - b[sortBy]);
  });

  const handleSort = (key) => {
    if (sortBy === key) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    else { setSortBy(key); setSortDir('desc'); }
  };

  const SortIcon = ({ col }) => sortBy === col
    ? (sortDir === 'desc' ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />)
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Driver Performance Analytics</h2>
        <p className="text-gray-500 text-sm mt-1">Monitor driver safety and efficiency metrics</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Top Performer', value: 'Ananya Menon', sub: 'Score: 97', icon: Award, color: 'gradient-green' },
          { label: 'Needs Attention', value: '2 Drivers', sub: 'Below 70 score', icon: AlertTriangle, color: 'gradient-orange' },
          { label: 'Avg Safety Score', value: '84.4', sub: 'Fleet average', icon: Shield, color: 'gradient-blue' },
          { label: 'Total Trips Today', value: '127', sub: '+8 vs yesterday', icon: TrendingUp, color: 'gradient-purple' },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="card"
          >
            <div className={`w-10 h-10 ${card.color} rounded-2xl flex items-center justify-center mb-3 shadow-md`}>
              <card.icon className="w-5 h-5 text-white" />
            </div>
            <div className="text-xl font-bold text-gray-800">{card.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{card.label}</div>
            <div className="text-xs text-gray-400 mt-0.5">{card.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card overflow-hidden p-0"
      >
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-800">Driver Performance Table</h3>
          <span className="text-xs text-gray-400">Click column headers to sort</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Driver</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Vehicle</th>
                {[
                  { key: 'trips', label: 'Trips' },
                  { key: 'overspeed', label: 'Overspeed' },
                  { key: 'hardBraking', label: 'Hard Braking' },
                  { key: 'aggressiveAccel', label: 'Aggr. Accel' },
                  { key: 'safetyScore', label: 'Safety Score' },
                  { key: 'efficiencyScore', label: 'Efficiency' },
                ].map(col => (
                  <th
                    key={col.key}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-700 select-none"
                    onClick={() => handleSort(col.key)}
                  >
                    <div className="flex items-center gap-1">
                      {col.label}
                      <SortIcon col={col.key} />
                    </div>
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
                    transition={{ delay: i * 0.05 }}
                    className={`hover:bg-gray-50/70 transition-colors ${isRisky ? 'bg-red-50/30' : ''}`}
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
                    <td className="px-4 py-3 w-40">
                      <div className="flex items-center gap-2">
                        <ScoreBar
                          value={d.safetyScore}
                          color={d.safetyScore >= 80 ? 'bg-emerald-500' : d.safetyScore >= 60 ? 'bg-amber-400' : 'bg-red-500'}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 w-40">
                      <ScoreBar value={d.efficiencyScore} color="bg-blue-500" />
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="px-6 py-3 bg-gray-50/50 border-t border-gray-100 flex items-center gap-6 text-xs text-gray-500">
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-red-400 rounded-full" />High Risk (&lt;70)</div>
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-amber-400 rounded-full" />Moderate (70–79)</div>
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-emerald-500 rounded-full" />Good (80+)</div>
        </div>
      </motion.div>
    </div>
  );
}
