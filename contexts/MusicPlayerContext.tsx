import { createContext, useContext, useState } from 'react';

interface MusicPlayerContextType {
  isAutoPlay: boolean;
  setIsAutoPlay: (value: boolean) => void;
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined);

export const MusicPlayerProvider = ({ children }: { children: React.ReactNode }) => {
  console.log('🔍 [DEBUG] MusicPlayerProvider rendering');
  const [isAutoPlay, setIsAutoPlay] = useState(false);

  return (
    <MusicPlayerContext.Provider value={{ isAutoPlay, setIsAutoPlay }}>
      {children}
    </MusicPlayerContext.Provider>
  );
};

export const useMusicPlayer = () => {
  console.log('🔍 [DEBUG] useMusicPlayer hook called');
  const context = useContext(MusicPlayerContext);
  if (context === undefined) {
    console.error('🔍 [DEBUG] useMusicPlayer - context is undefined!');
    throw new Error('useMusicPlayer must be used within a MusicPlayerProvider');
  }
  return context;
}; 