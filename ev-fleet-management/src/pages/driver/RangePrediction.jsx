import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cpu, Car, Zap, Battery, Activity, Gauge, Target, CheckCircle,
  AlertCircle, Loader, MousePointer, X, PlugZap, Route,
  TrendingUp, Thermometer, ChevronDown,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import TomTomMap, { geocodeAddress, reverseGeocode } from '../../components/map/TomTomMap';
import StatusBadge from '../../components/shared/StatusBadge';

const BACKEND      = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
const INDIA_CENTER = [20.5937, 78.9629];

const confidenceStyle = (level) => ({
  High:   'bg-emerald-50 text-emerald-700 border-emerald-200',
  Medium: 'bg-amber-50  text-amber-700  border-amber-200',
  Low:    'bg-red-50    text-red-700    border-red-200',
}[level] || 'bg-gray-50 text-gray-600 border-gray-200');

// All known Indian EV models with static specs
const MODEL_LIST = [
  { name: 'Creta EV',         manufacturer: 'Hyundai',  capacity: 45.0,  weight: 1577 },
  { name: 'Ioniq 5',          manufacturer: 'Hyundai',  capacity: 72.6,  weight: 1910 },
  { name: 'Carens Clavis EV', manufacturer: 'Kia',      capacity: 51.4,  weight: 1690 },
  { name: 'EV6',              manufacturer: 'Kia',      capacity: 77.4,  weight: 1960 },
  { name: 'EV9',              manufacturer: 'Kia',      capacity: 99.8,  weight: 2585 },
  { name: 'Comet EV',         manufacturer: 'MG',       capacity: 17.3,  weight:  950 },
  { name: 'Windsor EV',       manufacturer: 'MG',       capacity: 38.0,  weight: 1580 },
  { name: 'ZS EV',            manufacturer: 'MG',       capacity: 50.3,  weight: 1592 },
  { name: 'BE 6',             manufacturer: 'Mahindra', capacity: 59.0,  weight: 1890 },
  { name: 'XEV 9e',           manufacturer: 'Mahindra', capacity: 79.0,  weight: 2070 },
  { name: 'XUV400 EV',        manufacturer: 'Mahindra', capacity: 39.4,  weight: 1528 },
  { name: 'Curvv EV',         manufacturer: 'Tata',     capacity: 55.0,  weight: 1680 },
  { name: 'Nexon EV',         manufacturer: 'Tata',     capacity: 40.5,  weight: 1445 },
  { name: 'Punch EV',         manufacturer: 'Tata',     capacity: 35.0,  weight: 1315 },
  { name: 'Tiago EV',         manufacturer: 'Tata',     capacity: 24.0,  weight: 1150 },
];

function findModel(name) {
  if (!name) return null;
  return MODEL_LIST.find(m => m.name.toLowerCase() === name.toLowerCase())
      || MODEL_LIST.find(m => name.toLowerCase().includes(m.name.toLowerCase()))
      || null;
}

