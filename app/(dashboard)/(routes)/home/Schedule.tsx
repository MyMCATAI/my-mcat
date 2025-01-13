import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import { isSameDay, isToday, isTomorrow } from "date-fns";
import { NewActivity, FetchedActivity } from "@/types";
import { DialogHeader } from "@/components/ui/dialog";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogOverlay,
} from "@radix-ui/react-dialog";
import Image from "next/image";
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
import Statistics from "@/components/Statistics";
import DonutChart from "./DonutChart";
import { PurchaseButton } from "@/components/purchase-button";
import { toast } from "react-hot-toast";
import {
  Calendar as CalendarIcon,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Target,
} from "lucide-react";
import { useOutsideClick } from '@/hooks/use-outside-click';
import UWorldPopup from '@/components/home/UWorldPopup';
import CompletionDialog from '@/components/home/CompletionDialog';
import ScoreDisplay from '@/components/score/ScoreDisplay';
import { OptionsDialog } from "@/components/home/OptionsDialog";
import { useClerk } from "@clerk/clerk-react";

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
  onStudyPlanSaved?: () => void;
  handleSetTab: (tab: string) => void;
  isActive: boolean;
  onActivitiesUpdate: () => void;
  chatbotRef?: React.MutableRefObject<{ sendMessage: (message: string) => void }>;
}

type Section =
  | "AdaptiveTutoringSuite"
  | "MCATGameAnkiClinic"
  | "DailyCARsSuite"
  | "Tests";

