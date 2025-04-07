"use client"

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { format, isToday, isTomorrow } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FaCheckCircle } from "react-icons/fa";
import { toast } from "react-hot-toast";

/* --- Constants ----- */
const SIDEBAR_ITEMS = [
  { 
    id: 'kalypso-ai', 
    name: 'Kalypso AI', 
    href: '/chatgpt',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path>
        <path d="M3 15h14a2 2 0 1 1 0 4H3"></path>
        <path d="M21 12H7a2 2 0 0 0 0 4h8"></path>
      </svg>
    )
  },
  { 
    id: 'tests', 
    name: 'Practice Tests', 
    href: '/home?tab=Tests',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 3H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-1"></path>
        <path d="M15 2H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1Z"></path>
        <path d="M12 11h4"></path>
        <path d="M12 16h4"></path>
        <path d="M8 11h.01"></path>
        <path d="M8 16h.01"></path>
      </svg>
    )
  },
  { 
    id: 'ankiclinic', 
    name: 'Anki Clinic', 
    href: '/ankiclinic',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="3" rx="2"></rect>
        <path d="M7 7h.01"></path>
        <path d="M17 7h.01"></path>
        <path d="M7 17h.01"></path>
        <path d="M17 17h.01"></path>
      </svg>
    )
  },
  { 
    id: 'cars', 
    name: 'Daily CARS Suite', 
    href: '/home?tab=CARS',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
      </svg>
    )
  },
  { 
    id: 'tutoring', 
    name: 'Tutoring Suite', 
    href: '/home?tab=AdaptiveTutoringSuite',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
        <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
      </svg>
    )
  },
  { 
    id: 'home', 
    name: 'Home', 
    href: '/home',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
      </svg>
    )
  },
];

// Example mock tasks - in a real implementation these would come from your API
const MOCK_ACTIVITIES = [
  {
    id: "1",
    scheduledDate: new Date().toISOString(),
    activityTitle: "Biology Review",
    activityText: "Review biological processes",
    hours: 2,
    activityType: "study",
    tasks: [
      { text: "Cellular respiration", completed: false },
      { text: "DNA replication", completed: false },
      { text: "Protein synthesis", completed: false }
    ]
  },
  {
    id: "2",
    scheduledDate: new Date().toISOString(),
    activityTitle: "Chemistry Practice",
    activityText: "Practice chemistry problems",
    hours: 1.5,
    activityType: "practice",
    tasks: [
      { text: "Acid-base reactions", completed: false },
      { text: "Thermodynamics", completed: false }
    ]
  }
];

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

interface ChatSidebarProps {
  className?: string;
  isSubscribed?: boolean;
}

