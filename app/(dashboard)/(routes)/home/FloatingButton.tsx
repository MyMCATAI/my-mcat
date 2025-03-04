//app/(dashboard)/(routes)/home/FloatingButton.tsx
"use client";

import React, { useState, useRef, useEffect, useCallback, memo } from "react";
import { useRouter } from 'next/navigation';
import Image from "next/image";
import { AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { toast } from "react-hot-toast";
import FloatingTaskList from './FloatingTaskList';
import preloadAnkiClinic from '../ankiclinic/preload';
import { useUser } from "@/store/selectors";

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
}) => {
  /* ------------------------------------------- State -------------------------------------------- */
  const [state, setState] = useState({
    isHovered: false,
    activeTab: initialTab,
    recentlyChangedTab: false,
    showTutoringMessage: false
  });
  
  // Add loading state for navigation
  const [isNavigating, setIsNavigating] = useState(false);
  
  // Track if preloading has been initiated
  const hasPreloadedRef = useRef(false);

  /* ------------------------------------------- Refs --------------------------------------------- */
  const hoverTimeout = useRef<number | null>(null);
  const tabChangeTimeout = useRef<number | null>(null);
  const router = useRouter();
  
  // Get isSubscribed from the store
  const { isSubscribed } = useUser();
  
  /* ----------------------------------------- Preloading ----------------------------------------- */
  // Preload the AnkiClinic page when component mounts
  useEffect(() => {
    // Only preload if we're on the home page and haven't preloaded yet
    if (currentPage === 'home' && !hasPreloadedRef.current) {
      try {
        // Use setTimeout to defer preloading until after initial render
        const timer = setTimeout(() => {
          console.log("[FloatingButton] Starting AnkiClinic preload sequence");
          
          // First, preload the route
          router.prefetch('/ankiclinic');
          
          // Then, preload the components and assets
          preloadAnkiClinic().catch(error => {
            console.error("[FloatingButton] Error during preload:", error);
          });
          
          // Mark as preloaded
          hasPreloadedRef.current = true;
        }, 1000);
        
        return () => clearTimeout(timer);
      } catch (error) {
        console.error("[FloatingButton] Error preloading AnkiClinic:", error);
      }
    }
  }, [currentPage, router]);
  
  // Add preloading on hover for immediate response
  const handleAnkiClinicHover = useCallback(() => {
    if (currentPage === 'home' && !hasPreloadedRef.current) {
      console.log("[FloatingButton] Preloading AnkiClinic on hover");
      
      // Preload the route
      router.prefetch('/ankiclinic');
      
      // Preload core components only on hover for faster response
      import('../ankiclinic/preload').then(module => {
        module.preloadCoreComponents();
        module.preloadAudioAssets();
      }).catch(error => {
        console.error("[FloatingButton] Error preloading on hover:", error);
      });
      
      // Mark as preloaded
      hasPreloadedRef.current = true;
    }
  }, [currentPage, router]);

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
          const timestamp = new Date().toISOString();
          console.log("--------------------------------------------------------------------");
          console.log(`------- ANKI CLINIC CLICKED AT ${timestamp} -------`);
          console.log("--------------------------------------------------------------------");
          
          if (currentPage === 'home') {
            // Show loading indicator
            setIsNavigating(true);
            
            // If we haven't preloaded yet, do it now (though this should rarely happen)
            if (!hasPreloadedRef.current) {
              router.prefetch('/ankiclinic');
            }
            
            // Navigate to AnkiClinic
            router.push('/ankiclinic');
            
            // Reset loading state after a timeout (in case navigation takes too long)
            setTimeout(() => {
              setIsNavigating(false);
            }, 5000);
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
      setIsNavigating(false); // Reset loading state on error
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
      {/* Loading overlay */}
      {isNavigating && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[--theme-primary-color] mb-4"></div>
            <p className="text-lg font-medium">Loading AnkiClinic...</p>
          </div>
        </div>
      )}

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
          {buttonPositions.map((pos, index) => {
            const isActive = state.activeTab === pos.tab;
            const activeIndex = buttonPositions.findIndex(
              (p) => p.tab === state.activeTab
            );
            const inactiveIndex = buttonPositions
              .filter((p) => p.tab !== state.activeTab)
              .findIndex((p) => p.tab === pos.tab);

            const top = isActive
              ? 0
              : state.isHovered
              ? inactivePositions[inactiveIndex]?.top
              : inactivePositions[activeIndex]?.top;

            const left = isActive
              ? 0
              : state.isHovered
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
                      "opacity-100": state.isHovered || isActive,
                      "opacity-0 pointer-events-none": !state.isHovered && !isActive,
                    }
                  )}
                  style={{
                    top,
                    left,
                    transitionDelay: `${index * 50}ms`,
                    color: 'var(--theme-navbutton-color)',
                  }}
                  onClick={() => handleButtonClick(pos.tab)}
                  onMouseOver={() => pos.tab === 'ankiclinic' && handleAnkiClinicHover()}
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
                  {state.isHovered && !isActive && (
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
});

FloatingButton.displayName = 'FloatingButton';

export default FloatingButton;