import { useState } from 'react';
import { DataPulse } from './useCalendarActivities';

interface UpdateDataPulseParams {
  id: string;
  positive?: number;
  negative?: number;
  aiResponse?: string;
  reviewed?: boolean;
}

export function useDataPulse() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateDataPulse = async (params: UpdateDataPulseParams): Promise<DataPulse | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/data-pulse', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error('Failed to update data pulse');
      }

      const updatedPulse = await response.json();
      return updatedPulse;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update data pulse');
      setError(error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const markAsReviewed = async (dataPulseId: string): Promise<DataPulse | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/data-pulse', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dataPulseId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark data pulse as reviewed');
      }

      const { dataPulse } = await response.json();
      return dataPulse;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to mark data pulse as reviewed');
      setError(error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    updateDataPulse,
    markAsReviewed
  };
} 