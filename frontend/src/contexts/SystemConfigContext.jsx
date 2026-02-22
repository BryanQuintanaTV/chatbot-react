/**
 * SystemConfigContext
 *
 * Provides system-wide configuration that was previously stored in .env variables:
 *   VITE_MAINTENANCE_MODE, VITE_READ_ONLY_MODE, VITE_ENABLE_BACKEND_HEALTH_CHECK,
 *   VITE_MAINTENANCE_END_TIME, VITE_MAINTENANCE_WHITELIST_IPS
 *
 * Strategy:
 *  - On mount: fetches /api/v1/system/config/ (falls back to env vars on error)
 *  - Unauthenticated users: polls the endpoint every 30 s
 *  - Authenticated users: additionally opens an SSE stream for instant push updates
 *    (account suspension, maintenance toggle, alert changes, restrictions update)
 *
 * The backend handles IP-whitelist checking server-side and returns the
 * effective maintenanceMode value for the requesting client.
 * When using the env-var fallback the legacy client-side IP check is preserved.
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import {
  fetchSystemConfig,
  getEnvFallbackConfig,
  connectSSEStream,
} from '@/services/systemConfigAPI';
import { isIPWhitelisted, isMaintenanceBypassEnabled } from '@/lib/ipWhitelist';
import { useClientIP } from '@/hooks/useClientIP';

const POLL_INTERVAL_MS = 30_000;

const defaultConfig = {
  maintenanceMode: false,
  maintenanceStartTime: null,
  maintenanceEndTime: null,
  enableBackendHealthCheck: false,
  readOnlyMode: false,
  alerts: [],
  // SSE-delivered extras (not in the REST response)
  suspensionInfo: null,       // { reason, suspendedUntil, isPermanent } | null
  restrictions: null,         // null means "no restrictions loaded yet"
  _usingEnvFallback: false,
};

const SystemConfigContext = createContext(defaultConfig);

export function useSystemConfig() {
  return useContext(SystemConfigContext);
}

export function SystemConfigProvider({ children }) {
  const [config, setConfig] = useState(defaultConfig);
  const [configLoading, setConfigLoading] = useState(true);

  // For the env-fallback path we still need client IP for legacy whitelist check
  const { ip: clientIP, loading: ipLoading } = useClientIP();

  // Track auth token from localStorage so we know when to switch to SSE
  const [authToken, setAuthToken] = useState(
    () => localStorage.getItem('authToken') || null
  );

  const pollTimerRef = useRef(null);
  const sseAbortRef = useRef(null);

  // ─── Merge partial updates into config state ─────────────────────────────
  const mergeConfig = useCallback((partial) => {
    setConfig((prev) => ({ ...prev, ...partial }));
  }, []);

  // ─── Load config from API (or fall back to env) ───────────────────────────
  const loadConfig = useCallback(async (token) => {
    try {
      const data = await fetchSystemConfig(token);
      setConfig((prev) => ({
        ...prev,
        ...data,
        _usingEnvFallback: false,
      }));
    } catch {
      // Backend endpoint not yet available → use env vars
      const fallback = getEnvFallbackConfig();
      setConfig((prev) => ({ ...prev, ...fallback }));
    } finally {
      setConfigLoading(false);
    }
  }, []);

  // ─── Initial load ─────────────────────────────────────────────────────────
  useEffect(() => {
    loadConfig(authToken);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Polling (unauthenticated or when SSE not available) ──────────────────
  const startPolling = useCallback((token) => {
    if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    pollTimerRef.current = setInterval(() => {
      loadConfig(token);
    }, POLL_INTERVAL_MS);
  }, [loadConfig]);

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  // ─── SSE event handler ────────────────────────────────────────────────────
  const handleSSEEvent = useCallback((eventType, data) => {
    switch (eventType) {
      case 'system_config':
        setConfig((prev) => ({ ...prev, ...data, _usingEnvFallback: false }));
        break;

      case 'alert_created':
        setConfig((prev) => ({
          ...prev,
          alerts: [...(prev.alerts || []), data.alert],
        }));
        break;

      case 'alert_removed':
        setConfig((prev) => ({
          ...prev,
          alerts: (prev.alerts || []).filter((a) => a.id !== data.alertId),
        }));
        break;

      case 'account_suspended':
        mergeConfig({ suspensionInfo: data });
        break;

      case 'account_unsuspended':
        mergeConfig({ suspensionInfo: null });
        break;

      case 'restrictions_updated':
        mergeConfig({ restrictions: data.restrictions });
        // Notify AuthContext so it can update user.restrictions in real-time
        window.dispatchEvent(
          new CustomEvent('auth:restrictions_updated', { detail: { restrictions: data.restrictions } })
        );
        break;

      default:
        break;
    }
  }, [mergeConfig]);

  // ─── SSE connection management ────────────────────────────────────────────
  const openSSE = useCallback((token) => {
    // Close any existing SSE connection
    if (sseAbortRef.current) {
      sseAbortRef.current();
      sseAbortRef.current = null;
    }

    const abort = connectSSEStream(
      token,
      handleSSEEvent,
      (_err) => {
        // SSE failed — fall back to polling
        startPolling(token);
      }
    );
    sseAbortRef.current = abort;
  }, [handleSSEEvent, startPolling]);

  const closeSSE = useCallback(() => {
    if (sseAbortRef.current) {
      sseAbortRef.current();
      sseAbortRef.current = null;
    }
  }, []);

  // ─── React to auth token changes ─────────────────────────────────────────
  useEffect(() => {
    if (authToken) {
      stopPolling();
      openSSE(authToken);
    } else {
      closeSSE();
      startPolling(null);
    }

    return () => {
      stopPolling();
      closeSSE();
    };
  }, [authToken, openSSE, closeSSE, startPolling, stopPolling]);

  // ─── Listen for login / logout in this tab ────────────────────────────────
  useEffect(() => {
    const handleAuthChange = (e) => {
      if (e.type === 'auth:login') {
        const token = localStorage.getItem('authToken');
        setAuthToken(token);
        loadConfig(token);
      } else if (e.type === 'auth:logout') {
        setAuthToken(null);
        // Clear per-user state
        mergeConfig({ suspensionInfo: null, restrictions: null });
        loadConfig(null);
      }
    };

    window.addEventListener('auth:login', handleAuthChange);
    window.addEventListener('auth:logout', handleAuthChange);
    return () => {
      window.removeEventListener('auth:login', handleAuthChange);
      window.removeEventListener('auth:logout', handleAuthChange);
    };
  }, [loadConfig, mergeConfig]);

  // ─── Compute effective maintenanceMode for env-fallback path ─────────────
  // When using the API the server already returns the effective value.
  // When using env vars the legacy client-side IP check is preserved.
  const effectiveMaintenanceMode = (() => {
    if (!config._usingEnvFallback) return config.maintenanceMode;
    if (!config.maintenanceMode) return false;
    if (isMaintenanceBypassEnabled()) return false;
    // While IP is loading, keep maintenance off to avoid flicker
    if (ipLoading) return false;
    if (isIPWhitelisted(clientIP)) return false;
    return true;
  })();

  const value = {
    ...config,
    maintenanceMode: effectiveMaintenanceMode,
    configLoading,
  };

  return (
    <SystemConfigContext.Provider value={value}>
      {children}
    </SystemConfigContext.Provider>
  );
}
