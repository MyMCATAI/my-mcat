'use client'

import React, { useState, useRef, useEffect } from "react";
import clsx from "clsx";
import Image from "next/image";
import { useRouter } from 'next/navigation';
import { AnimatePresence } from "framer-motion";
import FloatingTaskList from './FloatingTaskList';
import { toast } from "react-hot-toast";
import { UnlockDialog } from "@/components/UnlockDialog";

interface FloatingButtonProps {
  activities?: any[];
  onTasksUpdate?: (tasks: any[]) => void;
  onTabChange: (tab: string) => void;
  currentPage: string;
  initialTab: string;
  className?: string;
}

interface ButtonPosition {
  top: number;
  left: number;
  tab: string;
  icon: string;
}

interface Activity {
  id: string;
  scheduledDate: string;
  activityTitle: string;
  activityText: string;
  hours: number;
  activityType: string;
  link?: string | null;
  tasks?: { text: string; completed: boolean; }[];
  source?: string;
}

// Updated Typewriter component
const Typewriter: React.FC<{ text: string; delay?: number }> = ({ text, delay = 0 }) => {
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
  onTasksUpdate 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [recentlyChangedTab, setRecentlyChangedTab] = useState(false);
  const hoverTimeout = useRef<number | null>(null);
  const tabChangeTimeout = useRef<number | null>(null);
  const router = useRouter();
  const [showTutoringMessage, setShowTutoringMessage] = useState(false);
  const [showUnlockDialog, setShowUnlockDialog] = useState(false);
  const [unlockType, setUnlockType] = useState<"game" | "ts" | null>(null);

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
    }, 200);
  };

  const handleTaskListHover = (hovering: boolean) => {
    if (hoverTimeout.current) {
      clearTimeout(hoverTimeout.current);
    }
    setIsHovered(hovering);
  };

  const buttonPositions: ButtonPosition[] = [
    { top: 0, left: 0, tab: "Schedule", icon: "/calendar.svg" },
    { top: 0, left: 0, tab: "doctorsoffice", icon: "/gamecontroller.svg" },
    { top: 0, left: 0, tab: "CARS", icon: "/book.svg" },
    { top: 0, left: 0, tab: "AdaptiveTutoringSuite", icon: "/graduationcap.svg" },
  ];

  const inactivePositions = [
    { top: -70, left: 10 },
    { top: -40, left: 80 },
    { top: 30, left: 100 },
  ];

  const handleButtonClick = async (tab: string) => {
    // First check if user has the required unlock
    try {
      const response = await fetch("/api/user-info");
      if (!response.ok) throw new Error("Failed to fetch user info");
      const data = await response.json();
      const unlocks = Array.isArray(data.unlocks) ? data.unlocks : [];

      // Check for required unlocks
      if (tab === "doctorsoffice" && !unlocks.includes("game")) {
        setUnlockType("game");
        setShowUnlockDialog(true);
        return;
      }

      if (tab === "AdaptiveTutoringSuite" && !unlocks.includes("ts")) {
        setUnlockType("ts");
        setShowUnlockDialog(true);
        return;
      }

      // If we reach here, user has the required unlock
      // Execute the navigation logic
      const tabActions = {
        AdaptiveTutoringSuite: () => {
          router.push('/home');
          setActiveTab(tab);
          onTabChange(tab);
          setRecentlyChangedTab(true);
          if (tabChangeTimeout.current) {
            clearTimeout(tabChangeTimeout.current);
          }
          tabChangeTimeout.current = window.setTimeout(() => {
            setRecentlyChangedTab(false);
          }, 3000);
        },
        doctorsoffice: () => {
          if (currentPage === 'home') {
            router.push('/doctorsoffice');
          } else {
            router.push('/home');
          }
          setActiveTab(tab);
          onTabChange(tab);
        },
        CARS: () => {
          if (currentPage === 'doctorsoffice') {
            router.push('/home');
          }
          setActiveTab(tab);
          onTabChange(tab);
          setRecentlyChangedTab(true);
          if (tabChangeTimeout.current) {
            clearTimeout(tabChangeTimeout.current);
          }
          tabChangeTimeout.current = window.setTimeout(() => {
            setRecentlyChangedTab(false);
          }, 3000);
        },
        default: () => {
          if (currentPage === 'doctorsoffice') {
            router.push('/home');
          }
          setActiveTab(tab);
          onTabChange(tab);
          setRecentlyChangedTab(true);
          if (tabChangeTimeout.current) {
            clearTimeout(tabChangeTimeout.current);
          }
          tabChangeTimeout.current = window.setTimeout(() => {
            setRecentlyChangedTab(false);
          }, 3000);
        }
      };

      const action = tabActions[tab as keyof typeof tabActions] || tabActions.default;
      action();
    } catch (error) {
      console.error("Error checking unlocks:", error);
      toast.error("Failed to check feature access");
    }
  };

  const labelTexts: Record<string, string> = {
    "Schedule": "Dashboard",
    "doctorsoffice": "The Anki Clinic",
    "CARS": "Daily CARs Suite",
    "AdaptiveTutoringSuite": "Tutoring Suite",
  };

  const getLabelPosition = (index: number) => {
    switch (index) {
      case 0:
        return { top: '-5.5rem', left: '10rem' };
      case 1:
        return { top: '-1.2rem', left: '15.5rem' };
      case 2:
        return { top: '4rem', left: '16.5rem' };
      default:
        return { top: '2rem', left: '12.5rem' };
    }
  };

  useEffect(() => {
    return () => {
      if (tabChangeTimeout.current) {
        clearTimeout(tabChangeTimeout.current);
      }
    };
  }, []);

  return (
    <>
      {isHovered && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40"></div>
      )}

      <AnimatePresence>
        {isHovered && 
         activeTab !== "Schedule" && 
         currentPage !== "Schedule" && 
         !recentlyChangedTab && (
          <FloatingTaskList 
            activities={activities}
            onTasksUpdate={() => onTasksUpdate?.([])}
            onHover={handleTaskListHover}
          />
        )}
      </AnimatePresence>

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
                  />
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

      <UnlockDialog
        isOpen={showUnlockDialog}
        onClose={() => setShowUnlockDialog(false)}
        unlockType={unlockType || "game"}
        title={unlockType === "game" ? "Unlock Anki Clinic" : "Unlock Tutoring Suite"}
        description={unlockType === "game" 
          ? "Access the Anki Clinic to practice spaced repetition and master MCAT concepts."
          : "Access the Adaptive Tutoring Suite to get personalized MCAT guidance."}
        cost={5}
      />
    </>
  );
};

export default FloatingButton;
