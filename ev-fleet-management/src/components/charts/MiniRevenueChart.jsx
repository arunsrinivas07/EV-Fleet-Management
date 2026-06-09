import React from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-3 text-xs">
        <p className="font-bold text-gray-700 mb-1">{label}</p>
        {payload.map(p => (
          <p key={p.dataKey} style={{ color: p.color }} className="font-semibold">
            {p.name}: ₹{Number(p.value).toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function MiniRevenueChart({ data, period = 'Weekly', revenueGrowth = 12.4 }) {
  const chartData = data ?? [];
  const total = chartData.reduce((sum, d) => sum + (d.revenue ?? 0), 0);
  const isPositive = revenueGrowth >= 0;

  const periodLabel = {
    Daily:   'Today',
    Weekly:  'This week',
    Monthly: 'This month',
    Yearly:  'This year',
  }[period] ?? '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="card h-full"
    >
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-800">
            {period === 'Weekly' ? 'Weekly' : period === 'Monthly' ? 'Monthly' : 'Yearly'} Revenue
          </h3>
          <p className="text-sm text-gray-500">Fleet earnings vs target · {periodLabel}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-800">₹{total.toLocaleString()}</div>
          <div className={`flex items-center gap-1 justify-end text-xs font-semibold mt-0.5 ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {isPositive ? '+' : ''}{revenueGrowth}% vs last {period.toLowerCase()}
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#10b981" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="targetGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.1} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2.5} fill="url(#revenueGrad)" name="Revenue" dot={false} activeDot={{ r: 5, fill: '#10b981' }} />
          <Area type="monotone" dataKey="target"  stroke="#3b82f6" strokeWidth={2} strokeDasharray="4 4" fill="url(#targetGrad)" name="Target" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
