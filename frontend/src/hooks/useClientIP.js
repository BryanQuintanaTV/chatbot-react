import { useState, useEffect } from 'react';

/**
 * Custom hook to fetch client's public IP address
 * Uses ipify API as primary method with fallback
 *
 * @returns {Object} { ip: string | null, loading: boolean, error: string | null }
 */
export function useClientIP() {
  const [ip, setIp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchIP = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try primary API (ipify)
        const response = await fetch('https://api.ipify.org?format=json', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch IP from primary source');
        }

        const data = await response.json();
        setIp(data.ip);
      } catch (err) {
        // Try fallback API (ipapi.co)
        try {
          const fallbackResponse = await fetch('https://ipapi.co/json/', {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
            },
          });

          if (!fallbackResponse.ok) {
            throw new Error('Failed to fetch IP from fallback source');
          }

          const fallbackData = await fallbackResponse.json();
          setIp(fallbackData.ip);
        } catch (fallbackErr) {
          console.error('Failed to fetch client IP:', err, fallbackErr);
          setError('Unable to determine IP address');
          setIp(null);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchIP();
  }, []);

  return { ip, loading, error };
}
