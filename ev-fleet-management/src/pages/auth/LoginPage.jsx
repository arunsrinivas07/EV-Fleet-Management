import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Zap, Mail, Lock, User, Shield, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function LoginPage() {
  const { login, loading, authError, clearAuthError, user, logout } = useApp();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: '',
    password: '',
    remember: false,
  });
  const [showPass, setShowPass] = useState(false);
  // role picker is UI-only — just pre-fills the demo email
  const [roleHint, setRoleHint] = useState('admin');
  const [localError, setLocalError] = useState(null);

  // Clear any stale error when the user starts typing or changes role
  useEffect(() => {
    if (authError) clearAuthError();
    if (localError) setLocalError(null);
  }, [form.email, form.password, roleHint]);

  // Navigate once user is set (by onAuthStateChange inside AppContext)
  useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin' : '/driver', { replace: true });
    }
  }, [user]);

  const handleRoleHint = (role) => {
    setRoleHint(role);
    setForm(f => ({
      ...f,
      email: role === 'admin' ? 'admin@evfleet.com' : 'driver@evfleet.com',
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(form.email, form.password, roleHint);
    // Navigation is handled by the useEffect above once `user` is populated
  };

  return (
    <div className="min-h-screen gradient-bg flex">
      {/* ── Left: Form ─────────────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 gradient-green rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">IntelliEV</h1>
              <p className="text-xs text-gray-500">Fleet Management System</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome back 👋</h2>
            <p className="text-gray-500">Sign in to your account to continue</p>
          </div>

          {/* Demo role quick-fill */}
          <div className="flex gap-3 mb-6 p-1 bg-gray-100 rounded-2xl">
            {['admin', 'driver'].map(role => (
              <button
                key={role}
                type="button"
                onClick={() => handleRoleHint(role)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  roleHint === role
                    ? 'bg-white text-emerald-700 shadow-md'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {role === 'admin' ? <Shield className="w-4 h-4" /> : <User className="w-4 h-4" />}
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </button>
            ))}
          </div>

          {/* Error banner */}
          <AnimatePresence>
            {(authError || localError) && (
              <motion.div
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -8, height: 0 }}
                className="mb-4 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-4 py-3 text-sm overflow-hidden"
              >
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{authError || localError}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                placeholder="Email address"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="input-field pl-12"
                required
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="input-field pl-12 pr-12"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={showPass ? 'Hide password' : 'Show password'}
              >
                {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Remember me + Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.remember}
                  onChange={e => setForm(f => ({ ...f, remember: e.target.checked }))}
                  className="w-4 h-4 accent-emerald-500 rounded"
                />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.98 }}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </motion.button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-emerald-600 hover:text-emerald-700">
              Create account
            </Link>
          </p>

          
        </motion.div>
      </div>

      {/* ── Right: Illustration ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="hidden lg:flex flex-1 items-center justify-center p-12 relative overflow-hidden"
      >
        <div className="absolute top-20 right-20 w-72 h-72 bg-emerald-200 rounded-full blur-3xl opacity-40" />
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-teal-200 rounded-full blur-3xl opacity-40" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-blue-200 rounded-full blur-3xl opacity-30" />

        <div className="relative z-10 text-center max-w-lg">
          <div className="relative w-80 h-80 mx-auto mb-8">
            <motion.div
              animate={{ y: [-4, 4, -4] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <svg viewBox="0 0 320 200" className="w-full h-full drop-shadow-2xl">
                <rect x="0" y="160" width="320" height="40" fill="#e5e7eb" rx="4" />
                <rect x="130" y="175" width="60" height="6" fill="#d1d5db" rx="3" />
                <ellipse cx="160" cy="165" rx="90" ry="8" fill="#d1fae5" opacity="0.6" />
                <rect x="50" y="110" width="220" height="50" fill="#10b981" rx="12" />
                <rect x="80" y="75" width="160" height="40" fill="#059669" rx="12" />
                <rect x="90" y="80" width="65" height="28" fill="#bfdbfe" rx="6" opacity="0.9" />
                <rect x="165" y="80" width="65" height="28" fill="#bfdbfe" rx="6" opacity="0.9" />
                <circle cx="95" cy="162" r="22" fill="#1f2937" />
                <circle cx="95" cy="162" r="12" fill="#374151" />
                <circle cx="95" cy="162" r="5" fill="#6b7280" />
                <circle cx="225" cy="162" r="22" fill="#1f2937" />
                <circle cx="225" cy="162" r="12" fill="#374151" />
                <circle cx="225" cy="162" r="5" fill="#6b7280" />
                <rect x="140" y="125" width="40" height="20" fill="#065f46" rx="4" />
                <text x="160" y="139" textAnchor="middle" fill="#34d399" fontSize="11" fontWeight="bold">EV</text>
                <rect x="265" y="120" width="10" height="20" fill="#34d399" rx="3" />
                <path d="M275 130 Q310 120 310 80" stroke="#34d399" strokeWidth="3" fill="none" strokeDasharray="5,3" />
                <rect x="295" y="40" width="20" height="80" fill="#1f2937" rx="6" />
                <rect x="298" y="45" width="14" height="30" fill="#34d399" rx="3" />
                <text x="305" y="65" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">⚡</text>
              </svg>
            </motion.div>

            <motion.div
              animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute top-4 right-4 bg-white rounded-2xl shadow-lg p-3 flex items-center gap-2"
            >
              <Zap className="w-4 h-4 text-emerald-500" />
              <div>
                <p className="text-xs font-bold text-gray-700">78%</p>
                <p className="text-xs text-gray-400">Battery</p>
              </div>
            </motion.div>

            <motion.div
              animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              className="absolute bottom-12 left-4 bg-white rounded-2xl shadow-lg p-3 flex items-center gap-2"
            >
              <div className="w-4 h-4 rounded-full bg-emerald-400 animate-pulse" />
              <div>
                <p className="text-xs font-bold text-gray-700">Live</p>
                <p className="text-xs text-gray-400">Tracking</p>
              </div>
            </motion.div>
          </div>

          <h2 className="text-3xl font-bold text-gray-800 mb-3">Smart Fleet Management</h2>
          <p className="text-gray-500 text-base leading-relaxed">
            Monitor, manage, and optimize your entire EV fleet in real-time with AI-powered analytics.
          </p>

          <div className="flex justify-center gap-8 mt-8">
            {[
              { label: 'Vehicles', value: '8+' },
              { label: 'Drivers',  value: '8+' },
              { label: 'Uptime',   value: '99%' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-bold text-emerald-600">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