const ChatSidebar = ({ className, isSubscribed = true }: ChatSidebarProps) => {
  /* ---- State ----- */
  const router = useRouter();
  const pathname = usePathname();
  const [activeItem, setActiveItem] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [activities, setActivities] = useState<Activity[]>(MOCK_ACTIVITIES);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loadingTasks, setLoadingTasks] = useState<Record<string, boolean>>({});
  
  /* --- Animations & Effects --- */
  useEffect(() => {
    // Set active item based on current path
    const currentPath = pathname || '';
    const matchingItem = SIDEBAR_ITEMS.find(item => 
      currentPath === item.href || currentPath.startsWith(`${item.href.split('?')[0]}/`)
    );
    
    if (matchingItem) {
      setActiveItem(matchingItem.id);
    }
    
    // Check if mobile
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, [pathname]);
  
  /* ---- Event Handlers ----- */
  const handleItemClick = (id: string, href: string) => {
    // Check if premium route and user is not subscribed
    if (!isSubscribed && id !== 'ankiclinic' && id !== 'home') {
      router.push('/pricing');
      return;
    }
    
    setActiveItem(id);
    router.push(href);
  };

  const handleTaskCompletion = async (activityId: string, taskIndex: number, completed: boolean) => {
    // Create a unique key for this task
    const taskKey = `${activityId}-${taskIndex}`;
    
    try {
      // Set loading state for this specific task
      setLoadingTasks(prev => ({ ...prev, [taskKey]: true }));

      setActivities(prevActivities => 
        prevActivities.map(activity => {
          if (activity.id === activityId && activity.tasks) {
            const newTasks = [...activity.tasks];
            newTasks[taskIndex] = { ...newTasks[taskIndex], completed };
            return { ...activity, tasks: newTasks };
          }
          return activity;
        })
      );
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Failed to update task");
    } finally {
      // Clear loading state for this task
      setLoadingTasks(prev => ({ ...prev, [taskKey]: false }));
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
  const renderTasks = () => {
    if (!isSubscribed) {
      return (
        <div className="px-3 py-4 flex flex-col items-center justify-center text-center space-y-4">
          <div className="max-w-xs space-y-3">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 mb-3 rounded-full bg-[--theme-hover-color] flex items-center justify-center">
                <svg 
                  className="w-6 h-6 text-[--theme-hover-text]" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2 text-[--theme-text-color]">Unlock Tasks</h3>
              <p className="text-[--theme-text-color] opacity-80 mb-3 text-sm">
                Get access to personalized daily tasks with a subscription.
              </p>
            </div>
          </div>
        </div>
      );
    }

    const todayActivities = getTodayActivities();

    return (
      <div className="flex flex-col h-[calc(100vh-18rem)]">
        <div className="flex items-center justify-between px-4 py-2 mb-2 bg-[--theme-leaguecard-color] rounded-lg">
          <button
            onClick={() => {
              const newDate = new Date(currentDate);
              newDate.setDate(newDate.getDate() - 1);
              setCurrentDate(newDate);
            }}
            className="p-1 hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text] rounded-lg transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="font-medium text-sm">
            {isToday(currentDate) 
              ? "Today"
              : isTomorrow(currentDate)
                ? "Tomorrow"
                : format(currentDate, 'EEEE, MMMM d')}
          </span>
          <button
            onClick={() => {
              const newDate = new Date(currentDate);
              newDate.setDate(newDate.getDate() + 1);
              setCurrentDate(newDate);
            }}
            className="p-1 hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text] rounded-lg transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        
        <ScrollArea className="flex-grow">
          <div className="px-3 space-y-4 pb-3">
            {todayActivities.map((activity) => (
              <div key={activity.id} className="mb-3">
                <button
                  className={`w-full py-2 px-3 
                    ${
                      isActivityCompleted(activity)
                        ? "bg-[--theme-hover-color] text-[--theme-hover-text]"
                        : "bg-[--theme-leaguecard-color] text-[--theme-text-color]"
                    }
                    border border-[--theme-border-color]
                    hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text]
                    font-semibold rounded-lg transition relative flex items-center justify-between
                    text-sm`}
                >
                  <span>{activity.activityTitle}</span>
                  <div className="flex items-center gap-2">
                    {isActivityCompleted(activity) ? (
                      <FaCheckCircle
                        className="min-w-[1rem] min-h-[1rem] w-[1rem] h-[1rem]"
                        style={{ color: "var(--theme-hover-text)" }}
                      />
                    ) : (
                      <svg
                        className="min-w-[1rem] min-h-[1rem] w-[1rem] h-[1rem]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    )}
                  </div>
                </button>

                <div className="bg-[--theme-mainbox-color] p-3 mt-2 space-y-2 rounded-lg">
                  {activity.tasks && activity.tasks.length > 0 ? (
                    activity.tasks.map((task, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Checkbox
                          id={`task-${activity.id}-${index}`}
                          checked={task.completed}
                          onCheckedChange={(checked) =>
                            handleTaskCompletion(
                              activity.id,
                              index,
                              checked as boolean
                            )
                          }
                          disabled={loadingTasks[`${activity.id}-${index}`]}
                          isLoading={loadingTasks[`${activity.id}-${index}`]}
                          className="data-[state=checked]:bg-[--theme-hover-color] data-[state=checked]:text-[--theme-hover-text]"
                        />
                        <label
                          htmlFor={`task-${activity.id}-${index}`}
                          className="text-xs leading-tight cursor-pointer flex-grow"
                        >
                          {task.text}
                        </label>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs italic">No tasks for this activity</p>
                  )}
                </div>
              </div>
            ))}

            {todayActivities.length === 0 && (
              <p className="text-center text-sm italic text-[--theme-text-color] opacity-70">
                No activities scheduled for this day
              </p>
            )}
          </div>
        </ScrollArea>
      </div>
    );
  };
  
  return (
    <div 
      className={cn(
        "flex flex-col h-full text-white border-r themed-scrollbar transition-all duration-300",
        "bg-gradient-to-b from-[--theme-gradient-start] to-[--theme-gradient-end]",
        "w-64",
        className
      )}
    >
      <ScrollArea className="flex-1 px-2 py-3">
        <div className="space-y-1 mb-4">
          {SIDEBAR_ITEMS.map((item) => (
            <div
              key={item.id}
              className={cn(
                "group flex items-center py-2 px-2 cursor-pointer transition-all duration-300 relative",
                "justify-start"
              )}
              onClick={() => handleItemClick(item.id, item.href)}
            >
              <div className={cn(
                "flex items-center w-full relative",
                "justify-start"
              )}>
                <span className={cn(
                  "text-[--theme-text-color] transition-all duration-300",
                  activeItem === item.id ? "opacity-100" : "opacity-70 group-hover:opacity-100"
                )}>
                  {item.icon}
                </span>
                
                <span className={cn(
                  "ml-3 text-[--theme-text-color] transition-all duration-300",
                  activeItem === item.id ? "opacity-100" : "opacity-70 group-hover:opacity-100"
                )}>
                  {item.name}
                </span>
              </div>
              
              {/* Active indicator line */}
              <div className={cn(
                "absolute left-0 top-0 bottom-0 w-0.5 bg-[--theme-text-color] transition-all duration-300",
                activeItem === item.id ? "opacity-100" : "opacity-0 group-hover:opacity-30"
              )} />
              
              {/* Bottom border line */}
              <div className={cn(
                "absolute bottom-0 left-2 right-2 h-px bg-[--theme-border-color] opacity-30",
                activeItem === item.id ? "opacity-0" : ""
              )} />
            </div>
          ))}
        </div>
        
        <div className="border-t border-[--theme-border-color] pt-4 opacity-90">
          <h3 className="font-medium text-sm mb-3 px-2 text-[--theme-text-color]">Today&apos;s Tasks</h3>
          {renderTasks()}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ChatSidebar; 