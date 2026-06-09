import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Maximize2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import TomTomMap from './TomTomMap';

const statusColors = {
  running:  '#10b981',
  charging: '#3b82f6',
  idle:     '#f59e0b',
  workshop: '#ef4444',
};

const statusTypeMap = {
  running:  'vehicle',
  charging: 'charging',
  idle:     'vehicle',
  workshop: 'vehicle',
};

export default function LiveMapSection({ filteredVehicles }) {
  const { vehicleList } = useApp();
  const displayVehicles = filteredVehicles ?? vehicleList;
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  // Build markers for TomTomMap
  const markers = displayVehicles.map(v => ({
    lat:   v.lat,
    lng:   v.lng,
    type:  statusTypeMap[v.status] || 'vehicle',
    label: v.id.split('-')[1],
    popup: `${v.model} | ${v.driver} | 🔋${Math.round(v.batteryPercent)}%`,
  }));

  // Center on India with zoom level showing all vehicles
  const avgLat = displayVehicles.length
    ? displayVehicles.reduce((s, v) => s + v.lat, 0) / displayVehicles.length
    : 20.5937;
  const avgLng = displayVehicles.length
    ? displayVehicles.reduce((s, v) => s + v.lng, 0) / displayVehicles.length
    : 78.9629;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="card"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Live Fleet Map</h3>
          <p className="text-sm text-gray-500">
            Real-time vehicle locations · {displayVehicles.length} vehicle{displayVehicles.length !== 1 ? 's' : ''} shown
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleRefresh} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <RefreshCw className={`w-4 h-4 text-gray-500 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <Maximize2 className="w-4 h-4 text-gray-500" />
          </button>
          <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-1.5">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs font-semibold text-emerald-700">Live</span>
          </div>
        </div>
      </div>

      {/* TomTom Map */}
      <TomTomMap
        center={[avgLat, avgLng]}
        zoom={displayVehicles.length === 1 ? 13 : 5}
        height={400}
        markers={markers}
        className="w-full"
      />

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 mt-4">
        {Object.entries(statusColors).map(([status, color]) => (
          <div key={status} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-xs text-gray-500 capitalize">{status}</span>
          </div>
        ))}
        <span className="text-xs text-gray-400 ml-auto">Click pins for details</span>
      </div>
    </motion.div>
  );
}
