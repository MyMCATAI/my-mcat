"use client";

import { useState, useRef, useEffect } from 'react';

interface UserActivity {
  id: string;
  userId: string;
  type: string;
  location: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  metadata?: any;
}

interface CreateActivityParams {
  type: string;
  location: string;
  metadata?: any;
}

export const useUserActivity = () => {
  const [currentActivity, setCurrentActivity] = useState<UserActivity | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastEndCallTime = useRef<number>(0);

  useEffect(() => {
    // Recover activity from localStorage on mount
    const savedActivity = localStorage.getItem('currentActivity');
    if (savedActivity) {
      const parsed = JSON.parse(savedActivity);
      // If activity exists but wasn't properly ended, end it now
      endActivity(parsed.id);
    }

    // Handle page unload
    const handleBeforeUnload = () => {
      if (currentActivity) {
        // Use sendBeacon for reliable delivery during page unload
        const blob = new Blob([
          JSON.stringify({ 
            endTime: new Date().toISOString(),
          })
        ], { type: 'application/json' });
        navigator.sendBeacon(`/api/user-activity/${currentActivity.id}`, blob);
        localStorage.removeItem('currentActivity');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [currentActivity]);

  // Start tracking a new activity
  const startActivity = async ({ type, location, metadata = {} }: CreateActivityParams) => {    
    
    if(currentActivity){
    endActivity(currentActivity.id)
  }
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/user-activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          location,
          metadata
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create activity');
      }

      const activity = await response.json();
      setCurrentActivity(activity);
      localStorage.setItem('currentActivity', JSON.stringify(activity));
      return activity;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start activity');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // End the current activity
  const endActivity = async (inputActivityId: string) => {
    let activityId = inputActivityId
    
    if (!activityId) {
      if(!currentActivity) {
        return
      }
      activityId = currentActivity.id
    }

    const now = Date.now();
    if (now - lastEndCallTime.current < 5000) {
      // console.log('Please wait before ending activity again');
      return null;
    }
    
    lastEndCallTime.current = now;
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/user-activity/${activityId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endTime: new Date().toISOString()
        })
      });

      if (!response.ok) throw new Error('Failed to end activity');

      const updatedActivity = await response.json();
      setCurrentActivity(null);
      localStorage.removeItem('currentActivity');
      return updatedActivity;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to end activity');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Add this new function
  const updateActivityEndTime = async (inputActivityIdctivityId?: string | null) => {
    setIsLoading(true);
    setError(null);
    let activityId = inputActivityIdctivityId
    if(!inputActivityIdctivityId){
      if(!currentActivity) return
      activityId = currentActivity?.id
    }
    
    try {
      const response = await fetch(`/api/user-activity/${activityId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endTime: new Date().toISOString()
        })
      });

      if (!response.ok) throw new Error('Failed to update activity');

      const updatedActivity = await response.json();
      return updatedActivity;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update activity end time');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    currentActivity,
    isLoading,
    error,
    startActivity,
    endActivity,
    updateActivityEndTime,
  };
}; 