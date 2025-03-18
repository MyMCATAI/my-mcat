"use client";

import { useEffect } from 'react';
import { useUser as useClerkUser } from '@clerk/nextjs';
import { useUser } from '@/store/selectors';
import { useAudioStore } from '@/store/slices/audioSlice';
import { initializeGlobalStore } from '@/store';

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
  const { refreshUserInfo } = useUser();
  const initializeAudioContext = useAudioStore(state => state.initializeAudioContext);
  
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
  
  // Refresh user information when the user is signed in
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      // Initial refresh
      refreshUserInfo();
      
      /**
       * IMPORTANT: Secondary refresh to ensure state synchronization
       * 
       * This solves a race condition where:
       * 1. The first refreshUserInfo() updates hasCompletedOnboarding in the store
       * 2. But RouteTracker might read the old value before the update is fully applied
       * 3. This causes incorrect redirects (e.g., to onboarding when it should go to home)
       * 
       * The delayed second refresh ensures all components have the correct state
       * after the initial data load is complete.
       */
      const refreshTimeout = setTimeout(() => {
        refreshUserInfo();
      }, 1000);
      
      return () => clearTimeout(refreshTimeout);
    }
  }, [isLoaded, isSignedIn, refreshUserInfo]);
  
  // This component doesn't render anything
  return null;
};

export default StoreInitializer; 