import { useState, useEffect } from 'react';

/**
 * Hook to monitor backend health
 * @param {boolean} enabled - Whether health check is enabled
 * @param {number} interval - Interval in ms between checks (default: 30000ms)
 * @returns {Object} { isHealthy, isChecking, checkNow }
 */
export function useBackendHealth(enabled = true, interval = 30000) {
  const [isHealthy, setIsHealthy] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const checkHealth = async () => {
    if (!enabled) return;

    setIsChecking(true);

    try {
      // Try to fetch available models endpoint (lightweight check)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

      const response = await fetch('https://apichat.bryanquintana.com/api/v1/models/available/', {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        setIsHealthy(true);
        setRetryCount(0);
      } else {
        setIsHealthy(false);
        setRetryCount(prev => prev + 1);
      }
    } catch (error) {
      // Network error or timeout
      console.error('Backend health check failed:', error.message);
      setIsHealthy(false);
      setRetryCount(prev => prev + 1);
    } finally {
      setIsChecking(false);
    }
  };

  // Initial check
  useEffect(() => {
    if (enabled) {
      checkHealth();
    }
  }, [enabled]);

  // Periodic check
  useEffect(() => {
    if (!enabled) return;

    const intervalId = setInterval(() => {
      checkHealth();
    }, interval);

    return () => clearInterval(intervalId);
  }, [enabled, interval]);

  return {
    isHealthy,
    isChecking,
    retryCount,
    checkNow: checkHealth,
  };
}
