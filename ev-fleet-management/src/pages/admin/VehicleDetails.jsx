import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, MapPin, Gauge, DollarSign, Battery, Activity,
  Route, Wrench, Calendar, User, Zap, CreditCard,
  TrendingDown, ChevronDown, ChevronUp,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { vehicleExpenses } from '../../data/mockData';
import BatteryRing from '../../components/shared/BatteryRing';
import StatusBadge from '../../components/shared/StatusBadge';
import TomTomMap from '../../components/map/TomTomMap';

// ── mini SVG map showing a single vehicle pin ─────────────────────────────────
function VehicleMiniMap({ vehicle }) {
  const W = 700, H = 280;
  const latMin = 41.84, latMax = 41.99;
  const lngMin = -87.93, lngMax = -87.60;
  const x = ((vehicle.lng - lngMin) / (lngMax - lngMin)) * W;
  const y = ((latMax - vehicle.lat) / (latMax - latMin)) * H;

  const statusColor = {
    running: '#10b981', charging: '#3b82f6',
    idle: '#f59e0b',    workshop: '#ef4444',
  }[vehicle.status] ?? '#10b981';

  return (
    <div className="relative rounded-2xl overflow-hidden bg-slate-50 border border-gray-100" style={{ height: 280 }}>
      <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`}>
        {/* Background */}
        <rect width={W} height={H} fill="#f8fafc" />
        {/* Grid */}
        {[...Array(8)].map((_, i) => (
          <line key={`gv${i}`} x1={i * W / 7} y1="0" x2={i * W / 7} y2={H} stroke="#e2e8f0" strokeWidth="1" />
        ))}
        {[...Array(5)].map((_, i) => (
          <line key={`gh${i}`} x1="0" y1={i * H / 4} x2={W} y2={i * H / 4} stroke="#e2e8f0" strokeWidth="1" />
        ))}
        {/* Roads */}
        <path d={`M0 ${H*0.5} Q${W*0.3} ${H*0.45} ${W*0.6} ${H*0.5} Q${W*0.8} ${H*0.55} ${W} ${H*0.5}`} stroke="#cbd5e1" strokeWidth="4" fill="none" />
        <path d={`M${W*0.35} 0 Q${W*0.37} ${H*0.5} ${W*0.35} ${H}`} stroke="#cbd5e1" strokeWidth="3" fill="none" />
        <path d={`M${W*0.6} 0 Q${W*0.62} ${H*0.5} ${W*0.6} ${H}`} stroke="#cbd5e1" strokeWidth="2" fill="none" />
        {/* Lake */}
        <path d={`M${W*0.88} 0 Q${W*0.94} ${H*0.3} ${W*0.96} ${H*0.6} Q${W*0.93} ${H*0.85} ${W*0.9} ${H} L${W} ${H} L${W} 0 Z`} fill="#dbeafe" opacity="0.6" />
        <text x={W*0.93} y="24" fill="#93c5fd" fontSize="9" fontWeight="500">Lake Michigan</text>
        {/* Area label */}
        <text x={W/2} y="20" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="600">Chicago Metropolitan Area</text>
        {/* Route trail */}
        {vehicle.status === 'running' && (
          <motion.path
            d={`M${x - 60} ${y + 20} Q${x - 20} ${y - 10} ${x} ${y}`}
            stroke={statusColor} strokeWidth="2" strokeDasharray="4,3" fill="none" opacity="0.5"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
        )}
        {/* Pulse ring */}
        <motion.circle cx={x} cy={y} r="28" fill={statusColor} opacity="0.08"
          animate={{ r: [22, 34, 22], opacity: [0.12, 0, 0.12] }}
          transition={{ duration: 2, repeat: Infinity }} />
        {/* Shadow */}
        <ellipse cx={x + 1} cy={y + 18} rx="10" ry="4" fill="#00000018" />
        {/* Pin */}
        <circle cx={x} cy={y} r="18" fill={statusColor} />
        <circle cx={x} cy={y} r="18" fill="none" stroke="white" strokeWidth="2.5" />
        <text x={x} y={y + 5} textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">
          {vehicle.id.split('-')[1]}
        </text>
      </svg>

      {/* Floating info chip */}
      <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg px-3 py-2 flex items-center gap-2">
        <MapPin className="w-4 h-4 text-emerald-500 flex-shrink-0" />
        <div>
          <p className="text-xs font-bold text-gray-800">{vehicle.location}</p>
          <p className="text-xs text-gray-400">Last updated: just now</p>
        </div>
      </div>
      <div className="absolute top-3 right-3">
        <StatusBadge status={vehicle.status} />
      </div>
    </div>
  );
}

// ── Donut chart for expense breakdown ────────────────────────────────────────
function ExpenseDonut({ charging, maintenance, insurance, misc, total }) {
  const segments = [
    { label: 'Charging',    value: charging,    color: '#3b82f6' },
    { label: 'Maintenance', value: maintenance, color: '#f59e0b' },
    { label: 'Insurance',   value: insurance,   color: '#8b5cf6' },
    { label: 'Misc',        value: misc,        color: '#6b7280' },
  ];
  const R = 54, cx = 70, cy = 70, stroke = 18;
  const circ = 2 * Math.PI * R;
  let cumPct = 0;

  return (
    <div className="flex items-center gap-6">
      <div className="relative flex-shrink-0">
        <svg width={140} height={140}>
          {/* Track */}
          <circle cx={cx} cy={cy} r={R} fill="none" stroke="#f3f4f6" strokeWidth={stroke} />
          {segments.map(seg => {
            const pct = total ? seg.value / total : 0;
            const dashLen = pct * circ;
            const offset = circ - cumPct * circ;
            cumPct += pct;
            return (
              <circle key={seg.label}
                cx={cx} cy={cy} r={R}
                fill="none" stroke={seg.color} strokeWidth={stroke}
                strokeDasharray={`${dashLen} ${circ - dashLen}`}
                strokeDashoffset={offset}
                strokeLinecap="butt"
                style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px` }}
              />
            );
          })}
          <text x={cx} y={cy - 6} textAnchor="middle" fontSize="11" fill="#374151" fontWeight="700">
            ₹{(total / 1000).toFixed(0)}k
          </text>
          <text x={cx} y={cy + 9} textAnchor="middle" fontSize="9" fill="#9ca3af">Total</text>
        </svg>
      </div>
      <div className="space-y-2 flex-1">
        {segments.map(seg => (
          <div key={seg.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: seg.color }} />
              <span className="text-xs text-gray-600">{seg.label}</span>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-gray-800">₹{seg.value.toLocaleString()}</span>
              <span className="text-xs text-gray-400 ml-1">({total ? Math.round(seg.value / total * 100) : 0}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function VehicleDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { vehicleList, driverList } = useApp();
  const [showAllHistory, setShowAllHistory] = useState(false);

  const vehicle = vehicleList.find(v => v.id === id);
  const driver  = driverList.find(d => d.vehicle === id);
  const expenses = vehicleExpenses[id] ?? { total: 0, charging: 0, maintenance: 0, insurance: 0, misc: 0, history: [] };

  if (!vehicle) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-gray-500 text-lg mb-4">Vehicle not found</p>
        <button onClick={() => navigate('/admin/fleet')} className="btn-primary">Back to Fleet</button>
      </div>
    );
  }

  const heroStats = [
    { label: 'Battery',        value: `${Math.round(vehicle.batteryPercent)}%`,       icon: Battery,    color: 'text-emerald-600' },
    { label: 'Battery Health', value: `${vehicle.batteryHealth}%`,                    icon: Activity,   color: vehicle.batteryHealth >= 85 ? 'text-emerald-600' : 'text-amber-600' },
    { label: 'Current Speed',  value: `${Math.round(vehicle.speed)} km/h`,            icon: Gauge,      color: 'text-blue-600' },
    { label: 'Range Left',     value: `${Math.round(vehicle.range)} km`,              icon: Route,      color: 'text-teal-600' },
    { label: 'Revenue',        value: `₹${vehicle.revenue.toLocaleString()}`,         icon: DollarSign, color: 'text-purple-600' },
    { label: 'Total Distance', value: `${vehicle.totalDistance.toLocaleString()} km`, icon: MapPin,     color: 'text-orange-600' },
  ];

  const expenseTypeColor = { Charging: 'bg-blue-100 text-blue-700', Maintenance: 'bg-amber-100 text-amber-700', Insurance: 'bg-purple-100 text-purple-700', Misc: 'bg-gray-100 text-gray-600' };
  const visibleHistory = showAllHistory ? expenses.history : expenses.history.slice(0, 4);

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Back */}
      <button
        onClick={() => navigate('/admin/fleet')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Fleet
      </button>

      {/* ── Hero card ────────────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card overflow-hidden p-0">
        <div className="relative h-56 overflow-hidden">
          <img src={vehicle.image} alt={vehicle.model} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          <div className="absolute bottom-4 left-6 text-white">
            <h1 className="text-3xl font-bold">{vehicle.model}</h1>
            <p className="text-gray-300 mt-1">{vehicle.manufacturer} · {vehicle.id}</p>
          </div>
          <div className="absolute top-4 right-4"><StatusBadge status={vehicle.status} /></div>
          <div className="absolute bottom-4 right-6">
            <BatteryRing percent={Math.round(vehicle.batteryPercent)} size={72} strokeWidth={6} />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-x divide-gray-100 border-t border-gray-100">
          {heroStats.map(s => (
            <div key={s.label} className="p-4 text-center">
              <s.icon className={`w-5 h-5 mx-auto mb-1 ${s.color}`} />
              <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-400">{s.label}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Row 1: Info + Driver ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Vehicle Info */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.08 }} className="card">
          <SectionHeader icon={Gauge} gradient="gradient-green" title="Vehicle Information" />
          <div className="space-y-3 mt-4">
            {[
              { label: 'Model',            value: vehicle.model },
              { label: 'Manufacturer',     value: vehicle.manufacturer },
              { label: 'Vehicle ID',       value: vehicle.id },
              { label: 'Battery Capacity', value: vehicle.batteryCapacity },
              { label: 'Current Location', value: vehicle.location },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-gray-50">
                <span className="text-sm text-gray-500">{item.label}</span>
                <span className="text-sm font-semibold text-gray-700">{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Driver Info */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="card">
          <SectionHeader icon={User} gradient="gradient-blue" title="Assigned Driver" />
          <div className="mt-4">
            {driver ? (
              <>
                <div className="flex items-center gap-4 mb-4 p-4 bg-gray-50 rounded-2xl">
                  <div className="w-14 h-14 gradient-green rounded-2xl flex items-center justify-center text-white font-bold text-lg">
                    {driver.avatar}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{driver.name}</p>
                    <p className="text-sm text-gray-500">{driver.id}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <ScoreItem label="Safety Score"  value={`${driver.safetyScore}%`}     good={driver.safetyScore >= 80} />
                  <ScoreItem label="Efficiency"    value={`${driver.efficiencyScore}%`} good={driver.efficiencyScore >= 80} />
                  <ScoreItem label="Total Trips"   value={driver.trips}  neutral />
                  <ScoreItem label="Avg Speed"     value={`${driver.avgSpeed} km/h`} neutral />
                </div>
              </>
            ) : (
              <p className="text-gray-400 text-sm">No driver currently assigned</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* ── Expenses ─────────────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card">
        <div className="flex items-start justify-between mb-6">
          <SectionHeader icon={CreditCard} gradient="gradient-teal" title="Expense Breakdown" />
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-800">₹{expenses.total.toLocaleString()}</p>
            <p className="text-xs text-gray-400">Total lifetime expenses</p>
          </div>
        </div>

        {/* Top 3 expense cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Charging Expenses',    value: expenses.charging,    icon: Zap,          color: 'bg-blue-50',   textColor: 'text-blue-700',   iconBg: 'bg-blue-100',   iconColor: 'text-blue-600' },
            { label: 'Maintenance Expenses', value: expenses.maintenance, icon: Wrench,        color: 'bg-amber-50',  textColor: 'text-amber-700',  iconBg: 'bg-amber-100',  iconColor: 'text-amber-600' },
            { label: 'Insurance',            value: expenses.insurance,   icon: TrendingDown,  color: 'bg-purple-50', textColor: 'text-purple-700', iconBg: 'bg-purple-100', iconColor: 'text-purple-600' },
          ].map(e => (
            <div key={e.label} className={`${e.color} rounded-2xl p-4`}>
              <div className={`w-9 h-9 ${e.iconBg} rounded-xl flex items-center justify-center mb-3`}>
                <e.icon className={`w-4 h-4 ${e.iconColor}`} />
              </div>
              <p className={`text-2xl font-bold ${e.textColor}`}>₹{e.value.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-0.5">{e.label}</p>
              <p className={`text-xs font-semibold ${e.textColor} mt-1`}>
                {expenses.total ? Math.round(e.value / expenses.total * 100) : 0}% of total
              </p>
            </div>
          ))}
        </div>

        {/* Donut + history side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-3">Distribution</p>
            <ExpenseDonut {...expenses} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-3">Recent Transactions</p>
            <div className="space-y-2">
              {visibleHistory.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${expenseTypeColor[item.type] ?? 'bg-gray-100 text-gray-600'}`}>
                      {item.type}
                    </span>
                    <span className="text-xs text-gray-500 truncate">{item.note}</span>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <p className="text-sm font-bold text-gray-800">-₹{item.amount}</p>
                    <p className="text-xs text-gray-400">{item.date}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            {expenses.history.length > 4 && (
              <button
                onClick={() => setShowAllHistory(!showAllHistory)}
                className="mt-3 w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 py-2 hover:bg-emerald-50 rounded-2xl transition-colors"
              >
                {showAllHistory ? <><ChevronUp className="w-3.5 h-3.5" /> Show less</> : <><ChevronDown className="w-3.5 h-3.5" /> Show all ({expenses.history.length})</>}
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── Live Location Map ─────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card">
        <div className="flex items-center justify-between mb-4">
          <SectionHeader icon={MapPin} gradient="gradient-blue" title="Live Location" />
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 font-medium">{vehicle.location}</span>
            <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-1.5">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-xs font-semibold text-emerald-700">Live</span>
            </div>
          </div>
        </div>
        <TomTomMap
          center={[vehicle.lat, vehicle.lng]}
          zoom={13}
          height={300}
          markers={[{ lat: vehicle.lat, lng: vehicle.lng, type: vehicle.status === 'charging' ? 'charging' : 'vehicle', label: vehicle.id.split('-')[1], popup: `${vehicle.model} · ${vehicle.location}` }]}
        />
      </motion.div>

      {/* ── Row 3: Service + Maintenance ─────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="card">
          <SectionHeader icon={Calendar} gradient="gradient-purple" title="Service History" />
          <div className="space-y-2 mt-4">
            {vehicle.serviceHistory.map((s, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
                <div className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0" />
                <span className="text-sm text-gray-600">{s}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }} className="card">
          <SectionHeader icon={Wrench} gradient="gradient-orange" title="Maintenance Records" />
          <div className="space-y-2 mt-4">
            {vehicle.maintenanceRecords.map((m, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-amber-50 rounded-2xl border border-amber-100">
                <div className="w-2 h-2 bg-amber-500 rounded-full flex-shrink-0" />
                <span className="text-sm text-amber-700">{m}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function SectionHeader({ icon: Icon, gradient, title }) {
  return (
    <h3 className="font-bold text-gray-800 flex items-center gap-2">
      <div className={`w-8 h-8 ${gradient} rounded-xl flex items-center justify-center flex-shrink-0`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      {title}
    </h3>
  );
}

function ScoreItem({ label, value, good, neutral }) {
  return (
    <div className={`p-3 rounded-2xl text-center ${neutral ? 'bg-gray-50' : good ? 'bg-emerald-50' : 'bg-amber-50'}`}>
      <p className={`text-lg font-bold ${neutral ? 'text-gray-700' : good ? 'text-emerald-700' : 'text-amber-700'}`}>{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}
