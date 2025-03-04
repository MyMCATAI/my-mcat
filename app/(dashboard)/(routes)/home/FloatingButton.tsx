//app/(dashboard)/(routes)/home/FloatingButton.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from 'next/navigation';
import Image from "next/image";
import { AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { toast } from "react-hot-toast";
import FloatingTaskList from './FloatingTaskList';

/* ------------------------------------------ Constants ----------------------------------------- */
const HOVER_TIMEOUT = 300;
const TAB_CHANGE_TIMEOUT = 3000;

const buttonPositions = [
  { top: 0, left: 0, tab: "Tests", icon: "/icons/exam.svg" },
  { top: 0, left: 0, tab: "ankiclinic", icon: "/icons/gamecontroller.svg" },
  { top: 0, left: 0, tab: "CARS", icon: "/icons/book.svg" },
  { top: 0, left: 0, tab: "AdaptiveTutoringSuite", icon: "/graduationcap.svg" },
] as const;

const inactivePositions = [
  { top: -70, left: 10 },
  { top: -40, left: 80 },
  { top: 30, left: 100 },
] as const;

const labelTexts = {
  "Tests": "Practice Tests",
  "ankiclinic": "The Anki Clinic",
  "CARS": "Daily CARs Suite",
  "AdaptiveTutoringSuite": "Tutoring Suite",
} as const;

const PROTECTED_ROUTES = ['/mobile', '/onboarding'];

/* -------------------------------------------- Types ------------------------------------------- */
interface FloatingButtonProps {
  activities?: any[];
  onTasksUpdate?: (tasks: any[]) => void;
  onTabChange: (tab: string) => void;
  currentPage: string;
  initialTab: string;
  className?: string;
  isSubscribed?: boolean;
}

interface ButtonPosition {
  top: number;
  left: number;
  tab: string;
  icon: string;
}

interface TypewriterProps {
  text: string;
  delay?: number;
}

/* ---------------------------------------- Components ------------------------------------------ */
const Typewriter: React.FC<TypewriterProps> = ({ text, delay = 0 }) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    const timeout = setTimeout(() => {
      let currentIndex = 0;
      const interval = setInterval(() => {
        if (currentIndex <= text.length) {
          setDisplayedText(text.slice(0, currentIndex));
          currentIndex++;
        } else {
          clearInterval(interval);
        }
      }, 10);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timeout);
  }, [text, delay]);

  return <span>{displayedText}</span>;
};

