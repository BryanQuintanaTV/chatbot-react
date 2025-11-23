import { useState, useEffect } from 'react';
import { authAPI } from '@/services/api';

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
        // Call the backend to check account status
        const userData = await authAPI.me(token);

        // If successful and user has suspension data, check if still suspended
        if (userData.isSuspended) {
          const info = {
            reason: userData.suspensionReason || null,
            suspendedUntil: userData.suspendedUntil || null,
            isPermanent: !userData.suspendedUntil,
          };

          setIsSuspended(true);
          setSuspensionInfo(info);

          // Store in localStorage for persistence
          localStorage.setItem('accountSuspension', JSON.stringify(info));
        } else {
          // Account is not suspended, clear any stored suspension info
          setIsSuspended(false);
          setSuspensionInfo(null);
          localStorage.removeItem('accountSuspension');
        }
      } catch (error) {
        console.error('Error checking account status:', error);

        // Check if error message indicates account suspension
        if (error.message && (
          error.message.includes('ACCOUNT_SUSPENDED') ||
          error.message.includes('suspended') ||
          error.message.includes('auth.accountSuspended')
        )) {
          // Try to parse suspension info from error
          // Backend should ideally return: { detail: 'Account suspended', code: 'ACCOUNT_SUSPENDED', ... }
          const info = {
            reason: error.reason || error.suspensionReason || null,
            suspendedUntil: error.suspendedUntil || null,
            isPermanent: !error.suspendedUntil,
          };

          setIsSuspended(true);
          setSuspensionInfo(info);

          // Store in localStorage for persistence
          localStorage.setItem('accountSuspension', JSON.stringify(info));
        } else {
          // Check localStorage as fallback (in case of network error)
          const storedSuspension = localStorage.getItem('accountSuspension');
          if (storedSuspension) {
            try {
              const info = JSON.parse(storedSuspension);
              setIsSuspended(true);
              setSuspensionInfo(info);
            } catch (e) {
              console.error('Error parsing stored suspension info:', e);
              localStorage.removeItem('accountSuspension');
            }
          }
        }
      }
    };

    checkAccountStatus();

    // Check every 30 seconds for real-time updates
    const interval = setInterval(checkAccountStatus, 30 * 1000);

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
