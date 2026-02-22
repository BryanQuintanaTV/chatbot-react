/**
 * System Configuration API Service
 *
 * Handles fetching system-wide configuration from the backend DB.
 * Previously these values came from environment variables (VITE_MAINTENANCE_MODE, etc.).
 *
 * Backend endpoints required (to be implemented):
 *   GET  /api/v1/system/config/        - Public config (maintenance, read-only, alerts)
 *   GET  /api/v1/events/stream/        - SSE stream for authenticated real-time updates
 *
 * The IP whitelist check is performed server-side; the backend returns the
 * effective maintenance state for the requesting client IP.
 */

// Derive the /api base from VITE_API_URL (strip trailing '/v1/chat')
const API_BASE_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/v1\/chat\/?$/, '')
  : '';

/**
 * Fetch the current system configuration from the backend.
 * The backend handles IP-whitelist checking and returns the effective state.
 *
 * @param {string|null} token - Auth token (optional; if provided the server may
 *   return user-specific alerts targeted to this user).
 * @returns {Promise<SystemConfig>}
 *
 * Expected response shape:
 * {
 *   maintenanceMode: boolean,
 *   maintenanceStartTime: string|null,   // ISO 8601
 *   maintenanceEndTime: string|null,     // ISO 8601 (optional)
 *   enableBackendHealthCheck: boolean,
 *   readOnlyMode: boolean,
 *   alerts: Array<{
 *     id: number,
 *     messageEs: string,
 *     messageEn: string,
 *     type: 'info'|'warning'|'error'|'success',
 *     startTime: string,
 *     endTime: string|null,
 *     targetAll: boolean,
 *     targetAuthenticatedOnly: boolean,
 *   }>
 * }
 */
export async function fetchSystemConfig(token = null) {
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/v1/system/config/`, {
    method: 'GET',
    headers,
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) {
    throw new Error(`System config request failed: ${response.status}`);
  }

  return await response.json();
}

/**
 * Build the env-var fallback config object.
 * Used when the /system/config/ endpoint is not yet available.
 */
export function getEnvFallbackConfig() {
  return {
    maintenanceMode: import.meta.env.VITE_MAINTENANCE_MODE === 'true',
    maintenanceStartTime: null,
    maintenanceEndTime: import.meta.env.VITE_MAINTENANCE_END_TIME || null,
    enableBackendHealthCheck: import.meta.env.VITE_ENABLE_BACKEND_HEALTH_CHECK === 'true',
    readOnlyMode: import.meta.env.VITE_READ_ONLY_MODE === 'true',
    // When using env-var fallback, IP whitelist is still checked client-side
    // via lib/ipWhitelist.js (legacy behaviour).
    _usingEnvFallback: true,
    alerts: [],
  };
}

/**
 * Connect to the SSE real-time event stream (authenticated users only).
 * Uses fetch + ReadableStream (same pattern as chat streaming).
 *
 * Events pushed by the server:
 *   system_config        - Full SystemConfig object (on change)
 *   alert_created        - New alert { alert: AlertObject }
 *   alert_removed        - Alert removed { alertId: number }
 *   account_suspended    - { reason, suspendedUntil, isPermanent }
 *   account_unsuspended  - {}
 *   restrictions_updated - { restrictions: RestrictionsObject }
 *
 * @param {string} token - Auth JWT token
 * @param {function} onEvent - Callback: (eventType: string, data: object) => void
 * @param {function} onError - Callback: (error: Error) => void
 * @returns {function} abort - Call to close the connection
 */
export function connectSSEStream(token, onEvent, onError) {
  const controller = new AbortController();

  (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/events/stream/`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'text/event-stream',
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`SSE stream failed: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop(); // Keep incomplete last line in buffer

        let eventType = 'message';
        for (const line of lines) {
          if (line.startsWith('event:')) {
            eventType = line.slice(6).trim();
          } else if (line.startsWith('data:')) {
            const raw = line.slice(5).trim();
            try {
              const data = JSON.parse(raw);
              onEvent(eventType, data);
            } catch {
              // Non-JSON data line, skip
            }
            eventType = 'message'; // Reset after data
          }
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        onError(err);
      }
    }
  })();

  return () => controller.abort();
}
