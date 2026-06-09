import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import AdminLayout from './layouts/AdminLayout';
import DriverLayout from './layouts/DriverLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import FleetMonitor from './pages/admin/FleetMonitor';
import DriverAnalytics from './pages/admin/DriverAnalytics';
import AlertCenter from './pages/admin/AlertCenter';
import VehicleDetails from './pages/admin/VehicleDetails';
import ChartsPage from './pages/admin/ChartsPage';
import DriverDashboard from './pages/driver/DriverDashboard';
import RangePrediction from './pages/driver/RangePrediction';
import TripPlanner from './pages/driver/TripPlanner';
import DrivingAnalytics from './pages/driver/DrivingAnalytics';
import { Zap } from 'lucide-react';

// ── Full-screen spinner shown while the initial session is resolving ─────────
function AuthLoader() {
  return (
    <div className="min-h-screen gradient-bg flex flex-col items-center justify-center gap-4">
      <div className="w-16 h-16 gradient-green rounded-2xl flex items-center justify-center shadow-xl animate-bounce-slow">
        <Zap className="w-8 h-8 text-white" />
      </div>
      <div className="flex gap-1.5">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="w-2.5 h-2.5 rounded-full bg-emerald-400"
            style={{ animation: `bounce 0.9s ease-in-out ${i * 0.15}s infinite` }}
          />
        ))}
      </div>
      <p className="text-sm text-gray-500 font-medium">Loading EV Fleet...</p>
    </div>
  );
}

// ── Guard that also blocks render while the session is being restored ────────
function ProtectedRoute({ children, requiredRole }) {
  const { user, authLoading } = useApp();

  if (authLoading) return <AuthLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/driver'} replace />;
  }
  return children;
}

// ── Route that redirects already-authed users away from auth pages ───────────
function PublicRoute({ children }) {
  const { user, authLoading } = useApp();
  if (authLoading) return <AuthLoader />;
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/driver'} replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />

      {/* Admin */}
      <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminLayout /></ProtectedRoute>}>
        <Route index            element={<AdminDashboard />} />
        <Route path="fleet"     element={<FleetMonitor />} />
        <Route path="drivers"   element={<DriverAnalytics />} />
        <Route path="alerts"    element={<AlertCenter />} />
        <Route path="charts"    element={<ChartsPage />} />
        <Route path="vehicle/:id" element={<VehicleDetails />} />
      </Route>

      {/* Driver */}
      <Route path="/driver" element={<ProtectedRoute requiredRole="driver"><DriverLayout /></ProtectedRoute>}>
        <Route index           element={<DriverDashboard />} />
        <Route path="range"    element={<RangePrediction />} />
        <Route path="trip"     element={<TripPlanner />} />
        <Route path="analytics" element={<DrivingAnalytics />} />
      </Route>

      <Route path="/"  element={<Navigate to="/login" replace />} />
      <Route path="*"  element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}
