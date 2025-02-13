import React, { useEffect, useState } from 'react';

interface FadingMessageProps {
  message: string;
  duration?: number; // Duration in milliseconds
  onComplete?: () => void;
  animation?: 'shake' | 'bounce';
  iconAnimation?: 'checkmark';
}

const FadingMessage = ({ message, duration = 3000, onComplete, animation, iconAnimation }: FadingMessageProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const checkmarkAnimationDuration = 900; // 600ms for circle + 300ms for fill

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onComplete) onComplete();
    }, iconAnimation === 'checkmark' ? checkmarkAnimationDuration + duration : duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete, iconAnimation]);

  if (!isVisible) return null;

  return (
    <div 
      className="flex flex-col items-center gap-2 px-4 py-2 bg-[--theme-mainbox-color] rounded-lg shadow-lg"
      style={{
        animation: `${animation ? `${animation} 0.5s ease-in-out, ` : ''}fadeOut ${duration}ms ease-in-out ${iconAnimation === 'checkmark' ? `${checkmarkAnimationDuration}ms` : '0ms'} forwards`
      }}
    >
      {iconAnimation === 'checkmark' && (
        <svg 
          className="w-8 h-8" 
          viewBox="0 0 24 24"
        >
          <circle 
            cx="12" 
            cy="12" 
            r="10" 
            className="stroke-green-500 fill-none"
            style={{ 
              strokeDasharray: 64,
              strokeDashoffset: 64,
              animation: 'circle-draw 0.6s ease-out forwards, circle-fill 0.3s ease-out 0.6s forwards'
            }} 
          />
          <path 
            d="M8 12l3 3 5-5" 
            className="stroke-white fill-none stroke-2"
            style={{ 
              strokeDasharray: 20,
              strokeDashoffset: 20,
              animation: 'checkmark-draw 0.3s ease-out 0.6s forwards'
            }} 
          />
        </svg>
      )}
      <div className="inline-block text-[--theme-text-color]">
        {message}
      </div>
    </div>
  );
};

export default FadingMessage; 