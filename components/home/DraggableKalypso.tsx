"use client"

import React, { useState, useRef, useEffect } from 'react';
import Draggable from 'react-draggable';

type KalypsoState = 'wait' | 'talk' | 'end' | 'start' | 'floating';

interface DraggableKalypsoProps {
  buttonSize?: number | string;
}

const DraggableKalypso: React.FC<DraggableKalypsoProps> = ({ 
  buttonSize = '24rem',
}) => {
  const [kalypsoState, setKalypsoState] = useState<KalypsoState>('wait');
  const [kalypsoSrc, setKalypsoSrc] = useState('/kalypso/kalypsowait.gif');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Setting initial position toward the left
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const meowIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const nodeRef = useRef(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastMeowTimeRef = useRef<number>(0);
  const lastPositionRef = useRef({ x: 0, y: 0 });
  const movementThresholdRef = useRef(15); // Minimum movement in pixels to trigger a meow

  // Map of state to file names (based on actual files in /public/kalypso/)
  const stateToFile = {
    wait: '/kalypso/kalypsowait.gif',
    talk: '/kalypso/kalypsotalk.gif',
    end: '/kalypso/kalypsoend.gif',
    start: '/kalypso/kalypsostart.gif',
    floating: '/kalypso/kalypsofloating.gif'
  };

  // Initialize audio element
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio('/audio/cat-meow.mp3');
      audioRef.current.volume = 0.7; // Set volume to 70%
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Play the meow sound with a min delay between meows
  const playMeow = () => {
    const now = Date.now();
    // Don't play the sound too frequently - limit to once every 800ms
    if (now - lastMeowTimeRef.current > 800) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0; // Reset to start
        audioRef.current.play().catch(err => console.error("Error playing audio:", err));
        lastMeowTimeRef.current = now;
      }
    }
  };

  // Set up an interval to periodically play meow during dragging
  const startMeowInterval = () => {
    if (meowIntervalRef.current) {
      clearInterval(meowIntervalRef.current);
    }
    
    meowIntervalRef.current = setInterval(() => {
      if (isDragging) {
        playMeow();
      }
    }, Math.random() * 1000 + 800); // Random interval between 800-1800ms
  };

  // Clean up the meow interval
  const stopMeowInterval = () => {
    if (meowIntervalRef.current) {
      clearInterval(meowIntervalRef.current);
      meowIntervalRef.current = null;
    }
  };

  // Calculate initial position based on window size 
  useEffect(() => {
    // Allow a small delay for the component to mount properly
    const timeout = setTimeout(() => {
      // Setting to 0,0 and letting the fixed positioning handle the rest
      setPosition({ x: 0, y: 0 });
    }, 100);
    
    return () => clearTimeout(timeout);
  }, []);

  const switchKalypsoState = (newState: KalypsoState): void => {
    setKalypsoState(newState);
    setKalypsoSrc(stateToFile[newState]);
  };

  const handleDragStart = () => {
    // Play meow sound when dragging starts
    playMeow();
    
    // Start the interval for periodic meows during dragging
    startMeowInterval();
    
    dragTimeoutRef.current = setTimeout(() => {
      setIsDragging(true);
      switchKalypsoState('floating');
    }, 200);
  };

  const handleDragStop = () => {
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current);
    }
    
    // Stop the meow interval
    stopMeowInterval();
    
    setIsDragging(false);
    switchKalypsoState('wait');
  };

  // Random animations for Kalypso when idle
  useEffect(() => {
    const randomAnimation = () => {
      const states: KalypsoState[] = ['wait', 'talk', 'end', 'start'];
      const randomState = states[Math.floor(Math.random() * states.length)];
      
      switchKalypsoState(randomState);
      
      timeoutRef.current = setTimeout(() => {
        switchKalypsoState('wait');
        
        // Schedule next animation
        timeoutRef.current = setTimeout(randomAnimation, Math.random() * 15000 + 10000);
      }, Math.random() * 3000 + 2000);
    };
    
    // Start the animation cycle after a delay
    const initialTimeout = setTimeout(randomAnimation, 5000);
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      clearTimeout(initialTimeout);
      if (dragTimeoutRef.current) {
        clearTimeout(dragTimeoutRef.current);
      }
      stopMeowInterval(); // Clean up the meow interval
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="fixed pointer-events-none" 
      style={{ 
        // YOU CAN EDIT KALYPSO'S INITIAL POSITION HERE ↓
        bottom: '-3rem', // Change this value to adjust vertical position from bottom
        left: '55rem',  // Change this value to adjust horizontal position from left
        // Or use 'right' instead of 'left' to position from the right side
        // YOU CAN EDIT KALYPSO'S INITIAL POSITION HERE ↑
        zIndex: 9999,
        width: buttonSize,
        height: buttonSize
      }}
    >
      <Draggable
        position={position}
        onStart={handleDragStart}
        onStop={(e, data) => {
          setPosition({ x: data.x, y: data.y });
          handleDragStop();
        }}
        onDrag={(e, data) => {
          // Store the new position
          setPosition({ x: data.x, y: data.y });
          
          // Calculate movement amount since last position
          const deltaX = Math.abs(data.x - lastPositionRef.current.x);
          const deltaY = Math.abs(data.y - lastPositionRef.current.y);
          
          // If significant movement, update position and possibly trigger meow
          if (deltaX > movementThresholdRef.current || deltaY > movementThresholdRef.current) {
            lastPositionRef.current = { x: data.x, y: data.y };
            
            // Randomly play meow on some movements (30% chance)
            if (Math.random() < 0.3) {
              playMeow();
            }
          }
        }}
        nodeRef={nodeRef}
        // Important: adding these properties to ensure free movement
        defaultClassName="draggable-kalypso"
        defaultPosition={{x: 0, y: 0}}
      >
        <div 
          ref={nodeRef}
          className="cursor-grab active:cursor-grabbing pointer-events-auto absolute"
          style={{ width: buttonSize, height: buttonSize }}
        >
          <div
            className="overflow-hidden transition duration-120 ease-in-out transform hover:-translate-y-1 hover:scale-105 w-full h-full"
          >
            <img
              src={kalypsoSrc}
              alt="Kalypso"
              className="w-full h-full object-contain"
              draggable={false}
              style={{ maxWidth: '100%', maxHeight: '100%' }}
            />
          </div>
        </div>
      </Draggable>

      {/* Debug image to test if images can load in general */}
      <div className="hidden">
        <img 
          src="/kalypso/KalypsoPicture.png" 
          alt="Debug" 
          width="1" 
          height="1"
          onLoad={() => console.log("Debug image loaded")}
          onError={() => console.error("Debug image failed to load")}
        />
      </div>
    </div>
  );
};

export default DraggableKalypso; 