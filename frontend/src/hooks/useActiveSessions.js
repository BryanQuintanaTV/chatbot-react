/**
 * useActiveSessions
 *
 * Fetches and manages the list of active sessions for the current user.
 * Exposes helpers to revoke a specific session or all other sessions.
 *
 * Requires:
 *   GET    /api/auth/sessions/        (new backend endpoint)
 *   DELETE /api/auth/sessions/{id}/   (new backend endpoint)
 *   DELETE /api/auth/sessions/others/ (new backend endpoint)
 *
 * Session object shape (from backend):
 * {
 *   id: number,
 *   userAgent: string,
 *   ipAddress: string,
 *   createdAt: string,      // ISO 8601
 *   lastActivity: string,   // ISO 8601
 *   isCurrent: boolean,
 * }
 */

import { useState, useEffect, useCallback } from 'react';
import { sessionsAPI } from '@/services/api';

export function useActiveSessions(token) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSessions = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await sessionsAPI.getAll(token);
      setSessions(data.sessions || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const revokeSession = useCallback(
    async (sessionId) => {
      await sessionsAPI.revoke(token, sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    },
    [token]
  );

  const revokeOtherSessions = useCallback(async () => {
    await sessionsAPI.revokeOthers(token);
    setSessions((prev) => prev.filter((s) => s.isCurrent));
  }, [token]);

  return {
    sessions,
    loading,
    error,
    refetch: fetchSessions,
    revokeSession,
    revokeOtherSessions,
  };
}
