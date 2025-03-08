"use client";

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useStore } from '@/store/store';

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
  const { isLoaded, isSignedIn } = useUser();
  const refreshUserInfo = useStore(state => state.refreshUserInfo);
  const initializeStore = useStore(state => state.initializeStore);
  
  // Initialize the global store when the app starts
  useEffect(() => {
    initializeStore().catch(error => {
      console.error('[StoreInitializer] Error initializing global store:', error);
    });
  }, [initializeStore]);
  
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