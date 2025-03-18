"use client";

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useAudioStore } from '@/store/slices/audioSlice';
import { useUserStore } from '@/store/slices/userSlice';
import { initializeGlobalStore } from '@/store';

/**
 * StoreInitializer Component
 * 
 * This component is responsible for initializing the global store and
 * setting up event listeners when the app starts.
 * 
 * It should be included near the root of the application, but within
 * any authentication providers so that user information is available.
 * 
 * @returns {JSX.Element} A component that initializes the store but doesn't render anything
 */
const StoreInitializer = () => {
  const { isLoaded, isSignedIn } = useUser();
  const refreshUserInfo = useUserStore(state => state.refreshUserInfo);
  const initializeAudioContext = useAudioStore(state => state.initializeAudioContext);
  
  // Initialize the global store when the app starts
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Initialize global store
    initializeGlobalStore({ forceOnboarding: true }).catch(error => {
      console.error('Failed to initialize global store:', error);
    });
    
    // Initialize audio context
    initializeAudioContext().catch(error => {
      console.error('Failed to initialize audio context:', error);
    });
  }, [initializeAudioContext]);
  
  // Refresh user information when the user is signed in
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      // Initial refresh
      refreshUserInfo().catch(error => {
        console.error('Failed to refresh user info:', error);
      });
      
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
        refreshUserInfo().catch(error => {
          console.error('Failed to refresh user info in secondary refresh:', error);
        });
      }, 1000);
      
      return () => clearTimeout(refreshTimeout);
    }
  }, [isLoaded, isSignedIn, refreshUserInfo]);
  
  // This component doesn't render anything
  return null;
};

export default StoreInitializer; 