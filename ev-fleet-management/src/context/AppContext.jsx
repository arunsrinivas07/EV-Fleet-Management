import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import {
  fetchVehiclesWithDrivers, fetchDrivers, fetchAlerts,
  subscribeToVehicles, subscribeToAlerts,
  fetchEvModels, fetchCities, fetchAnalyticsSeries,
} from '../lib/db';

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

  // If there's a driver row, get its vehicle_id
  const vehicle = profile?.drivers?.[0]?.vehicle_id || null;

  return {
    id:      session.user.id,
    email,
    role,
    name:    fullName,
    avatar:  initials || 'U',
    phone:   profile?.phone ?? metadata.phone ?? '',
    vehicle: role === 'driver' ? vehicle : null,
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
        .select('id, full_name, phone, role, avatar_url, drivers(id, vehicle_id)')
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
  const expectedRoleRef = useRef(null);
  const [authLoading,   setAuthLoading]   = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [authError,     setAuthError]     = useState(null);

  const [darkMode,            setDarkMode]            = useState(false);
  const [sidebarOpen,         setSidebarOpen]         = useState(true);
  const [notificationDrawer,  setNotificationDrawer]  = useState(false);
  const [vehicleList,         setVehicleList]         = useState([]);
  const [driverList,          setDriverList]          = useState([]);
  const [alertList,           setAlertList]           = useState([]);
  const [stats, setStats] = useState({
    totalVehicles: 0, activeVehicles: 0, workshopVehicles: 0, totalDrivers: 0,
    fleetRevenue: 0, energyToday: 0, avgBatteryHealth: 0, chargingVehicles: 0,
    revenueGrowth: 12.4, energyGrowth: -3.2, healthGrowth: -1.1, activeGrowth: 0,
  });
  const [evModels, setEvModels] = useState([]);
  const [cities, setCities] = useState([]);
  const [growthStats, setGrowthStats] = useState([]);
  const [selectedVehicle,     setSelectedVehicle]     = useState(null);
  const [dataLoading,         setDataLoading]         = useState(true);

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
          const userMeta = buildUserMeta(session, profile);

          if (expectedRoleRef.current && userMeta.role !== expectedRoleRef.current) {
            setAuthError(
              expectedRoleRef.current === 'admin'
                ? 'Admin account does not exist.'
                : 'Driver account does not exist.'
            );
            await supabase.auth.signOut();
            setUser(null);
            expectedRoleRef.current = null;
            setActionLoading(false);
            setAuthLoading(false);
            return;
          }

          setUser(userMeta);
          expectedRoleRef.current = null;
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

  const loadData = async () => {
    setDataLoading(true);
    const [v, d, a, models, cts, growth] = await Promise.all([
      fetchVehiclesWithDrivers(),
      fetchDrivers(),
      fetchAlerts(),
      fetchEvModels(),
      fetchCities(),
      fetchAnalyticsSeries('general', 'growth'),
    ]);
    const mappedDrivers = d.map(driver => {
      const vehicle = v.find(veh => veh.id === driver.vehicle);
      return {
        ...driver,
        vehicleModel: vehicle ? `${vehicle.manufacturer} ${vehicle.model}` : 'Unassigned'
      };
    });
    setVehicleList(v);
    setDriverList(mappedDrivers);
    setAlertList(a);
    setEvModels(models);
    setCities(cts);
    setGrowthStats(growth);
    setDataLoading(false);

    // Re-sync user.vehicle after data refresh (driver may have been assigned a vehicle)
    setUser(prev => {
      if (!prev || prev.role !== 'driver') return prev;
      const driverRow = d.find(dr => dr.profileId === prev.id);
      if (!driverRow) return prev;
      const newVehicle = driverRow.vehicle || null;
      if (newVehicle === prev.vehicle) return prev; // no change needed
      return { ...prev, vehicle: newVehicle };
    });
  };

  // ── Load data from Supabase + realtime subscriptions ────────────────────
  useEffect(() => {
    let unsubVehicles, unsubAlerts;

    loadData();

    unsubVehicles = subscribeToVehicles((updatedVehicle) => {
      setVehicleList(prev =>
        prev.map(v => {
          if (v.id === updatedVehicle.id) {
            return {
              ...v,
              ...updatedVehicle,
              driver: updatedVehicle.driver || v.driver,
              driverId: updatedVehicle.driverId || v.driverId,
              serviceHistory: updatedVehicle.serviceHistory?.length ? updatedVehicle.serviceHistory : v.serviceHistory,
              maintenanceRecords: updatedVehicle.maintenanceRecords?.length ? updatedVehicle.maintenanceRecords : v.maintenanceRecords,
            };
          }
          return v;
        })
      );
    });

    // Realtime: refresh alerts list on any alert change
    unsubAlerts = subscribeToAlerts(async () => {
      const fresh = await fetchAlerts();
      setAlertList(fresh);
    });

    return () => {
      unsubVehicles?.();
      unsubAlerts?.();
    };
  }, []);

  // Compute stats dynamically from vehicle and driver lists + db growth metrics
  useEffect(() => {
    if (vehicleList.length === 0) return;
    const totalVehicles = vehicleList.length;
    const activeVehicles = vehicleList.filter(v => v.status === 'running').length;
    const workshopVehicles = vehicleList.filter(v => v.status === 'workshop').length;
    const chargingVehicles = vehicleList.filter(v => v.status === 'charging').length;
    const totalDrivers = driverList.length;
    
    const avgBatteryHealth = Math.round(
      vehicleList.reduce((s, v) => s + (v.batteryHealth || 0), 0) / (totalVehicles || 1)
    );
    
    const fleetRevenue = Math.round(
      vehicleList.reduce((s, v) => s + (v.revenue || 0), 0)
    );

    const revGrowthPt = growthStats.find(g => g.period_type === 'weekly' && g.metric_type === 'revenueGrowth');
    const energyGrowthPt = growthStats.find(g => g.period_type === 'weekly' && g.metric_type === 'energyGrowth');
    const healthGrowthPt = growthStats.find(g => g.period_type === 'weekly' && g.metric_type === 'healthGrowth');
    const activeGrowthPt = growthStats.find(g => g.period_type === 'weekly' && g.metric_type === 'activeGrowth');

    setStats(prev => ({
      ...prev,
      totalVehicles,
      activeVehicles,
      workshopVehicles,
      chargingVehicles,
      totalDrivers,
      avgBatteryHealth,
      fleetRevenue,
      revenueGrowth: revGrowthPt ? parseFloat(revGrowthPt.value) : prev.revenueGrowth,
      energyGrowth: energyGrowthPt ? parseFloat(energyGrowthPt.value) : prev.energyGrowth,
      healthGrowth: healthGrowthPt ? parseFloat(healthGrowthPt.value) : prev.healthGrowth,
      activeGrowth: activeGrowthPt ? parseFloat(activeGrowthPt.value) : prev.activeGrowth,
    }));
  }, [vehicleList, driverList, growthStats]);

  // ── Auth actions ──────────────────────────────────────────────────────────

  /**
   * Sign in — role always resolved from the profiles table (or user_metadata
   * fallback). The role selector on the login page is purely cosmetic.
   */
  const login = async (email, password, expectedRole) => {
    setActionLoading(true);
    setAuthError(null);
    expectedRoleRef.current = expectedRole;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setAuthError(error.message);
      setActionLoading(false);
      expectedRoleRef.current = null;
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
        dataLoading,
        darkMode, setDarkMode,
        sidebarOpen, setSidebarOpen,
        notificationDrawer, setNotificationDrawer,
        vehicleList, driverList, alertList, stats,
        selectedVehicle, setSelectedVehicle,
        unreadAlerts, evModels, cities, growthStats,
        refreshData: loadData,
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
