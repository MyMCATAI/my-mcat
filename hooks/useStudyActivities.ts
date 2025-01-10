import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

export interface StudyActivity {
  id: string;
  scheduledDate: Date;
  activityTitle: string;
  activityText: string;
  hours: number;
  activityType: string;
  status: string;
  tasks: { text: string; completed: boolean; }[];
}

export const useStudyActivities = (examId?: string) => {
  const { user } = useUser();
  const [activities, setActivities] = useState<StudyActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await fetch('/api/study-activities' + (examId ? `?examId=${examId}` : ''));
      
      if (!response.ok) {
        throw new Error('Failed to fetch study activities');
      }

      const data = await response.json();
      setActivities(data.activities);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch activities');
    } finally {
      setLoading(false);
    }
  };

  const updateActivityStatus = async (activityId: string, status: string) => {
    try {
      const response = await fetch(`/api/study-activities/${activityId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update activity status');
      }

      // Update local state
      setActivities(prev => 
        prev.map(activity => 
          activity.id === activityId 
            ? { ...activity, status } 
            : activity
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update activity');
    }
  };

  const updateTaskStatus = async (activityId: string, taskIndex: number, completed: boolean) => {
    try {
      const response = await fetch(`/api/study-activities/${activityId}/tasks`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ taskIndex, completed }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task status');
      }

      // Update local state
      setActivities(prev => 
        prev.map(activity => {
          if (activity.id === activityId) {
            const newTasks = [...activity.tasks];
            newTasks[taskIndex] = { ...newTasks[taskIndex], completed };
            return { ...activity, tasks: newTasks };
          }
          return activity;
        })
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
    }
  };

  useEffect(() => {
    if (user) {
      fetchActivities();
    }
  }, [user, examId]);

  return {
    activities,
    loading,
    error,
    fetchActivities,
    updateActivityStatus,
    updateTaskStatus
  };
}; 