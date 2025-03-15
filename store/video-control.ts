import { create } from 'zustand';

interface VideoControlState {
  shouldPauseVideo: boolean;
  setShouldPauseVideo: (shouldPause: boolean) => void;
}

export const useVideoControl = create<VideoControlState>((set) => ({
  shouldPauseVideo: false,
  setShouldPauseVideo: (shouldPause) => set({ shouldPauseVideo: shouldPause }),
})); 