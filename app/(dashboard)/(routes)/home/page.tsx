"use client";

import React, { useState, useEffect, useRef } from "react";
import Schedule from "./Schedule";
import SideBar from "./SideBar";
import AdaptiveTutoring from "./AdaptiveTutoring";
import FloatingButton from "./FloatingButton";
import { FetchedActivity } from "@/types";
import TestingSuit from "./TestingSuit";
import ThemeSwitcher from "@/components/home/ThemeSwitcher";
import { useSearchParams } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { checkProStatus } from "@/lib/utils";
import FlashcardDeck from "./FlashcardDeck";
import { toast } from 'react-hot-toast';
import { PurchaseButton } from "@/components/purchase-button";
import { isToday } from "date-fns";
import { shouldUpdateKnowledgeProfiles, updateKnowledgeProfileTimestamp } from "@/lib/utils";
import StreakPopup from "@/components/score/StreakDisplay";
import { useUserInfo } from "@/hooks/useUserInfo";


const Page = () => {
  
  const searchParams = useSearchParams();
  const initialTab = searchParams?.get("tab") || "Schedule";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isPro, setIsPro] = useState(false);
  const [activities, setActivities] = useState<FetchedActivity[]>([]);
  const scrollPosition = 7.125;
  const [showScorePopup, setShowScorePopup] = useState(false);
  const [testScore, setTestScore] = useState(0);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isGeneratingActivities, setIsGeneratingActivities] = useState(false);
  const [kalypsoState, setKalypsoState] = useState<
    "wait" | "talk" | "end" | "start"
  >("wait");
  const kalypsoRef = useRef<HTMLImageElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [chatbotContext, setChatbotContext] = useState<{
    contentTitle: string;
    context: string;
  } | null>(null);
  const { userInfo, isLoading: isLoadingUserInfo, checkHasReferrals } = useUserInfo();
  const [hasReferral, setHasReferral] = useState(false);

  const [currentPage, setCurrentPage] = useState("Schedule");
  const chatbotRef = useRef<{ sendMessage: (message: string) => void; }>({
    sendMessage: () => {}
  });
  const paymentStatus = searchParams?.get("payment");
  const [hasPaid, setHasPaid] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showStreakPopup, setShowStreakPopup] = useState(false);
  const [userStreak, setUserStreak] = useState(0);

  useEffect(() => {    
    // if returning from stripe, show toast depending on payment
    if (!paymentStatus) return;

    if (paymentStatus === "success") {
      toast.success("Payment Successful! Your coins have been added to your account."); // todo handle different purchases
    } else if (paymentStatus === "cancelled") {
      toast.error("Payment Cancelled. Your payment was cancelled.");
    }
  }, [paymentStatus]);

  useEffect(() => {
    const initializePage = async () => {
      setIsLoading(true);
      try {
        await fetchActivities();
        const proStatus = await checkProStatus();
        setIsPro(proStatus);
        
        // Check for referrals
        const hasExistingReferral = await checkHasReferrals();
        setHasReferral(hasExistingReferral);

        // Only update knowledge profiles if needed
        if (typeof window !== 'undefined' && shouldUpdateKnowledgeProfiles()) {
          const response = await fetch("/api/knowledge-profile/update", {
            method: "POST",
          });
          
          if (response.ok) {
            updateKnowledgeProfileTimestamp();
          }
        }
      } catch (error) {
        console.error("Error initializing page:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializePage();
  }, [checkHasReferrals]);

  useEffect(()=>{
    updateCalendarChatContext(activities);
  },[activities])

  const fetchActivities = async () => {
    try {
      const response = await fetch("/api/calendar-activity");
      if (!response.ok) {
        throw new Error("Failed to fetch activities");
      }
      const activities = await response.json();

      const todaysActivities = activities.filter((activity: FetchedActivity) =>
        isToday(new Date(activity.scheduledDate))
      );

      // get UWorld activities that need task generation
      const uworldActivities = todaysActivities.filter((activity: FetchedActivity) => 
        activity.activityTitle === "UWorld" && 
        (!activity.tasks || activity.tasks.length === 1)
      );

      let updatedActivities = [...activities];

      // Only fetch UWorld updates if there are UWorld activities that need tasks
      if (uworldActivities.length > 0) {
        const responseUWorld = await fetch("/api/uworld-update", {
          method: "POST",
          body: JSON.stringify({ todayUWorldActivity: uworldActivities }),
        });
    
        const responseUWorldJson = await responseUWorld.json();
        const uworldActivityTasks = responseUWorldJson.tasks;
        
        // Update only the activities that needed new tasks
        updatedActivities = updatedActivities.map(activity => 
          isToday(new Date(activity.scheduledDate)) && 
          activity.activityTitle === "UWorld" &&
          (!activity.tasks || activity.tasks.length === 1)
            ? { ...activity, tasks: uworldActivityTasks } 
            : activity
        );
      }
      
      setActivities(updatedActivities);
      updateCalendarChatContext(updatedActivities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      toast.error("Failed to fetch activities. Please try again.");
    }
  };

  const renderContent = () => {
    if (isLoading || isLoadingUserInfo) {
      return (
        <div className="flex justify-center items-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-sky-500 mx-auto mb-4"></div>
            <p className="text-sky-300 text-xl">Loading...</p>
          </div>
        </div>
      );
    }

    // Check both payment and referral status
    if (!userInfo?.hasPaid && !hasReferral) {
      return (
        <div className="flex justify-center items-center h-full">
          <div className="bg-[--theme-mainbox-color] rounded-lg p-[2rem] shadow-lg">
            <div className="text-center max-w-[45rem] mx-auto">
              <h2 className="text-6xl font-bold text-[--theme-text-color] mb-[3rem] animate-fade-in-up">
                Welcome to MyMCAT!
              </h2>
              <img 
                src="/kalypsodiagnostic.png" 
                alt="Kalypso" 
                className="mx-auto mb-[3rem] max-w-[20rem]"
              />
              <div className="mb-[2rem]">
                <p className="text-[--theme-text-color] text-lg leading-relaxed mb-[2rem]">
                  {!userInfo?.hasPaid 
                    ? "With 10 coins, you can unlock the Adaptive Tutoring Suite, Calendar, and Daily CARs. With hard work, you can earn coins and unlock more features without having to pay another cent. Please purchase coins to begin your MCAT journey!"
                    : "Please refer a friend to unlock all features. Share MyMCAT with your study buddies!"}
                </p>
                
                  <PurchaseButton 
                    text="Get Started with Coins"
                    className="bg-[--theme-hover-color] !important
                      px-[2rem] py-[0.75rem] text-lg 
                      text-[--theme-hover-text] 
                      transition-opacity duration-200
                      rounded-lg
                      hover:!bg-[--theme-hover-color]
                      hover:opacity-80"
                    tooltipText="Purchase coins to begin your MCAT journey"
                  />
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (isUpdatingProfile || isGeneratingActivities) {
      return (
        <div className="flex justify-center items-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-sky-500 mx-auto mb-4"></div>
            <p className="text-sky-300 text-xl">
              {isUpdatingProfile
                ? "Updating knowledge profile..."
                : "Generating new study plan..."}
            </p>
          </div>
        </div>
      );
    }

    let content;
    switch (activeTab) {
      case "Schedule":
        content = (
          <Schedule
            activities={activities}
            handleSetTab={handleTabChange}
            isActive={activeTab === "Schedule"}
            onActivitiesUpdate={() => {
              fetchActivities();
            }}
          />
        );
        break;
      case "KnowledgeProfile":
        content = (
          <div className="h-full overflow-hidden">
            <AdaptiveTutoring
              toggleChatBot={toggleChatBot}
              setChatbotContext={setChatbotContext}
              chatbotRef={chatbotRef}
            />
          </div>
        );
        break;
      case "AdaptiveTutoring":
        content = "";
        break;
      case "CARS":
        content = (
          <TestingSuit />
        );
        break;
      case "flashcards":
        content = <FlashcardDeck  />;
        break;
      default:
        content = null;
    }

    // Only wrap non-Schedule content with MDOnlyFeaturesDialog
    // if (!isPro && activeTab !== "Schedule" && activeTab !== "test") {
    //   return <MDOnlyFeaturesDialog content={content} />;
    // }

    return content;
  };

  useEffect(() => {
    const handleScroll = () => {
      const remToPixels = (rem: number) => rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
      const scrollToPosition = remToPixels(scrollPosition);
      
      window.scrollTo({
        top: scrollToPosition,
        behavior: 'smooth'
      });
    };

    // Wait for content to load
    const timer = setTimeout(() => {
      handleScroll();
    }, 100); // Small delay to ensure content is rendered

    return () => clearTimeout(timer);
  }, [activities, activeTab]); // Re-run when content changes

  const switchKalypsoState = (newState: "wait" | "talk" | "end" | "start") => {
    setKalypsoState(newState);
    if (kalypsoRef.current) {
      kalypsoRef.current.src = `/kalypso${newState}.gif`;
    }
  };

  const toggleChatBot = () => {
    console.log("todo, set this up to widget");
  };

  useEffect(() => {
    switchKalypsoState("wait"); // Start with waiting animation
    return () => {
      if (timeoutRef.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const updateCalendarChatContext = (currentActivities: FetchedActivity[]) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Create array of next 7 days
    const nextWeekDays = Array.from({length: 7}, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      return date;
    });

    // Helper function to format activities for a specific date
    const formatActivitiesForDate = (activities: FetchedActivity[]) => {
      return activities.map(a => 
        `${a.activityTitle} (${a.activityType}, ${a.hours}h, ${a.status})`
      ).join(', ');
    };

    // Get activities for yesterday and each day of the week
    const yesterdayActivities = currentActivities.filter(
      activity => new Date(activity.scheduledDate).toDateString() === yesterday.toDateString()
    );

    // Create context string with detailed information
    const context = `
      Here's my personal MCAT study calendar:

      Yesterday (${yesterday.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}):
      ${formatActivitiesForDate(yesterdayActivities) || 'No activities scheduled'}

      ${nextWeekDays.map(date => {
        const dayActivities = currentActivities.filter(
          activity => new Date(activity.scheduledDate).toDateString() === date.toDateString()
        );
        
        const dayLabel = date.toDateString() === today.toDateString() 
          ? 'Today' 
          : date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

        return `${dayLabel}:
      ${formatActivitiesForDate(dayActivities) || 'No activities scheduled'}`;
      }).join('\n\n')}
    `.trim();

    setChatbotContext({
      contentTitle: "Personal Calendar",
      context: context
    });
  };

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    setCurrentPage(newTab);

    if (newTab === "Schedule") {
      updateCalendarChatContext(activities);
    }
  };

  const shouldShowStreakPopup = () => {
    console.log('shouldShowStreakPopup called'); // Debug log
    console.log('Current userStreak:', userStreak); // Debug log
    
    if (userStreak < 1) {
      console.log('Streak too low, not showing popup'); // Debug log
      return false;
    }
    
    const lastStreakPopup = localStorage.getItem('lastStreakPopup');
    const today = new Date().toDateString();
    
    console.log('Last streak popup:', lastStreakPopup); // Debug log
    console.log('Today:', today); // Debug log
    
    if (!lastStreakPopup || lastStreakPopup !== today) {
      console.log('Conditions met, should show popup'); // Debug log
      localStorage.setItem('lastStreakPopup', today);
      return true;
    }
    return false;
  };

  return (
      <div className="w-full px-[2rem] lg:px-[2.7rem] xl:px-[7rem] overflow-visible">
        <div className="text-white flex gap-[1.5rem] overflow-visible">
          <div className="w-3/4 relative overflow-visible">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <h2 
                  className="text-white text-2xl ml-3 font-thin leading-normal shadow-text cursor-pointer" 
                  onClick={() => window.location.href = '/home'}
                >
                  {activeTab === "Schedule"
                    ? "Dashboard"
                    : activeTab === "KnowledgeProfile"
                    ? "Adaptive Tutoring Suite"
                    : activeTab === "flashcards"
                    ? "Flashcards"
                    : activeTab === "CARS"
                    ? "Daily CARs Practice"
                    : "Home"}
                  {/* {isPro && " Pro"} */}
                </h2>
                <ThemeSwitcher />
              </div>
            </div>
            <div className="relative overflow-visible">
              <div className="p-3 gradientbg h-[calc(100vh-5rem)] rounded-lg">
                {renderContent()}
              </div>

              {hasPaid && 
              <FloatingButton
                onTabChange={handleTabChange}
                currentPage="home"
                initialTab={activeTab}
                className="z-50"
              />
            }
            </div>
          </div>
          <div className="w-1/4">
            <h2 className="text-white text-2xl font-thin leading-normal shadow-text">
              &nbsp;
            </h2>

            <div className="gradientbg p-3 h-[calc(100vh-5rem)] rounded-lg knowledge-profile-component">
              <SideBar
                activities={activities}
                currentPage={currentPage}
                chatbotContext={chatbotContext}
                chatbotRef={chatbotRef}
              />
            </div>
          </div>
        </div>

        {/* Score Popup */}
        <Dialog open={showScorePopup} onOpenChange={setShowScorePopup}>
          <DialogContent className="bg-[#001226] text-white border border-sky-500 rounded-lg">
            <DialogHeader>
              <DialogTitle className="text-2xl font-semibold text-sky-300">
                Test Completed!
              </DialogTitle>
              <DialogDescription className="text-gray-300">
                Great job on completing the diagnostic test.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-xl">
                Your Score:{" "}
                <span className="font-bold text-sky-300">
                  {testScore.toFixed(2)}%
                </span>
              </p>
            </div>
            <div className="flex justify-end">
              <Button
                onClick={() => setShowScorePopup(false)}
                className="bg-sky-500 hover:bg-sky-600 text-white"
                disabled={isUpdatingProfile || isGeneratingActivities}
              >
                {isUpdatingProfile || isGeneratingActivities
                  ? "Processing..."
                  : "Close"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <StreakPopup 
          streak={userStreak}
          isOpen={showStreakPopup}
          onClose={() => {
            console.log('Closing streak popup'); // Debug log
            setShowStreakPopup(false);
          }}
        />
      </div>
  );
};

export default Page;
