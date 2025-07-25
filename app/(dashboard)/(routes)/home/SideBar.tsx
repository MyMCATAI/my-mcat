import React, { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import { FetchedActivity } from '@/types';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, HelpCircle, CheckCircle, Cat, Calendar as CalendarIcon } from 'lucide-react';
import { FaCheckCircle, FaYoutube } from 'react-icons/fa';
import { toast } from "react-hot-toast";
import { isToday, isSameDay, isTomorrow, format } from "date-fns";
import RedditPosts from "@/components/RedditPosts";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import TutorialVidDialog from '@/components/ui/TutorialVidDialog';
import ChatBot from "@/components/chatbot/ChatBot";
import { useUser } from "@clerk/nextjs";
import { Star, StarHalf } from 'lucide-react';
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tutor, tutors as initialTutors, tutorExpertise, getTutorDescription } from "@/constants/tutors";
import { Checkbox } from "@/components/ui/checkbox";
import CompletionDialog from "@/components/home/CompletionDialog";
import { useRouter } from "next/navigation";
import UWorldPopup from '@/components/home/UWorldPopup';
import ScoreDisplay from '@/components/score/ScoreDisplay';
import { PurchaseButton } from '@/components/purchase-button';
import Leaderboard from "@/components/leaderboard/Leaderboard";
import { useAudio } from '@/store/selectors';
import { useUserInfo } from '@/hooks/useUserInfo';
import { cn } from "@/lib/utils";
import { useAllCalendarActivities, useExamActivities } from "@/hooks/useCalendarActivities";
import TestCalendar from '@/components/calendar/TestCalendar';
import type { CalendarEvent } from "@/types/calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "@/components/styles/CustomCalendar.css";
import {
  processExamActivities,
  processStudyActivities,
  combineCalendarEvents,
} from "@/components/chatgpt/CalendarUtils";

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

interface SideBarProps {
  activities: FetchedActivity[];
  currentPage: string;
  chatbotContext: any;
  chatbotRef: React.MutableRefObject<{
    sendMessage: (message: string) => void;
  }>;
  handleSetTab: (tab: string) => void;
  onActivitiesUpdate: () => void;
  isSubscribed: boolean;
  showTasks?: boolean;
}

type TabContent = 
  | { type: 'insights'; videos: { id: string; title: string }[] }
  | { type: 'tutors'; schools: Tutor[] }
  | { type: 'tasks' }
  | { type: 'leaderboard' };

type VideoCategory = 'RBT' | 'RWT' | 'CMP';

