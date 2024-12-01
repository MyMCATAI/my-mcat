import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import { isSameDay, isToday, isTomorrow } from "date-fns";
import { useUser } from "@clerk/nextjs";
import SettingContent from "./SettingContent";
import { NewActivity, FetchedActivity } from "@/types";
import { DialogHeader } from "@/components/ui/dialog";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogOverlay,
} from "@radix-ui/react-dialog";
import Image from "next/image";
import InteractiveCalendar from "@/components/calendar/InteractiveCalendar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Legend,
  Tooltip as ChartTooltip,
} from "chart.js";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Tutorial from "./Tutorial";
import { Checkbox } from "@/components/ui/checkbox"; 
import Statistics from "@/components/Statistics";
import DonutChart from "./DonutChart"; 
import { FaFire } from "react-icons/fa"
import { PurchaseButton } from "@/components/purchase-button";
import { toast } from "react-hot-toast";
import { Calendar as CalendarIcon, BarChart as AnalyticsIcon } from "lucide-react";
import { FaCheckCircle } from "react-icons/fa";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend
);

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
}

interface ScheduleProps {
  activities: Activity[];
  onShowDiagnosticTest: () => void;
  onStudyPlanSaved?: () => void;
  handleSetTab: (tab: string) => void;
  isActive: boolean;
  onActivitiesUpdate: () => void;
}

type Section =
  | "AdaptiveTutoringSuite"
  | "MCATGameAnkiClinic"
  | "DailyCARsSuite";

