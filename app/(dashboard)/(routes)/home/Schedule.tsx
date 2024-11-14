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
import { CheckCircle } from "lucide-react"; // Add this import
import Tutorial from "./Tutorial";
import { Checkbox } from "@/components/ui/checkbox"; // Add this import
import Statistics from "@/components/Statistics";
import DonutChart from "./DonutChart"; // Add this import
import { FaFire } from "react-icons/fa";

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
  const [showThankYouDialog, setShowThankYouDialog] = useState(false);
  const [typedText, setTypedText] = useState("");
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [expandedGraph, setExpandedGraph] = useState<string | null>(null);
  const [showGraphs, setShowGraphs] = useState(false);
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
  const [showCalendarTutorial, setShowCalendarTutorial] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [statistics, setStatistics] = useState<any>(null);
  const [userScore, setUserScore] = useState(0);
  const [arrowDirection, setArrowDirection] = useState(">");

  const [newActivity, setNewActivity] = useState<NewActivity>({
    activityTitle: "",
    activityText: "",
    hours: "",
    activityType: "",
    scheduledDate: new Date().toISOString().split("T")[0],
  });

  const { user } = useUser();

  const [checklists, setChecklists] = useState<
    Record<Section, { id: number; text: string; checked: boolean }[]>
  >(() => {
    // Try to load saved state from localStorage
    const savedChecklists = localStorage.getItem('dailyChecklists');
    const today = new Date().toDateString();
    const savedDate = localStorage.getItem('checklistsDate');
    
    if (savedChecklists && savedDate === today) {
      return JSON.parse(savedChecklists);
    }
    
    // Return default state if no saved state or if it's a new day
    return {
      AdaptiveTutoringSuite: [
        { id: 1, text: "Complete daily adaptive quiz", checked: false },
        { id: 2, text: "Review personalized study plan", checked: false },
        { id: 3, text: "Schedule tutoring session", checked: false },
      ],
      MCATGameAnkiClinic: [
        { id: 1, text: "Play MCAT Game for 30 minutes", checked: false },
        { id: 2, text: "Review Anki flashcards", checked: false },
        { id: 3, text: "Create new Anki cards", checked: false },
      ],
      DailyCARsSuite: [
        { id: 1, text: "Complete daily CARS passage", checked: false },
        { id: 2, text: "Review CARS strategies", checked: false },
        { id: 3, text: "Practice timing for CARS", checked: false },
      ],
    };
  });

  useEffect(() => {
    localStorage.setItem('dailyChecklists', JSON.stringify(checklists));
    localStorage.setItem('checklistsDate', new Date().toDateString());
  }, [checklists]);

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

  const handleCheckboxChange = async (section: Section, id: number) => {
    setChecklists((prevChecklists) => {
      const updatedSection = prevChecklists[section].map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      );

      // Create new checklists state with the updated section
      const newChecklists = {
        ...prevChecklists,
        [section]: updatedSection,
      };

      // Count total unchecked boxes across all sections
      const totalUnchecked = Object.values(newChecklists).reduce((total, sectionItems) => {
        return total + sectionItems.filter(item => !item.checked).length;
      }, 0);
      
      console.log(`Total unchecked boxes remaining: ${totalUnchecked}`);

      const allChecked = updatedSection.every(
        (item: { checked: boolean }) => item.checked
      );
      if (
        allChecked &&
        !prevChecklists[section].every(
          (item: { checked: boolean }) => item.checked
        )
      ) {
        setShowRewardDialog(true);
        setRewardSection(section);

        const newCompletedSections = [...completedSections, section];
        setCompletedSections(newCompletedSections);

        // Play the appropriate sound
        if (newCompletedSections.length === 3) {
          if (fanfareRef.current) {
            fanfareRef.current.play();
          }
        } else if (audioRef.current) {
          audioRef.current.play();
        }

        // Update user's coin count
        updateUserCoinCount();
      }

      return newChecklists;
    });
  };

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

    // // Delay before starting Tutorial Part 2
    // setTimeout(() => {
    //   // Start Tutorial Part 2
    //   setTutorialStep(1);
    //   setRunTutorialPart2(true);
    // }, 5000);
  }, []);

  const handleCalendarModified = useCallback(() => {
    // Start Tutorial Part 3
    setTutorialStep(1);
    setRunTutorialPart3(true);
  }, []);

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

  const handleActionClick = () => {
    handleSetTab("KnowledgeProfile");
  };

  const toggleGraphExpansion = (graphId: string) => {
    setExpandedGraph(expandedGraph === graphId ? null : graphId);
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
    const fetchStatistics = async () => {
      try {
        const response = await fetch("/api/user-statistics");
        if (response.ok) {
          const data = await response.json();
          setStatistics(data);
        }
      } catch (error) {
        console.error("Error fetching statistics:", error);
      }
    };

    fetchStatistics();
  }, []);

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

  const handleProgressClick = () => {
    setShowGraphs(!showGraphs);
    setArrowDirection(showGraphs ? ">" : "v");
  };

  const [todayActivities, setTodayActivities] = useState<Activity[]>([]);

  // Fetch tasks for each activity that doesn't have tasks
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

      const updatedTasks = activity.tasks.map((task, index) =>
        index === taskIndex ? { ...task, completed } : task
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
    } catch (error) {
      console.error('Error updating task:', error);
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
                  className="w-full py-3 px-4 
                    bg-[--theme-leaguecard-color] text-[--theme-text-color] 
                    border-2 border-[--theme-border-color]
                    hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text]
                    font-semibold shadow-md rounded-lg transition relative flex items-center justify-between
                    text-md"
                  onClick={() => handleButtonClick(activity.activityTitle)}
                >
                  <span>{activity.activityTitle}</span>
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

          {(
            Object.entries(checklists) as [
              Section,
              { id: number; text: string; checked: boolean }[]
            ][]
          ).map(([section, items]) => (
            <div key={section} className="mb-6">
              <button
                className={`w-full py-3 px-4 
                  ${
                    completedSections.includes(section)
                      ? "bg-green-500 text-white"
                      : "bg-[--theme-leaguecard-color] text-[--theme-text-color] border-2 border-[--theme-border-color]"
                  } 
                  hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text]
                  font-semibold shadow-md rounded-lg transition relative flex items-center justify-between
                  text-md`} // Changed from text-lg to match progress buttons
                onClick={() => handleButtonClick(section)}
              >
                <span>{buttonLabels[section as Section]}</span>
                {completedSections.includes(section) ? (
                  <CheckCircle className="w-6 h-6 text-white" />
                ) : (
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
                )}
              </button>
              <div className="bg-[--theme-leaguecard-color] shadow-md p-4 mt-2 space-y-2 rounded-lg">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`checkbox-${section}-${item.id}`}
                      checked={item.checked}
                      onChange={() =>
                        handleCheckboxChange(section as Section, item.id)
                      }
                      className="mr-3 h-5 w-5 text-blue-600"
                    />
                    <label
                      htmlFor={`checkbox-${section}-${item.id}`}
                      className="text-sm leading-tight cursor-pointer flex-grow"
                    >
                      {item.text}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Content */}
      <div className="w-3/4 p-2.5 flex flex-col relative">
        {/* Stats Box - Vertical stack */}
        {showAnalytics && !showGraphs && (
          <div className="absolute top-6 text-[--theme-text-color] left-8 flex flex-col bg-transparent rounded-lg p-2 z-10 space-y-3">
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

            <div className="flex items-center">
              <FaFire className="text-[--theme-text-color] ml-1 mr-2 text-5xl" />
              <span className="font-bold text-lg ml-3">{statistics?.streak || 0}</span>
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
                    {!showGraphs ? (
                      <motion.div 
                        key="donut"
                        className="flex justify-center items-center min-h-[32rem]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <DonutChart onProgressClick={() => setShowGraphs(true)} />
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
                          statistics={statistics}
                          expandedGraph={expandedGraph}
                          toggleGraphExpansion={toggleGraphExpansion}
                          onReturn={() => setShowGraphs(false)}
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
              <div className="h-32 flex justify-end items-start px-4 pt-4">
                <button
                  onClick={handleToggleView}
                  className="w-36 py-3 px-2 bg-[--theme-leaguecard-color] text-[--theme-text-color] border-2 border-[--theme-border-color] hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text] font-semibold shadow-md rounded-lg transition relative flex items-center justify-between text-md"
                >
                  <svg
                    className="w-6 h-6 rotate-180"
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
                  <span>Overview</span>
                </button>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          {showAnalytics && !showGraphs && (
            <div className="absolute bottom-4 right-4 flex flex-col space-y-2">
              <button
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
              </button>
              <button
                onClick={handleToggleView}
                className="w-full py-3 px-4 bg-[--theme-leaguecard-color] text-[--theme-text-color] border-2 border-[--theme-border-color] hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text] font-semibold shadow-md rounded-lg transition relative flex items-center justify-between text-md"
              >
                <span>Calendar</span>
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
              </button>
            </div>
          )}
        </div>

        {/* Dialogs */}
        {/* Comment out or remove the Thank You Dialog */}
        {/*
        <Dialog open={showThankYouDialog} onOpenChange={setShowThankYouDialog}>
          <DialogOverlay className="fixed inset-0 bg-black bg-opacity-50 z-50" />
          <DialogContent className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-xl max-w-md w-full z-50">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold mb-4 text-gray-800">Thank You!</DialogTitle>
              <DialogDescription className="text-gray-600 mb-6">
                Your study plan has been saved successfully. We recommend taking a diagnostic test to help us personalize your learning experience.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex justify-end space-x-4 mt-4">
              <Button variant="outline" onClick={() => setShowThankYouDialog(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors">
                Maybe Later
              </Button>
              <Button onClick={handleTakeDiagnosticTest} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                Take Diagnostic Test
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        */}

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
    </div>
  );
};

export default Schedule;
