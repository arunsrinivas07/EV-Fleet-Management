import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Gauge, IndianRupee, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BatteryRing from '../shared/BatteryRing';
import StatusBadge from '../shared/StatusBadge';

export default function VehicleCard({ vehicle: v, delay = 0 }) {
  const navigate = useNavigate();

  const getBatteryHealthColor = (h) => {
    if (h >= 90) return 'text-emerald-600 bg-emerald-50';
    if (h >= 75) return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onClick={() => navigate(`/admin/vehicle/${v.id}`)}
      className="bg-white rounded-3xl overflow-hidden shadow-card border border-gray-100 cursor-pointer group"
    >
      {/* Vehicle image */}
      <div className="relative h-40 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
        <img
          src={v.image}
          alt={v.model}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={e => { e.target.style.display = 'none'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

        {/* Status badge overlay */}
        <div className="absolute top-3 left-3">
          <StatusBadge status={v.status} />
        </div>

        {/* Battery ring overlay */}
        <div className="absolute top-2 right-3">
          <BatteryRing percent={Math.round(v.batteryPercent)} size={56} strokeWidth={5} />
        </div>

        {/* Charging indicator */}
        {v.isCharging && (
          <motion.div
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute bottom-3 right-3 bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
          >
            ⚡ Charging
          </motion.div>
        )}
      </div>

      {/* Card content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-bold text-gray-800 text-sm leading-tight">{v.model}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{v.id}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold text-emerald-600">{v.driver}</p>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <StatItem icon={MapPin} label="Location" value={v.location} small />
          <StatItem icon={Navigation} label="Range" value={`${Math.round(v.range)} km`} />
          <StatItem icon={Gauge} label="Speed" value={`${Math.round(v.speed)} km/h`} />
          <StatItem icon={IndianRupee} label="Revenue" value={`₹${v.revenue.toLocaleString()}`} />
        </div>

        {/* Battery health */}
        <div className={`flex items-center justify-between px-3 py-2 rounded-2xl text-xs font-semibold ${getBatteryHealthColor(v.batteryHealth)}`}>
          <span>Battery Health</span>
          <span>{v.batteryHealth}%</span>
        </div>
      </div>
    </motion.div>
  );
}

function StatItem({ icon: Icon, label, value, small }) {
  return (
    <div className="bg-gray-50 rounded-xl p-2 flex items-center gap-2">
      <Icon className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-gray-400">{label}</p>
        <p className={`font-semibold text-gray-700 truncate ${small ? 'text-xs' : 'text-xs'}`}>{value}</p>
      </div>
    </div>
  );
}
