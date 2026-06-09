import React, { useEffect, useRef, useState } from 'react';

const API_KEY = import.meta.env.VITE_TOMTOM_API_KEY;
const HAS_KEY = API_KEY && API_KEY !== 'your_tomtom_api_key_here';

// ── SDK loader ────────────────────────────────────────────────────────────────
let sdkLoaded = false, sdkLoading = false;
const loadCallbacks = [];
function loadTomTomSDK() {
  return new Promise(resolve => {
    if (sdkLoaded) { resolve(window.tt); return; }
    loadCallbacks.push(resolve);
    if (sdkLoading) return;
    sdkLoading = true;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://api.tomtom.com/maps-sdk-for-web/cdn/6.x/6.25.0/maps/maps.css';
    document.head.appendChild(link);
    const script = document.createElement('script');
    script.src = 'https://api.tomtom.com/maps-sdk-for-web/cdn/6.x/6.25.0/maps/maps-web.min.js';
    script.onload = () => {
      sdkLoaded = true;
      loadCallbacks.forEach(cb => cb(window.tt));
      loadCallbacks.length = 0;
    };
    document.head.appendChild(script);
  });
}

// ── Reverse geocode ───────────────────────────────────────────────────────────
export async function reverseGeocode(lat, lng) {
  if (!HAS_KEY) return `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`;
  try {
    const res  = await fetch(`https://api.tomtom.com/search/2/reverseGeocode/${lat},${lng}.json?key=${API_KEY}`);
    const data = await res.json();
    return data.addresses?.[0]?.address?.freeformAddress || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } catch { return `${lat.toFixed(4)}, ${lng.toFixed(4)}`; }
}

// ── Geocode address → lat/lng ─────────────────────────────────────────────────
export async function geocodeAddress(query) {
  if (!HAS_KEY) {
    const fb = {
      'new delhi': [28.6139, 77.2090], 'delhi': [28.6139, 77.2090],
      'mumbai': [19.0760, 72.8777], 'bengaluru': [12.9716, 77.5946],
      'bangalore': [12.9716, 77.5946], 'chennai': [13.0827, 80.2707],
      'hyderabad': [17.3850, 78.4867], 'pune': [18.5204, 73.8567],
      'kolkata': [22.5726, 88.3639], 'ahmedabad': [23.0225, 72.5714],
      'jaipur': [26.9124, 75.7873], 'gurugram': [28.4595, 77.0266],
      'noida': [28.5355, 77.3910], 'kochi': [9.9312, 76.2673],
      'chandigarh': [30.7333, 76.7794],
    };
    const key = query.toLowerCase().trim();
    for (const [k, v] of Object.entries(fb)) {
      if (key.includes(k)) return { lat: v[0], lng: v[1], display: query };
    }
    return { lat: 20.5937 + (Math.random() - 0.5) * 6, lng: 78.9629 + (Math.random() - 0.5) * 6, display: query };
  }
  try {
    const res  = await fetch(`https://api.tomtom.com/search/2/geocode/${encodeURIComponent(query)}.json?key=${API_KEY}&countrySet=IN&limit=1`);
    const data = await res.json();
    const r = data.results?.[0];
    if (!r) return null;
    return { lat: r.position.lat, lng: r.position.lon, display: r.address.freeformAddress };
  } catch { return null; }
}