const FloatingButton: React.FC<FloatingButtonProps> = ({ 
  onTabChange, 
  currentPage, 
  initialTab, 
  className,
  activities = [],
  onTasksUpdate,
  isSubscribed = false
}) => {
  /* ------------------------------------------- State -------------------------------------------- */
  const [isHovered, setIsHovered] = useState(false);
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [recentlyChangedTab, setRecentlyChangedTab] = useState(false);
  const [showTutoringMessage, setShowTutoringMessage] = useState(false);

  /* ------------------------------------------- Refs --------------------------------------------- */
  const hoverTimeout = useRef<number | null>(null);
  const tabChangeTimeout = useRef<number | null>(null);
  const router = useRouter();

  /* ----------------------------------------- Callbacks ------------------------------------------ */
  const getLabelPosition = (index: number) => {
    switch (index) {
      case 0: return { top: '-5.5rem', left: '10rem' };
      case 1: return { top: '-1.2rem', left: '15.5rem' };
      case 2: return { top: '4rem', left: '16.5rem' };
      default: return { top: '2rem', left: '12.5rem' };
    }
  };

  /* ---------------------------------------- Event Handlers -------------------------------------- */
  const handleMouseEnter = () => {
    if (hoverTimeout.current) {
      clearTimeout(hoverTimeout.current);
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (hoverTimeout.current) {
      clearTimeout(hoverTimeout.current);
    }
    hoverTimeout.current = window.setTimeout(() => {
      setIsHovered(false);
    }, HOVER_TIMEOUT);
  };

  const handleTaskListHover = (hovering: boolean) => {
    if (hoverTimeout.current) {
      clearTimeout(hoverTimeout.current);
    }
    if (hovering) {
      setIsHovered(true);
    } else {
      hoverTimeout.current = window.setTimeout(() => {
        setIsHovered(false);
      }, 500);
    }
  };

  // Used to direct free user (isSubscribed = false) to /mobile
  const handleButtonClick = async (tab: string) => {
    const startTime = performance.now();
    console.log(`[Navigation] Starting navigation to ${tab} at ${startTime}ms`);

    // Check if current path is protected from auto-redirect
    const currentPath = window.location.pathname;
    if (PROTECTED_ROUTES.some(route => currentPath.startsWith(route))) {
      return;
    }

    // Check subscription status first, before any other logic
    if (!isSubscribed && tab !== 'ankiclinic') {
      router.push('/mobile');
      return;
    }

    // Get current query parameters to preserve them during navigation
    const currentUrl = new URL(window.location.href);
    const queryParams = currentUrl.search;

    // Move the try-catch block inside the subscription check
    try {
      console.log(`[Navigation] Starting user-info API call at ${performance.now() - startTime}ms`);
      const response = await fetch("/api/user-info");
      if (!response.ok) throw new Error("Failed to fetch user info");
      const data = await response.json();
      console.log(`[Navigation] Completed user-info API call at ${performance.now() - startTime}ms`);
      const unlocks = Array.isArray(data.unlocks) ? data.unlocks : [];

      const tabActions = {
        Tests: () => {
          if (currentPage === 'ankiclinic') {
            router.push(`/home${queryParams}`);
          }
          setActiveTab(tab);
          onTabChange(tab);
          setRecentlyChangedTab(true);
          if (tabChangeTimeout.current) {
            clearTimeout(tabChangeTimeout.current);
          }
          tabChangeTimeout.current = window.setTimeout(() => {
            setRecentlyChangedTab(false);
          }, TAB_CHANGE_TIMEOUT);
        },
        AdaptiveTutoringSuite: () => {
          router.push(`/home${queryParams}`);
          setActiveTab(tab);
          onTabChange(tab);
          setRecentlyChangedTab(true);
          if (tabChangeTimeout.current) {
            clearTimeout(tabChangeTimeout.current);
          }
          tabChangeTimeout.current = window.setTimeout(() => {
            setRecentlyChangedTab(false);
          }, TAB_CHANGE_TIMEOUT);
        },
        ankiclinic: () => {
          console.log(`[Navigation] Starting router.push at ${performance.now() - startTime}ms`);
          if (currentPage === 'home') {
            router.push('/ankiclinic');
          } else {
            router.push('/home');
          }
          setActiveTab(tab);
          onTabChange(tab);
        },
        CARS: () => {
          if (currentPage === 'ankiclinic') {
            router.push(`/home${queryParams}`);
          }
          setActiveTab(tab);
          onTabChange(tab);
          setRecentlyChangedTab(true);
          if (tabChangeTimeout.current) {
            clearTimeout(tabChangeTimeout.current);
          }
          tabChangeTimeout.current = window.setTimeout(() => {
            setRecentlyChangedTab(false);
          }, TAB_CHANGE_TIMEOUT);
        },
        default: () => {
          if (currentPage === 'ankiclinic') {
            router.push(`/home${queryParams}`);
          }
          setActiveTab(tab);
          onTabChange(tab);
          setRecentlyChangedTab(true);
          if (tabChangeTimeout.current) {
            clearTimeout(tabChangeTimeout.current);
          }
          tabChangeTimeout.current = window.setTimeout(() => {
            setRecentlyChangedTab(false);
          }, TAB_CHANGE_TIMEOUT);
        }
      };

      const action = tabActions[tab as keyof typeof tabActions] || tabActions.default;
      action();
      console.log(`[Navigation] Completed navigation action at ${performance.now() - startTime}ms`);
    } catch (error) {
      console.error("Error checking unlocks:", error);
      toast.error("Failed to check feature access");
    }
  };

  /* ------------------------------------ Animations & Effects ------------------------------------ */
  useEffect(() => {
    return () => {
      if (tabChangeTimeout.current) {
        clearTimeout(tabChangeTimeout.current);
      }
    };
  }, []);

  /* ---------------------------------------- Render Methods -------------------------------------- */
  return (
    <>
      {/* Overlay */}
      {isHovered && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" />
      )}

      {/* Task List */}
      <AnimatePresence>
        {isHovered && currentPage === "ankiclinic" && !recentlyChangedTab && (
          <FloatingTaskList 
            activities={activities}
            onTasksUpdate={() => onTasksUpdate?.([])}
            onHover={handleTaskListHover}
          />
        )}
      </AnimatePresence>

      {/* Main Button Group */}
      <span className="fixed bottom-[8rem] left-[0.625rem] z-50">
        <div
          className="relative group"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {buttonPositions.map((pos, index) => {
            const isActive = activeTab === pos.tab;
            const activeIndex = buttonPositions.findIndex(
              (p) => p.tab === activeTab
            );
            const inactiveIndex = buttonPositions
              .filter((p) => p.tab !== activeTab)
              .findIndex((p) => p.tab === pos.tab);

            const isDisabled = !isSubscribed && pos.tab !== 'ankiclinic';

            const top = isActive
              ? 0
              : isHovered
              ? inactivePositions[inactiveIndex]?.top
              : inactivePositions[activeIndex]?.top;

            const left = isActive
              ? 0
              : isHovered
              ? inactivePositions[inactiveIndex]?.left
              : inactivePositions[activeIndex]?.left;

            const labelPosition = getLabelPosition(inactiveIndex);
            const labelText = labelTexts[pos.tab] || pos.tab;

            return (
              <div key={index} className="relative">
                <button
                  className={clsx(
                    "w-16 h-16 bg-[var(--theme-navbutton-color)] border-2 border-white text-white rounded-full shadow-lg focus:outline-none transition-all transform hover:scale-110 absolute flex justify-center items-center",
                    {
                      "w-24 h-24": isActive,
                      "opacity-100": isHovered || isActive,
                      "opacity-0 pointer-events-none": !isHovered && !isActive,
                    }
                  )}
                  style={{
                    top,
                    left,
                    transitionDelay: `${index * 50}ms`,
                    color: 'var(--theme-navbutton-color)',
                  }}
                  onClick={() => handleButtonClick(pos.tab)}
                >
                  <Image 
                    src={pos.icon} 
                    alt={pos.tab} 
                    width={isActive ? 44 : 32} 
                    height={isActive ? 44 : 32} 
                    className={isDisabled ? "opacity-50" : ""}
                  />
                  {isDisabled && isHovered && (
                    <div className="absolute -top-2 -right-2">
                      <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </button>
                <span
                  className="absolute"
                  style={{
                    top: labelPosition.top,
                    left: labelPosition.left,
                    transform: 'translate(-50%, -50%)',
                    zIndex: 60,
                  }}
                >
                  {isHovered && !isActive && (
                    <span
                      className="bg-transparent text-white text-2xl px-2 py-1 rounded overflow-hidden"
                      style={{
                        display: 'inline-block',
                        width: '150px',
                        textAlign: 'left',
                        whiteSpace: 'nowrap',
                        overflow: 'visible',
                      }}
                    >
                      <Typewriter text={labelText} delay={0} />
                    </span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </span>
    </>
  );
};

export default FloatingButton;