import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Battery, Activity, WifiOff, Wrench, Gauge, AlertTriangle, Bell, CheckCircle, Filter } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const alertIcons = {
  low_battery: Battery,
  battery_health: Activity,
  offline: WifiOff,
  maintenance: Wrench,
  overspeed: Gauge,
};

const severityConfig = {
  critical: {
    bg: 'bg-red-50 border-red-200',
    icon: 'bg-red-100 text-red-600',
    badge: 'bg-red-100 text-red-700',
    dot: 'bg-red-500',
    label: 'Critical',
  },
  warning: {
    bg: 'bg-amber-50 border-amber-200',
    icon: 'bg-amber-100 text-amber-600',
    badge: 'bg-amber-100 text-amber-700',
    dot: 'bg-amber-400',
    label: 'Warning',
  },
  info: {
    bg: 'bg-blue-50 border-blue-200',
    icon: 'bg-blue-100 text-blue-600',
    badge: 'bg-blue-100 text-blue-700',
    dot: 'bg-blue-400',
    label: 'Info',
  },
};

export default function AlertCenter() {
  const { alertList } = useApp();
  const [filter, setFilter] = useState('all');
  const [resolved, setResolved] = useState(new Set());

  const filtered = alertList.filter(a => {
    if (filter === 'all') return true;
    return a.severity === filter;
  });

  const toggleResolve = (id) => {
    setResolved(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const counts = {
    all: alertList.length,
    critical: alertList.filter(a => a.severity === 'critical').length,
    warning: alertList.filter(a => a.severity === 'warning').length,
    info: alertList.filter(a => a.severity === 'info').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Alert Center</h2>
          <p className="text-gray-500 text-sm mt-1">{counts.critical} critical · {counts.warning} warnings · {counts.info} informational</p>
        </div>
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-2xl px-4 py-2">
          <Bell className="w-4 h-4 text-red-500 animate-bounce" />
          <span className="text-sm font-semibold text-red-600">{counts.critical} Critical</span>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { key: 'critical', label: 'Critical Alerts', icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50 border-red-100' },
          { key: 'warning', label: 'Warnings', icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100' },
          { key: 'info', label: 'Information', icon: Bell, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' },
        ].map((s, i) => (
          <motion.div
            key={s.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`card border ${s.bg} cursor-pointer`}
            onClick={() => setFilter(filter === s.key ? 'all' : s.key)}
          >
            <s.icon className={`w-7 h-7 ${s.color} mb-2`} />
            <div className={`text-3xl font-bold ${s.color}`}>{counts[s.key]}</div>
            <div className="text-sm text-gray-500 mt-1">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-gray-400" />
        {['all', 'critical', 'warning', 'info'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-2xl text-sm font-medium transition-all ${
              filter === f
                ? 'bg-gray-800 text-white shadow'
                : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)} {f !== 'all' && `(${counts[f]})`}
          </button>
        ))}
      </div>

      {/* Alert cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map((alert, i) => {
          const cfg = severityConfig[alert.severity];
          const Icon = alertIcons[alert.type] || AlertTriangle;
          const isResolved = resolved.has(alert.id);

          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isResolved ? 0.5 : 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`rounded-3xl border p-5 transition-all ${isResolved ? 'grayscale opacity-60' : cfg.bg}`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-2xl flex-shrink-0 ${cfg.icon}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="font-bold text-gray-800 text-sm">{alert.title}</h4>
                    <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${cfg.badge}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${!isResolved && 'animate-pulse'}`} />
                      {cfg.label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed mb-3">{alert.message}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span>{alert.vehicle}</span>
                      <span>·</span>
                      <span>{alert.time}</span>
                    </div>
                    <button
                      onClick={() => toggleResolve(alert.id)}
                      className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all ${
                        isResolved
                          ? 'bg-gray-100 text-gray-500'
                          : 'bg-white text-emerald-600 hover:bg-emerald-50 shadow-sm border border-emerald-100'
                      }`}
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      {isResolved ? 'Resolved' : 'Resolve'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