// ── Static Indian EV chargers ─────────────────────────────────────────────────
const STATIC_CHARGERS = [
  { id: 'tata-cp',    name: 'Tata Power EZ Charge – Connaught Place', address: 'Connaught Place, New Delhi',      lat: 28.6328, lng: 77.2197, available: 3, power: '50 kW'  },
  { id: 'eesl-igi',   name: 'EESL Fast Charger – IGI Airport',         address: 'IGI Airport, New Delhi',         lat: 28.5562, lng: 77.1000, available: 1, power: '25 kW'  },
  { id: 'bpcl-nh48',  name: 'BPCL EV Station – NH-48',                 address: 'NH-48, Gurugram, Haryana',       lat: 28.4744, lng: 77.0266, available: 4, power: '150 kW' },
  { id: 'ather-cc',   name: 'Ather Grid – Cyber City',                  address: 'Cyber City, Gurugram',           lat: 28.4950, lng: 77.0880, available: 2, power: '22 kW'  },
  { id: 'tata-bkc',   name: 'Tata Power EZ Charge – BKC',              address: 'Bandra Kurla Complex, Mumbai',   lat: 19.0596, lng: 72.8656, available: 5, power: '50 kW'  },
  { id: 'eesl-mum',   name: 'EESL Charger – Mumbai Central',            address: 'Mumbai Central, Mumbai',         lat: 18.9690, lng: 72.8194, available: 2, power: '25 kW'  },
  { id: 'zeon-blr',   name: 'Zeon Charging – Koramangala',              address: 'Koramangala, Bengaluru',         lat: 12.9279, lng: 77.6271, available: 3, power: '50 kW'  },
  { id: 'ather-blr',  name: 'Ather Grid – Indiranagar',                 address: 'Indiranagar, Bengaluru',         lat: 12.9784, lng: 77.6408, available: 4, power: '22 kW'  },
  { id: 'tata-hyd',   name: 'Tata Power – Hitech City',                 address: 'Hitech City, Hyderabad',         lat: 17.4474, lng: 78.3762, available: 3, power: '50 kW'  },
  { id: 'bpcl-pune',  name: 'BPCL EV – Koregaon Park',                  address: 'Koregaon Park, Pune',            lat: 18.5362, lng: 73.8938, available: 2, power: '50 kW'  },
  { id: 'tata-chn',   name: 'Tata Power – Anna Nagar',                  address: 'Anna Nagar, Chennai',            lat: 13.0850, lng: 80.2101, available: 2, power: '50 kW'  },
  { id: 'eesl-ahm',   name: 'EESL Charger – SG Highway',                address: 'SG Highway, Ahmedabad',          lat: 23.0225, lng: 72.5100, available: 3, power: '25 kW'  },
  { id: 'tata-kol',   name: 'Tata Power – Park Street',                 address: 'Park Street, Kolkata',           lat: 22.5513, lng: 88.3534, available: 2, power: '50 kW'  },
  { id: 'bpcl-jpr',   name: 'BPCL EV – MI Road',                        address: 'MI Road, Jaipur',                lat: 26.9022, lng: 75.7873, available: 1, power: '25 kW'  },
];

function distKm(lat1, lng1, lat2, lng2) {
  return Math.sqrt(((lat1 - lat2) * 111) ** 2 + ((lng1 - lng2) * 90) ** 2);
}

// ── Search EV charging stations near route midpoint ───────────────────────────
export async function searchEVChargers(lat, lng, radiusMeters = 40000) {
  const radiusKm = radiusMeters / 1000;

  if (!HAS_KEY) {
    return STATIC_CHARGERS
      .map(s => ({ ...s, distance: +distKm(s.lat, s.lng, lat, lng).toFixed(1) }))
      .filter(s => s.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 6);
  }

  try {
    const url = `https://api.tomtom.com/search/2/categorySearch/electric%20vehicle%20station.json` +
      `?key=${API_KEY}&lat=${lat}&lon=${lng}&radius=${radiusMeters}&limit=8&countrySet=IN`;
    const res  = await fetch(url);
    const data = await res.json();

    if (data.results?.length) {
      return data.results.map((r, i) => ({
        id:        r.id || `tt-${i}`,
        name:      r.poi?.name || 'EV Charging Station',
        address:   r.address?.freeformAddress || '',
        lat:       r.position.lat,
        lng:       r.position.lon,
        available: Math.floor(Math.random() * 4) + 1,
        power:     '50 kW',
        distance:  r.dist ? +(r.dist / 1000).toFixed(1) : null,
      }));
    }
  } catch (e) { console.warn('[TomTom] EV search error:', e); }

  // Fallback to static dataset
  return STATIC_CHARGERS
    .map(s => ({ ...s, distance: +distKm(s.lat, s.lng, lat, lng).toFixed(1) }))
    .filter(s => s.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 6);
}

