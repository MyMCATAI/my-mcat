"use client";

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useUser as useZustandUser } from '@/store/selectors';

const StoreInitializer = () => {
  const { isLoaded, isSignedIn } = useUser();
  const { refreshUserInfo } = useZustandUser();
  
  // Initialize Zustand store with user data when the user is signed in
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      refreshUserInfo();
    }
  }, [isLoaded, isSignedIn, refreshUserInfo]);
  
  // This component doesn't render anything
  return null;
};

export default StoreInitializer; 