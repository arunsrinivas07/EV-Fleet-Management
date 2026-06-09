import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Zap, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function ForgotPasswordPage() {
  const { forgotPassword, authError, clearAuthError } = useApp();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [localError, setLocalError] = useState(null);

  useEffect(() => {
    if (authError) clearAuthError();
    setLocalError(null);
  }, [email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLocalError(null);
    const { error } = await forgotPassword(email);
    setLoading(false);
    if (error) {
      setLocalError(error);
    } else {
      setSent(true);
    }
  };

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
              <p className="text-xs text-gray-500">Password Reset</p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {sent ? (
              /* ── Success state ── */
              <motion.div
                key="sent"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 220, delay: 0.1 }}
                  className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5"
                >
                  <CheckCircle className="w-8 h-8 text-emerald-500" />
                </motion.div>

                <h2 className="text-xl font-bold text-gray-800 mb-2">Email sent!</h2>
                <p className="text-gray-500 text-sm mb-1">
                  We sent a password reset link to
                </p>
                <p className="font-semibold text-emerald-600 break-all mb-6">{email}</p>
                <p className="text-xs text-gray-400 mb-8">
                  Click the link in the email to choose a new password.
                  The link expires in 1 hour.
                </p>

                <Link to="/login" className="btn-primary inline-flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Sign In
                </Link>
              </motion.div>
            ) : (
              /* ── Form state ── */
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="text-2xl font-bold text-gray-800 mb-1">Forgot password?</h2>
                <p className="text-gray-500 text-sm mb-6">
                  Enter your email and we'll send you a reset link.
                </p>

                <AnimatePresence>
                  {(localError || authError) && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: 'auto' }}
                      exit={{ opacity: 0, y: -8, height: 0 }}
                      className="mb-4 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-4 py-3 text-sm overflow-hidden"
                    >
                      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{localError || authError}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      placeholder="Your email address"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="input-field pl-12"
                      required
                      autoComplete="email"
                      autoFocus
                    />
                  </div>

                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileTap={{ scale: 0.98 }}
                    className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Send Reset Link'
                    )}
                  </motion.button>
                </form>

                <div className="mt-6 text-center">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Sign In
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
