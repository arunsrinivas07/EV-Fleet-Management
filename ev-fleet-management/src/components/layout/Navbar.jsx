import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Bell, Sun, Moon, Settings, ChevronDown, UserPlus } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import AssignVehiclePanel from '../shared/AssignVehiclePanel';
import { unassignedDrivers } from '../../data/mockData';

export default function Navbar({ title }) {
  const { user, darkMode, setDarkMode, setNotificationDrawer, unreadAlerts } = useApp();
  const [searchFocus,   setSearchFocus]   = useState(false);
  const [assignOpen,    setAssignOpen]    = useState(false);

  const isAdmin = user?.role === 'admin';
  const pendingCount = unassignedDrivers.length;

  return (
    <>
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4">
        <div className="flex items-center justify-between gap-4">

          {/* Title */}
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-gray-800 truncate">{title}</h1>
            <p className="text-xs text-gray-400">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Search */}
          <motion.div
            animate={{ width: searchFocus ? 320 : 240 }}
            transition={{ duration: 0.2 }}
            className="relative hidden md:block flex-shrink-0"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search vehicles, drivers..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent focus:bg-white transition-all"
              onFocus={() => setSearchFocus(true)}
              onBlur={() => setSearchFocus(false)}
            />
          </motion.div>

          {/* Right actions */}
          <div className="flex items-center gap-2 flex-shrink-0">

            {/* Assign Vehicle — admin only */}
            {isAdmin && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setAssignOpen(true)}
                className="relative flex items-center gap-2 px-3 py-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-2xl transition-colors"
              >
                <UserPlus className="w-4 h-4 text-emerald-600" />
                <span className="hidden lg:block text-sm font-semibold text-emerald-700 whitespace-nowrap">
                  Assign Vehicle
                </span>
                {pendingCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-amber-500 text-white text-xs rounded-full flex items-center justify-center font-bold leading-none shadow"
                  >
                    {pendingCount}
                  </motion.span>
                )}
              </motion.button>
            )}

            {/* Dark mode */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2.5 rounded-2xl hover:bg-gray-100 transition-colors text-gray-500"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Notifications */}
            <button
              onClick={() => setNotificationDrawer(true)}
              className="relative p-2.5 rounded-2xl hover:bg-gray-100 transition-colors text-gray-500"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadAlerts > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold leading-none"
                >
                  {unreadAlerts}
                </motion.span>
              )}
            </button>

            {/* Settings */}
            <button className="p-2.5 rounded-2xl hover:bg-gray-100 transition-colors text-gray-500" aria-label="Settings">
              <Settings className="w-5 h-5" />
            </button>

            {/* Profile */}
            <button className="flex items-center gap-2 pl-2 pr-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-colors">
              <div className="w-8 h-8 gradient-green rounded-xl flex items-center justify-center text-white text-xs font-bold">
                {user?.avatar || 'U'}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-semibold text-gray-700 leading-tight">{user?.name || 'User'}</p>
                <p className="text-xs text-emerald-600 capitalize">{user?.role || 'Role'}</p>
              </div>
              <ChevronDown className="w-3 h-3 text-gray-400 hidden md:block" />
            </button>
          </div>
        </div>
      </header>

      {/* Assign Vehicle slide-in panel */}
      <AssignVehiclePanel open={assignOpen} onClose={() => setAssignOpen(false)} />
    </>
  );
}
