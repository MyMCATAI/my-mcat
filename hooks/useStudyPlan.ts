import { useState, useCallback } from 'react';
import { useExamActivities } from './useCalendarActivities';

interface Resources {
  uworld: boolean;
  aamc: boolean;
  adaptive: boolean;
  ankigame: boolean;
  anki: boolean;
}

interface GenerateTasksParams {
  resources: Resources;
  hoursPerDay: Record<string, string>;
  selectedBalance: string;
  startDate?: Date;
  endDate: Date;
  examDate: Date;
}

export function useStudyPlan() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { activities: examActivities, fetchExamActivities } = useExamActivities();

  const generateTasks = useCallback(async (params: GenerateTasksParams) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/generate-tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...params,
          startDate: params.startDate?.toISOString() || new Date().toISOString(),
          endDate: params.endDate.toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate tasks');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to generate tasks'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAllActivities = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/calendar-activity');
      if (!response.ok) {
        throw new Error('Failed to fetch activities');
      }
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch activities'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    generateTasks,
    fetchAllActivities,
    examActivities,
  };
} 