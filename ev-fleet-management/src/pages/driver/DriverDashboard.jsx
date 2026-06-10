import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, MapPin, IndianRupee, Navigation, Wrench } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { fetchTrips, fetchAnalyticsSeries } from '../../lib/db';
import BatteryRing from '../../components/shared/BatteryRing';
import StatusBadge from '../../components/shared/StatusBadge';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

const PERIODS = ['Weekly', 'Monthly', 'Last 3 Mo', 'Yearly'];
const PERIOD_KEY_MAP = {
  'Weekly':    'weekly',
  'Monthly':   'monthly',
  'Last 3 Mo': 'last3months',
  'Yearly':    'yearly',
};

const RupeesTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
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
};

export default function DriverDashboard() {
  const { user, vehicleList, driverList } = useApp();
  const [period, setPeriod]         = useState('Weekly');
  const [trips,  setTrips]          = useState([]);
  const [loadingTrips, setLoadingTrips] = useState(true);
  const [seriesData,   setSeriesData]   = useState([]);
  const [loadingSeries, setLoadingSeries] = useState(true);

  // Find this driver's record + assigned vehicle
  const myDriver  = driverList.find(d => d.profileId === user?.id)
                 || driverList.find(d => d.name === user?.name);
  const myVehicle = vehicleList.find(v => v.id === myDriver?.vehicle);

  // Fetch real trips and series from Supabase
  useEffect(() => {
    if (!myDriver?.id) return;
    setLoadingTrips(true);
    fetchTrips(myDriver.id).then(data => {
      setTrips(data);
      setLoadingTrips(false);
    });
  }, [myDriver?.id]);

  useEffect(() => {
    if (!myDriver?.id) return;
    setLoadingSeries(true);
    fetchAnalyticsSeries('driver', myDriver.id).then(data => {
      setSeriesData(data);
      setLoadingSeries(false);
    });
  }, [myDriver?.id]);

  const pKey = PERIOD_KEY_MAP[period] ?? 'weekly';

  const periodSeries = seriesData.filter(d => d.period_type === pKey);

  // Earnings data
  const earningsData = periodSeries
    .filter(d => d.metric_type === 'earnings')
    .map(d => ({ label: d.period_label, earnings: parseFloat(d.value) }));

  // Energy data to calculate charging/maintenance costs proportionally
  const energyTrendData = periodSeries
    .filter(d => d.metric_type === 'energy')
    .map(d => ({ label: d.period_label, kWh: parseFloat(d.value) }));

  const expChartData = energyTrendData.map(ePt => {
    const kWh = ePt.kWh || 0;
    const charging = Math.round(kWh * 25);
    let maintenance = 0;
    if (['Sat', 'W2', 'Wk5', '4PM', 'Jun'].includes(ePt.label)) {
      maintenance = 1200;
    }
    return {
      label: ePt.label,
      charging,
      maintenance,
    };
  });

  const totalEarnings    = earningsData.reduce((s, d) => s + (d.earnings || 0), 0);
  const totalCharging    = expChartData.reduce((s, v) => s + v.charging, 0);
  const totalMaintenance = expChartData.reduce((s, v) => s + v.maintenance, 0);

  const hasData = seriesData.length > 0;

  const greetHour = new Date().getHours();
  const greeting  = greetHour < 12 ? 'Good morning' : greetHour < 17 ? 'Good afternoon' : 'Good evening';

  if (!myVehicle) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center border border-amber-100">
          <Wrench className="w-6 h-6 text-amber-500" />
        </div>
        <p className="text-gray-500 font-semibold">No vehicle assigned yet.</p>
        <p className="text-sm text-gray-400">The admin will assign a vehicle to your account shortly.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ── Welcome Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 rounded-3xl p-6 text-white overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-emerald-100 text-sm font-medium mb-1">{greeting},</p>
            <h2 className="text-3xl font-bold mb-2">{user?.name || 'Driver'} 👋</h2>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">{myVehicle.manufacturer} {myVehicle.model}</span>
              <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">{myVehicle.id}</span>
              <StatusBadge status={myVehicle.status} />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <BatteryRing percent={Math.round(myVehicle.batteryPercent)} size={90} strokeWidth={8} />
            <div>
              <p className="text-emerald-100 text-xs">Range Left</p>
              <p className="text-2xl font-bold">{Math.round(myVehicle.range)} km</p>
              <p className="text-emerald-200 text-xs truncate max-w-[160px]">{myVehicle.location}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Period selector ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">View by:</span>
        <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl">
          {PERIODS.map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                period === p ? 'bg-white dark:bg-gray-700 text-emerald-700 dark:text-emerald-400 shadow-md' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* ── No analytics data notice ── */}
      {!loadingSeries && !hasData && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
          <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Zap className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-800">No analytics data yet</p>
            <p className="text-xs text-amber-600 mt-0.5">
              Run <code className="bg-amber-100 px-1 rounded font-mono">auto_seed_all_drivers.sql</code> in
              your Supabase SQL Editor to populate your dashboard with data.
            </p>
          </div>
        </div>
      )}

      {/* ── Quick stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: `${period} Earnings`,    value: `₹${totalEarnings.toLocaleString()}`,    icon: IndianRupee, color: 'gradient-green',  sub: `${period} total`  },
          { label: `${period} Charging`,    value: `₹${totalCharging.toLocaleString()}`,    icon: Zap,        color: 'gradient-blue',   sub: 'Charging cost'    },
          { label: `${period} Maintenance`, value: `₹${totalMaintenance.toLocaleString()}`, icon: Wrench,     color: 'gradient-orange', sub: 'Maintenance cost' },
          { label: 'Range Left',            value: `${Math.round(myVehicle.range)} km`,     icon: Navigation, color: 'gradient-purple', sub: 'Estimated'        },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }} className="card">
            <div className={`w-10 h-10 ${s.color} rounded-2xl flex items-center justify-center mb-3 shadow-md`}>
              <s.icon className="w-5 h-5 text-white" />
            </div>
            <div className="text-xl font-bold text-gray-800">{s.value}</div>
            <div className="text-sm text-gray-600 mt-0.5">{s.label}</div>
            <div className="text-xs text-gray-400 mt-0.5">{s.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Earnings area chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }} className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800">{period} Earnings</h3>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-xl">
              ₹{totalEarnings.toLocaleString()}
            </span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={earningsData}>
              <defs>
                <linearGradient id="earnGrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip content={<RupeesTooltip />} />
              <Area type="monotone" dataKey="earnings" name="Earnings"
                stroke="#10b981" strokeWidth={2.5} fill="url(#earnGrad2)"
                dot={{ r: 3, fill: '#10b981' }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Expenses bar chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }} className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800">{period} Expenses</h3>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-blue-600">
                <span className="w-2 h-2 bg-blue-500 rounded-full" />Charging
              </span>
              <span className="flex items-center gap-1 text-amber-600">
                <span className="w-2 h-2 bg-amber-400 rounded-full" />Maintenance
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={expChartData}>
              <defs>
                <linearGradient id="chgG2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" /><stop offset="100%" stopColor="#2563eb" />
                </linearGradient>
                <linearGradient id="mntG2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" /><stop offset="100%" stopColor="#d97706" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip content={<RupeesTooltip />} />
              <Bar dataKey="charging"    name="Charging"    fill="url(#chgG2)" radius={[4,4,0,0]} />
              <Bar dataKey="maintenance" name="Maintenance" fill="url(#mntG2)" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* ── Trips + Vehicle Status ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Trips */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }} className="card">
          <h3 className="font-bold text-gray-800 mb-4">Recent Trips</h3>
          {loadingTrips ? (
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="h-14 bg-gray-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : trips.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No trips recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {trips.slice(0, 5).map((trip, i) => (
                <motion.div key={trip.id}
                  initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + i * 0.05 }}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 gradient-teal rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-700">{trip.from} → {trip.to}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {trip.distance} km · {trip.duration} · {trip.date}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-600">₹{trip.earnings}</p>
                    <p className="text-xs text-gray-400">{trip.energyUsed} kWh</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Vehicle Status */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }} className="card">
          <h3 className="font-bold text-gray-800 mb-4">My Vehicle Status</h3>
          <div className="relative rounded-2xl overflow-hidden h-36 mb-4">
            <img src={myVehicle.image} alt={`${myVehicle.manufacturer} ${myVehicle.model}`} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <div className="absolute bottom-2 left-3">
              <StatusBadge status={myVehicle.status} />
            </div>
            <div className="absolute bottom-2 right-3">
              <BatteryRing percent={Math.round(myVehicle.batteryPercent)} size={52} strokeWidth={5} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Battery',  value: `${Math.round(myVehicle.batteryPercent)}%`,        color: 'text-emerald-600 bg-emerald-50' },
              { label: 'Health',   value: `${myVehicle.batteryHealth}%`,                     color: 'text-blue-600 bg-blue-50'       },
              { label: 'Speed',    value: `${Math.round(myVehicle.speed)} km/h`,             color: 'text-teal-600 bg-teal-50'       },
              { label: 'Range',    value: `${Math.round(myVehicle.range)} km`,               color: 'text-purple-600 bg-purple-50'   },
              { label: 'Revenue',  value: `₹${myVehicle.revenue.toLocaleString()}`,          color: 'text-pink-600 bg-pink-50'       },
              { label: 'Distance', value: `${myVehicle.totalDistance.toLocaleString()} km`,  color: 'text-orange-600 bg-orange-50'   },
            ].map(s => (
              <div key={s.label} className={`p-2.5 rounded-2xl ${s.color}`}>
                <p className="text-xs font-medium opacity-70">{s.label}</p>
                <p className="text-sm font-bold truncate mt-0.5">{s.value}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
