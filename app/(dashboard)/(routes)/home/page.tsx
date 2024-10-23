"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Schedule from "./Schedule";
import KnowledgeProfileCARsONLY from "./KnowledgeProfileCARsONLY";
import AdaptiveTutoring from "./AdaptiveTutoring";
import FloatingButton from "./FloatingButton";
import { FetchedActivity, Test } from "@/types";
import TestingSuit from "./TestingSuit";
import { toast } from "@/components/ui/use-toast";
import ThemeSwitcher from "@/components/home/ThemeSwitcher";
import { useSearchParams } from "next/navigation";
import MDOnlyFeaturesDialog from "@/components/home/MDOnlyFeaturesDialog";
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

const FlashcardDeck = dynamic(() => import("./FlashcardDeck"), { ssr: false });

interface HandleShowDiagnosticTestParams {
  reset?: boolean;
}

const Page = () => {
  const searchParams = useSearchParams();
  // Change this line to set "Schedule" as the default tab
  const initialTab = searchParams?.get("tab") || "Schedule";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isPro, setIsPro] = useState(false);
  const [activities, setActivities] = useState<FetchedActivity[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const scrollPosition = 130;
  const [tests, setTests] = useState<Test[]>([]);
  const [testsCompletedToday, setTestsCompletedToday] = useState(0);
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
  const [showMessageForm, setShowMessageForm] = useState(false);
  const [message, setMessage] = useState("");
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const [showUpdateNotification, setShowUpdateNotification] = useState(false);

  useEffect(() => {
    const initializePage = async () => {
      await fetchActivities();
      fetchTests(true);
      const proStatus = await checkProStatus();
      setIsPro(proStatus);
      await fetchUserInfo();

      // Show welcome popup
      // setShowWelcomePopup(true);

      // Show update notification
      setShowUpdateNotification(true);
    };

    initializePage();
  }, []);

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

      toast({
        title: "Success",
        description: "Knowledge profile updated successfully!",
        duration: 3000,
      });

      // Generate and fetch new activities
      await generateAndFetchActivities();
    } catch (error) {
      console.error("Error updating knowledge profile:", error);
      toast({
        title: "Error",
        description: "Failed to update knowledge profile. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
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

      toast({
        title: "Success",
        description: "New study plan generated successfully!",
        duration: 3000,
      });

      // Fetch the newly generated activities
      await fetchActivities();
    } catch (error) {
      console.error("Error generating or fetching activities:", error);
      toast({
        title: "Error",
        description: "Failed to generate new study plan. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
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
    } catch (error) {
      console.error("Error fetching activities:", error);
      toast({
        title: "Error",
        description: "Failed to fetch activities. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const fetchTests = async (
    ordered: boolean = false,
    page: number = 1,
    pageSize: number = 10
  ) => {
    try {
      setIsLoading(true);

      const queryParams = new URLSearchParams({
        ordered: ordered.toString(),
        page: page.toString(),
        pageSize: pageSize.toString(),
        CARSonly: "true",
      });

      const response = await fetch(`/api/test?${queryParams}`);

      if (!response.ok) throw new Error("Failed to fetch tests");

      const data = await response.json();

      setTests(data.tests);
      setTestsCompletedToday(data.testsCompletedToday);
    } catch (error) {
      console.error("Error fetching tests:", error);
      setError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    } finally {
      setIsLoading(false);
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
        // User info not found, create a new one
        const currentDate = new Date().toISOString().split("T")[0]; // Get current date in YYYY-MM-DD format
        const createResponse = await fetch("/api/user-info", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            bio: `I love the MCAT and started my learning journey on ${currentDate}`,
          }),
        });
        if (createResponse.ok) {
          const newUserInfo = await createResponse.json();
          setUserInfo(newUserInfo);
        } else {
          throw new Error("Failed to create user info");
        }
      } else if (response.ok) {
        const userInfo = await response.json();
        setUserInfo(userInfo);
      } else {
        throw new Error("Failed to fetch user info");
      }
    } catch (error) {
      console.error("Error fetching/creating user info:", error);
      toast({
        title: "Error",
        description: "Failed to fetch or create user info. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleSendMessage = async () => {
    try {
      const response = await fetch("/api/send-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Message sent successfully!",
          duration: 3000,
        });
        setShowMessageForm(false);
        setMessage("");
      } else {
        throw new Error("Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
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
            handleSetTab={setActiveTab}
          />
        );
        break;
      case "KnowledgeProfile":
        content = (
          <AdaptiveTutoring
            toggleChatBot={toggleChatBot}
            setChatbotContext={setChatbotContext}
          />
        );
        break;
      case "AdaptiveTutoring":
        content = "";
        break;
      case "test":
        content = (
          <TestingSuit
            tests={tests}
            testsCompletedToday={testsCompletedToday}
          />
        );
        break;
      case "flashcards":
        content = <FlashcardDeck />;
        break;
      default:
        content = null;
    }
    content = <FlashcardDeck />;

    // Only wrap non-Schedule content with MDOnlyFeaturesDialog
    // if (!isPro && activeTab !== "Schedule" && activeTab !== "test") {
    //   return <MDOnlyFeaturesDialog content={content} />;
    // }

    return content;
  };

  useEffect(() => {
    window.scrollTo({ top: scrollPosition, behavior: "smooth" });
  }, []);

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

  return (
    <div className="w-full px-[2rem] lg:px-[2.7rem] xl:px-[7rem]">
      <div className="text-white flex gap-[1.5rem]">
        <div className="w-3/4 relative">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h2 className="text-white text-2xl ml-3 font-thin leading-normal shadow-text">
                {activeTab === "Schedule"
                  ? "Dashboard"
                  : activeTab === "KnowledgeProfile"
                  ? "Adaptive Tutoring Suite"
                  : activeTab === "flashcards"
                  ? "Flashcards"
                  : activeTab === "test"
                  ? "Daily CARs Practice"
                  : "Home"}
                {/* {isPro && " Pro"} */}
              </h2>
              <ThemeSwitcher />
            </div>
          </div>
          <div className="relative">
            <div className="p-3 gradientbg overflow-auto h-[calc(100vh-5rem)] rounded-lg">
              {renderContent()}
            </div>
            <FloatingButton
              onTabChange={setActiveTab}
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
            <KnowledgeProfileCARsONLY
              activities={activities}
              currentPage={activeTab}
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
    </div>
  );
};

export default Page;
