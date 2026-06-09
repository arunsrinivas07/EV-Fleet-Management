import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Battery, Activity, Wifi, WifiOff, Wrench, Gauge, AlertTriangle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const alertIcons = {
  low_battery: Battery,
  battery_health: Activity,
  offline: WifiOff,
  maintenance: Wrench,
  overspeed: Gauge,
};

const severityStyles = {
  critical: 'border-l-4 border-red-500 bg-red-50',
  warning: 'border-l-4 border-amber-400 bg-amber-50',
  info: 'border-l-4 border-blue-400 bg-blue-50',
};

const severityDot = {
  critical: 'bg-red-500',
  warning: 'bg-amber-400',
  info: 'bg-blue-400',
};

export default function NotificationDrawer() {
  const { notificationDrawer, setNotificationDrawer, alertList } = useApp();

  return (
    <AnimatePresence>
      {notificationDrawer && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => setNotificationDrawer(false)}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 h-full w-96 bg-white shadow-2xl z-50 flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-gray-800">Notifications</h2>
                <p className="text-sm text-gray-500">{alertList.length} alerts</p>
              </div>
              <button
                onClick={() => setNotificationDrawer(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {alertList.map((alert, i) => {
                const Icon = alertIcons[alert.type] || AlertTriangle;
                return (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`rounded-2xl p-4 ${severityStyles[alert.severity]}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 p-1.5 rounded-lg ${
                        alert.severity === 'critical' ? 'bg-red-100' :
                        alert.severity === 'warning' ? 'bg-amber-100' : 'bg-blue-100'
                      }`}>
                        <Icon className={`w-4 h-4 ${
                          alert.severity === 'critical' ? 'text-red-600' :
                          alert.severity === 'warning' ? 'text-amber-600' : 'text-blue-600'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-semibold text-gray-800">{alert.title}</p>
                          <span className={`w-2 h-2 rounded-full ${severityDot[alert.severity]}`} />
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed">{alert.message}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-400">{alert.time}</span>
                          <span className="text-xs font-medium text-gray-500">{alert.vehicle}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="p-4 border-t border-gray-100">
              <button className="w-full py-3 text-sm font-semibold text-emerald-600 hover:bg-emerald-50 rounded-2xl transition-colors">
                Mark all as read
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
