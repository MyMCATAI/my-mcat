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
    console.log('[StoreInitializer] Initializing global store');
    
    initializeStore().catch(error => {
      console.error('[StoreInitializer] Error initializing global store:', error);
    });
  }, [initializeStore]);
  
  // Refresh user information when the user is signed in
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      console.log('[StoreInitializer] User is signed in, refreshing user info');
      refreshUserInfo();
    }
  }, [isLoaded, isSignedIn, refreshUserInfo]);
  
  // This component doesn't render anything
  return null;
};

export default StoreInitializer; 