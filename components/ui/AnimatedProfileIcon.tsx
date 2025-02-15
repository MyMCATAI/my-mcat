"use client";

import React, { useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import { SparkleEffect } from '@/components/effects/SparkleEffect';
import { motion, AnimatePresence } from 'framer-motion';
import { CUSTOM_PARTICLES } from '@/config/particleEffects';

interface AnimatedProfileIconProps {
  photoName: string;
  size?: number;
  onClick?: () => void;
}

interface BubblePosition {
  x: number;
  y: number;
  angle: number;
}

const SPEECH_BUBBLES = ['...', '?', '!', '^_^'];

const AnimatedProfileIcon: React.FC<AnimatedProfileIconProps> = ({ 
  photoName, 
  size = 192,
  onClick 
}) => {
  const [showSpeechBubble, setShowSpeechBubble] = useState(false);
  const [bubbleContent, setBubbleContent] = useState('');
  const [bubblePosition, setBubblePosition] = useState<BubblePosition & { rect: DOMRect | null }>({ 
    x: 0, 
    y: 0, 
    angle: 0,
    rect: null 
  });
  const iconRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const getRandomPosition = useCallback(() => {
    if (!iconRef.current) return { x: 0, y: 0, angle: 0, rect: null };
    
    const rect = iconRef.current.getBoundingClientRect();
    const angle = Math.random() * 360;
    const angleInRad = angle * (Math.PI / 180);
    
    const baseRadius = size / 1.5;
    const radius = baseRadius + (Math.random() * 10 - 5);
    
    return {
      x: Math.cos(angleInRad) * radius,
      y: Math.sin(angleInRad) * radius,
      angle,
      rect
    };
  }, [size]);

  const getBubbleStyles = (angle: number) => {
    // Normalize angle to 0-360 range
    const normalizedAngle = ((angle % 360) + 360) % 360;
    
    let stemStyles;
    if (normalizedAngle <= 45 || normalizedAngle > 315) {
      // Right side of icon
      stemStyles = {
        left: '0',
        top: '50%',
        transform: `translate(-50%, -50%) rotate(${normalizedAngle + 90}deg)`
      };
    } else if (normalizedAngle <= 135) {
      // Bottom of icon
      stemStyles = {
        left: '50%',
        top: '0',
        transform: `translate(-50%, -50%) rotate(${normalizedAngle + 90}deg)`
      };
    } else if (normalizedAngle <= 225) {
      // Left side of icon
      stemStyles = {
        left: '100%',
        top: '50%',
        transform: `translate(0%, -50%) rotate(${normalizedAngle + 90}deg)`
      };
    } else {
      // Top of icon
      stemStyles = {
        left: '50%',
        bottom: '0',
        transform: `translate(-50%, 50%) rotate(${normalizedAngle + 90}deg)`
      };
    }

    return { stemStyles };
  };

  const handleClick = () => {
    if (onClick) onClick();
    
    const newContent = SPEECH_BUBBLES[Math.floor(Math.random() * SPEECH_BUBBLES.length)];
    const newPosition = getRandomPosition();
    
    setBubbleContent(newContent);
    setBubblePosition(newPosition);
    setShowSpeechBubble(true);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setShowSpeechBubble(false);
      timeoutRef.current = undefined;
    }, 3000);
  };

  const particleConfig = CUSTOM_PARTICLES[photoName] || { particles: [], dispersion: 'burst' };

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div 
      ref={iconRef}
      className="relative"
      style={{ width: size, height: size }}
    >
      <SparkleEffect 
        enabled={true}
        customParticle={particleConfig.particles}
        dispersion={particleConfig.dispersion}
        onClick={handleClick}
      >
        <div className="w-full h-full rounded-lg overflow-hidden border-2 border-[--theme-border-color]">
          <div className="relative w-full h-full">
            <Image
              key={photoName}
              src={`/profile-photo/${photoName}`}
              alt="Profile"
              width={size}
              height={size}
              className="w-full h-full object-cover transition-opacity duration-300 cursor-pointer"
              quality={100}
              style={{ opacity: 1 }}
              onLoadingComplete={(img) => {
                img.style.opacity = "1";
              }}
              onLoad={(e) => {
                (e.target as HTMLImageElement).style.opacity = "1";
              }}
              loading="eager"
            />
          </div>
        </div>
      </SparkleEffect>

      <AnimatePresence>
        {showSpeechBubble && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: 1, 
              opacity: 1,
            }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ 
              duration: 0.3,
              scale: {
                type: "spring",
                damping: 7,
                stiffness: 200,
                duration: 0.5
              }
            }}
            className="fixed bg-white px-6 py-3 rounded-[20px] shadow-lg text-gray-800 font-medium z-[9999] text-lg"
            style={{ 
              left: bubblePosition.rect ? `${bubblePosition.rect.left + size/2 + bubblePosition.x}px` : '0',
              top: bubblePosition.rect ? `${bubblePosition.rect.top + size/2 + bubblePosition.y}px` : '0',
              transform: 'translate(-50%, -50%)',
              minWidth: '60px',
              textAlign: 'center'
            }}
          >
            {bubbleContent}
            <div 
              className="absolute w-4 h-8 bg-white"
              style={{
                ...getBubbleStyles(bubblePosition.angle).stemStyles,
                clipPath: 'polygon(50% 100%, 0 -1px, 100% -1px)',
                filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.1))',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AnimatedProfileIcon; 