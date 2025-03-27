import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { VIDEO_TIMESTAMPS } from './atsVariables'

/* --- Types ---- */
export interface ATSState {
  videoPause: boolean;
  timer: number;
  timerFormatted: string;
  timerInterval: NodeJS.Timeout | null;
}

/* --- Initial State ---- */
const initialState: ATSState = {
  timer: 0,
  timerFormatted: '0:00',
  videoPause: false,
  timerInterval: null,
};

/* --- Store ---- */
export interface ATSSlice extends ATSState {
  setVideoPause: (pause: boolean) => void;
  setTimer: (seconds: number) => void;
  startTimer: () => void;
  stopTimer: () => void;
  resetState: () => void;
}

export const useATSStore = create<ATSSlice>()(
  devtools(
    (set) => ({
      ...initialState,
      setVideoPause: (pause: boolean) => {
        set({ videoPause: pause });
      },
      setTimer: (seconds: number) => {
        const time = Math.floor(seconds);
        const minutes = Math.floor(time / 60);
        const remainingSeconds = time % 60;
        const formattedTime = `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
        
        set((state) => {
          // Set videoPause to true when timer reaches configured timestamp
          if (time >= VIDEO_TIMESTAMPS.ALPHA_CARBON && !state.videoPause) {
            return {
              timer: time,
              timerFormatted: formattedTime,
              videoPause: true,
            };
          }
          return {
            timer: time,
            timerFormatted: formattedTime,
          };
        });
      },
      startTimer: () => {
        set((state) => {
          if (state.timerInterval) {
            clearInterval(state.timerInterval);
          }
          return {
            timer: 0,
            timerFormatted: '0:00',
            videoPause: false,
            timerInterval: null,
          };
        });
      },
      stopTimer: () => {
        set((state) => {
          if (state.timerInterval) {
            clearInterval(state.timerInterval);
          }
          return {
            timerInterval: null,
          };
        });
      },
      resetState: () => {
        set((state) => {
          if (state.timerInterval) {
            clearInterval(state.timerInterval);
          }
          return {
            timer: 0,
            timerFormatted: '0:00',
            videoPause: false,
            timerInterval: null,
          };
        });
      },
    }),
    {
      name: 'ats-store',
    }
  )
); 