"use client";

import React, { useState, useCallback, useRef, useEffect } from 'react';
import Image from 'next/image';
import { SparkleEffect } from '@/components/effects/SparkleEffect';
import { CUSTOM_PARTICLES } from '@/config/particleEffects';
import dynamic from 'next/dynamic';
import ChatBubbleDialog from '@/components/ui/ChatBubbleDialog';
import { FEATURE_UNLOCK } from '@/components/navigation/HoverSidebar';
import { useFeatureUnlock } from '@/hooks/useFeatureUnlock';
import { UnlockDialog } from '@/components/unlock-dialog';
import { useUser } from '@/store/selectors';

// Dynamically import ChatContainer to avoid loading it until needed
const DynamicChatContainer = dynamic(() => import('@/components/chatgpt/ChatContainer'), {
  loading: () => <div className="p-4 text-center">Loading chat...</div>,
  ssr: false
});

interface AnimatedProfileIconProps {
  photoName: string;
  size?: number;
  onClick?: () => void;
  activities?: any[]; // Use the proper type from your actual implementation
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
  onClick,
  activities = []
}) => {
  const [showChatContainer, setShowChatContainer] = useState(false);
  const [unlockDialogOpen, setUnlockDialogOpen] = useState(false);
  const [bubblePosition, setBubblePosition] = useState<BubblePosition & { rect: DOMRect | null }>({ 
    x: 0, 
    y: 0, 
    angle: 0,
    rect: null 
  });
  const iconRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Feature unlock hook to check if user has access to chat
  const { isFeatureUnlocked } = useFeatureUnlock();
  
  // Get user coins for unlock dialog
  const { coins } = useUser();

  const getRandomPosition = useCallback(() => {
    if (!iconRef.current) return { x: 0, y: 0, angle: 0, rect: null };
    
    const rect = iconRef.current.getBoundingClientRect();
    // For chat container, we'll position it at a fixed angle from the icon
    const angle = 45; // Position at top-right
    const angleInRad = angle * (Math.PI / 180);
    
    const baseRadius = size * 1.2; // Increase radius for better positioning
    
    return {
      x: Math.cos(angleInRad) * baseRadius,
      y: Math.sin(angleInRad) * baseRadius - baseRadius, // Adjust Y to position above
      angle,
      rect
    };
  }, [size]);

  const handleClick = () => {
    if (onClick) onClick();
    
    // Check if Kalypso AI is unlocked
    if (!isFeatureUnlocked(FEATURE_UNLOCK.KALYPSO_AI)) {
      // Show unlock dialog instead of chat
      setUnlockDialogOpen(true);
      return;
    }
    
    // Toggle chat container if feature is unlocked
    setShowChatContainer(prev => !prev);
    
    // If we're showing the container, calculate its position
    if (!showChatContainer) {
      const newPosition = getRandomPosition();
      setBubblePosition(newPosition);
    }
    
    // Clear any existing timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
  };

  const handleCloseChatBubble = () => {
    setShowChatContainer(false);
  };

  // Handle successful feature unlock
  const handleUnlockSuccess = () => {
    // After successful unlock, show the chat container
    setShowChatContainer(true);
    const newPosition = getRandomPosition();
    setBubblePosition(newPosition);
  };

  const particleConfig = CUSTOM_PARTICLES[photoName] || { particles: [], dispersion: 'burst' };

  useEffect(() => {
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
              onLoad={(e) => {
                (e.target as HTMLImageElement).style.opacity = "1";
              }}
              loading="eager"
            />
          </div>
        </div>
      </SparkleEffect>

      {/* Use the ChatBubbleDialog component */}
      <ChatBubbleDialog
        isOpen={showChatContainer}
        onClose={handleCloseChatBubble}
        position={bubblePosition}
        activities={activities}
        size={size}
      />

      {/* Unlock dialog when feature is locked */}
      <UnlockDialog 
        isOpen={unlockDialogOpen}
        onOpenChange={setUnlockDialogOpen}
        item={{
          id: FEATURE_UNLOCK.KALYPSO_AI,
          name: "Kalypso AI",
          tab: "KalypsoAI",
          photo: "/kalypso/kalypsocalendar.png",
          unlockCost: 5,
          description: "Your personal AI assistant for MCAT preparation. Get personalized study guidance, a custom study plan generator, and answers to your questions."
        }}
        userCoins={coins}
        onSuccess={handleUnlockSuccess}
        skipRedirect={true}
      />
    </div>
  );
};

export default AnimatedProfileIcon; 