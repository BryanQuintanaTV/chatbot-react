import { useState, useEffect, useRef } from 'react';
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

  // Check localStorage on mount for suspension info (from login failures)
  useEffect(() => {
    const storedSuspension = localStorage.getItem('accountSuspension');
    if (storedSuspension) {
      try {
        const info = JSON.parse(storedSuspension);
        console.log('Found suspension info in localStorage on mount:', info);
        setIsSuspended(true);
        setSuspensionInfo(info);
      } catch (e) {
        console.error('Error parsing stored suspension info on mount:', e);
        localStorage.removeItem('accountSuspension');
      }
    }
  }, []); // Run once on mount

  useEffect(() => {
    if (!isAuthenticated || !token) {
      // Don't clear suspension state here - it might be from a failed login
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

          // Store in localStorage for persistence
          localStorage.setItem('accountSuspension', JSON.stringify(info));
        } else {
          // For other errors (network, etc), check localStorage as fallback
          const storedSuspension = localStorage.getItem('accountSuspension');
          if (storedSuspension) {
            try {
              const info = JSON.parse(storedSuspension);
              console.log('Using stored suspension info:', info);
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

  // Clear suspension only when user explicitly logs out (transition from authenticated to not authenticated)
  // We use a ref to track previous auth state to detect actual logout
  const wasAuthenticated = useRef(isAuthenticated);

  useEffect(() => {
    // Only clear if user was previously authenticated and is now not (actual logout)
    if (wasAuthenticated.current && !isAuthenticated) {
      console.log('User logged out, clearing suspension info');
      setIsSuspended(false);
      setSuspensionInfo(null);
      localStorage.removeItem('accountSuspension');
    }
    wasAuthenticated.current = isAuthenticated;
  }, [isAuthenticated]);

  return {
    isSuspended,
    suspensionInfo,
  };
}
