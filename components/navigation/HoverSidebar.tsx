"use client"

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { format, isToday, isTomorrow } from "date-fns";
import { ChevronLeft, ChevronRight, Book, BookOpen, GraduationCap, Brain, Clock, Menu } from "lucide-react";
import { FaCheckCircle } from "react-icons/fa";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { toast } from "react-hot-toast";
import HelpContentTestingSuite from "@/components/guides/HelpContentTestingSuite";

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
}

interface HoverSidebarProps {
  activities?: Activity[];
  onTasksUpdate?: (tasks: Activity[]) => void;
  onTabChange: (tab: string) => void;
  currentPage: string;
  isSubscribed?: boolean;
}

const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    id: "kalypso-ai",
    name: "Kalypso AI",
    tab: "KalypsoAI",
    icon: <Brain className="w-5 h-5" />
  },
  {
    id: "tests",
    name: "Practice Tests",
    tab: "Tests",
    icon: <Book className="w-5 h-5" />
  },
  {
    id: "cars",
    name: "CARS Suite",
    tab: "CARS",
    icon: <BookOpen className="w-5 h-5" />
  },
  {
    id: "tutoring",
    name: "Tutoring Suite",
    tab: "AdaptiveTutoringSuite",
    icon: <GraduationCap className="w-5 h-5" />
  },
  {
    id: "ankiclinic",
    name: "Anki Clinic",
    tab: "ankiclinic",
    icon: <Clock className="w-5 h-5" />
  }
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
  const [activeTab, setActiveTab] = useState<string | null>(() => {
    // Initialize based on currentPage
    const matchingItem = NAVIGATION_ITEMS.find(item => item.tab === currentPage);
    return matchingItem ? matchingItem.id : "kalypso-ai";
  });
  const [hoverTimer, setHoverTimer] = useState<NodeJS.Timeout | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [visibleSection, setVisibleSection] = useState<'nav' | 'tasks'>('nav');
  const [isMobile, setIsMobile] = useState(false);
  
  /* ---- Refs --- */
  const sidebarRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  /* --- Animations & Effects --- */
  useEffect(() => {
    // Check if we're on a mobile device
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);
  
  useEffect(() => {
    // Update active tab when currentPage changes
    const matchingItem = NAVIGATION_ITEMS.find(item => item.tab === currentPage);
    if (matchingItem) {
      setActiveTab(matchingItem.id);
    }
  }, [currentPage]);
  
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
    setActiveTab(item.id);
    
    if (item.id === 'ankiclinic') {
      console.log(`======== Anki Clinic clicked ${new Date().toISOString()} ========`);
      router.push('/ankiclinic');
    } else {
      onTabChange(item.tab);
    }
  };

  const handleTaskCompletion = async (activityId: string, taskIndex: number, completed: boolean) => {
    if (!onTasksUpdate) return;
    
    const updatedActivities = activities.map(activity => {
      if (activity.id === activityId && activity.tasks) {
        const newTasks = [...activity.tasks];
        newTasks[taskIndex] = { ...newTasks[taskIndex], completed };
        return { ...activity, tasks: newTasks };
      }
      return activity;
    });
    
    // Update UI immediately
    onTasksUpdate(updatedActivities);
    
    // Send update to API
    try {
      await fetch(`/api/calendar-activity`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: activityId,
          tasks: updatedActivities.find(a => a.id === activityId)?.tasks,
        }),
      });
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Failed to update task");
    }
  };

  const isActivityCompleted = (activity: Activity) => {
    if (!activity.tasks || activity.tasks.length === 0) return false;
    return activity.tasks.every(task => task.completed);
  };

  const getTodayActivities = () => {
    return activities.filter(activity => 
      isToday(new Date(activity.scheduledDate))
    );
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
  
  return (
    <>
      {/* Mobile toggle button - only shown when sidebar is hidden */}
      {!isVisible && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 p-2 rounded-full bg-[--theme-emphasis-color] text-[--theme-hover-text] shadow-lg"
          aria-label="Open navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}
      
      <div 
        ref={sidebarRef}
        className={cn(
          "fixed top-0 left-0 h-full z-50 transition-all duration-300 shadow-xl",
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
              {NAVIGATION_ITEMS.map(item => (
                <button
                  key={item.id}
                  className={cn(
                    "flex items-center gap-3 w-full p-3 rounded-lg transition-all duration-300",
                    activeTab === item.id
                      ? "bg-[--theme-hover-color] text-[--theme-hover-text]"
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
                  <div className="flex-shrink-0">
                    {item.icon}
                  </div>
                  <span className="font-medium">{item.name}</span>
                </button>
              ))}
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
};

export default HoverSidebar; 