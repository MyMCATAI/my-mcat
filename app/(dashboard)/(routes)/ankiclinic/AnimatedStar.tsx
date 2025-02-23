import React from 'react';
import { useSpring, animated } from 'react-spring';

interface AnimatedStarProps {
  progress: number;
  uniqueId: string;
}

const AnimatedStar: React.FC<AnimatedStarProps> = ({ progress, uniqueId }) => {
  const props = useSpring({
    width: `${progress * 100}%`,
    config: { tension: 170, friction: 5 }, // Increased tension and decreased friction
  });

  return (
    <svg
      viewBox="0 0 24 24"
      className="w-6 h-6 text-yellow-500"
      aria-label="Star"
      role="img"
    >
      <title>Star Rating</title>
      <defs>
        <linearGradient id={`grad-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="currentColor" />
          <animated.stop
            offset={props.width}
            stopColor="currentColor"
          />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>
      <polygon
        fill={`url(#grad-${uniqueId})`}
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        points="12 2 15.09 8.26 22 9.27 17 14.14 
                18.18 21.02 12 17.77 5.82 21.02 
                7 14.14 2 9.27 8.91 8.26 12 2"
      />
    </svg>
  );
};

export default React.memo(AnimatedStar);