const SideBar: React.FC<SideBarProps> = ({ 
  activities: initialActivities, 
  currentPage, 
  chatbotContext, 
  chatbotRef,
  handleSetTab,
  onActivitiesUpdate,
  isSubscribed,
  showTasks = true
}) => {
  const { userInfo } = useUserInfo();
  const audio = useAudio();
  
  // Initialize audio context when component mounts
  useEffect(() => {
    audio.initializeAudioContext();
  }, [audio]);

  const getInitialActiveTab = () => {
    if (!isSubscribed) {
      return "tab2"; // Default to Tasks tab even for non-subscribers
    }

    switch (currentPage) {
      case "Schedule":
        return "tab2"; // Tasks tab
      case "CARS":
      case "AdaptiveTutoringSuite":
        return "tab1"; // Default to Chatbot tab
      case "Tests":
        return "tab2"; // Default to Tasks tab
      case "KalypsoAI":
        return "tab2"; // Tasks tab for KalypsoAI
      default:
        return "tab2"; // Default to Tasks tab
    }
  };

  const [activeTab, setActiveTab] = useState(getInitialActiveTab());
  
  useEffect(() => {
    setActiveTab(getInitialActiveTab());
  }, [currentPage]);

  const [tutors, setTutors] = useState<Tutor[]>(initialTutors);

  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<VideoCategory>('RBT');

  // Add task-related state
  const [todayActivities, setTodayActivities] = useState<Activity[]>([]);

  const firstVideo = { id: "gn10W2awwqw", title: "Scaffolding Strategy " };

  const videoCategories: Record<VideoCategory, { id: string; title: string }[]> = {
    RBT: [
      { id: "0KZwYQPggl8", title: "RBT Video 1" },
      { id: "f1k4eXELEIE", title: "RBT Video 2" },
      { id: "7p9-NXGOS7Y", title: "RBT Video 3" },
      { id: "rfMZkZV9iSk", title: "RBT Video 4" },
      { id: "gUW2jit3uvo", title: "RBT Video 5" },
      { id: "-DqMlYom0JQ", title: "RBT Video 6" },
      { id: "NKEhdsnKKHs", title: "RBT Video 7" },
      { id: "-wrCpLJ1XAw", title: "RBT Video 8" },
    ],
    RWT: [
      { id: "srInq08DTCw", title: "RWT Video 1" },
      { id: "5CQTgY2fqxM", title: "RWT Video 2" },
      { id: "IlPHkPo3jj8", title: "RWT Video 3" },
      { id: "V2XekjyG2Mw", title: "RWT Video 4" },
      { id: "pP8dWURrEF0", title: "RWT Video 5" },
      { id: "8Xjpu-qJK74", title: "RWT Video 6" },
      { id: "dPvWRYPadFg", title: "RWT Video 7" },
      { id: "XlcrKfaJBRM", title: "RBT Video 9" },
    ],
    CMP: [
      { id: "srInq08DTCw", title: "CMP Video 1" },
      { id: "z6H2NLPqWtI", title: "CMP Video 2" },
      { id: "aptsr0CrpWY", title: "CMP Video 3" },
      { id: "lqGvYT5CJqs", title: "CMP Video 4" },
      { id: "f1k4eXELEIE", title: "CMP Video 5" },
      { id: "TMCWtto__VI", title: "CMP Video 6" },
      { id: "pfXzfF6mXsk", title: "CMP Video 7" },
      { id: "MfQB3y8ayRU", title: "CMP Video 8" },
    ],
  };

  const shuffleVideos = (videos: { id: string; title: string }[]) => {
    for (let i = videos.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [videos[i], videos[j]] = [videos[j], videos[i]];
    }
    return videos;
  };

  const [videos, setVideos] = useState([firstVideo, ...shuffleVideos(videoCategories[selectedCategory])]);

  const selectRandomCategory = () => {
    const categories: VideoCategory[] = ['RBT', 'RWT', 'CMP'];
    const randomIndex = Math.floor(Math.random() * categories.length);
    setSelectedCategory(categories[randomIndex]);
  };

  useEffect(() => {
    selectRandomCategory();
  }, []);

  useEffect(() => {
    setVideos([...shuffleVideos(videoCategories[selectedCategory])]);
    setCurrentVideoIndex(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  const [isTutorialDialogOpen, setIsTutorialDialogOpen] = useState(false);
  const [tutorialVideoUrl, setTutorialVideoUrl] = useState('');

  const openTutorialDialog = (videoUrl: string) => {
    setTutorialVideoUrl(videoUrl);
    setIsTutorialDialogOpen(true);
  };

  const renderInsights = () => {
    if (currentPage !== "CARS") {
      return (
        <div className="h-full flex flex-col">
          <div className="flex-1 min-h-0">
            <ChatBot
              chatbotRef={chatbotRef}
              chatbotContext={chatbotContext}
              width="100%"
              height="100%"
              backgroundColor="transparent"
              avatar="/kalypso/kalypsoend.gif"
            />
          </div>
        </div>
      );
    }

    return (
      <div className="h-full flex flex-col space-y-4 overflow-auto">
        <Card className="flex-shrink-0">
          <CardContent className="p-4 relative">
            <div className="flex items-center mb-4">
              <FaYoutube className="text-3xl text-red-600 mr-2" />
              <span className="font-semibold text-lg text-[--theme-text-color]">Videos from YouTube</span>
            </div>
            <HelpCircle 
              className="absolute top-2 right-2 text-[--theme-border-color] hover:text-gray-200 transition-colors duration-200 cursor-pointer" 
              size={20}
              onClick={() => openTutorialDialog('https://my-mcat.s3.us-east-2.amazonaws.com/tutorial/KnowledgeProfileInformation.mp4')}
            />
            <div className="relative aspect-video group">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${videos[currentVideoIndex].id}`}
                title={videos[currentVideoIndex].title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0"
              ></iframe>
              <Button
                variant="secondary"
                size="sm"
                className="absolute left-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black bg-opacity-50 hover:bg-opacity-75 text-white z-10"
                onClick={() => setCurrentVideoIndex((prev) => (prev - 1 + videos.length) % videos.length)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black bg-opacity-50 hover:bg-opacity-75 text-white z-10"
                onClick={() => setCurrentVideoIndex((prev) => (prev + 1) % videos.length)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card className="flex-grow overflow-hidden">
          <CardContent className="p-4 h-full overflow-hidden">
            <div className="h-full overflow-auto">
              <RedditPosts />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderTutors = (tutors: Tutor[]) => (
    <div className="h-full flex flex-col">
      <ScrollArea className="flex-grow">
        <div className="pb-4">
          <div className="mb-3 flex justify-center">
            <TutorBookingDialog />
          </div>

          {tutors.map((tutor, index) => {
            const firstName = tutor.name.split(/[\s.]/, 1)[0];
            
            return (
              <div 
                key={index} 
                className="mb-4 p-4 bg-[--theme-leaguecard-color] rounded-lg shadow-md"
              >
                <div className="flex items-start">
                  <div className="mr-4 flex-shrink-0">
                    <Image
                      src={`/tutors/${tutor.name.split('.')[0].replace(/\s+/g, '')}.png`}
                      alt={tutor.name}
                      width={80}
                      height={80}
                      className="rounded-lg border border-[--theme-border-color] object-cover xl:w-24 xl:h-24"
                    />
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-[--theme-text-color]">{tutor.name}</h3>
                      </div>
                    </div>
                    <p className="text-sm text-[--theme-text-color] opacity-80">{tutor.university}</p>
                    <div className="mt-1 flex items-center">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => {
                          const starValue = i + 1;
                          const isHalfStar = tutor.stars % 1 !== 0 && Math.ceil(tutor.stars) === starValue;
                          
                          return isHalfStar ? (
                            <StarHalf
                              key={i}
                              className="w-4 h-4 fill-yellow-400 text-yellow-400"
                            />
                          ) : (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < tutor.stars 
                                  ? "fill-yellow-400 text-yellow-400" 
                                  : "fill-none text-gray-300"
                              }`}
                            />
                          );
                        })}
                        <span className="ml-2 text-sm text-[--theme-text-color] opacity-80">
                          ({tutor.reviews})
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-sm text-[--theme-text-color] opacity-90">
                  {getTutorDescription(tutor.name)}
                </p>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );

  const [currentDate, setCurrentDate] = useState(new Date());

  const [loadingTasks, setLoadingTasks] = useState<Record<string, boolean>>({});
  
  // Calendar modal state
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  
  // Get calendar activities
  const { activities: examActivities, loading: examLoading, fetchExamActivities } = useExamActivities();
  const { activities: studyActivities, loading: studyLoading, refetch: refetchStudyActivities } = useAllCalendarActivities();

  // Process calendar events
  useEffect(() => {
    if (examActivities && studyActivities) {
      const examEvents = processExamActivities(examActivities);
      const studyEvents = processStudyActivities(studyActivities);
      const combined = combineCalendarEvents(examEvents, studyEvents);
      setCalendarEvents(combined);
    }
  }, [examActivities, studyActivities]);

  useEffect(() => {
    if (isCalendarModalOpen) {
      fetchExamActivities();
      refetchStudyActivities();
    }
  }, [isCalendarModalOpen, fetchExamActivities, refetchStudyActivities]);

  const renderTasks = () => {
    if (!isSubscribed) {
      return (
        <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-6">
          <div className="max-w-md space-y-6">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 mb-4 rounded-full bg-[--theme-hover-color] flex items-center justify-center">
                <svg 
                  className="w-8 h-8 text-[--theme-hover-text]" 
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
              <h3 className="text-xl font-bold mb-2">Unlock Calendar</h3>
              <p className="text-[--theme-text-color] opacity-80 mb-6 text-center">
                Get access to personalized daily tasks, study planning, and progress tracking with a Gold subscription.
              </p>
            </div>
            <div className="flex flex-col space-y-4">
              <p className="text-sm text-[--theme-text-color] opacity-60 text-center">
                Cancel anytime. Instant access to all features.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between px-4 py-2 bg-[--theme-leaguecard-color] rounded-lg">
          <button
            onClick={() => {
              const newDate = new Date(currentDate);
              newDate.setDate(newDate.getDate() - 1);
              setCurrentDate(newDate);
            }}
            className="p-2 hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text] rounded-lg transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="font-medium">
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
            className="p-2 hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text] rounded-lg transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
        
        <ScrollArea className="flex-grow mt-4">
          <div className="px-4 space-y-6 pb-4">
            {todayActivities.map((activity) => (
              <div key={activity.id} className="mb-6">
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
                  onClick={() => handleButtonClick(activity.activityTitle)}
                >
                  <span>{activity.activityTitle}</span>
                  <div className="flex items-center gap-2">
                    {isActivityCompleted(activity) ? (
                      <FaCheckCircle
                        className="min-w-[1.25rem] min-h-[1.25rem] w-[1.25rem] h-[1.25rem]"
                        style={{ color: "var(--theme-hover-text)" }}
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
                            isToday(currentDate)
                              ? handleTaskCompletion(
                                  activity.id,
                                  index,
                                  checked as boolean
                                )
                              : null
                          }
                          disabled={!isToday(currentDate) || loadingTasks[`${activity.id}-${index}`]}
                          isLoading={loadingTasks[`${activity.id}-${index}`]}
                          className={cn(
                            !isToday(currentDate) ? "opacity-50 cursor-not-allowed" : "",
                            "data-[state=checked]:bg-[--theme-hover-color] data-[state=checked]:text-[--theme-hover-text]"
                          )}
                        />
                        <label
                          htmlFor={`task-${activity.id}-${index}`}
                          className={`text-sm leading-tight cursor-pointer flex-grow ${
                            !isToday(currentDate) ? "opacity-50" : ""
                          }`}
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
              <p className="text-center italic">
                No activities scheduled for this day
              </p>
            )}
          </div>
        </ScrollArea>

        <div className="mt-4 bg-[--theme-leaguecard-color] rounded-lg flex items-center justify-between p-4">
          <Button
            onClick={() => setIsCalendarModalOpen(true)}
            variant="default"
            size="sm"
            className="flex items-center gap-2"
          >
            <CalendarIcon className="h-4 w-4" />
            OPEN CALENDAR
          </Button>
          <PurchaseButton 
            userCoinCount={userInfo?.score || 0}
            tooltipText="Click to purchase more coins"
            className="bg-transparent"
          >
            <div className="cursor-pointer hover:opacity-80 transition-opacity text-sm">
              <ScoreDisplay score={userInfo?.score || 0} textClassName="text-xl font-bold" />
            </div>
          </PurchaseButton>
        </div>
      </div>
    );
  };

  const renderLeaderboard = () => (
    <div className="h-full flex flex-col">
      <Leaderboard 
        variant="sidebar"
        showAddFriend={true}
        className="p-4"
        compact={true}
        defaultTab="friends"
      />
    </div>
  );

  const renderContent = (content: TabContent) => {
    if (content.type === 'insights') {
        return renderInsights();
    } else if (content.type === 'tutors') {
        return renderTutors(content.schools);
    } else if (content.type === 'tasks') {
        return renderTasks();
    } else if (content.type === 'leaderboard') {
        return renderLeaderboard();
    }
    return null;
  };

  const tabs: { id: string; label: string; content: TabContent }[] = [
    { id: "tab2", label: "Tasks", content: { type: 'tasks' } },
    { id: "tab5", label: "Friends", content: { type: 'leaderboard' } },
    { id: "tab3", label: "Tutors", content: { type: 'tutors', schools: tutors } },
  ];

  const displayTabs = useMemo(() => {
    // Always show the Tasks tab (tab2) regardless of showTasks value
    return tabs;
  }, [tabs]);

  const TutorBookingDialog = () => {
    const router = useRouter();
    
    return (
      <button 
        onClick={() => router.push('/pricing')}
        className="group relative flex items-center gap-3 px-6 py-3 rounded-lg 
          bg-[--theme-button-color] hover:bg-[--theme-hover-color] 
          transition-all duration-300 ease-in-out
          shadow-[var(--theme-button-boxShadow)]
          hover:shadow-[var(--theme-button-boxShadow-hover)]
          transform hover:scale-[1.02]"
      >
        <div className="relative">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-transform duration-300 group-hover:rotate-90"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          <div className="absolute inset-0 animate-ping opacity-75 rounded-full bg-[--theme-hover-color] group-hover:opacity-0"></div>
        </div>
        <span className="text-base font-semibold text-[--theme-text-color] group-hover:text-[--theme-hover-text]">
          Schedule a free consult
        </span>
      </button>
    );
  };

  useEffect(() => {
    const activitiesForDate = initialActivities.filter((activity: Activity) => 
      isSameDay(new Date(activity.scheduledDate), currentDate)
    );
    setTodayActivities(activitiesForDate);
  }, [initialActivities, currentDate]);

  const [showCompletionDialog, setShowCompletionDialog] = useState(false);

  const handleTaskCompletion = async (
    activityId: string, 
    taskIndex: number,
    completed: boolean
  ) => {
    // Create a unique key for this task
    const taskKey = `${activityId}-${taskIndex}`;
    
    try {
      // Set loading state for this specific task
      setLoadingTasks(prev => ({ ...prev, [taskKey]: true }));
      
      const activity = todayActivities.find((a: Activity) => a.id === activityId);
      if (!activity || !activity.tasks) return;

      // If task is already completed, prevent unchecking
      if (activity.tasks[taskIndex].completed) {
        return;
      }

      const updatedTasks = activity.tasks.map((task: Task, index: number) =>
        index === taskIndex ? { ...task, completed } : task
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
        // Play levelup sound
        audio.playSound('levelup');
        
        // Get activity details from backend
        const activityResponse = await fetch(`/api/calendar-activity`);
        const activities = await activityResponse.json();
        const completedActivity = activities.find((a: Activity) => a.id === activityId);

        if (completedActivity.source === "generated" && isToday(new Date(completedActivity.scheduledDate))) {
          // Update user coin count
          await fetch("/api/user-info", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount: 1 }),
          });
          
          toast.success(
            `You've completed all tasks for ${activity.activityTitle}! You earned a coin!`
          );
        } else {
          toast.success(
            `You've completed all tasks for ${activity.activityTitle}!`
          );
        }
      }

      // Check if ALL activities have ALL tasks completed
      const areAllTasksCompleted = updatedActivities.every((activity) => 
        activity.tasks?.every((task) => task.completed)
      );

      // If everything is complete, play fanfare and show completion dialog
      if (areAllTasksCompleted) {
        audio.playSound('fanfare');
        setShowCompletionDialog(true);
      }
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Failed to update task");
    } finally {
      // Clear loading state for this task
      setLoadingTasks(prev => ({ ...prev, [taskKey]: false }));
    }
  };

  const isActivityCompleted = (activity: Activity) => {
    return (
      activity.tasks &&
      activity.tasks.length > 0 &&
      activity.tasks.every((task) => task.completed)
    );
  };

  function getUWorldTasks() {
    const uWorldActivity = todayActivities.find(activity => activity.activityTitle === "UWorld");
    if (!uWorldActivity?.tasks) return [];
    
    // Number of tasks should match the hours allocated
    const numTasks = Math.floor(uWorldActivity.hours);
    
    // If tasks are already generated, return them
    if (uWorldActivity.tasks.some(task => task.text !== "New tasks will be generated based on your test results")) {
      return uWorldActivity.tasks
        .filter(task => task.text !== "Review UWorld" && task.text.includes(" - ")) // Filter out review task and ensure proper format
        .map(task => ({
          ...task,
          subject: task.text.split(' - ')[1]?.trim() || "Unknown"
        }));
    }
    
    // Return placeholder tasks based on duration
    return Array(numTasks).fill({
      text: "New tasks will be generated based on your test results",
      completed: false,
      subject: "Pending"
    });
  }

  async function getATSTasks() {
    const atsActivity = todayActivities.find(activity => activity.activityTitle === "Adaptive Tutoring Suite");
    if (!atsActivity?.tasks) return [];
    
    // If tasks are already generated with a specific category, return them
    if (atsActivity.tasks.some(task => !task.text.includes("Concept will be generated"))) {
      return atsActivity.tasks;
    }

    // Only generate tasks for today
    if (!isToday(new Date(atsActivity.scheduledDate))) {
      return atsActivity.tasks;
    }

    // Fetch a category based on time and weakness
    try {
      const response = await fetch(`/api/category-time?minutes=${atsActivity.hours * 60}`);
      if (!response.ok) throw new Error("Failed to fetch category");
      
      const data = await response.json();
      if (data.items && data.items.length > 0) {
        const category = data.items[0];
        
        const updatedTasks = atsActivity.tasks?.map(task => ({
          ...task,
          text: task.text.includes("Concept will be generated") 
            ? `${category.name} (${category.contentType === 'video' ? 'Videos' : 'Readings'}), Do two practice quizzes`
            : task.text
        })) || [];

        await fetch(`/api/calendar-activity`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: atsActivity.id,
            tasks: updatedTasks,
          }),
        });

        return updatedTasks;
      }
    } catch (error) {
      toast.error("Failed to generate tasks");
    }
    return atsActivity.tasks || [];
  }

  const router = useRouter();

  const handleButtonClick = (section: string) => {
    switch (section) {
      case "MyMCAT Daily CARs":
        handleSetTab("CARS");
        break;
      case "AAMC CARs":
      case "AAMC Materials":
        window.open('https://students-residents.aamc.org/prepare-mcat-exam/prepare-mcat-exam', '_blank');
        break;
      case "Adaptive Tutoring Suite":
        handleSetTab("AdaptiveTutoringSuite");
        break;
      case "Anki Clinic":
        router.push("/ankiclinic");
        break;
      case "UWorld":
        setShowUWorldPopup(true);
        break;
      default:
        break;
    }
  };

  const [showUWorldPopup, setShowUWorldPopup] = useState(false);
  const [atsTasks, setAtsTasks] = useState<Task[]>([]);
  const uWorldTasks = getUWorldTasks();

  useEffect(() => {
    const fetchATSTasks = async () => {
      const tasks = await getATSTasks();
      setAtsTasks(tasks);
    };
    fetchATSTasks();
  }, [todayActivities]);

  const handleUWorldScoreSubmit = async (scores: number[], newTasks?: Task[]) => {
    console.log("UWorld scores:", scores);
    
    if (newTasks) {
      // Find the UWorld activity
      const uWorldActivity = todayActivities.find(activity => activity.activityTitle === "UWorld");
      if (uWorldActivity) {
        try {
          // Update the activity with new tasks
          await fetch(`/api/calendar-activity`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: uWorldActivity.id,
              tasks: newTasks,
            }),
          });

          // Update local state
          setTodayActivities(prev => prev.map(activity => 
            activity.id === uWorldActivity.id 
              ? { ...activity, tasks: newTasks }
              : activity
          ));
        } catch (error) {
          console.error("Error updating UWorld tasks:", error);
          toast.error("Failed to update UWorld tasks");
        }
      }
    }
  };

  // Calendar modal handlers
  const handleCalendarNavigate = (date: Date) => {
    setCalendarDate(date);
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    // Optionally handle event selection
  };

  const handleEventUpdate = async () => {
    await fetchExamActivities();
    await refetchStudyActivities();
    onActivitiesUpdate(); // Also refresh the sidebar activities
  };

  return (
    <div className="flex flex-col h-full">
      <div className="relative z-10 text-[--theme-text-color] p-2 rounded-lg h-full flex flex-col">
        <div className="flex items-center gap-4 mb-3 min-w-0">
          {/* Only show cat button when not on KalypsoAI page */}
          {currentPage !== "KalypsoAI" && (
            <button
              className={`flex-shrink-0 p-2 rounded-full transition-all duration-300 ${
                activeTab === "tab1"
                  ? "bg-[--theme-hover-color] text-[--theme-hover-text] shadow-md transform scale-105"
                  : "bg-transparent text-[--theme-text-color] hover:opacity-50 hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text]"
              }`}
              onClick={() => {
                setActiveTab("tab1");
                audio.playSound('chatbot-open');
              }}
            >
              <Cat className="w-6 h-6" />
            </button>
          )}
          <div className="flex flex-1 min-w-0 bg-[--theme-leaguecard-color] rounded-lg p-[1%]">
            {displayTabs.map((tab) => (
              <button
                key={tab.id}
                data-tab={tab.id}
                className={`flex-1 min-w-0 text-m py-[2%] px-[3%] rounded-lg transition-all duration-300 whitespace-nowrap overflow-hidden text-ellipsis ${
                  activeTab === tab.id
                    ? "bg-[--theme-hover-color] text-[--theme-hover-text] shadow-md transform scale-105"
                    : "bg-transparent text-[--theme-text-color] hover:opacity-50 hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text]"
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        <div className={`${
          activeTab === 'tab3'
            ? 'bg-transparent' 
            : 'bg-[--theme-mainbox-color]'
          } flex-1 min-h-0 overflow-hidden relative rounded-lg transition-all duration-300`}>
          {renderContent({ type: activeTab === "tab1" ? 'insights' : displayTabs.find(tab => tab.id === activeTab)?.content.type || 'tasks', videos: activeTab === "tab1" ? videos : [], schools: tutors })}
        </div>
      </div>
      
      <CompletionDialog 
        isOpen={showCompletionDialog} 
        onClose={() => setShowCompletionDialog(false)}
      />
      
      <TutorialVidDialog
        isOpen={isTutorialDialogOpen}
        onClose={() => setIsTutorialDialogOpen(false)}
        videoUrl={tutorialVideoUrl}
      />
      
      <UWorldPopup
        isOpen={showUWorldPopup}
        onClose={() => setShowUWorldPopup(false)}
        onScoreSubmit={handleUWorldScoreSubmit}
        tasks={uWorldTasks}
        hours={todayActivities.find(activity => activity.activityTitle === "UWorld")?.hours || 1}
      />

      {/* Calendar Modal */}
      {isCalendarModalOpen && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsCalendarModalOpen(false);
            }
          }}
        >
          <div className="w-[90vw] max-w-6xl h-[calc(100%-2rem)] bg-transparent rounded-xl overflow-hidden">
            <div className="p-4 h-full overflow-auto">
              {(examLoading || studyLoading) ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[--theme-text-color]" />
                </div>
              ) : (
                <div className="h-full flex flex-col min-h-[500px]">
                  <TestCalendar
                    events={calendarEvents}
                    date={calendarDate}
                    onNavigate={handleCalendarNavigate}
                    onSelectEvent={handleSelectEvent}
                    chatbotRef={chatbotRef}
                    onEventUpdate={handleEventUpdate}
                    buttonLabels={{
                      generate: "Generate Tasks",
                      hideSummarize: true
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default React.memo(SideBar, (prevProps, nextProps) => {
  // Only re-render if these props change
  return (
    prevProps.activities === nextProps.activities &&
    prevProps.currentPage === nextProps.currentPage &&
    prevProps.chatbotContext === nextProps.chatbotContext
  );
});