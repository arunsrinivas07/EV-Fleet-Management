import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { vehicles, drivers, alerts, dashboardStats } from '../data/mockData';

const AppContext = createContext();

// ─── helpers ────────────────────────────────────────────────────────────────

/**
 * Build the in-memory user object from a Supabase session + optional profile row.
 *
 * Role priority (highest → lowest):
 *   1. profiles table row  — set by the DB trigger on sign-up
 *   2. user_metadata.role  — set by the client at sign-up time (reliable fallback)
 *   3. 'driver'            — safe default, never 'admin' by accident
 */
function buildUserMeta(session, profile) {
  const email      = session.user.email ?? '';
  const metadata   = session.user.user_metadata ?? {};

  // Role: DB row is authoritative; fall back to what was passed at registration
  const role =
    profile?.role ||
    metadata.role ||
    'driver';

  const fullName =
    profile?.full_name ||
    metadata.full_name ||
    email.split('@')[0];

  const initials = fullName
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return {
    id:      session.user.id,
    email,
    role,
    name:    fullName,
    avatar:  initials || 'U',
    phone:   profile?.phone ?? metadata.phone ?? '',
    vehicle: role === 'driver' ? 'EV-001' : null,
  };
}

/**
 * Fetch the profile row for a user.
 * Retries up to 4 times with exponential back-off to handle the race condition
 * where the DB trigger hasn't inserted the row yet right after sign-up.
 */
async function fetchProfile(userId, retries = 4) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, phone, role, avatar_url')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        if (error.code === '42P17') {
          console.error(
            '[EV Fleet] RLS infinite recursion on profiles table.\n' +
            'Run supabase/fix_rls.sql in your Supabase SQL Editor.'
          );
          return null; // unrecoverable until SQL is fixed
        }
        console.warn(`[EV Fleet] profile fetch attempt ${attempt} error:`, error.message);
      }

      // If we got a row, return it
      if (data) return data;

      // Row not found yet — wait and retry (trigger may still be running)
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, attempt * 300)); // 300, 600, 900 ms
      }
    } catch (e) {
      console.error('[EV Fleet] unexpected profile fetch error:', e);
      return null;
    }
  }

  // All retries exhausted — return null; role will come from user_metadata
  return null;
}

// ─── Provider ───────────────────────────────────────────────────────────────

export const AppProvider = ({ children }) => {
  const [user,          setUser]          = useState(null);
  const [authLoading,   setAuthLoading]   = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [authError,     setAuthError]     = useState(null);

  const [darkMode,            setDarkMode]            = useState(false);
  const [sidebarOpen,         setSidebarOpen]         = useState(true);
  const [notificationDrawer,  setNotificationDrawer]  = useState(false);
  const [vehicleList,         setVehicleList]         = useState(vehicles);
  const [driverList]                                  = useState(drivers);
  const [alertList]                                   = useState(alerts);
  const [stats]                                       = useState(dashboardStats);
  const [selectedVehicle,     setSelectedVehicle]     = useState(null);

  // ── Session bootstrap ────────────────────────────────────────────────────
  useEffect(() => {
    // 1. Restore any existing session on page load
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        const profile = await fetchProfile(session.user.id);
        setUser(buildUserMeta(session, profile));
      }
      setAuthLoading(false);
    });

    // 2. React to auth events (sign-in, sign-out, token refresh, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          const profile = await fetchProfile(session.user.id);
          setUser(buildUserMeta(session, profile));
        } else {
          setUser(null);
        }

        if (['SIGNED_IN', 'SIGNED_OUT', 'TOKEN_REFRESHED', 'USER_UPDATED'].includes(event)) {
          setAuthLoading(false);
          setActionLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // ── Dark mode ─────────────────────────────────────────────────────────────
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  // ── Simulated real-time battery changes ──────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      setVehicleList(prev =>
        prev.map(v => ({
          ...v,
          speed:
            v.status === 'running'
              ? Math.max(20, Math.min(80, v.speed + (Math.random() - 0.5) * 8))
              : v.speed,
          batteryPercent:
            v.status === 'running'
              ? Math.max(10, v.batteryPercent - 0.1)
              : v.status === 'charging'
              ? Math.min(100, v.batteryPercent + 0.2)
              : v.batteryPercent,
        }))
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // ── Auth actions ──────────────────────────────────────────────────────────

  /**
   * Sign in — role always resolved from the profiles table (or user_metadata
   * fallback). The role selector on the login page is purely cosmetic.
   */
  const login = async (email, password) => {
    setActionLoading(true);
    setAuthError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setAuthError(error.message);
      setActionLoading(false);
      return { error: error.message };
    }
    // setUser is handled by onAuthStateChange → no duplicate work here
    return { error: null };
  };

  /**
   * Register a new user.
   * - Passes role in user_metadata so buildUserMeta can use it immediately
   *   even before the DB trigger fires.
   * - The trigger writes it to the profiles table as the permanent record.
   */
  const register = async ({ email, password, fullName, phone, role }) => {
    setActionLoading(true);
    setAuthError(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone:     phone || '',
          role:      role,          // stored in user_metadata immediately
        },
      },
    });

    if (error) {
      setAuthError(error.message);
      setActionLoading(false);
      return { error: error.message, needsVerification: false };
    }

    setActionLoading(false);

    // If email confirmation is enabled, data.session is null
    const needsVerification = !data.session;
    return { error: null, needsVerification };
  };

  /** Send a password-reset email */
  const forgotPassword = async (email) => {
    setAuthError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return error ? { error: error.message } : { error: null };
  };

  const logout = async () => {
    setUser(null);
    await supabase.auth.signOut();
  };

  const clearAuthError = () => setAuthError(null);

  const unreadAlerts = alertList.filter(a => a.severity === 'critical').length;

  return (
    <AppContext.Provider
      value={{
        user, authLoading,
        loading: actionLoading,
        authError,
        login, register, logout, forgotPassword, clearAuthError,
        darkMode, setDarkMode,
        sidebarOpen, setSidebarOpen,
        notificationDrawer, setNotificationDrawer,
        vehicleList, driverList, alertList, stats,
        selectedVehicle, setSelectedVehicle,
        unreadAlerts,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
