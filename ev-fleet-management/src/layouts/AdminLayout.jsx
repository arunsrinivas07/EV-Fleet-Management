import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import NotificationDrawer from '../components/shared/NotificationDrawer';

const pageTitles = {
  '/admin': 'Admin Dashboard',
  '/admin/fleet': 'Fleet Monitor',
  '/admin/drivers': 'Driver Analytics',
  '/admin/charts': 'Charts & Reports',
  '/admin/alerts': 'Alert Center',
};

export default function AdminLayout() {
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'EV Fleet Management';

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar role="admin" />
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
