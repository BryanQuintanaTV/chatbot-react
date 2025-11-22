import { useState, useEffect } from 'react';

/**
 * Hook to check if user account is suspended
 * @param {boolean} isAuthenticated - Whether user is authenticated
 * @param {string} token - Auth token
 * @returns {Object} { isSuspended, suspensionInfo }
 */
export function useAccountStatus(isAuthenticated, token) {
  const [isSuspended, setIsSuspended] = useState(false);
  const [suspensionInfo, setSuspensionInfo] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      setIsSuspended(false);
      setSuspensionInfo(null);
      return;
    }

    // Check account status on mount and periodically
    const checkAccountStatus = async () => {
      try {
        // Try to fetch user data from /api/auth/me
        // This is a dummy check since we don't have the actual backend yet
        // In production, this would call the real endpoint

        // For now, check if there's suspension info in localStorage
        const storedSuspension = localStorage.getItem('accountSuspension');
        if (storedSuspension) {
          const info = JSON.parse(storedSuspension);
          setIsSuspended(true);
          setSuspensionInfo(info);
        } else {
          setIsSuspended(false);
          setSuspensionInfo(null);
        }
      } catch (error) {
        // Check if error is account suspended (403 with code ACCOUNT_SUSPENDED)
        if (error.status === 403 && error.data?.code === 'ACCOUNT_SUSPENDED') {
          const info = {
            reason: error.data.reason || null,
            suspendedUntil: error.data.suspendedUntil || null,
            isPermanent: !error.data.suspendedUntil,
          };

          setIsSuspended(true);
          setSuspensionInfo(info);

          // Store in localStorage for persistence
          localStorage.setItem('accountSuspension', JSON.stringify(info));
        }
      }
    };

    checkAccountStatus();

    // Check every 5 minutes
    const interval = setInterval(checkAccountStatus, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated, token]);

  // Clear suspension on logout
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.removeItem('accountSuspension');
    }
  }, [isAuthenticated]);

  return {
    isSuspended,
    suspensionInfo,
  };
}