const Schedule: React.FC<ScheduleProps> = ({
  activities,
  handleSetTab,
  isActive,
  onActivitiesUpdate,
}) => {
  const { user } = useClerk();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showNewActivityForm, setShowNewActivityForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [showRewardDialog, setShowRewardDialog] = useState(false);
  const [rewardSection, setRewardSection] = useState("");
  const [userCoinCount, setUserCoinCount] = useState(0);
  const [userStreak, setUserStreak] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const fanfareRef = useRef<HTMLAudioElement>(null);
  const [runTutorialPart1, setRunTutorialPart1] = useState(false);
  const [runTutorialPart2, setRunTutorialPart2] = useState(false);
  const [runTutorialPart3, setRunTutorialPart3] = useState(false);
  const [runTutorialPart4, setRunTutorialPart4] = useState(false);
  const [isTutorialTypingComplete, setIsTutorialTypingComplete] =
    useState(false);
  const [tutorialStep, setTutorialStep] = useState(1);
  const [showBreaksDialog, setShowBreaksDialog] = useState(false);
  const [showUWorldPopup, setShowUWorldPopup] = useState(false);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [allWelcomeTasksCompleted, setAllWelcomeTasksCompleted] = useState(false);
  const [isCoinsLoading, setIsCoinsLoading] = useState(true);
  const [examScores, setExamScores] = useState<any[]>([]);
  const [showTargetScoreDialog, setShowTargetScoreDialog] = useState(false);
  const [targetScore, setTargetScore] = useState("500");

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
    DailyCARsSuite: "MyMCAT Daily CARs",
    Tests: "Tests"
  };

  const handleStartTutorialPart4 = () => {
    setRunTutorialPart4(true);
    localStorage.setItem("tutorialPart4Played", "true");
  };

  useEffect(() => {
    const eventListener = () => {
      setTimeout(handleStartTutorialPart4, 4000); // Delay by 10 seconds
    };

    window.addEventListener("startTutorialPart4", eventListener);

    return () => {
      window.removeEventListener("startTutorialPart4", eventListener);
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
    if (
      localStorage.getItem("tutorialPart1Played") === "true" &&
      localStorage.getItem("tutorialPart2Played") === "true" &&
      localStorage.getItem("tutorialPart3Played") === "true" &&
      localStorage.getItem("tutorialPart4Played") === "true" &&
      !localStorage.getItem("optionsDialogShown")
    ) {
      // Check if all welcome tasks are completed
      const welcomeTasksCompleted = activities.some(activity => 
        activity.activityTitle === "Welcome!" && 
        activity.tasks?.every(task => task.completed)
      );

      if (welcomeTasksCompleted) {
        setShowOptionsModal(true);
        localStorage.setItem("optionsDialogShown", "true");
      }
    }
  }, [activities, runTutorialPart1, runTutorialPart2, runTutorialPart3, runTutorialPart4]);

  useEffect(() => {
    setCurrentDate(new Date());
    setIsTypingComplete(false);
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

  const handleStudyPlanSaved = useCallback(() => {
    setShowAnalytics(false); // Switch to calendar mode

    // Only start Part 2 if it hasn't been played yet
    if (
      !localStorage.getItem("tutorialPart2Played") ||
      localStorage.getItem("tutorialPart2Played") === "false"
    ) {
      setTimeout(() => {
        setRunTutorialPart2(true);
        localStorage.setItem("tutorialPart2Played", "true");
      }, 1000);
    }
  }, []);

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

  const router = useRouter();

  const handleButtonClick = (section: Section) => {
    handleSetTab("Tests");
  };

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        setIsCoinsLoading(true);
        const response = await fetch("/api/user-info");
        if (response.ok) {
          const data = await response.json();
          setUserCoinCount(data.score);
          setUserStreak(data.streak);
        }
      } catch (error) {
        console.error("Error fetching user coin count:", error);
      } finally {
        setIsCoinsLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  // Initialize target score from user metadata
  useEffect(() => {
    if (user?.unsafeMetadata?.targetScore) {
      setTargetScore(user.unsafeMetadata.targetScore.toString());
    }
  }, [user?.unsafeMetadata?.targetScore]);

  const resetTutorials = () => {
    localStorage.removeItem("tutorialPart1Played");
    localStorage.removeItem("tutorialPart2Played");
    localStorage.removeItem("tutorialPart3Played");
    localStorage.removeItem("tutorialPart4Played");
    setRunTutorialPart1(false);
    setRunTutorialPart2(false);
    setRunTutorialPart3(false);
    setRunTutorialPart4(false);

    // Set a timeout to start Tutorial Part 1 after 2 seconds
    setTimeout(() => {
      setRunTutorialPart1(true);
      setTutorialStep(1);
      localStorage.setItem("tutorialPart1Played", "true");
    }, 2000);
  };

  useEffect(() => {
    if (!isActive) {
      // No action needed
    }
  }, [isActive]);

 

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
              const tasks = await fetch(
                `/api/event-task?eventTitle=${activity.activityTitle}`
              ).then((res) => res.json());
              return {
                ...activity,
                tasks: tasks,
              };
            } catch (error) {
              console.error("Error fetching tasks for activity:", error);
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

  const handleTaskCompletion = async (
    activityId: string,
    taskIndex: number,
    completed: boolean
  ) => {
    try {
      const activity = todayActivities.find((a) => a.id === activityId);
      if (!activity || !activity.tasks) return;

      // If task is already completed, prevent unchecking
      if (activity.tasks[taskIndex].completed) {
        return;
      }

      const updatedTasks = activity.tasks.map((task, index) =>
        index === taskIndex ? { ...task, completed: true } : task
      );

      // Update backend
      const response = await fetch(`/api/calendar-activity`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: activityId,
          tasks: updatedTasks,
        }),
      });

      if (!response.ok) throw new Error("Failed to update task");

      // Update local state
      const updatedActivities = todayActivities.map((a) =>
        a.id === activityId ? { ...a, tasks: updatedTasks } : a
      );
      setTodayActivities(updatedActivities);

      // Call onActivitiesUpdate to refresh parent state
      onActivitiesUpdate();

      // Check if all tasks are completed for this activity
      const allTasksCompleted = updatedTasks.every((task) => task.completed);
      if (allTasksCompleted) {
        // Play success sound
        if (audioRef.current) {
          audioRef.current.play().catch(console.error);
        }

        // Get activity details from backend
        const activityResponse = await fetch(`/api/calendar-activity`);
        const activities = await activityResponse.json();
        const completedActivity = activities.find((a: FetchedActivity) => a.id === activityId);

        if (completedActivity.source === "generated" && isToday(new Date(completedActivity.scheduledDate))) {
          await updateUserCoinCount();
          try {
            const response = await fetch("/api/user-info");
            if (response.ok) {
              const data = await response.json();
              setUserCoinCount(data.score);
            }
          } catch (error) {
            console.error("Error fetching user score:", error);
          }
        }

        // Show success toast for individual activity
        if (completedActivity.source === "generated") {
          toast.success(
            `You've completed all tasks for ${activity.activityTitle}! You earned a coin!`
          );
        } else {
          toast.success(
            `You've completed all tasks for ${activity.activityTitle}!`
          );
        }
      }

      // Check if ALL activities have ALL tasks completed using the updated activities array
      const areAllTasksCompleted = updatedActivities.every((activity) => 
        activity.tasks?.every((task) => task.completed)
      );

      // If everything is complete, play fanfare and show completion dialog
      if (areAllTasksCompleted) {
        if (fanfareRef.current) {
          fanfareRef.current.play().catch(console.error);
        }
        setShowCompletionDialog(true);
      }

    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Failed to update task");
    }
  };

  const handleTasksUpdate = (eventId: string, updatedTasks: Task[]) => {
    // Update local state
    setTodayActivities((current) =>
      current.map((activity) =>
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
      audioRef.current
        .play()
        .catch((error) => console.error("Audio playback failed:", error));
    }
  };

  // Update the helper function to safely check tasks
  const isActivityCompleted = (activity: Activity) => {
    return (
      activity.tasks &&
      activity.tasks.length > 0 &&
      activity.tasks.every((task) => task.completed)
    );
  };

  const uWorldTasks = getUWorldTasks()
  const handleUWorldScoreSubmit = (scores: number[]) => {
    console.log("UWorld scores:", scores);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleTabChange = (tab: string) => {
    handleSetTab(tab);
  };

  useEffect(() => {
    const optionsDialogShown = localStorage.getItem('optionsDialogShown');
    if (!optionsDialogShown) {
      setShowOptionsModal(true);
      localStorage.setItem('optionsDialogShown', 'true');
    }
  }, []);

  // Function to check if all welcome tasks are completed
  const checkAllWelcomeTasksCompleted = () => {
    const welcomeTasks = todayActivities.flatMap(activity => activity.tasks);
    const allCompleted = welcomeTasks.every(task => task && task.completed);
    setAllWelcomeTasksCompleted(allCompleted);
  };

  // Call this function whenever tasks are updated
  useEffect(() => {
    checkAllWelcomeTasksCompleted();
  }, [todayActivities]);

  useEffect(() => {
    if (userCoinCount === 0) {
      const purchaseButton = document.querySelector('.purchase-button');
      if (purchaseButton instanceof HTMLElement) {
        purchaseButton.click();
      }
    }
  }, [userCoinCount]);

  // Add this function to calculate score feedback
  const getScoreFeedback = () => {
    if (!examScores.length) return null;

    const sortedExams = [...examScores].sort((a, b) => 
      new Date(a.calendarActivity.scheduledDate).getTime() - new Date(b.calendarActivity.scheduledDate).getTime()
    );

    const recentScore = sortedExams[sortedExams.length - 1].score;
    const previousScore = sortedExams.length > 1 ? sortedExams[sortedExams.length - 2].score : recentScore;
    const isImproving = recentScore > previousScore;

    if (!isImproving || recentScore === previousScore) {
      return {
        text: "You haven't improved from your last exam. Schedule a meeting with a tutor",
        link: true
      };
    }

    if (recentScore <= 505) {
      return {
        text: "You're scoring low and need help. Schedule a meeting with a tutor",
        link: true
      };
    }

    if (recentScore >= 525) {
      return {
        text: "Please reach out to prynce@mymcat.ai if you're scoring this high.",
        link: false
      };
    }

    if (recentScore >= 520) {
      return {
        text: "You're getting into medical school with that score.",
        link: false
      };
    }

    if (recentScore >= 515) {
      return {
        text: "You're scoring above the average for admitted medical students.",
        link: false
      };
    }

    if (recentScore >= 510) {
      return {
        text: "You're scoring good enough to secure admission to medical school.",
        link: false
      };
    }

    return null;
  };

  // Add this useEffect for fetching exam scores
  useEffect(() => {
    const fetchExamScores = async () => {
      try {
        const response = await fetch('/api/full-length-exam/complete');
        if (response.ok) {
          const data = await response.json();
          setExamScores(data);
        }
      } catch (error) {
        console.error('Error fetching exam scores:', error);
      }
    };

    fetchExamScores();
  }, []);

  return (
    <div className="w-full relative p-2">
      {/* Purchase Button - Now conditionally rendered */}
      <div className="absolute top-6 left-8 z-30 ml-4">
        {!isCoinsLoading && !selectedSubject && (
          <div className="pointer-events-auto flex items-center gap-2">
            <PurchaseButton 
              tooltipText="Click to purchase more coins!"
              autoOpen={false}
              userCoinCount={userCoinCount}
              className="purchase-button"
            >
              <button className="hover:opacity-80 transition-opacity">
                <ScoreDisplay score={userCoinCount} />
              </button>
            </PurchaseButton>
            
            {userCoinCount <= 3 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <div className="animate-vibrate">
                      <AlertTriangle 
                        className="h-6 w-6 text-red-500 drop-shadow-glow" 
                        strokeWidth={3}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="bg-red-500 text-white border-red-600">
                    <p>Low coin balance! Purchase more coins to continue accessing our features.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        )}
      </div>

      {/* Main Container */}
      <div
        className="flex-grow h-[calc(100vh-7.6rem)] w-full rounded-[10px] p-4 flex flex-col relative overflow-hidden"
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
        {/* Content Container */}
        <div className="relative w-full h-full flex-grow overflow-auto">
          {/* Analytics View - now always visible */}
          <div className="absolute inset-0 flex flex-col overflow-auto">
            {(isTypingComplete || isTutorialTypingComplete) && (
              <div className="flex-grow flex flex-col">
                <AnimatePresence mode="wait">
                  {!selectedSubject ? (
                    <motion.div
                      key="donut"
                      className="flex-grow flex justify-center items-center relative"
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
                      className="flex-grow"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Statistics onReturn={() => setSelectedSubject(null)} subject={selectedSubject} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Buttons */}
        <div className="mt-auto flex justify-end items-center gap-2 pt-2 mr-5">
          {/* Score Feedback */}
          {examScores.length > 0 && (
            <div className="mr-auto">
              {(() => {
                const feedback = getScoreFeedback();
                if (!feedback) return null;

                return (
                  <div 
                    className="text-[--theme-text-color] ml-5 text-sm font-medium p-2 rounded-lg max-w-[24rem]"
                    style={{
                      background: 'var(--theme-leaguecard-color)',
                      border: '1px solid var(--theme-border-color)',
                      boxShadow: 'var(--theme-button-boxShadow)'
                    }}
                  >
                    {feedback.link ? (
                      <p>
                        {feedback.text}
                        <span 
                          className="text-blue-500 hover:text-blue-600 cursor-pointer underline ml-1"
                          onClick={() => handleSetTab("Schedule?view=tutors")}
                        >
                          here
                        </span>
                        .
                      </p>
                    ) : (
                      <p>{feedback.text}</p>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          {/* Target Score Button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setShowTargetScoreDialog(true)}
                  className="group w-20 h-20 p-4 bg-[--theme-leaguecard-color] text-[--theme-text-color] 
                    border-2 border-[--theme-border-color] 
                    hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text] 
                    shadow-md rounded-full transition flex flex-col items-center justify-center gap-1"
                >
                  <Target className="w-8 h-8" />
                  <span className="text-xs font-medium">Target</span>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Set Target Score</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Practice Tests button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => handleButtonClick("Tests")}
                  className="group w-20 h-20 p-4 bg-[--theme-leaguecard-color] text-[--theme-text-color] 
                    border-2 border-[--theme-border-color] 
                    hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text] 
                    shadow-md rounded-full transition flex flex-col items-center justify-center gap-1"
                >
                  <ClipboardList className="w-8 h-8" />
                  <span className="text-xs font-medium">Tests</span>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Practice Tests</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
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
              <span className="font-bold">1 studycoin</span> for your hard
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
            <DialogTitle className="text-center text-black">
              Breaks Coming Soon!
            </DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <p className="text-center text-black">
              Toggle holidays. Add difficult weeks in school. Ask for a break.
              Your schedule will be updated automatically.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      <UWorldPopup
        isOpen={showUWorldPopup}
        onClose={() => setShowUWorldPopup(false)}
        onScoreSubmit={handleUWorldScoreSubmit}
        tasks={uWorldTasks}
      />

      <CompletionDialog 
        isOpen={showCompletionDialog} 
        onClose={() => setShowCompletionDialog(false)}
      />

      <OptionsDialog 
        showOptionsModal={showOptionsModal}
        setShowOptionsModal={setShowOptionsModal}
        handleTabChange={handleTabChange}
        allWelcomeTasksCompleted={allWelcomeTasksCompleted}
      />

      {/* Target Score Dialog */}
      <Dialog open={showTargetScoreDialog} onOpenChange={setShowTargetScoreDialog}>
        <DialogOverlay className="fixed inset-0 bg-black/50 z-50" />
        <DialogContent className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-xl max-w-md w-full z-50">
          <DialogHeader>
            <DialogTitle className="text-center text-black">Set Target Score</DialogTitle>
          </DialogHeader>
          <form onSubmit={async (e) => {
            e.preventDefault();
            
            const numValue = parseInt(targetScore);
            
            // Validate the score range on submit
            if (numValue < 472 || numValue > 528 || isNaN(numValue)) {
              toast.error('Please enter a score between 472 and 528');
              return;
            }

            try {
              await user?.update({
                unsafeMetadata: {
                  ...user.unsafeMetadata,
                  targetScore: numValue
                }
              });
              toast.success('Target score updated successfully!');
              setShowTargetScoreDialog(false);
            } catch (error) {
              console.error("Error updating target score:", error);
              toast.error('Failed to update target score');
            }
          }}>
            <div className="p-4 flex flex-col items-center gap-4">
              <input
                type="text"
                pattern="\d*"
                maxLength={3}
                value={targetScore}
                onChange={(e) => {
                  const value = e.target.value;
                  // Allow empty input for better UX
                  if (value === '') {
                    setTargetScore('');
                    return;
                  }
                  
                  // Only allow numbers
                  if (!/^\d+$/.test(value)) {
                    return;
                  }

                  const numValue = parseInt(value);
                  // Allow any number input, validation will happen on form submit
                  setTargetScore(value);
                }}
                className="w-24 text-center text-3xl font-bold bg-transparent border-b-2 border-gray-300 focus:outline-none focus:border-blue-500 text-black"
              />
              <p className="text-sm text-gray-500 text-center">
                Enter a score between 472 and 528
              </p>
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setShowTargetScoreDialog(false)}
                  className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );

  function getUWorldTasks() {
    const uWorldActivity = todayActivities.find(activity => activity.activityTitle === "UWorld");
    if (!uWorldActivity?.tasks) return [];
    
    return uWorldActivity.tasks
      .filter(task => {
        // Only include tasks that match the format "X Q UWorld - Subject"
        const pattern = /^\d+\s*Q\s*UWorld\s*-\s*.+$/i;
        return pattern.test(task.text);
      })
      .map(task => ({
        text: task.text,
        completed: task.completed,
        subject: task.text.split(' - ')[1]?.trim()
      }));
  }

};

export default Schedule;