export default function RangePrediction() {
  const { user, driverList, vehicleList } = useApp();
  const myDriver  = driverList.find(d => d.profileId === user?.id)
                 || driverList.find(d => d.name      === user?.name);
  const myVehicle = vehicleList.find(v => v.id === myDriver?.vehicle);

  // ── User-editable inputs (pre-filled from DB, fully editable) ────────────
  const defaultModel = myVehicle ? (findModel(myVehicle.model)?.name || '') : '';
  const [selectedModel,  setSelectedModel]  = useState(defaultModel);
  const [batteryPct,     setBatteryPct]     = useState(myVehicle ? Math.round(myVehicle.batteryPercent) : 80);
  const [batteryHealth,  setBatteryHealth]  = useState(myVehicle ? myVehicle.batteryHealth            : 95);
  const [speedKmh,       setSpeedKmh]       = useState(myVehicle ? Math.round(myVehicle.speed)        : 40);
  const [chargeCycles,   setChargeCycles]   = useState(150);
  const [odometer,       setOdometer]       = useState(myVehicle ? Math.round(myVehicle.totalDistance): 10000);
  const [roadType,       setRoadType]       = useState('City');

  // Sync defaults when vehicle loads (first render may be before data arrives)
  useEffect(() => {
    if (!myVehicle) return;
    if (!selectedModel) setSelectedModel(findModel(myVehicle.model)?.name || '');
    setBatteryPct(Math.round(myVehicle.batteryPercent));
    setBatteryHealth(myVehicle.batteryHealth);
    setSpeedKmh(Math.round(myVehicle.speed));
    setOdometer(Math.round(myVehicle.totalDistance));
  }, [myVehicle?.id]);

  const modelSpec = findModel(selectedModel);

  // ── Route / map state ─────────────────────────────────────────────────────
  const [srcText,      setSrcText]     = useState('');
  const [dstText,      setDstText]     = useState('');
  const [srcCoord,     setSrcCoord]    = useState(null);
  const [dstCoord,     setDstCoord]    = useState(null);
  const [geocoding,    setGeocoding]   = useState({ src: false, dst: false });
  const [pickingField, setPickingField]= useState(null);
  const [mapCenter,    setMapCenter]   = useState(INDIA_CENTER);
  const [mapZoom,      setMapZoom]     = useState(5);

  // ── Result state ──────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState(null);
  const [error,   setError]   = useState(null);

  const geocodeField = useCallback(async (field) => {
    const text = field === 'src' ? srcText : dstText;
    if (!text.trim()) return;
    setGeocoding(g => ({ ...g, [field]: true }));
    const res = await geocodeAddress(text + ', India');
    setGeocoding(g => ({ ...g, [field]: false }));
    if (!res) return;
    if (field === 'src') { setSrcCoord(res); setSrcText(res.display || text); }
    else                 { setDstCoord(res); setDstText(res.display || text); }
    setMapCenter([res.lat, res.lng]);
    setMapZoom(11);
    setResult(null);
  }, [srcText, dstText]);

  const handleMapClick = useCallback(async (lat, lng) => {
    if (!pickingField) return;
    const address = await reverseGeocode(lat, lng);
    const coord = { lat, lng, display: address };
    if (pickingField === 'src') { setSrcCoord(coord); setSrcText(address); }
    else                        { setDstCoord(coord); setDstText(address); }
    setPickingField(null);
    setResult(null);
  }, [pickingField]);

  const handlePredict = async (e) => {
    e.preventDefault();
    if (!modelSpec) { setError('Please select a vehicle model.'); return; }
    setError(null);
    setLoading(true);
    setResult(null);

    const payload = {
      vehicle_id:      myVehicle?.id || 'manual',
      model:           selectedModel,
      manufacturer:    modelSpec.manufacturer,
      battery_percent: batteryPct,
      battery_health:  batteryHealth,
      speed:           speedKmh,
      total_distance:  odometer,
      road_type:       roadType,
      charge_cycles:   chargeCycles,
      ...(srcCoord && dstCoord ? {
        origin_lat: srcCoord.lat, origin_lng: srcCoord.lng,
        dest_lat:   dstCoord.lat, dest_lng:   dstCoord.lng,
      } : {}),
    };

    try {
      const res = await fetch(`${BACKEND}/api/predict`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail || 'Prediction failed');
      }
      const data = await res.json();
      setResult(data);
      if (data.route_coordinates?.length) {
        const mid = data.route_coordinates[Math.floor(data.route_coordinates.length / 2)];
        setMapCenter([mid.lat, mid.lng]);
        setMapZoom(8);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const markers = [
    ...(srcCoord ? [{ lat: srcCoord.lat, lng: srcCoord.lng, type: 'origin',      label: 'A', popup: srcText || 'Source'      }] : []),
    ...(dstCoord ? [{ lat: dstCoord.lat, lng: dstCoord.lng, type: 'destination', label: 'B', popup: dstText || 'Destination' }] : []),
    ...(result?.charging_stations || []).map(s => ({ lat: s.lat, lng: s.lng, type: 'charging', label: '⚡', popup: s.name })),
    ...(result?.recommended_stops || []).map(stop => ({
      lat: stop.station.lat, lng: stop.station.lng,
      type: 'charging', label: '★', popup: `Recommended: ${stop.station.name}`,
    })),
  ];

  const mapRoute = result?.route_coordinates?.length && srcCoord && dstCoord
    ? { from: [srcCoord.lat, srcCoord.lng], to: [dstCoord.lat, dstCoord.lng] }
    : null;

  return (
    <div className="space-y-6 max-w-7xl">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Range Prediction</h2>
        <p className="text-gray-500 text-sm mt-1">ML-powered · enter your vehicle details to predict remaining range</p>
        {myVehicle && (
          <p className="text-xs text-gray-400 mt-1">
            Fields pre-filled from your assigned vehicle (<strong>{myVehicle.model}</strong>) — edit any value before predicting.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 items-start">

        {/* ── Input form ── */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
          className="xl:col-span-2 card space-y-4">

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 gradient-teal rounded-xl flex items-center justify-center">
              <Cpu className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">Vehicle Parameters</h3>
              <p className="text-xs text-gray-400">All fields are editable</p>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-2xl">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-700 font-medium">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handlePredict} className="space-y-4">

            {/* Car Model — user selects */}
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
                <Car className="w-3 h-3" /> Car Model
              </label>
              <div className="relative">
                <select value={selectedModel} onChange={e => setSelectedModel(e.target.value)}
                  required className="input-field appearance-none pr-10 text-sm">
                  <option value="">Select model…</option>
                  {MODEL_LIST.map(m => (
                    <option key={m.name} value={m.name}>{m.manufacturer} {m.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              {modelSpec && (
                <p className="text-xs text-gray-400 mt-1 pl-1">
                  {modelSpec.capacity} kWh · {modelSpec.weight} kg
                </p>
              )}
            </div>

            {/* Battery Level */}
            <NumberField
              icon={<Battery className="w-3 h-3" />}
              label="Battery Level"
              value={batteryPct} min={0} max={100} step={1} suffix="%"
              onChange={setBatteryPct}
            />

            {/* Battery Health */}
            <NumberField
              icon={<Activity className="w-3 h-3" />}
              label="Battery Health (SOH)"
              value={batteryHealth} min={0} max={100} step={0.1} suffix="%"
              onChange={v => setBatteryHealth(v === '' ? '' : parseFloat(v))}
            />

            {/* Speed */}
            <NumberField
              icon={<Gauge className="w-3 h-3" />}
              label="Current Speed"
              value={speedKmh} min={0} max={200} step={1} suffix="km/h"
              onChange={setSpeedKmh}
            />

            {/* Charge Cycles */}
            <NumberField
              icon={<Zap className="w-3 h-3" />}
              label="Charge Cycles"
              value={chargeCycles} min={0} max={3000} step={1}
              onChange={setChargeCycles}
            />

            {/* Odometer — number input */}
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1"><Route className="w-3 h-3" /> Odometer (km)</span>
                <span className="font-bold text-amber-600">{Number(odometer).toLocaleString()} km</span>
              </label>
              <input type="number" min={0} max={500000} step={100}
                onKeyDown={e => {
                  if (['-', '+', 'e', 'E'].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                value={odometer}
                onChange={e => {
                  if (e.target.value === '') {
                    setOdometer('');
                    return;
                  }
                  let val = Number(e.target.value);
                  if (val > 500000) val = 500000;
                  if (val < 0) val = 0;
                  setOdometer(val);
                }}
                className="input-field text-sm" />
            </div>

            {/* Road type */}
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-2 block">Road Type</label>
              <div className="grid grid-cols-2 gap-2">
                {[{ key: 'City', label: '🏙️ City Road' }, { key: 'Highway', label: '🛣️ Highway' }].map(t => (
                  <button key={t.key} type="button" onClick={() => setRoadType(t.key)}
                    className={`py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                      roadType === t.key
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                        : 'bg-gray-50 text-gray-600 border border-gray-200 hover:border-emerald-300'
                    }`}>
                    {t.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-1 pl-1">TomTom overrides this when a route is detected.</p>
            </div>

            {/* Source */}
            <LocationInput label="Source (optional)" dotColor="bg-emerald-500"
              value={srcText} coord={srcCoord} loading={geocoding.src} isPicking={pickingField === 'src'}
              onChange={v => { setSrcText(v); setSrcCoord(null); setResult(null); }}
              onBlur={() => geocodeField('src')}
              onClear={() => { setSrcText(''); setSrcCoord(null); setResult(null); }}
              onFocus={() => setPickingField('src')} />

            {/* Destination */}
            <LocationInput label="Destination (optional)" dotColor="bg-red-500"
              value={dstText} coord={dstCoord} loading={geocoding.dst} isPicking={pickingField === 'dst'}
              onChange={v => { setDstText(v); setDstCoord(null); setResult(null); }}
              onBlur={() => geocodeField('dst')}
              onClear={() => { setDstText(''); setDstCoord(null); setResult(null); }}
              onFocus={() => setPickingField('dst')} />

            <motion.button type="submit" disabled={loading || !selectedModel} whileTap={{ scale: 0.97 }}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
              {loading
                ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"/>Predicting…</>
                : <><Cpu className="w-4 h-4"/>Predict Range</>}
            </motion.button>
          </form>
        </motion.div>

        {/* ── Map ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="xl:col-span-3 rounded-3xl overflow-hidden shadow-card border border-gray-100"
          style={{ height: 560 }}>
          <TomTomMap center={mapCenter} zoom={mapZoom} height={560}
            markers={markers} route={mapRoute}
            onMapClick={handleMapClick}
            pickingMode={!!pickingField}
            pickingField={pickingField === 'src' ? 'from' : pickingField === 'dst' ? 'to' : null} />
        </motion.div>
      </div>

      {/* ── Results ── */}
      <AnimatePresence mode="wait">
        {loading && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="card flex flex-col items-center justify-center py-16 gap-4">
            <div className="w-16 h-16 gradient-teal rounded-full flex items-center justify-center shadow-xl">
              <Cpu className="w-8 h-8 text-white animate-pulse" />
            </div>
            <p className="font-semibold text-gray-700">Running ML model…</p>
            <div className="flex gap-1">
              {[0, 1, 2].map(i => (
                <motion.div key={i} className="w-2 h-2 bg-emerald-400 rounded-full"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }} />
              ))}
            </div>
          </motion.div>
        )}

        {result && !loading && (
          <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="space-y-5">

            {/* Hero banner */}
            <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500 rounded-3xl p-6 text-white">
              <p className="text-emerald-100 text-sm mb-1 font-medium">
                ML Predicted Remaining Range · {result.model} · {result.manufacturer}
              </p>
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <div className="text-6xl font-bold">
                    {result.predicted_range_km}
                    <span className="text-3xl text-emerald-200 ml-2">km</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${confidenceStyle(result.confidence_level)}`}>
                      {result.confidence_level} Confidence · {result.confidence_score}%
                    </span>
                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-medium">
                      {result.route_road_type || result.road_type} Road
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  {[
                    { label: 'Effective Mileage', value: `${result.effective_mileage} km`     },
                    { label: 'Battery',           value: `${result.battery_percent}%`          },
                    { label: 'Health (SOH)',       value: `${result.battery_health}%`           },
                    { label: 'Batt. Temp',         value: `${result.battery_temp_c} °C`        },
                    ...(result.route_distance_km ? [{ label: 'Trip Distance', value: `${result.route_distance_km} km` }] : []),
                    ...(result.route_duration    ? [{ label: 'Duration',      value: result.route_duration            }] : []),
                  ].map(s => (
                    <div key={s.label} className="bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-3 text-center min-w-[90px]">
                      <p className="text-lg font-bold">{s.value}</p>
                      <p className="text-emerald-100 text-xs mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Detail grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { icon: <Battery     className="w-4 h-4"/>, label: 'Battery',      value: `${result.battery_percent}%`,                           color: 'bg-emerald-50 text-emerald-700' },
                { icon: <Activity    className="w-4 h-4"/>, label: 'Health (SOH)', value: `${result.battery_health}%`,                            color: 'bg-blue-50    text-blue-700'    },
                { icon: <Gauge       className="w-4 h-4"/>, label: 'Speed',        value: `${result.speed} km/h`,                                 color: 'bg-purple-50  text-purple-700'  },
                { icon: <Route       className="w-4 h-4"/>, label: 'Odometer',     value: `${Number(result.total_distance).toLocaleString()} km`, color: 'bg-amber-50   text-amber-700'   },
                { icon: <Thermometer className="w-4 h-4"/>, label: 'Batt. Temp',  value: `${result.battery_temp_c} °C`,                          color: 'bg-orange-50  text-orange-700'  },
                { icon: <Zap         className="w-4 h-4"/>, label: 'Capacity',     value: `${result.battery_capacity_kwh} kWh`,                   color: 'bg-teal-50    text-teal-700'    },
                { icon: <Zap         className="w-4 h-4"/>, label: 'Charge Cycles', value: `${result.charge_cycles || chargeCycles}`,             color: 'bg-indigo-50  text-indigo-700'  },
                { icon: <Target      className="w-4 h-4"/>, label: 'Confidence',   value: `${result.confidence_score}%`,                          color: 'bg-pink-50    text-pink-700'    },
              ].map(s => (
                <div key={s.label} className={`rounded-2xl p-3 flex items-start gap-2 ${s.color}`}>
                  <div className="mt-0.5 flex-shrink-0">{s.icon}</div>
                  <div>
                    <p className="text-xs font-medium opacity-60 leading-none">{s.label}</p>
                    <p className="text-sm font-bold mt-1 leading-none">{s.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Trip feasibility */}
            {result.can_complete_trip !== undefined && (
              <div className={`rounded-2xl p-4 border flex items-start gap-3 ${
                result.can_complete_trip ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                {result.can_complete_trip
                  ? <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5"/>
                  : <AlertCircle className="w-5 h-5 text-amber-500  flex-shrink-0 mt-0.5"/>}
                <div>
                  <p className={`font-semibold text-sm ${result.can_complete_trip ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {result.can_complete_trip
                      ? '✓ Trip possible without charging'
                      : `⚠ Charging required — ${result.stops_needed} stop${result.stops_needed !== 1 ? 's' : ''} needed`}
                  </p>
                  {result.consumed_pct !== undefined && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      Battery consumed: {result.consumed_pct}% · Remaining on arrival: {result.remaining_battery_pct}%
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Recommended stops */}
            {result.recommended_stops?.length > 0 && (
              <div className="card">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <PlugZap className="w-4 h-4 text-blue-500"/> Recommended Charging Stops
                </h3>
                <div className="space-y-3">
                  {result.recommended_stops.map((stop, i) => (
                    <motion.div key={stop.station.id || i}
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07 }}
                      className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                      <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 text-sm">{stop.station.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5 truncate">{stop.station.address}</p>
                        <div className="flex items-center gap-3 mt-1.5 flex-wrap text-xs">
                          <span className="text-blue-700 font-medium">{stop.distance_from_start_km} km from start</span>
                          <span className="text-gray-400">{stop.station.power_kw} kW</span>
                          <span className="text-gray-400">{stop.station.connector_types.join(', ')}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* All stations */}
            {result.charging_stations?.length > 0 && (
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-500"/> Charging Stations Along Route
                  </h3>
                  <span className="text-xs text-gray-400">{result.charging_stations.length} found</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1">
                  {result.charging_stations.map((s, i) => (
                    <motion.div key={s.id || i}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="flex items-start gap-3 p-3 bg-gray-50 rounded-2xl">
                      <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Zap className="w-4 h-4 text-blue-600"/>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-800 text-xs truncate">{s.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5 truncate">{s.address}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-blue-600 font-medium">{s.power_kw} kW</span>
                          <span className="text-xs text-gray-400">{s.operator}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function NumberField({ icon, label, value, min, max, step, suffix, onChange }) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
        {icon} {label} {suffix && `(${suffix.trim()})`}
      </label>
      <input type="number" min={min} max={max} step={step} value={value}
        onKeyDown={e => {
          if (['-', '+', 'e', 'E'].includes(e.key)) {
            e.preventDefault();
          }
        }}
        onChange={e => {
          if (e.target.value === '') {
            onChange('');
            return;
          }
          let val = Number(e.target.value);
          if (max !== undefined && val > max) val = max;
          if (min !== undefined && val < min) val = min;
          onChange(val);
        }}
        className="input-field text-sm" />
    </div>
  );
}

function LocationInput({ label, dotColor, value, coord, loading, isPicking, onChange, onBlur, onClear, onFocus }) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-500 mb-1.5 block">{label}</label>
      <div className="relative">
        <div className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full ${dotColor}`}/>
        <input type="text" placeholder="Type address or click map…"
          value={value} onChange={e => onChange(e.target.value)}
          onBlur={onBlur} onKeyDown={e => e.key === 'Enter' && onBlur()}
          onFocus={onFocus}
          className={`input-field pl-9 pr-10 text-sm transition-all ${isPicking ? 'border-emerald-500 ring-2 ring-emerald-100' : ''}`}/>
        {loading
          ? <Loader className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400 animate-spin"/>
          : value && (
              <button type="button" onClick={onClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-red-400">
                <X className="w-3.5 h-3.5"/>
              </button>
            )}
      </div>
      {isPicking && (
        <p className="text-[10px] text-emerald-600 font-semibold mt-1 animate-pulse">
          🎯 Click on the map to pin this location
        </p>
      )}
      {coord && (
        <p className={`text-xs mt-1 pl-1 font-medium truncate ${dotColor === 'bg-emerald-500' ? 'text-emerald-600' : 'text-red-500'}`}>
          ✓ {coord.display || `${coord.lat.toFixed(4)}, ${coord.lng.toFixed(4)}`}
        </p>
      )}
    </div>
  );
}
