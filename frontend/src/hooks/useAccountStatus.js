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
      // Clear suspension when not authenticated
      setIsSuspended(false);
      setSuspensionInfo(null);
      return;
    }

    // Check account status on mount and periodically
    const checkAccountStatus = async () => {
      try {
        console.log('Checking account status...');
        // Call the backend to check account status
        const userData = await authAPI.me(token);

        // If successful and user has suspension data, check if still suspended
        if (userData.isSuspended) {
          console.log('Account is still suspended:', userData);
          const info = {
            reason: userData.suspensionReason || null,
            suspendedUntil: userData.suspendedUntil || null,
            isPermanent: !userData.suspendedUntil,
          };

          setIsSuspended(true);
          setSuspensionInfo(info);
        } else {
          // Account is not suspended, clear suspension state
          console.log('Account is NOT suspended, clearing suspension state');
          setIsSuspended(false);
          setSuspensionInfo(null);
        }
      } catch (error) {
        console.error('Error checking account status:', error);

        // Check if error code or message indicates account suspension
        if (error.code === 'ACCOUNT_SUSPENDED' ||
            (error.message && (
              error.message.includes('ACCOUNT_SUSPENDED') ||
              error.message.includes('suspended') ||
              error.message.includes('auth.accountSuspended')
            ))
        ) {
          // Extract suspension info from error object
          const info = {
            reason: error.reason || error.suspensionReason || null,
            suspendedUntil: error.suspendedUntil || null,
            isPermanent: error.isPermanent || !error.suspendedUntil,
          };

          console.log('Account is suspended:', info);
          setIsSuspended(true);
          setSuspensionInfo(info);
        }
        // For network errors or other issues, don't change suspension state
        // It will be checked again on next interval (30s)
      }
    };

    checkAccountStatus();

    // Check every 30 seconds for real-time updates
    const interval = setInterval(checkAccountStatus, 30 * 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated, token]);

  // Suspension state is managed entirely by the useEffect above
  // When isAuthenticated becomes false, the first useEffect clears the state

  return {
    isSuspended,
    suspensionInfo,
  };
}
