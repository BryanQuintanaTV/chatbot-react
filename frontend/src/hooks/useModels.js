import { useState, useEffect } from 'react';
import api from '@/api';

/**
 * Hook to fetch and manage available AI models
 * @returns {Object} { models, loading, error, refetch }
 */
export function useModels() {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchModels = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getAvailableModels();
      setModels(data.models || []);
    } catch (err) {
      console.error('Error fetching models:', err);
      setError(err);
      // Set default models if API fails
      setModels([
        {
          id: 'auto',
          name: 'Automático (Inteligente)',
          available: true,
          message: 'Usa el mejor modelo disponible',
          recommended: true,
          speed: 'adaptive',
          quality: 'adaptive'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  return {
    models,
    loading,
    error,
    refetch: fetchModels
  };
}
