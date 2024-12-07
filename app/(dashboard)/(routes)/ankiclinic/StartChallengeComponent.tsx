'use client'

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { animated, useSpring } from '@react-spring/web';

interface StartChallengeComponentProps {
  onClick: () => void;
  timer: number;
  setTimer: (seconds: number) => void;
}

const StartChallengeComponent: React.FC<StartChallengeComponentProps> = ({ onClick, timer, setTimer }) => {
  const [isHovered, setIsHovered] = useState(false);

  const { color } = useSpring({
    from: { color: 'rgb(99, 102, 241)' }, // indigo-500
    to: {
      color: isHovered ? 'rgb(79, 70, 229)' : 'rgb(99, 102, 241)', // hover: indigo-600
    },
    config: {
      tension: 300,
      friction: 20,
    }
  });

  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-4">
      <animated.div
        style={{
          background: color.to(c => `linear-gradient(to right, ${c}, rgb(147, 51, 234))`),
        }}
        className={`rounded-xl ${
          !isHovered ? 'animate-[scale_2s_ease-in-out_infinite]' : ''
        }`}
      >
        <Button 
          onClick={onClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="text-4xl font-bold py-8 px-12 text-white rounded-xl shadow-lg transform transition-all duration-200 active:scale-95"
          style={{ background: 'transparent' }}
        >
          START CHALLENGE!
        </Button>
      </animated.div>
      
      {/* Timer buttons */}
      <div className="flex gap-4">
        <Button
          onClick={() => setTimer(60)}
          className={`px-6 py-3 text-white rounded-lg shadow-md ${
            timer === 60
              ? 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700'
              : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
          }`}
        >
          1 min
        </Button>
        <Button
          onClick={() => setTimer(120)}
          className={`px-6 py-3 text-white rounded-lg shadow-md ${
            timer === 120
              ? 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700'
              : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
          }`}
        >
          2 min
        </Button>
        <Button
          onClick={() => setTimer(180)}
          className={`px-6 py-3 text-white rounded-lg shadow-md ${
            timer === 180
              ? 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700'
              : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
          }`}
        >
          3 min
        </Button>
      </div>

      <style jsx global>{`
        @keyframes scale {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }
      `}</style>
    </div>
  );
};

export default StartChallengeComponent;
