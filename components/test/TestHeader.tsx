// TestHeader.tsx
import React, { useRef, useImperativeHandle, forwardRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { useStopwatch } from 'react-timer-hook';
import { FaHome } from 'react-icons/fa'; // Import the home icon
import { useAudio } from '@/store/selectors'; // Replace useAudioManager

interface TestHeaderProps {
  title: string | undefined;
  isCreatingTest: boolean;
  currentQuestionIndex: number;
  hasAnsweredFirstQuestion: boolean;
  homeLink: string;
}

export interface TestHeaderRef {
  getElapsedTime: () => number;
  resetQuestionTimer: () => void;
  startQuestionTimer: () => void;
  getTotalElapsedTime: () => number;
  pauseTimers: () => void;
  resumeTimers: (resumeQuestionTimer: boolean, resumeTotalTimer: boolean) => void;
  isQuestionTimerRunning: boolean;
  isTotalTimerRunning: boolean;
  getQuestionElapsedTime: () => number;
}

const TestHeader = forwardRef<TestHeaderRef, TestHeaderProps>(
  ({ title, isCreatingTest, currentQuestionIndex, hasAnsweredFirstQuestion, homeLink }, ref) => {
    const audio = useAudio(); // Replace useAudioManager hook

    const {
      seconds: questionSeconds,
      minutes: questionMinutes,
      hours: questionHours,
      reset: resetQuestionStopwatch,
      pause: pauseQuestionStopwatch,
      start: startQuestionStopwatch,
      isRunning: isQuestionTimerRunning,
    } = useStopwatch({ autoStart: false });

    const {
      seconds: totalSeconds,
      minutes: totalMinutes,
      hours: totalHours,
      pause: pauseTotalStopwatch,
      start: startTotalStopwatch,
      isRunning: isTotalTimerRunning,
    } = useStopwatch({ autoStart: true });

    const [timerColor, setTimerColor] = useState('text-sky-300');
    const [isFlashing, setIsFlashing] = useState(false);

    const [hasPlayedBeep, setHasPlayedBeep] = useState(false);
    const [hasPlayedTotalBeep, setHasPlayedTotalBeep] = useState(false);

    const [hasPlayedQuestionBeep, setHasPlayedQuestionBeep] = useState(false);

    useImperativeHandle(ref, () => ({
      getElapsedTime: () => questionHours * 3600 + questionMinutes * 60 + questionSeconds,
      resetQuestionTimer: () => {
        pauseQuestionStopwatch();
        resetQuestionStopwatch(new Date(), false)
        setTimerColor('text-sky-300');
        setIsFlashing(false);
        setHasPlayedQuestionBeep(false);
      },
      startQuestionTimer: () => {
        if (hasAnsweredFirstQuestion) {
          startQuestionStopwatch();
        }
      },
      getTotalElapsedTime: () => totalHours * 3600 + totalMinutes * 60 + totalSeconds,
      pauseTimers: () => {
        pauseQuestionStopwatch();
        pauseTotalStopwatch();
      },
      resumeTimers: (resumeQuestionTimer: boolean, resumeTotalTimer: boolean) => {
        if (resumeQuestionTimer) {
          startQuestionStopwatch();
        }
        if (resumeTotalTimer) {
          startTotalStopwatch();
        }
      },
      isQuestionTimerRunning,
      isTotalTimerRunning,
      getQuestionElapsedTime: () => questionHours * 3600 + questionMinutes * 60 + questionSeconds,
    }));

    // Question Timer Logic
    useEffect(() => {
      if (!isQuestionTimerRunning || !hasAnsweredFirstQuestion) {
        return;
      }

      const totalQuestionSeconds = questionHours * 3600 + questionMinutes * 60 + questionSeconds;

      if (totalQuestionSeconds >= 60) {
        // 1 minute
        setTimerColor('text-red-500');
        setIsFlashing(true);

        if (!hasPlayedQuestionBeep) {
          audio.playSound('beep');
          setHasPlayedQuestionBeep(true);
        }
      } else if (totalQuestionSeconds >= 30) {
        // 30 seconds
        setTimerColor('text-yellow-500');
        setIsFlashing(false);
      } else {
        setTimerColor('text-sky-300');
        setIsFlashing(false);
      }
    }, [questionSeconds, questionMinutes, questionHours, hasPlayedQuestionBeep, isQuestionTimerRunning, hasAnsweredFirstQuestion, audio]);

    // Total Timer Beep at 5 Minutes, Only if Question Timer Hasn't Started
    useEffect(() => {
      const totalElapsedSeconds = totalHours * 3600 + totalMinutes * 60 + totalSeconds;

      if (totalElapsedSeconds >= 300 && !hasPlayedTotalBeep && !isQuestionTimerRunning) {
        audio.playSound('beep');
        setHasPlayedTotalBeep(true);
      }
    }, [totalSeconds, totalMinutes, totalHours, hasPlayedTotalBeep, isQuestionTimerRunning, audio]);

    return (
      <div className="bg-[#006dab] p-2 h-15 flex justify-between items-center border-3 border-sky-500">
        <div className="flex items-center">
          <h1 className="text-lg font-semibold ml-6">
            {title}
            {isCreatingTest && (
              <span className="ml-2 text-sm text-gray-400">Creating test...</span>
            )}
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex flex-col items-center">
            <div
              className={`timer ${timerColor}`}
              style={{ animation: isFlashing ? `flash 1s linear infinite` : 'none' }}
            >
              <span>{String(questionHours).padStart(2, '0')}:</span>
              <span>{String(questionMinutes).padStart(2, '0')}:</span>
              <span>{String(questionSeconds).padStart(2, '0')}</span>
            </div>
            <div className="text-sm text-gray-300">Question Time</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="timer">
              <span>{String(totalHours).padStart(2, '0')}:</span>
              <span>{String(totalMinutes).padStart(2, '0')}:</span>
              <span>{String(totalSeconds).padStart(2, '0')}</span>
            </div>
            <div className="text-sm text-gray-300">Total Test Time</div>
          </div>
          <div className="text-sm text-gray-300">
            Question {currentQuestionIndex + 1}
          </div>
          <Link
            href={homeLink}
            className="ml-4 p-2 bg-sky-500 hover:bg-sky-600 text-white rounded transition duration-300"
          >
            <FaHome size={24} />
          </Link>
        </div>
      </div>
    );
  }
);

TestHeader.displayName = 'TestHeader';

export default TestHeader;