const Schedule: React.FC<ScheduleProps> = ({
  activities,
  onShowDiagnosticTest,
  onStudyPlanSaved,
  handleSetTab,
  isActive,
  onActivitiesUpdate,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showSettings, setShowSettings] = useState(false);
  const [showNewActivityForm, setShowNewActivityForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [typedText, setTypedText] = useState("");
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [expandedGraph, setExpandedGraph] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(true);
  const [showRewardDialog, setShowRewardDialog] = useState(false);
  const [rewardSection, setRewardSection] = useState("");
  const [userCoinCount, setUserCoinCount] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const fanfareRef = useRef<HTMLAudioElement>(null);
  const [completedSections, setCompletedSections] = useState<string[]>([]);
  const [runTutorialPart1, setRunTutorialPart1] = useState(false);
  const [runTutorialPart2, setRunTutorialPart2] = useState(false);
  const [runTutorialPart3, setRunTutorialPart3] = useState(false);
  const [runTutorialPart4, setRunTutorialPart4] = useState(false);
  const [tutorialText, setTutorialText] = useState("");
  const [isTutorialTypingComplete, setIsTutorialTypingComplete] =
    useState(false);
  const [tutorialStep, setTutorialStep] = useState(1);
  const [hasUpdatedStudyPlan, setHasUpdatedStudyPlan] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [userScore, setUserScore] = useState(0);
  const emailTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [showBreaksDialog, setShowBreaksDialog] = useState(false);


  // todo fetch total stats, include streak, coins, grades for each subject
  const [newActivity, setNewActivity] = useState<NewActivity>({
    activityTitle: "",
    activityText: "",
    hours: "",
    activityType: "",
    scheduledDate: new Date().toISOString().split("T")[0],
  });

  // Should be consistent with calendar events
  // If table has the column "eventType", then we can use it to determine the section
  const buttonLabels: Record<Section, string> = {
    AdaptiveTutoringSuite: "Adaptive Tutoring Suite",
    MCATGameAnkiClinic: "Anki Clinic",
    DailyCARsSuite: "Daily CARs",
  };

  const handleStartTutorialPart4 = () => {
    setRunTutorialPart4(true);
    localStorage.setItem("tutorialPart4Played", "true");
  };

  useEffect(() => {
    const eventListener = () => {
      setTimeout(handleStartTutorialPart4, 10000); // Delay by 10 seconds
    };

    // Add the event listener when the component mounts
    window.addEventListener("startTutorialPart4", eventListener);

    // Cleanup function to remove the event listener when the component unmounts
    return () => {
      window.removeEventListener("startTutorialPart4", eventListener);
    };
  }, []);

  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (emailTimeoutRef.current) {
        clearTimeout(emailTimeoutRef.current);
      }
    };
  }, []);

  const updateUserCoinCount = async () => {
    try {
      const response = await fetch("/api/user-info", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 1 }),
      });

      if (response.ok) {
        const updatedUserInfo = await response.json();
        setUserCoinCount(updatedUserInfo.coinCount);
      }
    } catch (error) {
      console.error("Error updating user coin count:", error);
    }
  };

  const getActivitiesText = useMemo(() => {
    if (activities.length === 0) {
      return "Welcome to myMCAT.ai! It looks like this is your first time here. Let's get started by answering some questions about your test and study schedule. Would you like to take a diagnostic test to help us personalize your learning experience?";
    }

    const todayActivities = activities.filter((activity) =>
      isToday(new Date(activity.scheduledDate))
    );
    const tomorrowActivities = activities.filter((activity) =>
      isTomorrow(new Date(activity.scheduledDate))
    );

    if (todayActivities.length > 0) {
      const activityList = todayActivities
        .map((activity) => activity.activityTitle)
        .join(", ");
      return `Welcome back to MyMCAT.ai! Here's what you have scheduled for today: ${activityList}. Let's get studying!`;
    } else if (tomorrowActivities.length > 0) {
      const activityList = tomorrowActivities
        .map((activity) => activity.activityTitle)
        .join(", ");
      return `Welcome back to MyMCAT.ai! You don't have any activities scheduled for today, but tomorrow you'll be working on: ${activityList}. Take some time to prepare!`;
    } else {
      return "Welcome back to MyMCAT.ai! You don't have any activities scheduled for today or tomorrow. Would you like to add some new study tasks?";
    }
  }, [activities]);

  useEffect(() => {
    const tutorialPart1Played = localStorage.getItem("tutorialPart1Played");
    if (!tutorialPart1Played || tutorialPart1Played === "false") {
      setRunTutorialPart1(true);
      localStorage.setItem("tutorialPart1Played", "true");
    }
  }, []);

  useEffect(() => {
    setCurrentDate(new Date());
    setTypedText("");
    setIsTypingComplete(false);
    setTutorialText("");
    setIsTutorialTypingComplete(false);

    let text = getActivitiesText;
    if (runTutorialPart1) {
      if (tutorialStep === 1) {
        text =
          "Hi! Hello!\n\nThis is the dashboard. Here, you'll look at statistics on progress, look at your calendar, daily tasks, and ask Kalypso any questions related to the logistics of taking the test.";
      } else {
        text = "";
      }
    }

    let index = 0;
    const typingTimer = setInterval(() => {
      if (runTutorialPart1) {
        setTutorialText((prev) => text.slice(0, prev.length + 1));
      } else {
        setTypedText((prev) => text.slice(0, prev.length + 1));
      }
      index++;
      if (index > text.length) {
        clearInterval(typingTimer);
        if (runTutorialPart1) {
          setIsTutorialTypingComplete(true);
        } else {
          setIsTypingComplete(true);
        }
      }
    }, 15);

    return () => {
      clearInterval(typingTimer);
    };
  }, [getActivitiesText, runTutorialPart1, tutorialStep]);

  const handleTutorialStepChange = (step: number) => {
    setTutorialStep(step);
  };

  const handleStudyPlanSaved = useCallback(() => {
    setShowSettings(false);
    setShowAnalytics(false); // Switch to calendar mode
    setHasUpdatedStudyPlan(true);

    // Add this to ensure Part 2 plays
    setTimeout(() => {
      setRunTutorialPart2(true);
      localStorage.setItem("tutorialPart2Played", "true");
    }, 1000); // Short delay after settings close
  }, []);

  // Add this new effect to handle the transition from Part 2 to Part 3
  useEffect(() => {
    if (runTutorialPart2 === false && localStorage.getItem("tutorialPart2Played") === "true" && 
        (!localStorage.getItem("tutorialPart3Played") || localStorage.getItem("tutorialPart3Played") === "false")) {
      // Part 2 just finished, start Part 3
      setTimeout(() => {
        setRunTutorialPart3(true);
        localStorage.setItem("tutorialPart3Played", "true");
      }, 2000); // Delay after Part 2 ends
    }
  }, [runTutorialPart2]);

  // const handleTakeDiagnosticTest = () => {
  //   setShowThankYouDialog(false);
  //   onShowDiagnosticTest();
  // };

  const toggleSettings = () => {
    setShowSettings((prev) => !prev);
  };

  const endAllTutorials = () => {
    setRunTutorialPart1(false);
    setRunTutorialPart2(false);
    setRunTutorialPart3(false);
    setRunTutorialPart4(false);
  };

  const toggleNewActivityForm = () =>
    setShowNewActivityForm(!showNewActivityForm);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    const { name, value } = e.target;
    setNewActivity({ ...newActivity, [name]: value });
  };

  const createNewActivity = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/calendar-activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newActivity,
        }),
      });

      if (!response.ok) throw new Error("Failed to create activity");

      await response.json();
      setShowNewActivityForm(false);
      setNewActivity({
        activityTitle: "",
        activityText: "",
        hours: "",
        activityType: "",
        scheduledDate: new Date().toISOString().split("T")[0],
      });
      // TODO: Update activities list or refetch activities
      // TODO: Show a success message to the user
    } catch (error) {
      console.error("Error creating activity:", error);
      setError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getActivitiesForDate = (date: Date) => {
    return activities.filter((activity) =>
      isSameDay(new Date(activity.scheduledDate), date)
    );
  };

  const handleToggleView = () => {
    setShowAnalytics(!showAnalytics);
  };

  const router = useRouter();

  const handleButtonClick = (section: string) => {
    switch (section) {
      case "MyMCAT Daily CARs":
        handleSetTab("CARS");
        break;
      case "Anki Clinic":
        router.push("/doctorsoffice");
        break;
      case "Adaptive Tutoring Suite":
        handleSetTab("KnowledgeProfile");
        break;
      case "AAMC Materials":
        break;
      case "UWorld":
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    const fetchUserCoinCount = async () => {
      try {
        const response = await fetch("/api/user-info");
        if (response.ok) {
          const data = await response.json();
          setUserCoinCount(data.coinCount);
        }
      } catch (error) {
        console.error("Error fetching user coin count:", error);
      }
    };

    fetchUserCoinCount();
  }, []);

  const handleActivateTutorial = (step: number) => {
    setTutorialStep(step);
    setRunTutorialPart1(true);
  };

  // Add this function to reset the local storage variables
  const resetTutorials = () => {
    setIsResetting(true);
    localStorage.removeItem("tutorialPart1Played");
    localStorage.removeItem("tutorialPart2Played");
    localStorage.removeItem("tutorialPart3Played");
    localStorage.removeItem("tutorialPart4Played");
    console.log("Tutorials reset");
    setRunTutorialPart1(false);
    setRunTutorialPart2(false);
    setRunTutorialPart3(false);
    setRunTutorialPart4(false);

    // Set a timeout to start Tutorial Part 1 after 2 seconds
    setTimeout(() => {
      setRunTutorialPart1(true);
      setTutorialStep(1);
      localStorage.setItem("tutorialPart1Played", "true");
      setIsResetting(false);
    }, 2000);
  };

  useEffect(() => {
    if (!isActive) {
      setShowSettings(false);
    }
  }, [isActive]);

  useEffect(() => {
    const fetchUserScore = async () => {
      try {
        const response = await fetch("/api/user-info");
        if (response.ok) {
          const data = await response.json();
          setUserScore(data.score);
        }
      } catch (error) {
        console.error("Error fetching user score:", error);
      }
    };

    fetchUserScore();
  }, []);

  const [todayActivities, setTodayActivities] = useState<Activity[]>([]);

  // Fetch tasks for each activity that doesn't have tasks
  // Reload the tasks for the UWorld activity
  useEffect(() => {
    const fetchTasksForToday = async () => {
      const todaysActivities = activities.filter((activity) =>
        isToday(new Date(activity.scheduledDate))
      );

      const activitiesWithTasks = await Promise.all(
        todaysActivities.map(async (activity) => {
          if (!Array.isArray(activity.tasks) || activity.tasks.length === 0) {
            try {
              const tasks = await fetch(`/api/event-task?eventTitle=${activity.activityTitle}`).then(res => res.json());
              return {
                ...activity,
                tasks: tasks
              };
            } catch (error) {
              console.error('Error fetching tasks for activity:', error);
              return activity;
            }
          }
          return activity;
        })
      );

      setTodayActivities(activitiesWithTasks);
    };

    fetchTasksForToday();
  }, [activities]);

  const handleTaskCompletion = async (activityId: string, taskIndex: number, completed: boolean) => {
    try {
      const activity = todayActivities.find(a => a.id === activityId);
      if (!activity || !activity.tasks) return;

      // If task is already completed, prevent unchecking
      if (activity.tasks[taskIndex].completed) {
        return;
      }

      const updatedTasks = activity.tasks.map((task, index) =>
        index === taskIndex ? { ...task, completed: true } : task
      );

      // Update in backend
      const response = await fetch(`/api/calendar-activity`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: activityId,
          tasks: updatedTasks
        })
      });

      if (!response.ok) throw new Error('Failed to update task');

      // Update local state
      setTodayActivities(current =>
        current.map(a =>
          a.id === activityId
            ? { ...a, tasks: updatedTasks }
            : a
        )
      );

      // Check if all tasks are completed for this activity
      const allTasksCompleted = updatedTasks.every(task => task.completed);
      if (allTasksCompleted) {
        // Play success sound
        if (audioRef.current) {
          audioRef.current.play().catch(console.error);
        }
        
        // Update coin count
        await updateUserCoinCount();

        // Show success toast
        toast.success(`You've completed all tasks for ${activity.activityTitle}! You earned a coin!`)
      }

      // Check if ALL activities have ALL tasks completed
      const allActivitiesCompleted = todayActivities.every(activity => 
        activity.tasks?.every(task => task.completed)
      );

      if (allActivitiesCompleted) {        
        // Play fanfare for completing everything
        if (fanfareRef.current) {
          fanfareRef.current.play().catch(console.error);
        }
      }

    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };

  const handleTasksUpdate = (eventId: string, updatedTasks: Task[]) => {
    // Update local state
    setTodayActivities(current =>
      current.map(activity =>
        activity.id === eventId
          ? { ...activity, tasks: updatedTasks }
          : activity
      )
    );
  };

  const updateTodaySchedule = () => {
    fetchActivitiesForToday();
  };

  const fetchActivitiesForToday = async () => {
    const response = await fetch("/api/calendar-activity");
    const activities = await response.json();
    const todaysScheduleActivities = activities.filter((activity: any) =>
      isToday(new Date(activity.scheduledDate))
    );
    console.log('Updating today schedule activities');
    setTodayActivities(todaysScheduleActivities);
  };

  const handleResetTutorial = () => {
    // Reset localStorage values
    localStorage.setItem("tutorialPart1Played", "false");
    localStorage.setItem("tutorialPart2Played", "false");
    localStorage.setItem("tutorialPart3Played", "false");
    localStorage.setItem("tutorialPart4Played", "false");
    
    // Reset tutorial states
    setRunTutorialPart1(true);
    setRunTutorialPart2(false);
    setRunTutorialPart3(false);
    setRunTutorialPart4(false);
    
    // Play notification sound
    if (audioRef.current) {
      audioRef.current.play().catch((error) => console.error("Audio playback failed:", error));
    }
  };

  // Add this helper function near the top of the component
  const isActivityCompleted = (activity: Activity) => {
    return activity.tasks?.length > 0 && activity.tasks.every(task => task.completed);
  };

  return (
    <div className="flex h-full relative">
      {/* Left Sidebar */}
      <div
        className="w-1/4 p-5 flex flex-col ml-3 mt-2.5 mb-2.5 space-y-4 rounded-[10px] overflow-hidden daily-todo-list"
        style={{
          backgroundImage: `linear-gradient(var(--theme-gradient-start), var(--theme-gradient-end)), var(--theme-interface-image)`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundColor: "var(--theme-mainbox-color)",
          color: "var(--theme-text-color)",
          boxShadow: "var(--theme-box-shadow)",
        }}
      >
        <h1 className="text-3xl font-bold text-center mb-4">TODAY</h1>

        <div
          className="flex-grow overflow-y-auto space-y-4 pr-2"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <style jsx>{`
            div::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          {/* Today's Activities Section */}
          <div className="space-y-6">
            {todayActivities.map((activity) => (
              <div key={activity.id} className="mb-6">
                <button
                  className={`w-full py-3 px-4 
                    ${isActivityCompleted(activity) 
                      ? 'bg-[--theme-hover-color] text-[--theme-hover-text]' 
                      : 'bg-[--theme-leaguecard-color] text-[--theme-text-color]'}
                    border-2 border-[--theme-border-color]
                    hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text]
                    font-semibold shadow-md rounded-lg transition relative flex items-center justify-between
                    text-md`}
                  onClick={() => handleButtonClick(activity.activityTitle)}
                >
                  <span>{activity.activityTitle}</span>
                  {isActivityCompleted(activity) ? (
                    <FaCheckCircle 
                      className="min-w-[1.25rem] min-h-[1.25rem] w-[1.25rem] h-[1.25rem]"
                      style={{ color: 'var(--theme-hover-text)' }}
                    />
                  ) : (
                    <svg
                      className="min-w-[1.25rem] min-h-[1.25rem] w-[1.25rem] h-[1.25rem]"
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
                </button>
                
                <div className="bg-[--theme-leaguecard-color] shadow-md p-4 mt-2 space-y-2 rounded-lg">
                  {activity.tasks && activity.tasks.length > 0 ? (
                    activity.tasks.map((task, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Checkbox
                          id={`task-${activity.id}-${index}`}
                          checked={task.completed}
                          onCheckedChange={(checked) => 
                            handleTaskCompletion(activity.id, index, checked as boolean)
                          }
                        />
                        <label
                          htmlFor={`task-${activity.id}-${index}`}
                          className="text-sm leading-tight cursor-pointer flex-grow"
                        >
                          {task.text}
                        </label>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm italic">No tasks for this activity</p>
                  )}
                </div>
              </div>
            ))}
            
            {todayActivities.length === 0 && (
              <p className="text-center italic">No activities scheduled for today</p>
            )}
          </div>
        </div>
      </div>

      {/* Right Content */}
      <div className="w-3/4 p-2.5 flex flex-col relative">
        {/* Stats Box - Vertical stack */}
        {showAnalytics && !selectedSubject && (
          <div className="absolute top-6 text-[--theme-text-color] left-8 flex flex-col bg-transparent rounded-lg p-2 z-10 space-y-3">
            <PurchaseButton tooltipText="Click to purchase more coins!">
              <div className="flex items-center min-w-[6rem]">
                <Image
                  src="/game-components/PixelCupcake.png"
                  alt="Coins"
                  width={48}
                  height={48}
                  className="mr-4"
                />
                <span className="font-bold truncate text-2xl">{userScore}</span>
                <span className="ml-1 text-2xl">coins</span>
              </div>
            </PurchaseButton>

            <div className="flex items-center">
              <FaFire className="text-[--theme-text-color] ml-1 mr-2 text-5xl" />
              <span className="font-bold text-lg ml-3">{0}</span> 
              {/* statistics?.streak */}
              <span className="ml-1 text-2xl">days</span>
            </div>
          </div>
        )}

        {/* Settings Button */}
        <div className="absolute top-4 right-4 z-20">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <button
                  onClick={toggleSettings}
                  className={`settings-button tutorial-settings-button p-2 rounded-full shadow-md ${
                    showSettings ? "bg-[--theme-hover-color]" : "bg-white"
                  }`}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill={showSettings ? "white" : "#333"}
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9.25,22l-.4-3.2c-.216-.084-.42-.184-.612-.3c-.192-.117-.38-.242-.563-.375L4.7,19.375L1.95,14.625L4.525,12.675c-.016-.117-.024-.23-.024-.338V11.662c0-.108.008-.221.025-.337L1.95,9.375L4.7,4.625L7.675,5.875c.183-.134.375-.259.575-.375c.2-.117.4-.217.6-.3l.4-3.2H14.75l.4,3.2c.216.084.42.184.612.3c.192.117.38.242.563.375l2.975-.75l2.75,4.75l-2.575,1.95c.016.117.024.23.024.338v.675c0,.108-.008.221-.025.337l2.575,1.95l-2.75,4.75l-2.95-.75c-.183.133-.375.258-.575.375c-.2.117-.4.217-.6.3l-.4,3.2H9.25zM12.05,15.5c.966,0,1.791-.342,2.475-1.025c.683-.683,1.025-1.508,1.025-2.475c0-.966-.342-1.791-1.025-2.475c-.683-.683-1.508-1.025-2.475-1.025c-0.984,0-1.813,.342-2.488,1.025c-0.675,.683-1.012,1.508-1.012,2.475c0,.966,.337,1.791,1.012,2.475c.675,.683,1.504,1.025,2.488,1.025z"
                      fill={showSettings ? "white" : "#333"}
                    />
                  </svg>
                </button>
              </TooltipTrigger>
              <TooltipContent>Settings</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Opaque Overlay */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-70 z-40"
              onClick={toggleSettings}
            />
          )}
        </AnimatePresence>

        {/* Settings Modal */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-16 right-6 w-80 bg-white rounded-lg shadow-lg z-50"
            >
              <SettingContent
                onShowDiagnosticTest={onShowDiagnosticTest}
                onStudyPlanSaved={handleStudyPlanSaved}
                onToggleCalendarView={handleToggleView}
                onClose={toggleSettings}
                onActivitiesUpdate={onActivitiesUpdate}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Schedule Display */}
        <div
          className="flex-grow h-[calc(100vh-8rem)] rounded-[10px] p-4 flex flex-col relative overflow-hidden schedule-content"
          style={
            {
              backgroundImage: `linear-gradient(var(--theme-gradient-start), var(--theme-gradient-end)), var(--theme-interface-image)`,
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              backgroundColor: "var(--theme-mainbox-color)",
              color: "var(--theme-text-color)",
              boxShadow: "var(--theme-box-shadow)",
            } as React.CSSProperties
          }
        >
          {showAnalytics ? (
            <>
              {(isTypingComplete || isTutorialTypingComplete) && (
                <div className="flex-grow overflow-auto flex flex-col justify-center">
                  <AnimatePresence mode="wait">
                    {!selectedSubject ? (
                      <motion.div 
                        key="donut"
                        className="flex justify-center items-center min-h-[32rem]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <DonutChart onProgressClick={(label) => setSelectedSubject(label)} />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="statistics"
                        className="h-full"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Statistics
                          onReturn={() => setSelectedSubject(null)}
                          subject={selectedSubject}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </>
          ) : (
            <div className="h-full w-full relative flex flex-col">
              <div
                className="flex-grow"
                style={{
                  maxHeight: "90%",
                }}
              >
                <InteractiveCalendar
                  currentDate={currentDate}
                  activities={activities}
                  onDateChange={setCurrentDate}
                  getActivitiesForDate={getActivitiesForDate}
                  onInteraction={() => {}}
                  setRunTutorialPart2={setRunTutorialPart2}
                  setRunTutorialPart3={setRunTutorialPart3}
                  handleSetTab={handleSetTab}
                  onTasksUpdate={handleTasksUpdate}
                  updateTodaySchedule={updateTodaySchedule}
                />
              </div>
              {!showAnalytics ? (
                <div className="mt-auto flex justify-between items-center">
                  {/* Add Breaks button */}
                  <button
                    onClick={() => setShowBreaksDialog(true)}
                    className="flex items-center gap-2 py-3 px-4
                      bg-[--theme-leaguecard-color] text-[--theme-text-color] 
                      border-2 border-[--theme-border-color] 
                      hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text] 
                      font-semibold shadow-md rounded-lg transition"
                  >
                    <span>Add Breaks</span>
                    <span role="img" aria-label="palm tree">🌴</span>
                  </button>

                  {/* Existing Analytics button */}
                  <button
                    onClick={handleToggleView}
                    className="w-36 py-3 px-4 mt-2 bg-[--theme-leaguecard-color] text-[--theme-text-color] border-2 border-[--theme-border-color] hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text] font-semibold shadow-md rounded-lg transition relative flex items-center justify-between text-md"
                  >
                    <span>Analytics</span>
                    <AnalyticsIcon className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="absolute bottom-4 right-4 flex flex-col space-y-2">
                  <button
                    onClick={handleToggleView}
                    className="w-36 py-3 px-4 bg-[--theme-leaguecard-color] text-[--theme-text-color] border-2 border-[--theme-border-color] hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text] font-semibold shadow-md rounded-lg transition relative flex items-center justify-between text-md"
                  >
                    <span>Calendar</span>
                    <CalendarIcon className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          {showAnalytics && !selectedSubject && (
            <div className="absolute bottom-4 right-4 flex flex-col space-y-2">
              {/* <button
                onClick={() => router.push('/integrations')}
                className="w-full py-3 px-4 bg-[--theme-leaguecard-color] text-[--theme-text-color] border-2 border-[--theme-border-color] hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text] font-semibold shadow-md rounded-lg transition relative flex items-center justify-between text-md"
              >
                <span>AAMC</span>
                <svg
                  className="w-6 h-6"
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
              </button> */}
              <button
                onClick={handleToggleView}
                className="w-36 py-3 px-4 bg-[--theme-leaguecard-color] text-[--theme-text-color] border-2 border-[--theme-border-color] hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text] font-semibold shadow-md rounded-lg transition relative flex items-center justify-between text-md"
              >
                <span>Calendar</span>
                <CalendarIcon className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* New Activity Form */}
        {showNewActivityForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-96">
              <h3 className="text-lg font-bold mb-4 text-black">
                Add New Activity
              </h3>
              <form onSubmit={createNewActivity}>
                <input
                  type="text"
                  name="activityTitle"
                  value={newActivity.activityTitle}
                  onChange={handleInputChange}
                  placeholder="Activity Title"
                  className="w-full p-2 mb-2 border rounded text-black"
                  required
                />
                <textarea
                  name="activityText"
                  value={newActivity.activityText}
                  onChange={handleInputChange}
                  placeholder="Activity Description"
                  className="w-full p-2 mb-2 border rounded text-black"
                  required
                ></textarea>
                <input
                  type="number"
                  name="hours"
                  value={newActivity.hours}
                  onChange={handleInputChange}
                  placeholder="Hours"
                  className="w-full p-2 mb-2 border rounded text-black"
                  required
                />
                <input
                  type="text"
                  name="activityType"
                  value={newActivity.activityType}
                  onChange={handleInputChange}
                  placeholder="Activity Type"
                  className="w-full p-2 mb-2 border rounded text-black"
                  required
                />
                <input
                  type="date"
                  name="scheduledDate"
                  value={newActivity.scheduledDate}
                  onChange={handleInputChange}
                  className="w-full p-2 mb-2 border rounded text-black"
                  required
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={toggleNewActivityForm}
                    className="bg-gray-300 text-black px-4 py-2 rounded mr-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                    disabled={isLoading}
                  >
                    {isLoading ? "Adding..." : "Add Activity"}
                  </button>
                </div>
                {error && <p className="text-red-500 mt-2">{error}</p>}
              </form>
            </div>
          </div>
        )}
      </div>

      <Dialog open={showRewardDialog} onOpenChange={setShowRewardDialog}>
        <DialogOverlay className="fixed inset-0 bg-black/50 z-50" />
        <DialogContent className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-xl max-w-md w-full z-50">
          <DialogHeader className="text-center">
            <DialogTitle className="text-center text-black">
              Congratulations!
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-4 space-y-2">
            <div className="relative w-64 h-64">
              <Image
                src="/game-components/CupcakeCoin.gif"
                alt="Reward"
                layout="fill"
                objectFit="contain"
              />
            </div>
            <p className="text-center text-lg text-black">
              You&apos;ve completed all tasks in the{" "}
              {rewardSection && buttonLabels[rewardSection as Section]}!
            </p>
            <p className="text-center text-lg text-black">
              You&apos;ve earned{" "}
              <span className="font-bold">1 cupcake coin</span> for your hard
              work!
            </p>
          </div>
        </DialogContent>
      </Dialog>

      <audio ref={audioRef} src="/levelup.mp3" />
      <audio ref={fanfareRef} src="/fanfare.mp3" />

      <Tutorial
        runPart1={runTutorialPart1}
        setRunPart1={setRunTutorialPart1}
        runPart2={runTutorialPart2}
        setRunPart2={setRunTutorialPart2}
        runPart3={runTutorialPart3}
        setRunPart3={setRunTutorialPart3}
        runPart4={runTutorialPart4}
        setRunPart4={setRunTutorialPart4}
      />

      <Dialog open={showBreaksDialog} onOpenChange={setShowBreaksDialog}>
        <DialogOverlay className="fixed inset-0 bg-black/50 z-50" />
        <DialogContent className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-xl max-w-md w-full z-50">
          <DialogHeader>
            <DialogTitle className="text-center text-black">Coming Soon!</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <p className="text-center text-black">
              This feature will be implemented later: you can toggle holidays, note difficult weeks, and just ask for a break.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Schedule;

