import React, { useImperativeHandle, useRef, forwardRef } from 'react';

export interface TimerRef {
  getElapsedTime: () => number;
  startTimer: () => void;
  resetTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
}

const Timer = forwardRef<TimerRef>((_, ref) => {
  const startTimeRef = useRef<number | null>(null);
  const elapsedTimeRef = useRef<number>(0);
  const isRunningRef = useRef<boolean>(false);

  useImperativeHandle(ref, () => ({
    getElapsedTime: () => {
      if (!isRunningRef.current) return elapsedTimeRef.current;
      if (!startTimeRef.current) return 0;
      
      const currentTime = Date.now();
      return elapsedTimeRef.current + (currentTime - startTimeRef.current) / 1000;
    },
    startTimer: () => {
      startTimeRef.current = Date.now();
      isRunningRef.current = true;
    },
    resetTimer: () => {
      startTimeRef.current = Date.now();
      elapsedTimeRef.current = 0;
    },
    pauseTimer: () => {
      if (startTimeRef.current && isRunningRef.current) {
        elapsedTimeRef.current += (Date.now() - startTimeRef.current) / 1000;
        isRunningRef.current = false;
      }
    },
    resumeTimer: () => {
      if (!isRunningRef.current) {
        startTimeRef.current = Date.now();
        isRunningRef.current = true;
      }
    }
  }));

  return null;
});

Timer.displayName = 'Timer';

export default Timer;