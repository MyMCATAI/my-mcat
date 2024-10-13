import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { isSameDay, isToday, isTomorrow } from "date-fns";
import { useUser } from "@clerk/nextjs";
import SettingContent from "./SettingContent";
import { NewActivity, FetchedActivity } from "@/types";
import { DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogOverlay } from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import Image from 'next/image';
import InteractiveCalendar from "@/components/InteractiveCalendar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Legend } from 'chart.js';
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from 'next/navigation';
import { CheckCircle } from 'lucide-react'; // Add this import
import Tutorial from './Tutorial';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

interface ScheduleProps {
  activities: FetchedActivity[];
  onShowDiagnosticTest: () => void;
  handleSetTab: (tab: string) => void;
}

const Schedule: React.FC<ScheduleProps> = ({ activities, onShowDiagnosticTest, handleSetTab }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showSettings, setShowSettings] = useState(false);
  const [showNewActivityForm, setShowNewActivityForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showThankYouDialog, setShowThankYouDialog] = useState(false);
  const [typedText, setTypedText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [expandedGraph, setExpandedGraph] = useState<string | null>(null);
  const [showGraphs, setShowGraphs] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(true);
  const [showRewardDialog, setShowRewardDialog] = useState(false);
  const [rewardSection, setRewardSection] = useState('');
  const [userCoinCount, setUserCoinCount] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const fanfareRef = useRef<HTMLAudioElement>(null);
  const [completedSections, setCompletedSections] = useState<string[]>([]);
  const [runTutorialPart1, setRunTutorialPart1] = useState(false);
  const [runTutorialPart2, setRunTutorialPart2] = useState(false);
  const [runTutorialPart3, setRunTutorialPart3] = useState(false);
  const [runTutorialPart4, setRunTutorialPart4] = useState(false);
  const [tutorialText, setTutorialText] = useState('');
  const [isTutorialTypingComplete, setIsTutorialTypingComplete] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(1);
  const [hasUpdatedStudyPlan, setHasUpdatedStudyPlan] = useState(false);
  const [showCalendarTutorial, setShowCalendarTutorial] = useState(false);

  const [newActivity, setNewActivity] = useState<NewActivity>({
    activityTitle: "",
    activityText: "",
    hours: "",
    activityType: "",
    scheduledDate: new Date().toISOString().split("T")[0],
  });

  const { user } = useUser();

  // Dummy data for charts
  const barChartData = {
    labels: ['Biology', 'Chemistry', 'Physics', 'CARS'],
    datasets: [
      {
        label: 'Hours Studied',
        data: [12, 19, 3, 5],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  const lineChartData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Practice Test Scores',
        data: [495, 501, 508, 512],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  const [checklists, setChecklists] = useState({
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
  });

  const buttonLabels = {
    AdaptiveTutoringSuite: "Tutoring Suite",
    MCATGameAnkiClinic: "The Anki Clinic",
    DailyCARsSuite: "Daily CARs Suite",
  };

  const handleCheckboxChange = async (section: string, id: number) => {
    setChecklists(prevChecklists => {
      const updatedSection = prevChecklists[section].map(item =>
        item.id === id ? { ...item, checked: !item.checked } : item
      );
      
      const allChecked = updatedSection.every(item => item.checked);
      if (allChecked && !prevChecklists[section].every(item => item.checked)) {
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
      
      return {
        ...prevChecklists,
        [section]: updatedSection
      };
    });
  };

  const updateUserCoinCount = async () => {
    try {
      const response = await fetch('/api/user-info', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 1 }),
      });

      if (response.ok) {
        const updatedUserInfo = await response.json();
        setUserCoinCount(updatedUserInfo.coinCount);
      }
    } catch (error) {
      console.error('Error updating user coin count:', error);
    }
  };

  const getActivitiesText = useMemo(() => {
    if (activities.length === 0) {
      return "Welcome to myMCAT.ai! It looks like this is your first time here. Let's get started by answering some questions about your test and study schedule. Would you like to take a diagnostic test to help us personalize your learning experience?";
    }

    const todayActivities = activities.filter(activity => isToday(new Date(activity.scheduledDate)));
    const tomorrowActivities = activities.filter(activity => isTomorrow(new Date(activity.scheduledDate)));

    if (todayActivities.length > 0) {
      const activityList = todayActivities.map(activity => activity.activityTitle).join(", ");
      return `Welcome back to myMCAT.ai! Here's what you have scheduled for today: ${activityList}. Let's get studying!`;
    } else if (tomorrowActivities.length > 0) {
      const activityList = tomorrowActivities.map(activity => activity.activityTitle).join(", ");
      return `Welcome back to myMCAT.ai! You don't have any activities scheduled for today, but tomorrow you'll be working on: ${activityList}. Take some time to prepare!`;
    } else {
      return "Welcome back to myMCAT.ai! You don't have any activities scheduled for today or tomorrow. Would you like to add some new study tasks?";
    }
  }, [activities]);

  useEffect(() => {
    setCurrentDate(new Date());
    setTypedText('');
    setIsTypingComplete(false);
    setTutorialText('');
    setIsTutorialTypingComplete(false);

    let text = getActivitiesText;
    if (runTutorialPart1) {
      if (tutorialStep === 1) {
        text = "Hi! Hello!\n\nThis is the dashboard. Here, you'll look at statistics on progress, look at your calendar, daily tasks, and ask Kalypso any questions related to the logistics of taking the test.";
      } else {
        text = '';
      }
    }

    let index = 0;
    const typingTimer = setInterval(() => {
      if (runTutorialPart1) {
        setTutorialText(prev => text.slice(0, prev.length + 1));
      } else {
        setTypedText(prev => text.slice(0, prev.length + 1));
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
    setShowCalendarTutorial(true);

    // Delay before starting Tutorial Part 2
    setTimeout(() => {
      // Start Tutorial Part 2
      setTutorialStep(1);
      setRunTutorialPart2(true);
    }, 5000);
  }, []);

  const handleCalendarModified = useCallback(() => {
    // Start Tutorial Part 3
    setTutorialStep(1);
    setRunTutorialPart3(true);
  }, []);

  const handleTakeDiagnosticTest = () => {
    setShowThankYouDialog(false);
    onShowDiagnosticTest();
  };

  const toggleSettings = () => {
    setShowSettings(!showSettings);
    if (runTutorialPart1) {
      endAllTutorials();
    }
  };

  const endAllTutorials = () => {
    setRunTutorialPart1(false);
    setRunTutorialPart2(false);
    setRunTutorialPart3(false);
    setRunTutorialPart4(false);
  };

  const toggleNewActivityForm = () => setShowNewActivityForm(!showNewActivityForm);

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
          userId: user?.id,
          studyPlanId: "placeholder-study-plan-id", // Replace with actual study plan ID
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
      case "DailyCARsSuite":
        handleSetTab("test");
        break;
      case "MCATGameAnkiClinic":
        router.push('/doctorsoffice');
        break;
      case "AdaptiveTutoringSuite":
        handleSetTab("KnowledgeProfile");
        break;
      // Add more cases if needed
      default:
        break;
    }
  };

  useEffect(() => {
    // Fetch initial user coin count when component mounts
    fetchUserCoinCount();
  }, []);

  const fetchUserCoinCount = async () => {
    try {
      const response = await fetch('/api/user-info');
      if (response.ok) {
        const data = await response.json();
        setUserCoinCount(data.coinCount);
      }
    } catch (error) {
      console.error('Error fetching user coin count:', error);
    }
  };

  const handleActivateTutorial = (step: number) => {
    setTutorialStep(step);
    setRunTutorialPart1(true);
  };

  return (
    <div className="flex h-full relative">
      {/* Left Sidebar */}
      <div className="w-1/4 p-6 flex flex-col ml-3 mt-5 mb-5 space-y-4 rounded-[10px] overflow-hidden daily-todo-list"
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
        {/* Add the large "TODAY" title */}
        <h1 className="text-3xl font-bold text-center">TODAY</h1>

        {/* Make the buttons container scrollable but hide the scrollbar */}
        <div className="flex-grow overflow-y-auto space-y-4 pr-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <style jsx>{`
            div::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          {Object.entries(checklists).map(([section, items]) => (
            <div key={section} className="mb-4 relative">
              <button
                className={`w-full h-10 ${
                  completedSections.includes(section)
                    ? 'bg-green-500 text-white'
                    : 'bg-[--theme-hover-color] text-[--theme-hover-text]'
                } hover:opacity-80 font-semibold shadow-md rounded transition text-m relative`}
                onClick={() => handleButtonClick(section)}
              >
                {buttonLabels[section]}
                {completedSections.includes(section) && (
                  <div className="absolute top-1/2 right-0 transform -translate-y-1/2 -mr-2">
                    <CheckCircle className="w-6 h-6 text-white bg-green-500 rounded-full" />
                  </div>
                )}
              </button>
              <div className="bg-[--theme-leaguecard-color] shadow-md p-3 mt-2 space-y-2">
                {items.map(item => (
                  <div key={item.id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`checkbox-${section}-${item.id}`}
                      checked={item.checked}
                      onChange={() => handleCheckboxChange(section, item.id)}
                      className="mr-2 h-4 w-4"
                    />
                    <label 
                      htmlFor={`checkbox-${section}-${item.id}`} 
                      className="text-sm leading-tight"
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
      <div className="w-3/4 p-6 bg-[--theme-gray-100] flex flex-col relative">
        {/* Settings Button */}
        <div className="absolute top-4 right-4 z-20">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <button 
                  onClick={toggleSettings} 
                  className={`settings-button p-2 rounded-full shadow-md ${
                    showSettings ? 'bg-[--theme-hover-color]' : 'bg-white'
                  }`}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill={showSettings ? 'white' : '#333'}
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9.25,22l-.4-3.2c-.216-.084-.42-.184-.612-.3c-.192-.117-.38-.242-.563-.375L4.7,19.375L1.95,14.625L4.525,12.675c-.016-.117-.024-.23-.024-.338V11.662c0-.108.008-.221.025-.337L1.95,9.375L4.7,4.625L7.675,5.875c.183-.134.375-.259.575-.375c.2-.117.4-.217.6-.3l.4-3.2H14.75l.4,3.2c.216.084.42.184.612.3c.192.117.38.242.563.375l2.975-.75l2.75,4.75l-2.575,1.95c.016.117.024.23.024.338v.675c0,.108-.008.221-.025.337l2.575,1.95l-2.75,4.75l-2.95-.75c-.183.133-.375.258-.575.375c-.2.117-.4.217-.6.3l-.4,3.2H9.25zM12.05,15.5c.966,0,1.791-.342,2.475-1.025c.683-.683,1.025-1.508,1.025-2.475c0-.966-.342-1.791-1.025-2.475c-.683-.683-1.508-1.025-2.475-1.025c-0.984,0-1.813,.342-2.488,1.025c-0.675,.683-1.012,1.508-1.012,2.475c0,.966,.337,1.791,1.012,2.475c.675,.683,1.504,1.025,2.488,1.025z"
                      fill={showSettings ? 'white' : '#333'}
                    />
                  </svg>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                Settings
              </TooltipContent>
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
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Schedule Display */}
        <div
          className="flex-grow h-[calc(100vh-8.3rem)] rounded-[10px] p-4 flex flex-col relative overflow-hidden schedule-content"
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
          {showAnalytics ? (
            <>
              <pre
                className="pt-5 font-mono text-m leading-[20px] tracking-[0.4px] whitespace-pre-wrap mt-4 ml-2"
                style={{ color: "var(--theme-text-color)" }}
              >
                {runTutorialPart1 ? tutorialText : typedText}
              </pre>

              {(isTypingComplete || isTutorialTypingComplete) && (
                <div className="flex-grow overflow-auto mt-6">
                  <div className="flex space-x-4 mb-4">
                    <button
                      onClick={() => setShowGraphs(!showGraphs)}
                      className="bg-[--theme-leaguecard-color] text-lg border-2 border-[--theme-border-color] hover:bg-[--theme-hover-color] text-[--theme-text-color] hover:text-[--theme-hover-text] font-semibold py-2 px-4 rounded transition"
                    >
                      &gt; progress
                    </button>
                    <button
                      onClick={handleToggleView}
                      className="bg-[--theme-leaguecard-color] text-lg border-2 border-[--theme-border-color] hover:bg-[--theme-hover-color] text-[--theme-text-color] hover:text-[--theme-hover-text] font-semibold py-2 px-4 rounded transition"
                    >
                      &gt; calendar
                    </button>
                  </div>

                  <AnimatePresence>
                    {showGraphs && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="grid grid-cols-2 gap-4">
                          <motion.div 
                            className={`bg-white p-4 rounded-lg shadow cursor-pointer ${expandedGraph === 'studyTime' ? 'col-span-2' : ''}`}
                            onClick={() => toggleGraphExpansion('studyTime')}
                            layout
                          >
                            <h3 className="text-lg font-semibold mb-2">Study Time by Subject</h3>
                            <AnimatePresence>
                              {expandedGraph === 'studyTime' ? (
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                >
                                  <Bar data={barChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                                </motion.div>
                              ) : (
                                <Bar data={barChartData} />
                              )}
                            </AnimatePresence>
                          </motion.div>
                          <motion.div 
                            className={`bg-white p-4 rounded-lg shadow cursor-pointer ${expandedGraph === 'practiceTest' ? 'col-span-2' : ''}`}
                            onClick={() => toggleGraphExpansion('practiceTest')}
                            layout
                          >
                            <h3 className="text-lg font-semibold mb-2">Practice Test Progress</h3>
                            <AnimatePresence>
                              {expandedGraph === 'practiceTest' ? (
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                >
                                  <Line data={lineChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                                </motion.div>
                              ) : (
                                <Line data={lineChartData} />
                              )}
                            </AnimatePresence>
                          </motion.div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </>
          ) : (
            <div className="h-full w-full relative">
              <InteractiveCalendar
                currentDate={currentDate}
                activities={activities}
                onDateChange={setCurrentDate}
                getActivitiesForDate={getActivitiesForDate}
                onInteraction={handleCalendarModified}
              />
              <button
                onClick={handleToggleView}
                className="absolute bottom-4 right-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition text-sm"
              >
                Back to Overview
              </button>
            </div>
          )}

          {/* Tutorial Buttons */}
          <div className="absolute bottom-4 right-4 flex space-x-2">
            <Button
              onClick={() => setRunTutorialPart4(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition text-sm"
            >
              Activate Tutorial Part 4
            </Button>
            <Button
              onClick={() => setRunTutorialPart3(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition text-sm"
            >
              Activate Tutorial Part 3
            </Button>
            <Button
              onClick={() => setRunTutorialPart2(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition text-sm"
            >
              Activate Tutorial Part 2
            </Button>
            <Button
              onClick={() => setRunTutorialPart1(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition text-sm"
            >
              Activate Tutorial
            </Button>
          </div>
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
            <DialogTitle className="text-center text-black">Congratulations!</DialogTitle>
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
              You&apos;ve completed all tasks in the {buttonLabels[rewardSection]}!
            </p>
            <p className="text-center text-lg text-black">
              You&apos;ve earned <span className="font-bold">1 cupcake coin</span> for your hard work!
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