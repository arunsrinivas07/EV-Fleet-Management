import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Route, Zap, CheckCircle, Search, Loader,
  MousePointer, X, Navigation, ExternalLink,
} from 'lucide-react';
import TomTomMap, { geocodeAddress, reverseGeocode, searchEVChargers } from '../../components/map/TomTomMap';

const INDIA_CENTER = [20.5937, 78.9629];

export default function TripPlanner() {
  const [fromText,    setFromText]    = useState('');
  const [toText,      setToText]      = useState('');
  const [fromCoord,   setFromCoord]   = useState(null);
  const [toCoord,     setToCoord]     = useState(null);
  const [geocoding,   setGeocoding]   = useState({ from: false, to: false });
  const [planned,     setPlanned]     = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [mapCenter,   setMapCenter]   = useState(INDIA_CENTER);
  const [mapZoom,     setMapZoom]     = useState(5);
  const [pickingField, setPickingField] = useState(null);

  // Dynamic charging stations state
  const [stations,     setStations]     = useState([]);
  const [loadingCS,    setLoadingCS]    = useState(false);

  // ── Geocode from text ──────────────────────────────────────────────────────
  const geocodeField = useCallback(async (field) => {
    const text = field === 'from' ? fromText : toText;
    if (!text.trim()) return;
    setGeocoding(g => ({ ...g, [field]: true }));
    const result = await geocodeAddress(text + ', India');
    setGeocoding(g => ({ ...g, [field]: false }));
    if (!result) return;
    if (field === 'from') { setFromCoord(result); setFromText(result.display || text); }
    else                  { setToCoord(result);   setToText(result.display || text);   }
  }, [fromText, toText]);

  // ── Map click pick ─────────────────────────────────────────────────────────
  const handleMapClick = useCallback(async (lat, lng) => {
    if (!pickingField) return;
    const address = await reverseGeocode(lat, lng);
    const coord = { lat, lng, display: address };
    if (pickingField === 'from') { setFromCoord(coord); setFromText(address); }
    else                         { setToCoord(coord);   setToText(address);   }
    setPickingField(null);
    setPlanned(false);
    setMapCenter([lat, lng]);
    setMapZoom(12);
  }, [pickingField]);

  // ── Fetch EV chargers along route midpoint ─────────────────────────────────
  const fetchChargers = useCallback(async (fc, tc) => {
    setLoadingCS(true);
    // Search near midpoint of route
    const midLat = (fc.lat + tc.lat) / 2;
    const midLng = (fc.lng + tc.lng) / 2;
    const radius = Math.max(20000, Math.round(
      Math.sqrt(((fc.lat - tc.lat) * 111000) ** 2 + ((fc.lng - tc.lng) * 90000) ** 2) * 0.6
    ));
    const results = await searchEVChargers(midLat, midLng, radius);
    setStations(results);
    setLoadingCS(false);
  }, []);

  // ── Plan route ─────────────────────────────────────────────────────────────
  const handlePlan = async () => {
    if (!fromText.trim() || !toText.trim()) return;
    setLoading(true);
    const [fc, tc] = await Promise.all([
      fromCoord || geocodeAddress(fromText + ', India'),
      toCoord   || geocodeAddress(toText + ', India'),
    ]);
    if (fc) setFromCoord(fc);
    if (tc) setToCoord(tc);
    if (fc && tc) {
      const midLat = (fc.lat + tc.lat) / 2;
      const midLng = (fc.lng + tc.lng) / 2;
      setMapCenter([midLat, midLng]);
      setMapZoom(7);
      fetchChargers(fc, tc);
    }
    setTimeout(() => { setLoading(false); setPlanned(true); }, 800);
  };

  // ── Navigate to a charging station ────────────────────────────────────────
  const navigateTo = (station) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${station.lat},${station.lng}&travelmode=driving`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Derived stats
  const distKm    = fromCoord && toCoord ? Math.round(Math.sqrt(((fromCoord.lat - toCoord.lat) * 111) ** 2 + ((fromCoord.lng - toCoord.lng) * 90) ** 2)) : 0;
const totalMinutes = distKm ? Math.round(distKm * 1.8) : null;

const duration = totalMinutes !== null
  ? `${Math.floor(totalMinutes / 60)} hr ${totalMinutes % 60} min`
  : '—';  const energyKwh = distKm ? (distKm * 0.18).toFixed(1) : '—';

  // Map markers: source + destination + charging stations
  const markers = [
    ...(fromCoord ? [{ lat: fromCoord.lat, lng: fromCoord.lng, type: 'origin',      label: 'A', popup: fromText || 'Source' }] : []),
    ...(toCoord   ? [{ lat: toCoord.lat,   lng: toCoord.lng,   type: 'destination', label: 'B', popup: toText   || 'Destination' }] : []),
    ...stations.map((s, i) => ({ lat: s.lat, lng: s.lng, type: 'charging', label: '⚡', popup: s.name })),
  ];

  const route = fromCoord && toCoord
    ? { from: [fromCoord.lat, fromCoord.lng], to: [toCoord.lat, toCoord.lng] }
    : null;

  return (
    <div className="space-y-4 max-w-6xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Trip Planner</h2>
        <p className="text-gray-500 text-sm mt-0.5">
          Type a location or click <span className="font-semibold text-emerald-600">📍 Pick on Map</span> · EV chargers auto-loaded along route
        </p>
      </div>

      {/* ── Main grid: left panel + map side by side, equal height ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-start">

        {/* Left panel */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 card space-y-4"
        >
          <h3 className="font-bold text-gray-800">Plan Your Route</h3>

          <LocationField
            label="Source"
            value={fromText}
            coord={fromCoord}
            loading={geocoding.from}
            isPicking={pickingField === 'from'}
            dotColor="bg-emerald-500"
            onChange={v => { setFromText(v); setFromCoord(null); setPlanned(false); }}
            onBlur={() => geocodeField('from')}
            onSearch={() => geocodeField('from')}
            onPickMap={() => setPickingField(f => f === 'from' ? null : 'from')}
            onClear={() => { setFromText(''); setFromCoord(null); setPlanned(false); }}
          />

          <LocationField
            label="Destination"
            value={toText}
            coord={toCoord}
            loading={geocoding.to}
            isPicking={pickingField === 'to'}
            dotColor="bg-red-500"
            onChange={v => { setToText(v); setToCoord(null); setPlanned(false); }}
            onBlur={() => geocodeField('to')}
            onSearch={() => geocodeField('to')}
            onPickMap={() => setPickingField(f => f === 'to' ? null : 'to')}
            onClear={() => { setToText(''); setToCoord(null); setPlanned(false); }}
          />

          {/* Quick cities */}
          <div>
            <p className="text-xs text-gray-400 mb-1.5 font-medium">Quick cities</p>
            <div className="flex flex-wrap gap-1.5">
              {['New Delhi', 'Mumbai', 'Bengaluru', 'Hyderabad', 'Pune', 'Chennai'].map(city => (
                <button
                  key={city}
                  onClick={() => {
                    if (!fromText) { setFromText(city); setFromCoord(null); }
                    else           { setToText(city);   setToCoord(null);   }
                    setPlanned(false);
                  }}
                  className="text-xs px-2.5 py-1 bg-gray-100 hover:bg-emerald-100 hover:text-emerald-700 rounded-xl transition-colors text-gray-600"
                >
                  {city}
                </button>
              ))}
            </div>
          </div>

          {/* Plan button */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            disabled={loading || !fromText || !toText}
            onClick={handlePlan}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading
              ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Planning…</>
              : <><Route className="w-4 h-4" />Plan Route</>
            }
          </motion.button>

          {/* Route stats — inline after plan */}
          <AnimatePresence>
            {planned && distKm > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Distance',      value: `${distKm} km`,    color: 'text-emerald-700 bg-emerald-50' },
                    { label: 'Est. Duration', value: duration,           color: 'text-blue-700 bg-blue-50'       },
                    { label: 'Energy Use',    value: `${energyKwh} kWh`,color: 'text-amber-700 bg-amber-50'     },
                    { label: 'Arrive Bat.',   value: `${Math.max(10, 75 - Math.round(distKm * 0.12))}%`, color: 'text-teal-700 bg-teal-50' },
                  ].map(s => (
                    <div key={s.label} className={`p-3 rounded-2xl ${s.color}`}>
                      <p className="text-base font-bold">{s.value}</p>
                      <p className="text-xs font-medium opacity-70 mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Map — no extra wrapper div causing spacing */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-3 rounded-3xl overflow-hidden shadow-card border border-gray-100"
          style={{ minHeight: 460 }}
        >
          <TomTomMap
            center={mapCenter}
            zoom={mapZoom}
            height={460}
            markers={markers}
            route={planned ? route : null}
            onMapClick={handleMapClick}
            pickingMode={!!pickingField}
            pickingField={pickingField}
          />
        </motion.div>
      </div>

      {/* ── Charging stations + optimal route — appear after plan ── */}
      <AnimatePresence>
        {planned && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* EV Charging Stations */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800">
                  EV Charging Stations Along Route
                </h3>
                {loadingCS && (
                  <div className="flex items-center gap-2 text-xs text-emerald-600 font-medium">
                    <Loader className="w-3.5 h-3.5 animate-spin" />
                    Searching…
                  </div>
                )}
                {!loadingCS && stations.length > 0 && (
                  <span className="text-xs text-gray-400">{stations.length} found</span>
                )}
              </div>

              {!loadingCS && stations.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-6">
                  No EV charging stations found along this route.
                </p>
              )}

              <div className="space-y-3">
                {stations.map((station, i) => (
                  <motion.div
                    key={station.id || i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl hover:bg-blue-50/50 transition-colors border border-transparent hover:border-blue-100"
                  >
                    <div className="w-11 h-11 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <Zap className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm truncate">{station.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{station.address}</p>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          station.available > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {station.available > 0 ? `${station.available} Available` : 'Check availability'}
                        </span>
                        {station.distance && (
                          <span className="text-xs text-gray-400">{station.distance} km away</span>
                        )}
                        {station.power && (
                          <span className="text-xs text-gray-400">{station.power}</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => navigateTo(station)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 active:bg-blue-200 px-3 py-1.5 rounded-xl transition-colors whitespace-nowrap"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      Navigate
                      <ExternalLink className="w-3 h-3 opacity-60" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Optimal route summary */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-3xl p-5 flex items-start gap-4">
              <div className="w-10 h-10 gradient-green rounded-2xl flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-emerald-800">Optimal Route Found</p>
                <p className="text-sm text-emerald-700 mt-1">
                  <strong>{fromText}</strong> → <strong>{toText}</strong> · {distKm} km · {energyKwh} kWh · {duration}
                </p>
                <button
                  onClick={() => {
                    if (fromCoord && toCoord) {
                      window.open(
                        `https://www.google.com/maps/dir/${fromCoord.lat},${fromCoord.lng}/${toCoord.lat},${toCoord.lng}`,
                        '_blank', 'noopener,noreferrer'
                      );
                    }
                  }}
                  className="btn-primary mt-3 text-sm py-2 px-4 inline-flex items-center gap-2"
                >
                  <Navigation className="w-4 h-4" />
                  Start Navigation
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── LocationField ─────────────────────────────────────────────────────────────
function LocationField({ label, value, coord, loading, isPicking, dotColor, onChange, onBlur, onSearch, onPickMap, onClear }) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-500 mb-1.5 block">{label}</label>
      <div className="relative">
        <div className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full ${dotColor}`} />
        <input
          type="text"
          placeholder={`Type or pick on map…`}
          value={value}
          onChange={e => onChange(e.target.value)}
          onBlur={onBlur}
          onKeyDown={e => e.key === 'Enter' && onSearch()}
          className="input-field pl-9 pr-16 text-sm"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
          {loading
            ? <Loader className="w-4 h-4 text-emerald-500 animate-spin mr-1" />
            : <button type="button" onClick={onSearch} className="p-1.5 text-gray-400 hover:text-emerald-600 transition-colors"><Search className="w-3.5 h-3.5" /></button>
          }
          {value && <button type="button" onClick={onClear} className="p-1.5 text-gray-300 hover:text-red-400 transition-colors"><X className="w-3.5 h-3.5" /></button>}
        </div>
      </div>
      <button
        type="button"
        onClick={onPickMap}
        className={`mt-1.5 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
          isPicking
            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
            : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50'
        }`}
      >
        <MousePointer className="w-3.5 h-3.5" />
        {isPicking ? 'Click anywhere on map…' : `📍 Pick ${label} on Map`}
      </button>
      {coord && (
        <p className={`text-xs mt-1 pl-1 font-medium truncate ${dotColor === 'bg-emerald-500' ? 'text-emerald-600' : 'text-red-500'}`}>
          ✓ {coord.display || `${coord.lat.toFixed(4)}, ${coord.lng.toFixed(4)}`}
        </p>
      )}
    </div>
  );
}
