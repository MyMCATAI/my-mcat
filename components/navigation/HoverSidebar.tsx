"use client"

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { format, isToday, isTomorrow } from "date-fns";
import { ChevronLeft, ChevronRight, Book, BookOpen, GraduationCap, Brain, Clock, Menu, Lock } from "lucide-react";
import { FaCheckCircle } from "react-icons/fa";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { toast } from "react-hot-toast";
import HelpContentTestingSuite from "@/components/guides/HelpContentTestingSuite";
import { useNavigation, useUser } from "@/store/selectors";
import { createPortal } from 'react-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PurchaseButton } from "@/components/purchase-button";
import Image from "next/image";
import { useFeatureUnlock } from "@/hooks/useFeatureUnlock";
import { UnlockDialog } from "@/components/unlock-dialog";

/* ----- Types ---- */
interface Task {
  text: string;
  completed: boolean;
}

interface Activity {
  id: string;
  scheduledDate: string;
  activityTitle: string;
  activityText: string;
  hours: number;
  activityType: string;
  link?: string | null;
  tasks?: Task[];
  source?: string;
}

interface NavigationItem {
  id: string;
  name: string;
  tab: string;
  icon: React.ReactNode;
  requiresUnlock?: boolean;
  unlockCost?: number;
  description?: string;
  photo?: string;
}

interface HoverSidebarProps {
  activities?: Activity[];
  onTasksUpdate?: (tasks: Activity[]) => void;
  onTabChange: (tab: string) => void;
  currentPage: string;
  isSubscribed?: boolean;
}

export const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    id: "kalypso-ai",
    name: "Kalypso AI",
    tab: "KalypsoAI",
    icon: <Brain className="w-5 h-5" />,
    requiresUnlock: true,
    unlockCost: 5,
    description: "Your personal AI assistant for MCAT preparation. Get personalized study guidance, a custom study plan generator, and answers to your questions.",
    photo: "/kalypso/kalypsocalendar.png"
  },
  {
    id: "cars",
    name: "CARS Suite",
    tab: "CARS",
    icon: <BookOpen className="w-5 h-5" />,
    requiresUnlock: true,
    unlockCost: 15,
    description: "Critical Analysis and Reasoning Skills practice with advanced tools and strategies.",
    photo: "/kalypso/kalypotesting.png"
  },
  {
    id: "tutoring",
    name: "Adaptive Content",
    tab: "AdaptiveTutoringSuite",
    icon: <GraduationCap className="w-5 h-5" />,
    requiresUnlock: true,
    unlockCost: 20,
    description: "Adaptive learning system that adjusts to your knowledge gaps and provides content currated for you.",
    photo: "/kalypso/kalypsoteaching.png"
  },
  
  {
    id: "tests",
    name: "Practice Test Review",
    tab: "Tests",
    icon: <Book className="w-5 h-5" />,
    requiresUnlock: true,
    unlockCost: 30,
    description: "Review your full-length MCAT practice tests with focused feedback and performance tracking.",
    photo: "/kalypso/kalypotesting.png"
  },
  {
    id: "ankiclinic",
    name: "Anki Clinic",
    tab: "AnkiClinic",
    icon: <Clock className="w-5 h-5" />,
    requiresUnlock: false,
    description: "Earn coins while mastering concepts through flashcards in a fun clinical setting.",
    photo: "/kalypso/KalypsoPicture.png"
  },
];

