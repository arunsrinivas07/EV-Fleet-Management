import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Gauge, Zap, Leaf, Car, DollarSign, TrendingUp, Wrench } from 'lucide-react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import { drivers, tripHistory, driverEarningsByPeriod, driverExpensesByPeriod } from '../../data/mockData';

const driver = drivers[0]; // Arjun Sharma
const PERIODS = ['Daily', 'Weekly', 'Monthly', 'Yearly'];

const radarData = [
  { subject: 'Safety',    value: driver.safetyScore,    fullMark: 100 },
  { subject: 'Efficiency',value: driver.efficiencyScore,fullMark: 100 },
  { subject: 'Smoothness',value: 86,                    fullMark: 100 },
  { subject: 'Speed Ctrl',value: 90,                    fullMark: 100 },
  { subject: 'Eco Drive', value: 82,                    fullMark: 100 },
  { subject: 'Braking',   value: 88,                    fullMark: 100 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-3 text-xs">
      <p className="font-bold text-gray-700 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-semibold">
          {p.name}: {p.name === 'Score' ? p.value : `₹${Number(p.value).toLocaleString()}`}
        </p>
      ))}
    </div>
  );
};

export default function DrivingAnalytics() {
  const [period, setPeriod] = useState('Weekly');
  const pKey = period.toLowerCase();

  const earningsData = driverEarningsByPeriod[pKey] || driverEarningsByPeriod.weekly;
  const expData      = driverExpensesByPeriod[pKey]  || driverExpensesByPeriod.weekly;

  const totalEarnings    = earningsData.reduce((s, d) => s + d.earnings, 0);
  const totalCharging    = expData.charging.reduce((s, v) => s + v, 0);
  const totalMaintenance = expData.maintenance.reduce((s, v) => s + v, 0);
  const netIncome        = totalEarnings - totalCharging - totalMaintenance;

  const expChartData = expData.labels.map((label, i) => ({
    label,
    charging:    expData.charging[i]    || 0,
    maintenance: expData.maintenance[i] || 0,
  }));

  // Combine earnings + expenses for combo view
  const comboData = earningsData.map((d, i) => ({
    label:       d.label,
    earnings:    d.earnings,
    expenses:    (expData.charging[i] || 0) + (expData.maintenance[i] || 0),
  }));

  // Weekly performance score data
  const scoreData = [
    { day: 'Mon', score: 88 }, { day: 'Tue', score: 92 },
    { day: 'Wed', score: 90 }, { day: 'Thu', score: 84 },
    { day: 'Fri', score: 86 }, { day: 'Sat', score: 91 },
    { day: 'Sun', score: 94 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">My Driving Analytics</h2>
          <p className="text-gray-500 text-sm mt-1">Track your performance, earnings and expenses</p>
        </div>
        {/* Period selector */}
        <div className="flex gap-2 p-1 bg-gray-100 rounded-2xl">
          {PERIODS.map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                period === p ? 'bg-white text-emerald-700 shadow-md' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* ── Score Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-500 via-purple-500 to-teal-500 rounded-3xl p-6 text-white"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-blue-100 text-sm mb-1">Overall Driving Score</p>
            <div className="text-5xl font-bold">{driver.safetyScore}</div>
            <p className="text-blue-100 mt-1 flex items-center gap-1"><TrendingUp className="w-4 h-4" /> +3 points this week</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {[
              { label: 'Trips',       value: driver.trips                          },
              { label: `${period} Rev`, value: `₹${totalEarnings.toLocaleString()}` },
              { label: 'Net Income',  value: `₹${netIncome.toLocaleString()}`      },
              { label: 'Eco Score',   value: `${driver.efficiencyScore}%`          },
            ].map(s => (
              <div key={s.label} className="bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-3 text-center min-w-[80px]">
                <p className="text-xl font-bold whitespace-nowrap">{s.value}</p>
                <p className="text-blue-100 text-xs">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Metric Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: `${period} Earnings`,    value: `₹${totalEarnings.toLocaleString()}`,    icon: DollarSign, color: 'gradient-green',  sub: 'Total revenue'       },
          { label: `${period} Charging`,    value: `₹${totalCharging.toLocaleString()}`,    icon: Zap,        color: 'gradient-blue',   sub: 'Charging cost'       },
          { label: `${period} Maintenance`, value: `₹${totalMaintenance.toLocaleString()}`, icon: Wrench,     color: 'gradient-orange', sub: 'Maintenance cost'    },
          { label: 'Net Income',            value: `₹${netIncome.toLocaleString()}`,         icon: Leaf,       color: 'gradient-teal',   sub: 'After expenses'      },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="card"
          >
            <div className={`w-10 h-10 ${s.color} rounded-2xl flex items-center justify-center mb-3 shadow-md`}>
              <s.icon className="w-5 h-5 text-white" />
            </div>
            <div className="text-xl font-bold text-gray-800">{s.value}</div>
            <div className="text-sm text-gray-600">{s.label}</div>
            <div className="text-xs text-gray-400 mt-0.5">{s.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* ── Revenue vs Expenses ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800">{period} Revenue vs Expenses</h3>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-emerald-600"><span className="w-2 h-2 bg-emerald-500 rounded-full" />Earnings</span>
            <span className="flex items-center gap-1 text-red-500"><span className="w-2 h-2 bg-red-400 rounded-full" />Expenses</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={comboData}>
            <defs>
              <linearGradient id="earnG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" /><stop offset="100%" stopColor="#059669" />
              </linearGradient>
              <linearGradient id="expG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f87171" /><stop offset="100%" stopColor="#ef4444" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="earnings" name="Earnings" fill="url(#earnG)" radius={[5,5,0,0]} />
            <Bar dataKey="expenses" name="Expenses" fill="url(#expG)"  radius={[5,5,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* ── Expense breakdown + Radar ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense breakdown */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="card">
          <h3 className="font-bold text-gray-800 mb-4">{period} Expense Breakdown</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={expChartData}>
              <defs>
                <linearGradient id="chgG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" /><stop offset="100%" stopColor="#2563eb" />
                </linearGradient>
                <linearGradient id="mntG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" /><stop offset="100%" stopColor="#d97706" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="charging"    name="Charging"    fill="url(#chgG)" radius={[4,4,0,0]} />
              <Bar dataKey="maintenance" name="Maintenance" fill="url(#mntG)" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
          {/* Summary row */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="p-3 bg-blue-50 rounded-2xl">
              <Zap className="w-4 h-4 text-blue-500 mb-1" />
              <p className="text-lg font-bold text-blue-700">₹{totalCharging.toLocaleString()}</p>
              <p className="text-xs text-blue-500">Total Charging</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-2xl">
              <Wrench className="w-4 h-4 text-amber-500 mb-1" />
              <p className="text-lg font-bold text-amber-700">₹{totalMaintenance.toLocaleString()}</p>
              <p className="text-xs text-amber-500">Total Maintenance</p>
            </div>
          </div>
        </motion.div>

        {/* Driving profile radar */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }} className="card">
          <h3 className="font-bold text-gray-800 mb-4">Driving Profile</h3>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
              <PolarGrid stroke="#f3f4f6" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#9ca3af' }} />
              <Radar name="Score" dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.15} strokeWidth={2} dot={{ r: 3, fill: '#10b981' }} />
            </RadarChart>
          </ResponsiveContainer>
          {/* Safety events */}
          <div className="grid grid-cols-3 gap-2 mt-3">
            {[
              { label: 'Overspeed',    value: driver.overspeed,      good: driver.overspeed <= 2,      color: 'text-red-600',    bg: 'bg-red-50'    },
              { label: 'Hard Braking', value: driver.hardBraking,    good: driver.hardBraking <= 3,    color: 'text-amber-600',  bg: 'bg-amber-50'  },
              { label: 'Aggr. Accel.', value: driver.aggressiveAccel,good: driver.aggressiveAccel <= 3,color: 'text-orange-600', bg: 'bg-orange-50' },
            ].map(item => (
              <div key={item.label} className={`${item.bg} rounded-2xl p-3 text-center`}>
                <p className={`text-xl font-bold ${item.color}`}>{item.value}</p>
                <p className="text-xs text-gray-500">{item.label}</p>
                <p className={`text-xs font-semibold mt-0.5 ${item.good ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {item.good ? '✓ Good' : '⚠ Improve'}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Weekly performance score ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card">
        <h3 className="font-bold text-gray-800 mb-4">Weekly Safety Score Trend</h3>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={scoreData}>
            <defs>
              <linearGradient id="scoreG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#8b5cf6" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis domain={[70, 100]} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <Tooltip formatter={v => [`${v}`, 'Score']} contentStyle={{ borderRadius: '12px', border: '1px solid #f3f4f6', fontSize: '12px' }} />
            <Area type="monotone" dataKey="score" name="Score" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#scoreG)" dot={{ r: 4, fill: '#8b5cf6' }} />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* ── Trip History ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800">Trip History</h3>
          <span className="text-xs text-gray-400">{tripHistory.length} trips</span>
        </div>
        <div className="space-y-2">
          {tripHistory.map((trip, i) => (
            <motion.div
              key={trip.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45 + i * 0.05 }}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 gradient-blue rounded-xl flex items-center justify-center flex-shrink-0">
                  <Car className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-700">{trip.from} → {trip.to}</p>
                  <p className="text-xs text-gray-400">{trip.date} · {trip.distance} km · {trip.duration}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-emerald-600">₹{trip.earnings}</p>
                <p className="text-xs text-gray-400">{trip.energyUsed} kWh</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
