import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Car, Users, Bell, BarChart3, LogOut,
  Zap, ChevronLeft, ChevronRight, MapPin, Route, Activity,
  Navigation, TrendingUp, Settings, PlusCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

const adminLinks = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/fleet', label: 'Fleet Monitor', icon: Car },
  { to: '/admin/add-vehicle', label: 'Add Vehicle', icon: PlusCircle },
  { to: '/admin/drivers', label: 'Driver Analytics', icon: Users },
  { to: '/admin/charts', label: 'Charts & Reports', icon: BarChart3 },
  { to: '/admin/alerts', label: 'Alert Center', icon: Bell },
];

const driverLinks = [
  { to: '/driver', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/driver/range', label: 'Range Prediction', icon: Navigation },
  { to: '/driver/trip', label: 'Trip Planner', icon: Route },
  { to: '/driver/analytics', label: 'My Analytics', icon: TrendingUp },
];

export default function Sidebar({ role }) {
  const { sidebarOpen, setSidebarOpen, logout, user, alertList } = useApp();
  const navigate = useNavigate();
  const links = role === 'admin' ? adminLinks : driverLinks;
  const criticalAlerts = alertList?.filter(a => a.severity === 'critical').length || 0;

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <motion.aside
      animate={{ width: sidebarOpen ? 260 : 80 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="relative bg-white border-r border-gray-100 shadow-sm flex flex-col h-screen sticky top-0 z-30"
    >
      {/* Logo */}
      <div className="p-5 flex items-center gap-3 border-b border-gray-100 min-h-[72px]">
        <div className="w-10 h-10 gradient-green rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="font-bold text-gray-800 text-sm leading-tight">IntelliEV</div>
              <div className="text-xs text-emerald-600 font-medium">Fleet Management</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Toggle button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute -right-3 top-20 w-6 h-6 bg-white border border-gray-200 rounded-full shadow-sm flex items-center justify-center text-gray-500 hover:text-emerald-600 transition-colors z-50"
      >
        {sidebarOpen ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
      </button>

      {/* Nav links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <AnimatePresence>
          {sidebarOpen && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-xs font-semibold text-gray-400 px-4 py-2 uppercase tracking-wider"
            >
              {role === 'admin' ? 'Administration' : 'Driver Menu'}
            </motion.p>
          )}
        </AnimatePresence>

        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 font-medium text-sm group relative ${isActive
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-200 active-sidebar-link'
                : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-700'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-emerald-600'}`} />
                <AnimatePresence>
                  {sidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -5 }}
                      className="whitespace-nowrap"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {label === 'Alert Center' && criticalAlerts > 0 && (
                  <AnimatePresence>
                    {sidebarOpen && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                      >
                        {criticalAlerts}
                      </motion.span>
                    )}
                  </AnimatePresence>
                )}
                {!sidebarOpen && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                    {label}
                  </div>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="p-3 border-t border-gray-100 space-y-1">
        <button className="flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-600 hover:bg-gray-50 transition-all w-full">
          <Settings className="w-5 h-5 flex-shrink-0 text-gray-500" />
          <AnimatePresence>
            {sidebarOpen && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm font-medium whitespace-nowrap">
                Settings
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-2xl text-red-500 hover:bg-red-50 transition-all w-full"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <AnimatePresence>
            {sidebarOpen && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm font-medium whitespace-nowrap">
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        {sidebarOpen && user && (
          <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-2xl mt-2">
            <div className="w-8 h-8 gradient-green rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {user.avatar}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-700 truncate">{user.name}</p>
              <p className="text-xs text-emerald-600 capitalize">{user.role}</p>
            </div>
          </div>
        )}
      </div>
    </motion.aside>
  );
}
