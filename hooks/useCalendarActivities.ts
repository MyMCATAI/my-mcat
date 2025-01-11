import { useState, useEffect, useCallback } from 'react';

export interface DataPulse {
  id: string;
  name: string;
  level: string;
  positive: number;
  negative: number;
  source: string;
  fullLengthExamId: string;
  reviewed: boolean;
  section: string;
  aiResponse?: string;
}

export interface FullLengthExam {
  id: string;
  title: string;
  createdAt: string;
  score: number
  aiResponse: string
  dataPulses: DataPulse[];
}

export interface CalendarActivity {
  id: string;
  activityTitle: string;
  activityText: string;
  activityType: string;
  scheduledDate: string;
  status: string;
  hours: number;
  fullLengthExam?: FullLengthExam;
}

interface CreateExamActivityParams {
  activityTitle: string;
  activityText: string;
  scheduledDate: Date;
  hours?: number;
}

export function useExamActivities() {
  const [activities, setActivities] = useState<CalendarActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchExamActivities = useCallback(async () => {
    try {
      const response = await fetch('/api/calendar/exam-activities');
      if (!response.ok) {
        throw new Error('Failed to fetch exam activities');
      }
      const data = await response.json();
      setActivities(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch exam activities'));
      throw err;
    }
  }, []);

  const createExamActivity = useCallback(async (params: CreateExamActivityParams) => {
    try {
      setLoading(true);
      const response = await fetch('/api/calendar/exam-activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...params,
          scheduledDate: params.scheduledDate.toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create exam activity');
      }
      
      const data = await response.json();
      await fetchExamActivities();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create exam activity'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchExamActivities]);

  const updateExamDate = useCallback(async (id: string, scheduledDate: Date) => {
    try {
      setLoading(true);
      const response = await fetch('/api/calendar/exam-activities', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          scheduledDate: scheduledDate.toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update exam date');
      }
      
      const data = await response.json();
      await fetchExamActivities();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update exam date'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchExamActivities]);

  const deleteExamActivity = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/calendar/exam-activities?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete exam activity');
      }

      await fetchExamActivities();
      // Force a refresh by incrementing the key
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete exam activity'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchExamActivities]);

  // Initial fetch and refresh on key change
  useEffect(() => {
    setLoading(true);
    fetchExamActivities()
      .finally(() => setLoading(false));
  }, [fetchExamActivities, refreshKey]);

  return { 
    activities, 
    setActivities,
    loading, 
    error,
    createExamActivity,
    updateExamDate,
    deleteExamActivity,
    fetchExamActivities
  };
}

export function useAllCalendarActivities() {
  const [activities, setActivities] = useState<CalendarActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchAllActivities = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/calendar-activity');
      if (!response.ok) {
        throw new Error('Failed to fetch activities');
      }
      const data = await response.json();
      console.log(data);
      // Filter out exam activities
      const nonExamActivities = data.filter(
        (activity: CalendarActivity) => activity.activityType !== 'Exam'
      );
      setActivities(nonExamActivities);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch activities'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllActivities();
  }, [fetchAllActivities]);

  return {
    activities,
    loading,
    error,
    refetch: fetchAllActivities
  };
} 