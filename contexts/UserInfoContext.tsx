'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { UserInfo } from '@/hooks/useUserInfo';

interface UserInfoContextType {
  userInfo: UserInfo | null;
  refreshUserInfo: () => Promise<void>;
}

const UserInfoContext = createContext<UserInfoContextType | undefined>(undefined);

export const UserInfoProvider = ({ children }: { children: React.ReactNode }) => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  const refreshUserInfo = useCallback(async () => {
    try {
      const response = await fetch('/api/user-info');
      if (!response.ok) throw new Error();
      const data = await response.json();
      setUserInfo(data);
    } catch (error) {
      console.error('Failed to refresh user info:', error);
    }
  }, []);

  return (
    <UserInfoContext.Provider value={{ userInfo, refreshUserInfo }}>
      {children}
    </UserInfoContext.Provider>
  );
};

export const useUserInfoContext = () => {
  const context = useContext(UserInfoContext);
  if (!context) {
    throw new Error('useUserInfoContext must be used within UserInfoProvider');
  }
  return context;
};