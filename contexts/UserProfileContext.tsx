"use client";

import React, { createContext, useContext } from 'react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useUser } from '@clerk/nextjs';

interface UserProfileContextType {
  profile: any;
  isLoading: boolean;
  updateProfile: (updates: any) => Promise<void>;
}

const UserProfileContext = createContext<UserProfileContextType | null>(null);

export const UserProfileProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress;
  
  const { profile, isLoading, updateProfile } = useUserProfile(
    email ? { email } : null
  );

  return (
    <UserProfileContext.Provider value={{ profile, isLoading, updateProfile }}>
      {children}
    </UserProfileContext.Provider>
  );
};

export const useProfileContext = () => {
  const context = useContext(UserProfileContext);
  if (!context) throw new Error('useProfileContext must be used within UserProfileProvider');
  return context;
}; 