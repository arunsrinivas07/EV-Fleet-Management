import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import NotificationDrawer from '../components/shared/NotificationDrawer';
import { useApp } from '../context/AppContext';
import { Clock, LogOut, RefreshCw } from 'lucide-react';

const pageTitles = {
  '/driver': 'Driver Dashboard',
  '/driver/range': 'Range Prediction',
  '/driver/trip': 'Trip Planner',
  '/driver/analytics': 'My Analytics',
};

export default function DriverLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, refreshData } = useApp();
  const title = pageTitles[location.pathname] || 'EV Fleet';
  const [checking, setChecking] = React.useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const handleCheckStatus = async () => {
    setChecking(true);
    await refreshData();
    setChecking(false);
  };

  // If driver has no assigned vehicle, show the pending allocation screen
  if (user && user.role === 'driver' && !user.vehicle) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-3xl shadow-xl p-8 max-w-lg w-full text-center border border-gray-100"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-amber-100"
          >
            <Clock className="w-10 h-10 text-amber-500 animate-pulse" />
          </motion.div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-xs font-bold text-amber-700 mb-4">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping" />
            Pending Vehicle Allocation
          </span>

          <h2 className="text-2xl font-bold text-gray-800 mb-2">Awaiting Vehicle Assignment</h2>
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">
            Welcome to IntelliEV, <strong className="text-gray-700">{user.name}</strong>! Your account has been created successfully.
            Before you can access the driver dashboard, the administrator must assign a vehicle to your account.
          </p>

          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-left mb-6 space-y-2 text-xs text-gray-500">
            <p className="font-semibold text-gray-600">What happens next?</p>
            <p>1. The fleet administrator will see your account on the dashboard.</p>
            <p>2. They will select an unallocated vehicle and assign it to you.</p>
            <p>3. Once assigned, click "Check Status" and your dashboard will unlock.</p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleCheckStatus}
              disabled={checking}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 border border-gray-200 text-gray-700 font-semibold rounded-2xl text-sm hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-60"
            >
              <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
              {checking ? 'Checking…' : 'Check Status'}
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 btn-primary flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar role="driver" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar title={title} />
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="p-6"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <NotificationDrawer />
    </div>
  );
}
