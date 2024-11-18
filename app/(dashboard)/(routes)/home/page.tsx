"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Schedule from "./Schedule";
import SideBar from "./SideBar";
import AdaptiveTutoring from "./AdaptiveTutoring";
import FloatingButton from "./FloatingButton";
import { FetchedActivity, Test } from "@/types";
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
import TestComponent from "@/components/test-component";
import { DialogOverlay } from "@radix-ui/react-dialog";
import { checkProStatus } from "@/lib/utils";
import WelcomePopUp from "@/components/home/WelcomePopUp";
import UpdateNotificationPopup from "@/components/home/UpdateNotificationPopup";
import FlashcardDeck from "./FlashcardDeck";
import { toast } from 'react-hot-toast';
import PurchaseCoinsModal from "@/components/PurchaseCoinsModal";

interface HandleShowDiagnosticTestParams {
  reset?: boolean;
}

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
  const [showDiagnosticTest, setShowDiagnosticTest] = useState(false);
  const [diagnosticTestId, setDiagnosticTestId] = useState<string | null>(null);
  const [chatbotContext, setChatbotContext] = useState<{
    contentTitle: string;
    context: string;
  } | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);

  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const [showUpdateNotification, setShowUpdateNotification] = useState(false);
  const [currentPage, setCurrentPage] = useState("Schedule");
  const chatbotRef = useRef<{ sendMessage: (message: string) => void; }>({
    sendMessage: () => {}
  });
  const paymentStatus = searchParams?.get("payment");
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

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
      await fetchActivities();
      const proStatus = await checkProStatus();
      setIsPro(proStatus);
      await fetchUserInfo();

      // Show welcome popup
      // setShowWelcomePopup(true);

      // Show update notification
      // setShowUpdateNotification(true);
    };

    initializePage();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(()=>{
    updateCalendarChatContext(activities);
  },[activities])
  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem("hasSeenWelcome");
    if (!hasSeenWelcome) {
      setShowWelcomePopup(true);
      localStorage.setItem("hasSeenWelcome", "true");
    }
  }, []);

  const handleCloseWelcomePopup = () => {
    setShowWelcomePopup(false);
  };

  const handleTestComplete = async (score: number) => {
    setTestScore(score);
    setShowScorePopup(true);
    setShowDiagnosticTest(false);

    // Update knowledge profile
    setIsUpdatingProfile(true);
    try {
      const response = await fetch("/api/knowledge-profile/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ score }),
      });

      if (!response.ok) {
        throw new Error("Failed to update knowledge profile");
      }

      toast.success("Knowledge profile updated successfully!");

      // Generate and fetch new activities
      await generateAndFetchActivities();
    } catch (error) {
      console.error("Error updating knowledge profile:", error);
      toast.error("Failed to update knowledge profile. Please try again.");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const generateAndFetchActivities = async () => {
    setIsGeneratingActivities(true);
    try {
      // Generate new activities
      const generateResponse = await fetch("/api/generate-study-plan", {
        method: "POST",
      });

      if (!generateResponse.ok) {
        throw new Error("Failed to generate new activities");
      }

      toast.success("New study plan generated successfully!");

      // Fetch the newly generated activities
      await fetchActivities();
    } catch (error) {
      console.error("Error generating or fetching activities:", error);
      toast.error("Failed to generate new study plan. Please try again.");
    } finally {
      setIsGeneratingActivities(false);
    }
  };

  const fetchActivities = async () => {
    try {
      const response = await fetch("/api/calendar-activity");
      if (!response.ok) {
        throw new Error("Failed to fetch activities");
      }
      const activities = await response.json();
      setActivities(activities);
      updateCalendarChatContext(activities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      toast.error("Failed to fetch activities. Please try again.");
    }
  };

  const handleShowDiagnosticTest = async ({
    reset = true,
  }: HandleShowDiagnosticTestParams = {}) => {
    try {
      if (reset) {
        // Call the delete API to reset everything - BE CAREFUL about this
        const resetResponse = await fetch("/api/knowledge-profile/reset", {
          method: "DELETE",
        });

        if (!resetResponse.ok) {
          throw new Error("Failed to reset user data");
        }

        console.log("User data reset successfully");
      }

      // Fetch the diagnostic test
      const response = await fetch("/api/test?diagnostic=true");
      if (response.ok) {
        const { testId } = await response.json();
        setDiagnosticTestId(testId);
        setShowDiagnosticTest(true);
      } else {
        throw new Error("Failed to fetch diagnostic test");
      }
    } catch (error) {
      console.error("Error in handleShowDiagnosticTest:", error);
      // Handle the error appropriately (e.g., show an error message to the user)
    }
  };

  const fetchUserInfo = async () => {
    try {
      const response = await fetch("/api/user-info");
      if (response.status === 404) {
        // Show purchase coins modal if user has no coins (and does not exist)
        setShowPurchaseModal(true);
        return;
      } else if (response.ok) {
        const userInfo = await response.json();
        setUserInfo(userInfo);
      } else {
        throw new Error("Failed to fetch user info");
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
      toast.error("Failed to fetch user info. Please try again.");
    }
  };

  const renderContent = () => {
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
            onShowDiagnosticTest={handleShowDiagnosticTest}
            handleSetTab={handleTabChange}
            isActive={activeTab === "Schedule"}
            onActivitiesUpdate={() => {
              console.log("update activities");
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

  const handleCloseUpdateNotification = () => {
    setShowUpdateNotification(false);
  };

  const haveAllTutorialsPlayed = () => {
    const tutorialPart1Played =
      localStorage.getItem("tutorialPart1Played") === "true";
    const tutorialPart2Played =
      localStorage.getItem("tutorialPart2Played") === "true";
    const tutorialPart3Played =
      localStorage.getItem("tutorialPart3Played") === "true";
    const tutorialPart4Played =
      localStorage.getItem("tutorialPart4Played") === "true";

    return (
      tutorialPart1Played &&
      tutorialPart2Played &&
      tutorialPart3Played &&
      tutorialPart4Played
    );
  };

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
              <FloatingButton
                onTabChange={handleTabChange}
                currentPage="home"
                initialTab={activeTab}
              />
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
        {/* Diagnostic Test Dialog */}
        <Dialog open={showDiagnosticTest} onOpenChange={setShowDiagnosticTest}>
          <DialogOverlay className="fixed inset-0 bg-black bg-opacity-80 z-50" />
          <DialogContent className="max-w-4xl w-full max-h-[95vh] flex flex-col bg-[#001226] text-white border border-sky-500 rounded-lg">
            <DialogHeader className="border-b border-sky-500 pb-4">
              <DialogTitle className="text-2xl font-semibold text-gray-300">
                Complete this test to help us understand your current knowledge
                level.
              </DialogTitle>
            </DialogHeader>
            <div className="flex-grow py-3">
              {diagnosticTestId && (
                <TestComponent
                  testId={diagnosticTestId}
                  onTestComplete={handleTestComplete}
                />
              )}
            </div>
          </DialogContent>
        </Dialog>

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

        {/* Welcome Popup */}
        <WelcomePopUp
          open={showWelcomePopup}
          onOpenChange={handleCloseWelcomePopup}
        />

        {/* Update Notification Popup */}
        <UpdateNotificationPopup
          open={showUpdateNotification && haveAllTutorialsPlayed()}
          onOpenChange={handleCloseUpdateNotification}
        />

        <PurchaseCoinsModal 
          open={showPurchaseModal} 
          onOpenChange={setShowPurchaseModal}
        />
      </div>
  );
};

export default Page;