// ── Fallback SVG map ──────────────────────────────────────────────────────────
function FallbackMap({ center, zoom, markers = [], height, className, onMapClick, pickingMode, pickingField }) {
  const W = 800, H = height || 400;
  const SPAN = 0.8 / Math.pow(2, Math.max(0, (zoom || 5) - 5));
  const latMin = center[0] - SPAN, latMax = center[0] + SPAN;
  const lngMin = center[1] - SPAN, lngMax = center[1] + SPAN;

  const toXY = (lat, lng) => ({
    x: ((lng - lngMin) / (lngMax - lngMin)) * W,
    y: ((latMax - lat) / (latMax - latMin)) * H,
  });
  const fromXY = (x, y) => ({
    lat: latMax - (y / H) * (latMax - latMin),
    lng: lngMin + (x / W) * (lngMax - lngMin),
  });

  const colors = { origin: '#10b981', destination: '#ef4444', vehicle: '#3b82f6', charging: '#f59e0b' };

  const handleClick = (e) => {
    if (!onMapClick) return;
    const svg  = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const { lat, lng } = fromXY(
      ((e.clientX - rect.left) / rect.width)  * W,
      ((e.clientY - rect.top)  / rect.height) * H,
    );
    onMapClick(lat, lng);
  };

  // Find origin and last destination for route line
  const originMarker = markers.find(m => m.type === 'origin');
  const destMarker   = markers.find(m => m.type === 'destination');

  return (
    <div className={`relative overflow-hidden ${className || ''}`} style={{ height, width: '100%' }}>
      <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`}
        onClick={handleClick} style={{ cursor: pickingMode ? 'crosshair' : 'default', display: 'block' }}>
        <rect width={W} height={H} fill="#e8f4f8" />
        {[...Array(12)].map((_, i) => <line key={`v${i}`} x1={i*W/11} y1="0" x2={i*W/11} y2={H} stroke="#cfe2f3" strokeWidth="1" />)}
        {[...Array(8)].map((_, i)  => <line key={`h${i}`} x1="0" y1={i*H/7} x2={W} y2={i*H/7} stroke="#cfe2f3" strokeWidth="1" />)}
        <path d={`M0 ${H*.5} Q${W*.25} ${H*.48} ${W*.5} ${H*.5} Q${W*.75} ${H*.52} ${W} ${H*.5}`} stroke="#b8cdd9" strokeWidth="5" fill="none" />
        <path d={`M${W*.3} 0 L${W*.32} ${H}`} stroke="#b8cdd9" strokeWidth="4" fill="none" />
        <path d={`M${W*.65} 0 L${W*.67} ${H}`} stroke="#b8cdd9" strokeWidth="3" fill="none" />
        <path d={`M0 ${H*.28} Q${W*.5} ${H*.26} ${W} ${H*.28}`} stroke="#c8d8e4" strokeWidth="2" fill="none" />
        <path d={`M0 ${H*.74} Q${W*.5} ${H*.72} ${W} ${H*.74}`} stroke="#c8d8e4" strokeWidth="2" fill="none" />
        <text x={W/2} y="18" textAnchor="middle" fill="#7a9ab0" fontSize="11" fontWeight="600">
          India · {center[0].toFixed(2)}°N {center[1].toFixed(2)}°E
        </text>
        {/* Route line */}
        {originMarker && destMarker && (() => {
          const a = toXY(originMarker.lat, originMarker.lng);
          const b = toXY(destMarker.lat, destMarker.lng);
          return <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#10b981" strokeWidth="3" strokeDasharray="8,4" opacity="0.8" />;
        })()}
        {/* All markers */}
        {markers.map((m, i) => {
          const { x, y } = toXY(m.lat, m.lng);
          const col = colors[m.type] || '#6366f1';
          const r   = m.type === 'charging' ? 12 : 16;
          return (
            <g key={m.id || i}>
              <circle cx={x} cy={y} r={r} fill={col} />
              <circle cx={x} cy={y} r={r} fill="none" stroke="white" strokeWidth="2.5" />
              <text x={x} y={y+4} textAnchor="middle" fill="white" fontSize={m.type === 'charging' ? 9 : 11} fontWeight="bold">
                {m.label || '●'}
              </text>
            </g>
          );
        })}
      </svg>
      {pickingMode && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg flex items-center gap-2 pointer-events-none">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
          Click map to set {pickingField === 'from' ? 'Source' : 'Destination'}
        </div>
      )}
      <div className="absolute bottom-2 left-2 bg-amber-50 border border-amber-200 rounded-xl px-2.5 py-1 text-xs text-amber-700 font-medium">
        ⚠ Add VITE_TOMTOM_API_KEY for live map
      </div>
    </div>
  );
}

// ── Main TomTomMap component ──────────────────────────────────────────────────
export default function TomTomMap({
  center = [20.5937, 78.9629],
  zoom = 5,
  height = 400,
  className = '',
  markers = [],
  route = null,
  onMapClick = null,
  pickingMode = false,
  pickingField = null,
}) {
  const containerRef = useRef(null);
  const mapRef       = useRef(null);
  const markersRef   = useRef([]);
  const [ready, setReady] = useState(false);

  // Init
  useEffect(() => {
    if (!HAS_KEY) { setReady(true); return; }
    loadTomTomSDK().then(tt => {
      if (!containerRef.current || mapRef.current) return;
      const map = tt.map({
        key: API_KEY,
        container: containerRef.current,
        center: { lng: center[1], lat: center[0] },
        zoom,
        stylesVisibility: { trafficFlow: false, trafficIncidents: false },
      });
      map.addControl(new tt.NavigationControl());
      map.addControl(new tt.FullscreenControl());
      mapRef.current = map;
      map.on('load', () => setReady(true));
    });
    return () => { if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } };
  }, []);

  // Click handler
  useEffect(() => {
    if (!ready || !HAS_KEY || !mapRef.current) return;
    const map = mapRef.current;
    map.getCanvas().style.cursor = pickingMode ? 'crosshair' : '';
    const handler = e => { if (onMapClick) onMapClick(e.lngLat.lat, e.lngLat.lng); };
    map.on('click', handler);
    return () => map.off('click', handler);
  }, [ready, onMapClick, pickingMode]);

  // Markers
  useEffect(() => {
    if (!ready || !HAS_KEY || !mapRef.current || !window.tt) return;
    const tt = window.tt;
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    const cols = { origin: '#10b981', destination: '#ef4444', vehicle: '#3b82f6', charging: '#f59e0b' };
    markers.forEach(m => {
      const el  = document.createElement('div');
      const col = cols[m.type] || '#6366f1';
      const sz  = m.type === 'charging' ? 28 : 34;
      el.style.cssText = `width:${sz}px;height:${sz}px;border-radius:50%;background:${col};border:3px solid white;box-shadow:0 2px 10px rgba(0,0,0,0.25);display:flex;align-items:center;justify-content:center;color:white;font-size:${m.type === 'charging' ? 10 : 12}px;font-weight:700;cursor:pointer;`;
      el.textContent = m.label || '●';
      const popup = m.popup ? new tt.Popup({ offset: 32 }).setText(m.popup) : undefined;
      const marker = new tt.Marker({ element: el }).setLngLat([m.lng, m.lat]);
      if (popup) marker.setPopup(popup);
      marker.addTo(mapRef.current);
      markersRef.current.push(marker);
    });
  }, [ready, markers]);

  // Route
  useEffect(() => {
    if (!ready || !HAS_KEY || !mapRef.current || !window.tt) return;
    const map = mapRef.current, tt = window.tt;
    const SRC = 'ev-route-src', LYR = 'ev-route-lyr';
    if (map.getLayer(LYR))  map.removeLayer(LYR);
    if (map.getSource(SRC)) map.removeSource(SRC);
    if (!route) return;
    (async () => {
      try {
        const url  = `https://api.tomtom.com/routing/1/calculateRoute/${route.from[0]},${route.from[1]}:${route.to[0]},${route.to[1]}/json?key=${API_KEY}&travelMode=car&routeType=eco`;
        const data = await (await fetch(url)).json();
        const coords = data.routes[0].legs[0].points.map(p => [p.longitude, p.latitude]);
        map.addSource(SRC, { type: 'geojson', data: { type: 'Feature', geometry: { type: 'LineString', coordinates: coords } } });
        map.addLayer({ id: LYR, type: 'line', source: SRC, layout: { 'line-join': 'round', 'line-cap': 'round' }, paint: { 'line-color': '#10b981', 'line-width': 4, 'line-opacity': 0.85 } });
        map.fitBounds(coords.reduce((b, c) => b.extend(c), new tt.LngLatBounds(coords[0], coords[0])), { padding: 70 });
      } catch (e) { console.warn('[TomTom] route error:', e); }
    })();
  }, [ready, route]);

  // Fly
  useEffect(() => {
    if (!ready || !HAS_KEY || !mapRef.current) return;
    mapRef.current.flyTo({ center: { lat: center[0], lng: center[1] }, zoom, essential: true });
  }, [center[0], center[1], zoom]);

  if (!HAS_KEY) {
    return (
      <FallbackMap
        center={center} zoom={zoom} markers={markers} height={height}
        className={className} onMapClick={onMapClick}
        pickingMode={pickingMode} pickingField={pickingField}
      />
    );
  }

  return (
    <div className="relative" style={{ height, width: '100%' }}>
      <div ref={containerRef} className={`rounded-2xl overflow-hidden ${className}`} style={{ height, width: '100%' }} />
      {pickingMode && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 bg-emerald-600 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg flex items-center gap-2 pointer-events-none">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
          Click map to set {pickingField === 'from' ? 'Source' : 'Destination'}
        </div>
      )}
    </div>
  );
}
