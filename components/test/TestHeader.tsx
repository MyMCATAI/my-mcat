import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import Link from 'next/link';
import { useStopwatch } from 'react-timer-hook';

interface TestHeaderProps {
  title: string | undefined;
  isCreatingTest: boolean;
}

export interface TestHeaderRef {
  getElapsedTime: () => number;
  reset: () => void;
}

const TestHeader = forwardRef<TestHeaderRef, TestHeaderProps>(({ title, isCreatingTest }, ref) => {
  const {
    seconds,
    minutes,
    hours,
    reset: resetStopwatch,
    pause,
    start
  } = useStopwatch({ autoStart: true });

  useImperativeHandle(ref, () => ({
    getElapsedTime: () => hours * 3600 + minutes * 60 + seconds,
    reset: () => {
      pause();
      resetStopwatch();
      start();
    }
  }));

  return (
    <div className="bg-[#006dab] p-2 h-15 flex justify-between items-center border-3 border-sky-500">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold ml-6">
          {title}
          {isCreatingTest && <span className="ml-2 text-sm text-gray-400">Creating test...</span>}
        </h1>
      </div>
      <div className="timer text-sky-300">
        <span>{hours.toString().padStart(2, '0')}:</span>
        <span>{minutes.toString().padStart(2, '0')}:</span>
        <span>{seconds.toString().padStart(2, '0')}</span>
      </div>
      <Link href="/home" className="ml-4 px-3 py-1 bg-sky-500 hover:bg-sky-600 text-white rounded transition duration-300">
        Return Home
      </Link>
    </div>
  );
});

TestHeader.displayName = 'TestHeader';

export default TestHeader;