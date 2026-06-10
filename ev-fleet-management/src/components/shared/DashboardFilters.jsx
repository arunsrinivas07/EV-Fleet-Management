import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Car, Tag, ChevronDown, Check, X } from 'lucide-react';

// ── Generic animated dropdown ────────────────────────────────────────────────
function Dropdown({ icon: Icon, label, value, options, onChange, accent = 'emerald' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const accentMap = {
    emerald: { ring: 'ring-emerald-400', badge: 'bg-emerald-500', active: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
    blue: { ring: 'ring-blue-400', badge: 'bg-blue-500', active: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400', dot: 'bg-blue-500' },
    purple: { ring: 'ring-purple-400', badge: 'bg-purple-500', active: 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400', dot: 'bg-purple-500' },
  };
  const colors = accentMap[accent];

  const isDefault = value === options[0]; // first option = "All …" or "Weekly"

  return (
    <div ref={ref} className="relative">
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-sm font-semibold transition-all select-none
          ${open
            ? `bg-white dark:bg-gray-800 ring-2 ${colors.ring} border-transparent shadow-lg`
            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm'
          }
          ${!isDefault ? `border-transparent ring-2 ${colors.ring}` : ''}
        `}
      >
        <Icon className={`w-4 h-4 flex-shrink-0 ${!isDefault ? colors.active.split(' ')[2] + ' ' + colors.active.split(' ')[3] : 'text-gray-500 dark:text-gray-400'}`} />
        <span className={`max-w-[130px] truncate ${!isDefault ? colors.active.split(' ')[2] + ' ' + colors.active.split(' ')[3] : 'text-gray-700 dark:text-gray-300'}`}>
          {value}
        </span>
        {!isDefault && (
          <span
            onClick={e => { e.stopPropagation(); onChange(options[0]); }}
            className={`ml-0.5 w-4 h-4 rounded-full ${colors.badge} text-white flex items-center justify-center flex-shrink-0 hover:opacity-80`}
          >
            <X className="w-2.5 h-2.5" />
          </span>
        )}
        <ChevronDown className={`w-3.5 h-3.5 flex-shrink-0 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute top-[calc(100%+8px)] left-0 min-w-[200px] bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-1.5 z-50 overflow-hidden"
          >
            <div className="max-h-[280px] overflow-y-auto pr-1 custom-scrollbar">
              {options.map((opt) => {
                const selected = opt === value;
                return (
                  <button
                    key={opt}
                    onClick={() => { onChange(opt); setOpen(false); }}
                    className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left
                      ${selected ? colors.active : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'}
                    `}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {selected && <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${colors.dot}`} />}
                      {!selected && <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-transparent" />}
                      <span className="truncate">{opt}</span>
                    </div>
                    {selected && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Public component ─────────────────────────────────────────────────────────
export default function DashboardFilters({ filters, onChange, brands, vehicleOptions }) {
  const periodOptions = ['Weekly', 'Monthly', 'Last 3 Mo', 'Yearly'];

  const anyActive = filters.period !== 'Weekly' || filters.brand !== 'All Brands' || filters.vehicle !== 'All Vehicles';

  const reset = () => onChange({ period: 'Weekly', brand: 'All Brands', vehicle: 'All Vehicles' });

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-wrap items-center gap-2"
    >
      {/* 1 — Time period */}
      <Dropdown
        icon={Calendar}
        label="Period"
        value={filters.period}
        options={periodOptions}
        onChange={v => onChange({ ...filters, period: v })}
        accent="emerald"
      />

      {/* 2 — Brand */}
      <Dropdown
        icon={Tag}
        label="Brand"
        value={filters.brand}
        options={brands}
        onChange={v => onChange({ ...filters, brand: v, vehicle: 'All Vehicles' })}
        accent="blue"
      />

      {/* 3 — Vehicle */}
      <Dropdown
        icon={Car}
        label="Vehicle"
        value={filters.vehicle}
        options={vehicleOptions}
        onChange={v => onChange({ ...filters, vehicle: v })}
        accent="purple"
      />

      {/* Clear all — only shown when something is active */}
      <AnimatePresence>
        {anyActive && (
          <motion.button
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            whileTap={{ scale: 0.95 }}
            onClick={reset}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-2xl text-xs font-semibold text-gray-500 hover:text-red-500 hover:bg-red-50 border border-gray-200 hover:border-red-200 transition-all"
          >
            <X className="w-3 h-3" />
            Reset
          </motion.button>
        )}
      </AnimatePresence>

      {/* Active filter pill summary */}
      {anyActive && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-gray-400 font-medium hidden sm:inline"
        >
          Showing filtered results
        </motion.span>
      )}
    </motion.div>
  );
}
