//app/(dashboard)/(routes)/home/FloatingButton.tsx
"use client";

import React, { useState, useRef, useEffect, useCallback, memo } from "react";
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
const Typewriter = memo<TypewriterProps>(({ text, delay = 0 }) => {
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
});
Typewriter.displayName = 'Typewriter';

const FloatingButton = memo<FloatingButtonProps>(({ 
  onTabChange, 
  currentPage, 
  initialTab, 
  className,
  activities = [],
  onTasksUpdate,
  isSubscribed = false
}) => {
  /* ------------------------------------------- State -------------------------------------------- */
  const [state, setState] = useState({
    isHovered: false,
    activeTab: initialTab,
    recentlyChangedTab: false,
    showTutoringMessage: false
  });

  /* ------------------------------------------- Refs --------------------------------------------- */
  const hoverTimeout = useRef<number | null>(null);
  const tabChangeTimeout = useRef<number | null>(null);
  const router = useRouter();

  /* ----------------------------------------- Callbacks ------------------------------------------ */
  const updateState = useCallback((updates: Partial<typeof state>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const getLabelPosition = useCallback((index: number) => {
    switch (index) {
      case 0: return { top: '-5.5rem', left: '10rem' };
      case 1: return { top: '-1.2rem', left: '15.5rem' };
      case 2: return { top: '4rem', left: '16.5rem' };
      default: return { top: '2rem', left: '12.5rem' };
    }
  }, []);

  /* ---------------------------------------- Event Handlers -------------------------------------- */
  const handleMouseEnter = useCallback(() => {
    if (hoverTimeout.current) {
      clearTimeout(hoverTimeout.current);
    }
    updateState({ isHovered: true });
  }, [updateState]);

  const handleMouseLeave = useCallback(() => {
    if (hoverTimeout.current) {
      clearTimeout(hoverTimeout.current);
    }
    hoverTimeout.current = window.setTimeout(() => {
      updateState({ isHovered: false });
    }, HOVER_TIMEOUT);
  }, [updateState]);

  const handleTaskListHover = useCallback((hovering: boolean) => {
    if (hoverTimeout.current) {
      clearTimeout(hoverTimeout.current);
    }
    if (hovering) {
      updateState({ isHovered: true });
    } else {
      hoverTimeout.current = window.setTimeout(() => {
        updateState({ isHovered: false });
      }, 500);
    }
  }, [updateState]);

  const handleButtonClick = useCallback(async (tab: string) => {
    const currentPath = window.location.pathname;
    if (PROTECTED_ROUTES.some(route => currentPath.startsWith(route))) {
      return;
    }

    if (!isSubscribed && tab !== 'ankiclinic') {
      router.push('/mobile');
      return;
    }

    try {
      const response = await fetch("/api/user-info");
      if (!response.ok) throw new Error("Failed to fetch user info");
      const data = await response.json();
      const unlocks = Array.isArray(data.unlocks) ? data.unlocks : [];

      const tabActions = {
        Tests: () => {
          if (currentPage === 'ankiclinic') {
            router.push('/home');
          }
          updateState({ activeTab: tab, recentlyChangedTab: true });
          onTabChange(tab);
          if (tabChangeTimeout.current) {
            clearTimeout(tabChangeTimeout.current);
          }
          tabChangeTimeout.current = window.setTimeout(() => {
            updateState({ recentlyChangedTab: false });
          }, TAB_CHANGE_TIMEOUT);
        },
        AdaptiveTutoringSuite: () => {
          router.push('/home');
          updateState({ activeTab: tab, recentlyChangedTab: true });
          onTabChange(tab);
          if (tabChangeTimeout.current) {
            clearTimeout(tabChangeTimeout.current);
          }
          tabChangeTimeout.current = window.setTimeout(() => {
            updateState({ recentlyChangedTab: false });
          }, TAB_CHANGE_TIMEOUT);
        },
        ankiclinic: () => {
          if (currentPage === 'home') {
            router.push('/ankiclinic');
          } else {
            router.push('/home');
          }
          updateState({ activeTab: tab });
          onTabChange(tab);
        },
        CARS: () => {
          if (currentPage === 'ankiclinic') {
            router.push('/home');
          }
          updateState({ activeTab: tab, recentlyChangedTab: true });
          onTabChange(tab);
          if (tabChangeTimeout.current) {
            clearTimeout(tabChangeTimeout.current);
          }
          tabChangeTimeout.current = window.setTimeout(() => {
            updateState({ recentlyChangedTab: false });
          }, TAB_CHANGE_TIMEOUT);
        }
      };

      const action = tabActions[tab as keyof typeof tabActions] || tabActions.Tests;
      action();
    } catch (error) {
      console.error("Error checking unlocks:", error);
      toast.error("Failed to check feature access");
    }
  }, [currentPage, router, onTabChange, updateState, isSubscribed]);

  /* ---------------------------------------- Effects -------------------------------------------- */
  useEffect(() => {
    return () => {
      if (tabChangeTimeout.current) {
        clearTimeout(tabChangeTimeout.current);
      }
      if (hoverTimeout.current) {
        clearTimeout(hoverTimeout.current);
      }
    };
  }, []);

  /* ---------------------------------------- Render -------------------------------------------- */
  return (
    <>
      {/* Overlay */}
      {state.isHovered && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" />
      )}

      {/* Task List */}
      <AnimatePresence>
        {state.isHovered && currentPage === "ankiclinic" && !state.recentlyChangedTab && (
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
          <div className="relative">
            {buttonPositions.map((position, index) => {
              const labelPosition = getLabelPosition(index);
              const isActive = state.activeTab === position.tab;
              const inactivePosition = !isActive && index < inactivePositions.length ? inactivePositions[index] : null;

              return (
                <div
                  key={position.tab}
                  className={clsx(
                    "absolute transition-all duration-300 ease-in-out",
                    isActive ? "scale-100 opacity-100" : "scale-75 opacity-50"
                  )}
                  style={{
                    top: inactivePosition ? inactivePosition.top : position.top,
                    left: inactivePosition ? inactivePosition.left : position.left,
                    transform: isActive ? 'translate(0, 0)' : undefined
                  }}
                >
                  <button
                    onClick={() => handleButtonClick(position.tab)}
                    className={clsx(
                      "relative p-3 rounded-full bg-white shadow-lg hover:shadow-xl transition-shadow",
                      isActive && "ring-2 ring-blue-500"
                    )}
                  >
                    <Image
                      src={position.icon}
                      alt={position.tab}
                      width={24}
                      height={24}
                      className="w-6 h-6"
                    />
                    {state.isHovered && (
                      <div
                        className="absolute whitespace-nowrap bg-black text-white px-2 py-1 rounded text-sm"
                        style={{
                          ...labelPosition,
                          transform: 'translate(-50%, -50%)'
                        }}
                      >
                        <Typewriter text={labelTexts[position.tab as keyof typeof labelTexts]} delay={index * 100} />
                      </div>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </span>
    </>
  );
});

FloatingButton.displayName = 'FloatingButton';

export default FloatingButton;