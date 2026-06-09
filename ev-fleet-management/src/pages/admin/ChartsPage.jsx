import React from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { revenueData, energyData, batteryHealthData, distanceData, chargingPatternData } from '../../data/mockData';

const CustomTooltip = ({ active, payload, label, prefix = '', suffix = '' }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-3 text-xs min-w-[120px]">
        <p className="font-bold text-gray-700 mb-2">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="font-semibold" style={{ color: p.color }}>
            {p.name}: {prefix}{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}{suffix}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const ChartCard = ({ title, subtitle, children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="card"
  >
    <div className="mb-6">
      <h3 className="text-lg font-bold text-gray-800">{title}</h3>
      <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
    </div>
    {children}
  </motion.div>
);

export default function ChartsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Charts & Reports</h2>
        <p className="text-gray-500 text-sm mt-1">Fleet analytics and performance metrics</p>
      </div>

      {/* Revenue + Energy row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Fleet Revenue" subtitle="Weekly revenue vs target (₹ INR)" delay={0.1}>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={revenueData} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="tar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip prefix="₹" />} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#10b981" strokeWidth={2.5} fill="url(#rev)" dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 6 }} />
              <Area type="monotone" dataKey="target" name="Target" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" fill="url(#tar)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Energy Consumption" subtitle="Hourly kWh consumed today" delay={0.15}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={energyData} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#14b8a6" />
                  <stop offset="100%" stopColor="#0d9488" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip suffix=" kWh" />} />
              <Bar dataKey="consumed" name="Energy" fill="url(#energyGrad)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Battery Health + Distance row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Battery Health Trend" subtitle="Average fleet battery health over months (%)" delay={0.2}>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={batteryHealthData} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis domain={[85, 100]} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip suffix="%" />} />
              <Line
                type="monotone"
                dataKey="avgHealth"
                name="Avg Health"
                stroke="#8b5cf6"
                strokeWidth={3}
                dot={{ r: 5, fill: '#8b5cf6', strokeWidth: 2, stroke: 'white' }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Daily Distance Travelled" subtitle="Total km covered per day (all vehicles)" delay={0.25}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={distanceData} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="distGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#2563eb" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip suffix=" km" />} />
              <Bar dataKey="distance" name="Distance" fill="url(#distGrad)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Charging Pattern */}
      <ChartCard title="Charging Pattern Analytics" subtitle="Number of charging sessions throughout the day" delay={0.3}>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={chargingPatternData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="chargGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip suffix=" sessions" />} />
            <Area
              type="monotone"
              dataKey="sessions"
              name="Sessions"
              stroke="#f59e0b"
              strokeWidth={2.5}
              fill="url(#chargGrad)"
              dot={{ r: 4, fill: '#f59e0b', strokeWidth: 2, stroke: 'white' }}
              activeDot={{ r: 6 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
