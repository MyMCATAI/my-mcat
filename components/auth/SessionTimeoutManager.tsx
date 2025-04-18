'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useClerk } from '@clerk/nextjs';
import { toast } from 'react-hot-toast';

// Inactivity timeout in milliseconds (15 minutes)
const INACTIVITY_TIMEOUT = 15 * 60 * 1000;
// Warning before timeout in milliseconds (1 minute)
const WARNING_BEFORE_TIMEOUT = 60 * 1000;
// Activity events to track
const ACTIVITY_EVENTS = [
  'mousedown', 'mousemove', 'keydown', 
  'scroll', 'touchstart', 'click'
];

export default function SessionTimeoutManager() {
  const { signOut } = useClerk();
  const [showWarning, setShowWarning] = useState(false);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  // Reset timers on user activity
  const resetTimers = useCallback(() => {
    lastActivityRef.current = Date.now();
    
    // Clear existing timers
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
      setShowWarning(false);
    }
    
    // Set new timers
    warningTimerRef.current = setTimeout(() => {
      setShowWarning(true);
    }, INACTIVITY_TIMEOUT - WARNING_BEFORE_TIMEOUT);
    
    inactivityTimerRef.current = setTimeout(() => {
      handleSessionTimeout();
    }, INACTIVITY_TIMEOUT);
  }, []);

  // Handle user activity
  const handleUserActivity = useCallback(() => {
    // Only reset timers if it's been more than 1 second since last activity
    // This prevents excessive timer resets during continuous activity
    if (Date.now() - lastActivityRef.current > 1000) {
      resetTimers();
    }
  }, [resetTimers]);

  // Handle session timeout
  const handleSessionTimeout = async () => {
    setShowWarning(false);
    toast.error("You've been logged out due to inactivity");
    await signOut();
  };

  // Continue the session
  const continueSession = () => {
    setShowWarning(false);
    resetTimers();
  };

  useEffect(() => {
    // Set initial timers
    resetTimers();
    
    // Add event listeners for user activity
    for (const event of ACTIVITY_EVENTS) {
      window.addEventListener(event, handleUserActivity);
    }
    
    // Clean up timers and event listeners on unmount
    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      if (warningTimerRef.current) {
        clearTimeout(warningTimerRef.current);
      }
      
      for (const event of ACTIVITY_EVENTS) {
        window.removeEventListener(event, handleUserActivity);
      }
    };
  }, [resetTimers, handleUserActivity]);

  // Render the warning modal or nothing
  if (!showWarning) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full">
        <h3 className="text-xl font-semibold mb-4 dark:text-white">
          Session Timeout Warning
        </h3>
        <p className="mb-6 dark:text-gray-300">
          Your session is about to expire due to inactivity. You will be logged out in 60 seconds.
        </p>
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={handleSessionTimeout}
            className="px-4 py-2 rounded text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-gray-700"
          >
            Logout Now
          </button>
          <button
            type="button"
            onClick={continueSession}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
          >
            Continue Session
          </button>
        </div>
      </div>
    </div>
  );
} 