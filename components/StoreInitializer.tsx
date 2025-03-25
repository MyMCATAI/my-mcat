"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
import { useUser as useClerkUser } from '@clerk/nextjs';
import { useUserStore } from '@/store/slices/userSlice';
import { useAudioStore } from '@/store/slices/audioSlice';
import { useUIStore } from '@/store/slices/uiSlice';
import type { ThemeType } from '@/store/slices/uiSlice';

/**
 * Initialize global store with theme and audio settings
 */
const initializeGlobalStore = async (): Promise<void> => {
  if (typeof window !== 'undefined') {
    try {
      // Initialize audio context
      await useAudioStore.getState().initializeAudioContext();
      
      // Initialize UI state
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme && ['cyberSpace', 'sakuraTrees', 'sunsetCity', 'mykonosBlue'].includes(savedTheme)) {
        useUIStore.getState().setTheme(savedTheme as ThemeType);
      }
    } catch (error) {
      console.error('[Store] Store initialization failed:', error);
      throw error;
    }
  }
};

/**
 * StoreInitializer component
 * 
 * This component initializes the global store when the app starts.
 * It handles:
 * 1. Audio initialization
 * 2. User data synchronization
 * 
 * It doesn't render anything visible, just handles initialization.
 */
const StoreInitializer = () => {
  const { isLoaded, isSignedIn } = useClerkUser();
  const refreshUserInfo = useUserStore(state => state.refreshUserInfo);
  const initializeAudioContext = useAudioStore(state => state.initializeAudioContext);
  
  // Track data refresh state
  const [isInitialRefreshComplete, setIsInitialRefreshComplete] = useState(false);
  const refreshAttemptRef = useRef(0);
  
  // Initialize the global store when the app starts
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Initialize global store
    initializeGlobalStore().catch(error => {
      console.error('[StoreInitializer] Error initializing global store:', error);
    });
    
    // Initialize audio context
    initializeAudioContext().catch(error => {
      console.error('[StoreInitializer] Error initializing audio context:', error);
    });
  }, [initializeAudioContext]);
  
  // Helper to log performance info during refresh
  const logRefreshAttempt = useCallback((action: string, attempt: number) => {
    // Simplified: Only log critical user refresh events
    if (action.includes('failed')) {
      console.log(`[StoreInitializer] ${action} (attempt: ${attempt})`);
    }
  }, []);
  
  // Refresh user information when the user is signed in - dependency-based approach
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    
    // Track this refresh attempt
    const currentAttempt = refreshAttemptRef.current;
    refreshAttemptRef.current += 1;
    
    logRefreshAttempt('User signed in, refreshing user info', currentAttempt);
    
    refreshUserInfo()
      .then(() => {
        logRefreshAttempt('User refresh complete', currentAttempt);
        setIsInitialRefreshComplete(true);
      })
      .catch(error => {
        console.error(`[StoreInitializer] User refresh failed (attempt: ${currentAttempt}):`, error);
      });
      
  }, [isLoaded, isSignedIn, refreshUserInfo, logRefreshAttempt]);
  
  // Secondary refresh effect that depends on initial refresh being complete
  // This replaces the arbitrary timeout with a dependency-based approach
  useEffect(() => {
    if (!isInitialRefreshComplete || !isLoaded || !isSignedIn) return;
    
    // Track this refresh attempt
    const currentAttempt = refreshAttemptRef.current;
    refreshAttemptRef.current += 1;
    
    logRefreshAttempt('Initial refresh complete, performing verification refresh', currentAttempt);
    
    refreshUserInfo()
      .then(() => {
        logRefreshAttempt('Verification refresh complete', currentAttempt);
      })
      .catch(error => {
        console.error(`[StoreInitializer] Verification refresh failed (attempt: ${currentAttempt}):`, error);
      });
      
  }, [isInitialRefreshComplete, isLoaded, isSignedIn, refreshUserInfo, logRefreshAttempt]);
  
  // This component doesn't render anything
  return null;
};

export default StoreInitializer; 