import { useState, useEffect } from 'react';

/**
 * Hook to detect online/offline status
 * @returns {Object} { isOnline, lastChecked }
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastChecked, setLastChecked] = useState(new Date());

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setLastChecked(new Date());
    };

    const handleOffline = () => {
      setIsOnline(false);
      setLastChecked(new Date());
    };

    // Listen to browser online/offline events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Periodic check every 30 seconds
    const intervalId = setInterval(async () => {
      try {
        // Try to fetch a small resource to verify connectivity
        const response = await fetch('/favicon.ico', {
          method: 'HEAD',
          cache: 'no-cache'
        });

        const online = response.ok;
        setIsOnline(online);
        setLastChecked(new Date());
      } catch (error) {
        setIsOnline(false);
        setLastChecked(new Date());
      }
    }, 30000); // 30 seconds

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(intervalId);
    };
  }, []);

  return { isOnline, lastChecked };
}
