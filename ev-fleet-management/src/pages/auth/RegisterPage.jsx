import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye, EyeOff, Zap, Mail, Lock, User, Phone, Shield,
  CheckCircle, AlertCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function RegisterPage() {
  const { register, loading, authError, clearAuthError } = useApp();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirm: '',
    role: 'driver',
  });
  const [showPass, setShowPass] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  // Clear error when user edits any field
  useEffect(() => { if (authError) clearAuthError(); }, [form]);

  const passwordsMatch = form.confirm === '' || form.password === form.confirm;
  const passwordStrong = form.password.length >= 6;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!passwordsMatch || !passwordStrong) return;

    const { error, needsVerification: nv } = await register({
      email: form.email,
      password: form.password,
      fullName: form.fullName,
      phone: form.phone,
      role: form.role,
    });

    if (!error) {
      if (nv) {
        setNeedsVerification(true);
      } else {
        // email confirmations disabled — user is logged in, go to dashboard
        navigate(form.role === 'admin' ? '/admin' : '/driver', { replace: true });
      }
    }
  };

  // ── Email-sent success screen ──────────────────────────────────────────────
  if (needsVerification) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-8">
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 220 }}
            className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </motion.div>

          <h2 className="text-2xl font-bold text-gray-800 mb-2">Check your inbox</h2>
          <p className="text-gray-500 mb-1">We sent a verification link to</p>
          <p className="font-semibold text-emerald-600 mb-6 break-all">{form.email}</p>

          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-left mb-8 space-y-1.5">
            {[
              'Open the email from EV Fleet Pro',
              'Click the "Confirm your email" button',
              'You\'ll be redirected back to sign in',
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-2.5 text-sm text-emerald-700">
                <span className="w-5 h-5 rounded-full bg-emerald-200 text-emerald-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                {step}
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-400 mb-6">
            Didn't receive it? Check your spam folder or{' '}
            <button
              onClick={() => setNeedsVerification(false)}
              className="text-emerald-600 font-semibold hover:underline"
            >
              try again
            </button>
            .
          </p>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/login')}
            className="btn-primary w-full"
          >
            Go to Sign In
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // ── Registration form ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-3xl shadow-card p-8">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 gradient-green rounded-2xl flex items-center justify-center shadow-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">EV Fleet Pro</h1>
              <p className="text-xs text-gray-500">Create your account</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-1">Get Started</h2>
          <p className="text-gray-500 text-sm mb-6">Create your EV Fleet account today</p>

          {/* Role selector */}
          <div className="flex gap-3 mb-6 p-1 bg-gray-100 rounded-2xl">
            {['admin', 'driver'].map(role => (
              <button
                key={role}
                type="button"
                onClick={() => set('role', role)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  form.role === role
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
            {authError && (
              <motion.div
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -8, height: 0 }}
                className="mb-4 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-4 py-3 text-sm overflow-hidden"
              >
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{authError}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Full Name"
                value={form.fullName}
                onChange={e => set('fullName', e.target.value)}
                className="input-field pl-11 text-sm"
                required
                autoComplete="name"
              />
            </div>

            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                placeholder="Email address"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                className="input-field pl-11 text-sm"
                required
                autoComplete="email"
              />
            </div>

            {/* Phone */}
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="tel"
                placeholder="Phone Number (optional)"
                value={form.phone}
                onChange={e => set('phone', e.target.value)}
                className="input-field pl-11 text-sm"
                autoComplete="tel"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Password (min 6 characters)"
                value={form.password}
                onChange={e => set('password', e.target.value)}
                className="input-field pl-11 pr-11 text-sm"
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={showPass ? 'Hide password' : 'Show password'}
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Password strength bar */}
            {form.password && (
              <div className="space-y-1 -mt-1">
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    animate={{ width: form.password.length >= 10 ? '100%' : form.password.length >= 6 ? '60%' : '30%' }}
                    className={`h-full rounded-full transition-all ${
                      form.password.length >= 10 ? 'bg-emerald-500' :
                      form.password.length >= 6  ? 'bg-amber-400'   : 'bg-red-400'
                    }`}
                  />
                </div>
                <p className={`text-xs ${
                  form.password.length >= 10 ? 'text-emerald-600' :
                  form.password.length >= 6  ? 'text-amber-600'   : 'text-red-500'
                }`}>
                  {form.password.length >= 10 ? 'Strong password' :
                   form.password.length >= 6  ? 'Good password'   : 'Too short (min 6)'}
                </p>
              </div>
            )}

            {/* Confirm Password */}
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="password"
                placeholder="Confirm Password"
                value={form.confirm}
                onChange={e => set('confirm', e.target.value)}
                className={`input-field pl-11 text-sm ${
                  !passwordsMatch ? 'border-red-300 focus:ring-red-400' : ''
                }`}
                required
                autoComplete="new-password"
              />
            </div>

            <AnimatePresence>
              {!passwordsMatch && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-xs text-red-500 -mt-1"
                >
                  Passwords don't match
                </motion.p>
              )}
            </AnimatePresence>

            <motion.button
              type="submit"
              disabled={loading || !passwordsMatch || !passwordStrong}
              whileTap={{ scale: 0.98 }}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </motion.button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-emerald-600 hover:text-emerald-700">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
