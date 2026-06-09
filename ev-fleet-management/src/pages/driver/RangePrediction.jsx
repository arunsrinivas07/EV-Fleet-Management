import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Navigation, Zap, Battery, Users, MapPin, ChevronDown,
  Cpu, Target, AlertCircle, CheckCircle, Search, Loader, MousePointer, X,
} from 'lucide-react';
import { evModels, cities } from '../../data/mockData';
import TomTomMap, { geocodeAddress, reverseGeocode } from '../../components/map/TomTomMap';

const INDIA_CENTER = [20.5937, 78.9629];

const initialForm = {
  model: '', city: '', roadType: 'city',
  source: '', destination: '',
  batteryPercent: 80, batteryHealth: 95, passengerLoad: 1,
};

function calcPrediction(form) {
  const baseRange = {
    'Tata Nexon EV Max': 437, 'Tata Nexon EV Prime': 312, 'Tata Tigor EV': 306,
    'Tata Punch EV': 421, 'MG ZS EV': 461, 'MG Comet EV': 230,
    'Hyundai Ioniq 5': 631, 'Hyundai Kona Electric': 452, 'Kia EV6': 708,
    'BYD Atto 3': 521, 'BYD Seal': 650, 'Mahindra XUV400': 456,
    'Mahindra BE 6e': 535, 'Ola S1 Pro': 195, 'Ola S1 Air': 151,
    'Volvo XC40 Recharge': 418, 'BMW iX1': 440, 'Citroen eC3': 320,
  };
  const base            = baseRange[form.model] || 480;
  const batteryFactor   = form.batteryPercent / 100;
  const healthFactor    = form.batteryHealth  / 100;
  const roadFactor      = form.roadType === 'highway' ? 0.88 : 0.95;
  const passengerFactor = 1 - (form.passengerLoad - 1) * 0.03;
  const range           = Math.round(base * batteryFactor * healthFactor * roadFactor * passengerFactor);
  const batteryUsed     = Math.min(form.batteryPercent - 5, Math.round(form.batteryPercent * (1 - (range / base))));
  const confidence      = Math.min(98, Math.round(85 + (form.batteryHealth - 80) * 0.3 + (form.batteryPercent > 50 ? 5 : 0)));
const estimatedMinutes = Math.round(
  (range / (form.roadType === 'highway' ? 90 : 45)) * 60
);

return {
  range,
  batteryUsed: Math.max(1, batteryUsed),
  chargingStops: range < 100 ? 1 : 0,
  confidence,
  estimatedTime:
    estimatedMinutes >= 60
      ? `${Math.floor(estimatedMinutes / 60)} hr ${estimatedMinutes % 60} min`
      : `${estimatedMinutes} min`,
};
}
export default function RangePrediction() {
  const [form,         setForm]         = useState(initialForm);
  const [result,       setResult]       = useState(null);
  const [loading,      setLoading]      = useState(false);
  const [srcCoord,     setSrcCoord]     = useState(null);
  const [dstCoord,     setDstCoord]     = useState(null);
  const [geocoding,    setGeocoding]    = useState({ src: false, dst: false });
  const [pickingField, setPickingField] = useState(null); // null | 'src' | 'dst'
  const [mapCenter,    setMapCenter]    = useState(INDIA_CENTER);
  const [mapZoom,      setMapZoom]      = useState(5);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  // ── Geocode manual text ───────────────────────────────────────────────────
  const geocodeField = useCallback(async (field) => {
    const text = field === 'src' ? form.source : form.destination;
    if (!text.trim()) return;
    setGeocoding(g => ({ ...g, [field]: true }));
    const res = await geocodeAddress(text + ', India');
    setGeocoding(g => ({ ...g, [field]: false }));
    if (!res) return;
    if (field === 'src') { setSrcCoord(res); set('source', res.display || text); }
    else                 { setDstCoord(res); set('destination', res.display || text); }
    setMapCenter([res.lat, res.lng]);
    setMapZoom(11);
  }, [form.source, form.destination]);

  // ── Handle map click ──────────────────────────────────────────────────────
  const handleMapClick = useCallback(async (lat, lng) => {
    if (!pickingField) return;
    const address = await reverseGeocode(lat, lng);
    const coord   = { lat, lng, display: address };
    if (pickingField === 'src') { setSrcCoord(coord); set('source', address); }
    else                        { setDstCoord(coord); set('destination', address); }
    setPickingField(null);
    setMapCenter([lat, lng]);
    setMapZoom(12);
    setResult(null);
  }, [pickingField]);

  const handlePredict = (e) => {
    e.preventDefault();
    if (!form.model || !form.city) return;
    setLoading(true);
    setResult(null);
    // Update map center to src or dst if available
    if (srcCoord) { setMapCenter([srcCoord.lat, srcCoord.lng]); setMapZoom(11); }
    setTimeout(() => { setResult(calcPrediction(form)); setLoading(false); }, 1500);
  };

  // Map markers
  const markers = [
    ...(srcCoord ? [{ lat: srcCoord.lat, lng: srcCoord.lng, type: 'origin',      label: 'A', popup: form.source      || 'Source'      }] : []),
    ...(dstCoord ? [{ lat: dstCoord.lat, lng: dstCoord.lng, type: 'destination', label: 'B', popup: form.destination || 'Destination' }] : []),
  ];

  const route = result && srcCoord && dstCoord
    ? { from: [srcCoord.lat, srcCoord.lng], to: [dstCoord.lat, dstCoord.lng] }
    : null;

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Range Prediction</h2>
        <p className="text-gray-500 text-sm mt-1">
          AI-powered range estimate · Type locations or <span className="font-semibold text-emerald-600">click 📍 Pick on Map</span>
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* ── Form ── */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="xl:col-span-1 card h-fit">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 gradient-teal rounded-xl flex items-center justify-center">
              <Cpu className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-bold text-gray-800">Trip Parameters</h3>
          </div>

          <form onSubmit={handlePredict} className="space-y-4">
            {/* EV Model */}
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">EV Model</label>
              <div className="relative">
                <select value={form.model} onChange={e => set('model', e.target.value)} className="input-field appearance-none pr-10 text-sm" required>
                  <option value="">Select Indian EV Model</option>
                  {evModels.map(m => <option key={m}>{m}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* City */}
            {/* <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">City</label>
              <div className="relative">
                <select value={form.city} onChange={e => set('city', e.target.value)} className="input-field appearance-none pr-10 text-sm" required>
                  <option value="">Select City</option>
                  {cities.map(c => <option key={c}>{c}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div> */}

            {/* Road Type */}
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Road Type</label>
              <div className="grid grid-cols-2 gap-2">
                {[{ key: 'city', label: '🏙️ City Road' }, { key: 'highway', label: '🛣️ Highway' }].map(t => (
                  <button key={t.key} type="button" onClick={() => set('roadType', t.key)}
                    className={`py-2.5 rounded-2xl text-sm font-semibold transition-all ${form.roadType === t.key ? 'bg-emerald-600 text-white shadow-md' : 'bg-gray-50 text-gray-600 border border-gray-200 hover:border-emerald-300'}`}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Source — manual + map pick */}
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Source Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
                <input
                  type="text"
                  placeholder="Type or pick on map…"
                  value={form.source}
                  onChange={e => { set('source', e.target.value); setSrcCoord(null); setResult(null); }}
                  onBlur={() => geocodeField('src')}
                  onKeyDown={e => e.key === 'Enter' && geocodeField('src')}
                  className="input-field pl-9 pr-10 text-sm"
                />
                {geocoding.src
                  ? <Loader className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400 animate-spin" />
                  : form.source && <button type="button" onClick={() => { set('source',''); setSrcCoord(null); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-red-400"><X className="w-3.5 h-3.5"/></button>
                }
              </div>
              <button
                type="button"
                onClick={() => setPickingField(f => f === 'src' ? null : 'src')}
                className={`mt-1.5 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${pickingField === 'src' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-emerald-300 hover:text-emerald-600'}`}
              >
                <MousePointer className="w-3 h-3" />
                {pickingField === 'src' ? 'Click map to pick…' : '📍 Pick Source on Map'}
              </button>
              {srcCoord && <p className="text-xs text-emerald-600 mt-1 pl-1 font-medium">✓ {srcCoord.display || `${srcCoord.lat.toFixed(4)}, ${srcCoord.lng.toFixed(4)}`}</p>}
            </div>

            {/* Destination — manual + map pick */}
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Destination Location</label>
              <div className="relative">
                <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-400" />
                <input
                  type="text"
                  placeholder="Type or pick on map…"
                  value={form.destination}
                  onChange={e => { set('destination', e.target.value); setDstCoord(null); setResult(null); }}
                  onBlur={() => geocodeField('dst')}
                  onKeyDown={e => e.key === 'Enter' && geocodeField('dst')}
                  className="input-field pl-9 pr-10 text-sm"
                />
                {geocoding.dst
                  ? <Loader className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400 animate-spin" />
                  : form.destination && <button type="button" onClick={() => { set('destination',''); setDstCoord(null); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-red-400"><X className="w-3.5 h-3.5"/></button>
                }
              </div>
              <button
                type="button"
                onClick={() => setPickingField(f => f === 'dst' ? null : 'dst')}
                className={`mt-1.5 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${pickingField === 'dst' ? 'bg-red-500 text-white border-red-500' : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-red-300 hover:text-red-500'}`}
              >
                <MousePointer className="w-3 h-3" />
                {pickingField === 'dst' ? 'Click map to pick…' : '📍 Pick Destination on Map'}
              </button>
              {dstCoord && <p className="text-xs text-red-500 mt-1 pl-1 font-medium">✓ {dstCoord.display || `${dstCoord.lat.toFixed(4)}, ${dstCoord.lng.toFixed(4)}`}</p>}
            </div>

            {/* Battery slider */}
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 flex justify-between">
                <span className="flex items-center gap-1"><Zap className="w-3 h-3"/>Current Battery</span>
                <span className="text-emerald-600 font-bold">{form.batteryPercent}%</span>
              </label>
              <input type="range" min="5" max="100" value={form.batteryPercent} onChange={e => set('batteryPercent', +e.target.value)} className="w-full accent-emerald-500" />
            </div>

            {/* Health slider */}
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 flex justify-between">
                <span className="flex items-center gap-1"><Battery className="w-3 h-3"/>Battery Health</span>
                <span className="text-blue-600 font-bold">{form.batteryHealth}%</span>
              </label>
              <input type="range" min="60" max="100" value={form.batteryHealth} onChange={e => set('batteryHealth', +e.target.value)} className="w-full accent-blue-500" />
            </div>

            {/* Passengers */}
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block"><Users className="w-3 h-3 inline mr-1"/>Passengers</label>
              <div className="grid grid-cols-5 gap-1.5">
                {[1,2,3,4,5].map(n => (
                  <button key={n} type="button" onClick={() => set('passengerLoad', n)}
                    className={`py-2 rounded-xl text-sm font-semibold transition-all ${form.passengerLoad === n ? 'bg-emerald-600 text-white shadow' : 'bg-gray-50 text-gray-600 border border-gray-200 hover:border-emerald-300'}`}>
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.97 }}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading
                ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"/>Analyzing…</>
                : <><Cpu className="w-4 h-4"/>Predict Range</>
              }
            </motion.button>
          </form>
        </motion.div>

        {/* ── Map ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="xl:col-span-1 rounded-3xl overflow-hidden shadow-card border border-gray-100"
          style={{ height: 520 }}
        >
          <TomTomMap
            center={mapCenter}
            zoom={mapZoom}
            height={520}
            markers={markers}
            route={route}
            onMapClick={handleMapClick}
            pickingMode={!!pickingField}
            pickingField={pickingField === 'src' ? 'from' : pickingField === 'dst' ? 'to' : null}
          />
        </motion.div>

        {/* ── Result ── */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} className="xl:col-span-1 space-y-4 h-fit">
          <AnimatePresence mode="wait">
            {loading && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="card flex flex-col items-center justify-center min-h-[280px] gap-4">
                <div className="w-16 h-16 gradient-teal rounded-full flex items-center justify-center shadow-xl">
                  <Cpu className="w-8 h-8 text-white animate-pulse" />
                </div>
                <p className="font-semibold text-gray-700">AI analysing your trip…</p>
                <div className="flex gap-1">
                  {[0,1,2].map(i => (
                    <motion.div key={i} className="w-2 h-2 bg-emerald-400 rounded-full"
                      animate={{ scale: [1,1.5,1] }} transition={{ duration: 0.6, repeat: Infinity, delay: i*0.2 }} />
                  ))}
                </div>
              </motion.div>
            )}

            {result && !loading && (
              <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                {/* Main card */}
                <div className="relative bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-6 text-white overflow-hidden">
                  <div className="absolute top-0 right-0 w-36 h-36 bg-white/10 rounded-full blur-2xl" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle className="w-5 h-5 text-emerald-200" />
                      <span className="text-emerald-100 text-sm">AI Prediction Result</span>
                    </div>
                    <div className="text-6xl font-bold mb-1">{result.range}<span className="text-3xl text-emerald-200 ml-1">km</span></div>
                    <p className="text-emerald-100 text-sm">Predicted Range · {form.model}</p>
                    <div className="mt-4 pt-4 border-t border-white/20 flex items-center gap-2">
                      <Target className="w-4 h-4 text-emerald-200" />
                      <span className="text-emerald-100 text-sm">Confidence:</span>
                      <span className="font-bold">{result.confidence}%</span>
                    </div>
                  </div>
                </div>

                {/* Detail cards */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Battery Usage',   value: `${result.batteryUsed}%`,   icon: Battery,    color: 'bg-blue-50 text-blue-700',    ic: 'text-blue-500'    },
                    { label: 'Travel Time',     value: `${result.estimatedTime}`, icon: Navigation, color: 'bg-purple-50 text-purple-700', ic: 'text-purple-500'  },
                    { label: 'Charging Stops',  value: result.chargingStops,       icon: Zap,        color: result.chargingStops > 0 ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700', ic: result.chargingStops > 0 ? 'text-amber-500' : 'text-emerald-500' },
                    { label: 'Confidence',      value: `${result.confidence}%`,    icon: Target,     color: 'bg-teal-50 text-teal-700',    ic: 'text-teal-500'    },
                  ].map(s => (
                    <motion.div key={s.label} initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} className={`rounded-2xl p-4 ${s.color}`}>
                      <s.icon className={`w-5 h-5 ${s.ic} mb-2`} />
                      <div className="text-2xl font-bold">{s.value}</div>
                      <div className="text-xs font-medium opacity-70 mt-0.5">{s.label}</div>
                    </motion.div>
                  ))}
                </div>

                {/* Advisory */}
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-700">Recommendation</p>
                    <p className="text-xs text-amber-600 mt-1">
                      {result.chargingStops > 0
                        ? `Plan for a charging stop. Charge when battery hits 20%.`
                        : `Good range for this trip. Drive smoothly. Est. arrival battery: ${Math.max(5, form.batteryPercent - result.batteryUsed)}%.`}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {!result && !loading && (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="card flex flex-col items-center justify-center min-h-[280px] text-center gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <Navigation className="w-7 h-7 text-gray-400" />
                </div>
                <p className="font-semibold text-gray-500">Fill in the form and click Predict</p>
                <p className="text-sm text-gray-400">Use text input or click the map to set locations</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
