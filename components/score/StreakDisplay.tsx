"use client";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { FaFire } from "react-icons/fa";
import { useAudio } from "@/store/selectors";
import { useUserInfo } from '@/hooks/useUserInfo';

/* --- Constants ----- */
const ANIMATION_DURATION = 300;

type StreakThreshold = 1 | 7 | 14 | 30;

const STREAK_MESSAGES = {
  30: {
    image: "/kalypsodancing.gif",
    subtitle: "You're a rockstar!"
  },
  14: {
    image: "/kalypsofloatinghappy.gif",
    subtitle: "I'm so proud of you! ❤️"
  },
  7: {
    image: "/kalypsothumbs.gif",
    subtitle: "You're becoming my bestie now!"
  },
  1: {
    image: "/kalypsoyouate.gif",
    subtitle: "You ate with that!"
  }
} as const satisfies Record<StreakThreshold, { image: string; subtitle: string }>;

/* ----- Types ---- */
type StreakMessage = {
  image: string;
  title: string;
  subtitle: string;
} | null;

interface StreakDisplayProps {
  onClose?: () => void;
}

const StreakDisplay = ({ onClose }: StreakDisplayProps) => {
  /* ---- State ----- */
  const { userInfo } = useUserInfo();
  const [isOpen, setIsOpen] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const audio = useAudio();

  /* ---- Refs --- */
  const closeTimeoutRef = useRef<NodeJS.Timeout>();
  const lastShownStreakRef = useRef<number>(0);

  /* ----- Callbacks --- */
  const getStreakMessage = (streak: number): StreakMessage => {
    if (streak <= 1) return null;

    // Find the highest threshold that the streak exceeds
    const threshold = Object.keys(STREAK_MESSAGES)
      .map(Number)
      .sort((a, b) => b - a)
      .find(t => streak >= t) ?? 1;

    const { image, subtitle } = STREAK_MESSAGES[threshold as StreakThreshold];
    
    return {
      image,
      title: `${streak} DAY STREAK!`,
      subtitle
    };
  };

  /* --- Animations & Effects --- */
  const streak = userInfo?.streak ?? 0;

  useEffect(() => {
    if (streak <= 1) return;
    if (streak === lastShownStreakRef.current) return;

    const lastVisit = localStorage.getItem('lastVisitDate');
    const today = new Date().toDateString();

    if (lastVisit !== today) {
      setIsOpen(true);
      lastShownStreakRef.current = streak;
      if (streak >= 30) {
        audio.playSound('streakmonth');
      } else {
        audio.playSound('streakdaily');
      }
      localStorage.setItem('lastVisitDate', today);
    }
  }, [streak, audio]);

  useEffect(() => {
    if (isOpen) {
      // Slight delay to ensure dialog is mounted
      const timer = setTimeout(() => setShowContent(true), 100);
      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
    }
  }, [isOpen]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  /* ---- Event Handlers ----- */
  const handleOpenChange = (open: boolean) => {
    // Clear any existing timeout
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }

    if (!open) {
      // First fade out the content
      setShowContent(false);
      // Then close the dialog after animation completes
      closeTimeoutRef.current = setTimeout(() => {
        setIsOpen(false);
        closeTimeoutRef.current = undefined;
        onClose?.();
      }, ANIMATION_DURATION);
    } else {
      setIsOpen(true);
    }
  };

  const message = getStreakMessage(streak);
  if (!message) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent 
        className="bg-[--theme-leaguecard-color] p-6 pt-[30px] rounded-2xl shadow-2xl max-w-[36rem] w-full mx-auto flex flex-col items-center gap-4 border-0 overflow-visible fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none"
      >
        {/* Static Background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <FaFire 
            className="text-[20rem] opacity-10" 
            style={{ color: 'var(--theme-hover-color)', transform: 'translateY(-5rem)' }}
          />
        </div>

        {/* Content Container */}
        <div className="relative z-10 flex flex-col items-center gap-4 w-full">
          {/* Kalypso Image */}
          <div 
            className={`relative w-[24rem] h-[18rem] rounded-xl pointer-events-none overflow-hidden transition-opacity duration-300 ${showContent ? 'opacity-100' : 'opacity-0'}`}
          >
            <Image
              src={message.image}
              alt="Kalypso"
              fill
              className="object-contain"
              priority
            />
          </div>

          {/* Streak Counter */}
          <div 
            className={`flex items-center gap-4 px-6 py-3 rounded-full shadow-lg transition-all duration-300 ${showContent ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
            style={{
              background: `linear-gradient(to right, var(--theme-gradient-startstreak), var(--theme-gradient-endstreak))`
            }}
          >
            <FaFire className="text-4xl text-white animate-pulse" />
            <h2 className="text-[2.5rem] font-bold text-white tracking-wider">
              {message.title}
            </h2>
          </div>

          {/* Subtitle */}
          <p 
            className={`text-center text-[1.5rem] font-medium transition-all duration-300 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            style={{ color: 'var(--theme-text-color)' }}
          >
            {message.subtitle}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StreakDisplay;