import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useUserInfo } from '@/hooks/useUserInfo';

interface UserStatsContextType {
  coins: number;
  updateCoins: (amount: number) => Promise<void>;  // DB update
  updateCoinsDisplay: (newAmount: number) => void;  // UI-only update
  isLoading: boolean;
}

const UserStatsContext = createContext<UserStatsContextType | undefined>(undefined);

export const UserStatsProvider = ({ children }: { children: React.ReactNode }) => {
  const { userInfo, updateScore, isLoading } = useUserInfo();
  const [displayCoins, setDisplayCoins] = useState<number>(0);

  useEffect(() => {
    if (userInfo?.score !== undefined) {
      setDisplayCoins(userInfo.score);
    }
  }, [userInfo?.score]);

  const updateCoinsDisplay = useCallback((newAmount: number) => {
    setDisplayCoins(newAmount);
  }, []);

  return (
    <UserStatsContext.Provider value={{ 
      coins: userInfo?.score ?? displayCoins,
      updateCoins: updateScore,
      updateCoinsDisplay,
      isLoading
    }}>
      {children}
    </UserStatsContext.Provider>
  );
};

export const useUserStats = () => {
  const context = useContext(UserStatsContext);
  if (context === undefined) {
    throw new Error('useUserStats must be used within a UserStatsProvider');
  }
  return context;
}; 