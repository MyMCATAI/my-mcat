"use client";

import { createContext, useContext, useState } from 'react';

interface MusicPlayerContextType {
  isAutoPlay: boolean;
  setIsAutoPlay: (value: boolean) => void;
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined);

/**
 * @deprecated This provider is maintained for backward compatibility only
 * The autoplay functionality should be migrated to the Zustand store
 */
export const MusicPlayerProvider = ({ children }: { children: React.ReactNode }) => {
  console.debug('[MusicPlayerContext] Using compatibility layer - consider migrating to Zustand store');
  
  const [isAutoPlay, setIsAutoPlay] = useState(false);

  return (
    <MusicPlayerContext.Provider value={{ isAutoPlay, setIsAutoPlay }}>
      {children}
    </MusicPlayerContext.Provider>
  );
};

/**
 * @deprecated This hook is maintained for backward compatibility only
 * The autoplay functionality should be migrated to the Zustand store
 */
export const useMusicPlayer = (): MusicPlayerContextType => {
  const context = useContext(MusicPlayerContext);
  if (context === undefined) {
    console.warn('useMusicPlayer used outside provider, returning default values');
    // Return a default implementation that does nothing
    return {
      isAutoPlay: false,
      setIsAutoPlay: () => console.debug('[MusicPlayerContext] setIsAutoPlay called outside provider')
    };
  }
  return context;
}; 