import { createContext, useContext, useState } from 'react';

interface MusicPlayerContextType {
  isAutoPlay: boolean;
  setIsAutoPlay: (value: boolean) => void;
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined);

export const MusicPlayerProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAutoPlay, setIsAutoPlay] = useState(false);

  return (
    <MusicPlayerContext.Provider value={{ isAutoPlay, setIsAutoPlay }}>
      {children}
    </MusicPlayerContext.Provider>
  );
};

export const useMusicPlayer = () => {
  const context = useContext(MusicPlayerContext);
  if (context === undefined) {
    throw new Error('useMusicPlayer must be used within a MusicPlayerProvider');
  }
  return context;
}; 