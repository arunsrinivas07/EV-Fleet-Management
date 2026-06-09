import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Car, User, ChevronDown, CheckCircle, UserPlus, Zap, AlertCircle } from 'lucide-react';
import { vehicles, unassignedDrivers } from '../../data/mockData';

// vehicles that currently have no driver assigned could be shown; for demo
// we show all vehicles as available to reassign
const availableVehicles = vehicles;

export default function AssignVehiclePanel({ open, onClose }) {
  const [selectedDriver,  setSelectedDriver]  = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [driverOpen,  setDriverOpen]  = useState(false);
  const [vehicleOpen, setVehicleOpen] = useState(false);
  const [assigned, setAssigned] = useState([]); // local state for demo
  const [justAssigned, setJustAssigned] = useState(null);

  const pendingDrivers = unassignedDrivers.filter(d => !assigned.includes(d.id));

  const handleAssign = () => {
    if (!selectedDriver || !selectedVehicle) return;
    setAssigned(prev => [...prev, selectedDriver.id]);
    setJustAssigned({ driver: selectedDriver, vehicle: selectedVehicle });
    setSelectedDriver(null);
    setSelectedVehicle(null);
    setTimeout(() => setJustAssigned(null), 3500);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="fixed top-0 right-0 h-full w-[420px] max-w-full bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 gradient-green rounded-xl flex items-center justify-center shadow">
                  <UserPlus className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-800">Assign Vehicle</h2>
                  <p className="text-xs text-gray-400">{pendingDrivers.length} driver{pendingDrivers.length !== 1 ? 's' : ''} waiting</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

              {/* Success toast */}
              <AnimatePresence>
                {justAssigned && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                    className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl p-4 overflow-hidden"
                  >
                    <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-emerald-700">Vehicle Assigned!</p>
                      <p className="text-xs text-emerald-600 mt-0.5">
                        <strong>{justAssigned.vehicle.model}</strong> ({justAssigned.vehicle.id}) has been assigned to <strong>{justAssigned.driver.name}</strong>.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Unassigned drivers list */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Drivers without a vehicle
                </p>
                {pendingDrivers.length === 0 ? (
                  <div className="flex flex-col items-center py-8 text-center">
                    <CheckCircle className="w-10 h-10 text-emerald-400 mb-2" />
                    <p className="text-sm font-semibold text-gray-500">All drivers have vehicles!</p>
                    <p className="text-xs text-gray-400 mt-1">No unassigned drivers at this time.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {pendingDrivers.map(d => (
                      <motion.div
                        key={d.id}
                        whileHover={{ x: 2 }}
                        onClick={() => setSelectedDriver(d)}
                        className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                          selectedDriver?.id === d.id
                            ? 'bg-emerald-50 border-emerald-300 shadow-sm'
                            : 'bg-gray-50 border-gray-100 hover:border-gray-200'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${
                          selectedDriver?.id === d.id ? 'gradient-green' : 'bg-gray-300'
                        }`}>
                          {d.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800">{d.name}</p>
                          <p className="text-xs text-gray-400">{d.id} · Joined {d.joined}</p>
                          <p className="text-xs text-gray-400">{d.email}</p>
                        </div>
                        {selectedDriver?.id === d.id && (
                          <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Vehicle selector — shown only when a driver is selected */}
              <AnimatePresence>
                {selectedDriver && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                      Select a vehicle for <span className="text-emerald-600">{selectedDriver.name}</span>
                    </p>

                    {/* Custom dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => setVehicleOpen(o => !o)}
                        className={`w-full flex items-center gap-3 px-4 py-3 bg-white border rounded-2xl text-sm font-medium transition-all ${
                          vehicleOpen ? 'border-emerald-400 ring-2 ring-emerald-200' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Car className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className={`flex-1 text-left truncate ${selectedVehicle ? 'text-gray-800' : 'text-gray-400'}`}>
                          {selectedVehicle ? `${selectedVehicle.id} – ${selectedVehicle.model}` : 'Choose a vehicle…'}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${vehicleOpen ? 'rotate-180' : ''}`} />
                      </button>

                      <AnimatePresence>
                        {vehicleOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -6, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -6, scale: 0.98 }}
                            transition={{ duration: 0.13 }}
                            className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden max-h-56 overflow-y-auto"
                          >
                            {availableVehicles.map(v => (
                              <button
                                key={v.id}
                                onClick={() => { setSelectedVehicle(v); setVehicleOpen(false); }}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50 transition-colors text-left ${
                                  selectedVehicle?.id === v.id ? 'bg-emerald-50' : ''
                                }`}
                              >
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                  v.status === 'running' ? 'bg-emerald-100' :
                                  v.status === 'charging' ? 'bg-blue-100' :
                                  v.status === 'idle' ? 'bg-amber-100' : 'bg-red-100'
                                }`}>
                                  <Zap className={`w-3.5 h-3.5 ${
                                    v.status === 'running' ? 'text-emerald-600' :
                                    v.status === 'charging' ? 'text-blue-600' :
                                    v.status === 'idle' ? 'text-amber-600' : 'text-red-600'
                                  }`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-gray-800 truncate">{v.model}</p>
                                  <p className="text-xs text-gray-400">{v.id} · {v.manufacturer} · 🔋 {Math.round(v.batteryPercent)}%</p>
                                </div>
                                {selectedVehicle?.id === v.id && (
                                  <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                )}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Preview card */}
                    <AnimatePresence>
                      {selectedVehicle && (
                        <motion.div
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-3 p-4 bg-gray-50 rounded-2xl border border-gray-100"
                        >
                          <p className="text-xs font-semibold text-gray-500 mb-2">Assignment Preview</p>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 gradient-green rounded-xl flex items-center justify-center text-white text-sm font-bold">
                              {selectedDriver.avatar}
                            </div>
                            <div className="text-xs text-gray-500 font-semibold">will drive</div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-gray-800 truncate">{selectedVehicle.model}</p>
                              <p className="text-xs text-gray-400">{selectedVehicle.id}</p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Warning when no unassigned drivers */}
              {!selectedDriver && pendingDrivers.length > 0 && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-2xl border border-amber-100">
                  <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700">Select a driver above, then choose a vehicle to assign.</p>
                </div>
              )}
            </div>

            {/* Footer action */}
            <div className="px-6 py-4 border-t border-gray-100">
              <motion.button
                whileTap={{ scale: 0.97 }}
                disabled={!selectedDriver || !selectedVehicle}
                onClick={handleAssign}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <UserPlus className="w-4 h-4" />
                Assign Vehicle
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