const HoverSidebar: React.FC<HoverSidebarProps> = ({
  activities = [],
  onTasksUpdate,
  onTabChange,
  currentPage,
  isSubscribed = false
}) => {
  /* ---- State ----- */
  const [isVisible, setIsVisible] = useState(false);
  const [hoverTimer, setHoverTimer] = useState<NodeJS.Timeout | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [visibleSection, setVisibleSection] = useState<'nav' | 'tasks'>('nav');
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [unlockDialogOpen, setUnlockDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<NavigationItem | null>(null);
  
  // Use navigation selector hook
  const { activePage, navigateHomeTab } = useNavigation();
  
  // Get user info and coins
  const { userInfo, coins } = useUser();
  
  // Feature unlock hook
  const { isFeatureUnlocked } = useFeatureUnlock();
  
  // Check if any navigation items are unlocked
  const hasAnyUnlocked = useMemo(() => {
    return NAVIGATION_ITEMS.some(item => 
      item.requiresUnlock && isFeatureUnlocked(item.id)
    );
  }, [isFeatureUnlocked]);
  
  // Determine if the button should be highlighted
  // Highlight when we're on ankiclinic page and no features are unlocked
  const shouldHighlightButton = currentPage === 'ankiclinic' && !hasAnyUnlocked;
  
  // Map page to nav id for UI highlighting
  const activeTab = (() => {
    // If we're on ankiclinic page, highlight the ankiclinic button
    if (currentPage === 'ankiclinic') {
      return 'ankiclinic';
    }
    // Otherwise use the global navigation state
    const matchingItem = NAVIGATION_ITEMS.find(item => item.tab === activePage);
    return matchingItem ? matchingItem.id : "kalypso-ai";
  })();
  
  /* ---- Refs --- */
  const sidebarRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  /* --- Animations & Effects --- */
  useEffect(() => {
    setMounted(true);
    // Check if we're on a mobile device
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);
  
  useEffect(() => {
    // Handle hover detection on the edge of the screen
    const handleMouseMove = (e: MouseEvent) => {
      const triggerThreshold = 20; // pixels from edge
      
      if (e.clientX <= triggerThreshold) {
        // Mouse is near the left edge
        if (hoverTimer === null) {
          const timer = setTimeout(() => {
            setIsVisible(true);
          }, 300); // Show after 300ms hover
          setHoverTimer(timer);
        }
      } else if (e.clientX > 300 && isVisible && !sidebarRef.current?.contains(e.target as Node)) {
        // Mouse moved away from sidebar
        setIsVisible(false);
        if (hoverTimer) {
          clearTimeout(hoverTimer);
          setHoverTimer(null);
        }
      }
    };
    
    // Only use hover for non-touch devices
    if (!isMobile) {
      document.addEventListener('mousemove', handleMouseMove);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      if (hoverTimer) {
        clearTimeout(hoverTimer);
      }
    };
  }, [hoverTimer, isVisible, isMobile]);
  
  /* ---- Event Handlers ----- */
  const toggleSidebar = () => {
    setIsVisible(!isVisible);
  };

  const handleNavigationClick = (item: NavigationItem) => {
    // Ensure navigation state is initialized
    if (typeof navigateHomeTab !== 'function') {
      console.error('Navigation not initialized yet');
      return;
    }

    // Check if the item requires unlock
    if (item.requiresUnlock && !isFeatureUnlocked(item.id)) {
      // Open unlock dialog instead of navigating
      setSelectedItem(item);
      setUnlockDialogOpen(true);
      return;
    }

    // If we're on ankiclinic page and clicking a non-ankiclinic item, redirect to home with tab
    if (currentPage === 'ankiclinic' && item.id !== 'ankiclinic') {
      router.push(`/home?tab=${item.tab}`);
    }
    // If clicking ankiclinic from any other page, redirect to ankiclinic
    else if (item.id === 'ankiclinic' && currentPage !== 'ankiclinic') {
      router.push('/ankiclinic');
    }
    // If we're already on home, just update the tab
    else {
      navigateHomeTab(item.tab);
    }
  };

  const handleUnlockSuccess = (itemId: string) => {
    // If we're on ankiclinic, navigate to the newly unlocked section
    const item = NAVIGATION_ITEMS.find(item => item.id === itemId);
    if (item && currentPage === 'ankiclinic') {
      router.push(`/home?tab=${item.tab}`);
    }
  };
  
  /* ---- Render Methods ----- */
  const renderHelp = () => {
    return (
      <div className="mt-4">
        <ScrollArea className="h-[calc(100vh-15rem)]">
          <div className="px-3">
            <HelpContentTestingSuite />
          </div>
        </ScrollArea>
      </div>
    );
  };
  
  if (!mounted) return null;

  const sidebarContent = (
    <>
      {/* Mobile toggle button - only shown when sidebar is hidden */}
      {!isVisible && (
        <button
          onClick={toggleSidebar}
          className={cn(
            "fixed left-4 z-50 p-2 rounded-full shadow-lg transition-all duration-300",
            shouldHighlightButton 
              ? "bg-emerald-500 text-white ring-4 ring-emerald-300 ring-opacity-50 animate-pulse scale-110" 
              : "bg-[--theme-emphasis-color] text-[--theme-hover-text]",
            isMobile ? "top-[6px]" : "top-[10px]"
          )}
          aria-label="Open navigation"
        >
          <Menu className={cn(
            "w-5 h-5",
            shouldHighlightButton && "animate-bounce"
          )} />
        </button>
      )}
      
      <div 
        ref={sidebarRef}
        className={cn(
          "fixed top-0 left-0 h-full z-[51] transition-all duration-300 shadow-xl",
          isVisible ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0",
          "bg-gradient-to-b from-[--theme-gradient-start] to-[--theme-gradient-end]",
          "border-r border-[--theme-border-color]",
          "flex flex-col w-[280px]"
        )}
      >
        <div className="p-4 border-b border-[--theme-border-color] flex items-center justify-between">
          <div className="flex justify-center gap-4">
            <button
              className={cn(
                "px-6 py-1.5 rounded-lg transition-all duration-300 font-medium",
                visibleSection === 'nav' 
                  ? "bg-[--theme-hover-color] text-[--theme-hover-text]" 
                  : "bg-[--theme-leaguecard-color] text-[--theme-text-color]"
              )}
              onClick={() => setVisibleSection('nav')}
            >
              Navigation
            </button>
            <button
              className={cn(
                "px-6 py-1.5 rounded-lg transition-all duration-300 font-medium",
                visibleSection === 'tasks' 
                  ? "bg-[--theme-hover-color] text-[--theme-hover-text]" 
                  : "bg-[--theme-leaguecard-color] text-[--theme-text-color]"
              )}
              onClick={() => setVisibleSection('tasks')}
            >
              Help
            </button>
          </div>
          
          {/* Close button for mobile */}
          <button
            onClick={toggleSidebar}
            className="text-[--theme-text-color] hover:text-[--theme-hover-text]"
            aria-label="Close navigation"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div className="flex-1 overflow-hidden">
          {visibleSection === 'nav' ? (
            <div className="p-4 space-y-2">
              {NAVIGATION_ITEMS.map(item => {
                const isUnlocked = isFeatureUnlocked(item.id);
                // Special highlight for Kalypso AI when not unlocked
                const isKalypsoHighlighted = item.id === "kalypso-ai" && !isUnlocked;
                
                return (
                <button
                  key={item.id}
                  className={cn(
                    "flex items-center gap-3 w-full p-3 rounded-lg transition-all duration-300 relative",
                    activeTab === item.id
                      ? "bg-[--theme-hover-color] text-[--theme-hover-text]"
                      : isKalypsoHighlighted 
                          ? "bg-[--theme-leaguecard-color] text-[--theme-text-color] border-2 border-emerald-400/50 shadow-md" 
                          : "bg-[--theme-leaguecard-color] text-[--theme-text-color] hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text]"
                  )}
                  onClick={() => {
                    handleNavigationClick(item);
                    if (isMobile) {
                      // Auto-close sidebar after navigation on mobile
                      setIsVisible(false);
                    }
                  }}
                >
                  {/* Subtle border animation for Kalypso */}
                  {isKalypsoHighlighted && (
                    <div className="absolute inset-0 rounded-lg border-2 border-emerald-400/0 animate-[pulse_3s_ease-in-out_infinite] pointer-events-none"></div>
                  )}
                  
                  <div className={cn(
                    "flex-shrink-0",
                    isKalypsoHighlighted && "text-emerald-500"
                  )}>
                    {item.icon}
                  </div>
                  <span className={cn(
                    "font-medium",
                    isKalypsoHighlighted && "text-emerald-700 dark:text-emerald-400"
                  )}>
                    {item.name}
                    {isKalypsoHighlighted && (
                      <span className="ml-1 text-xs font-bold text-emerald-600 dark:text-emerald-300">
                        (Recommended)
                      </span>
                    )}
                  </span>
                  {item.requiresUnlock && !isFeatureUnlocked(item.id) && (
                    <div className={cn(
                      "ml-auto flex items-center gap-1",
                      isKalypsoHighlighted ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400"
                    )}>
                      <Lock className="w-4 h-4" />
                      {item.unlockCost && (
                        <div className={cn(
                          "flex items-center text-xs",
                          isKalypsoHighlighted && "font-bold"
                        )}>
                          <span>{item.unlockCost}</span>
                          <Image 
                            src="/coin.png" 
                            alt="coins" 
                            width={12} 
                            height={12} 
                            className="ml-0.5" 
                          />
                        </div>
                      )}
                    </div>
                  )}
                </button>
              )})}
            </div>
          ) : (
            <div className="h-full overflow-y-auto">
              {renderHelp()}
            </div>
          )}
        </div>
        
        <div className="p-4 text-center border-t border-[--theme-border-color]">
          <p className="text-xs text-[--theme-text-color] opacity-70">
            {isMobile ? "Tap the menu icon to access navigation and help" : "Hover near the left edge to show sidebar"}
          </p>
        </div>
      </div>
    </>
  );

  return createPortal(
    <>
      {sidebarContent}
      
      {/* Use the UnlockDialog component */}
      <UnlockDialog 
        isOpen={unlockDialogOpen}
        onOpenChange={setUnlockDialogOpen}
        item={selectedItem}
        userCoins={coins}
        onSuccess={handleUnlockSuccess}
      />
    </>,
    document.body
  );
};

export default HoverSidebar; 