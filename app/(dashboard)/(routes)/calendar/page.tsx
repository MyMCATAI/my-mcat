"use client";
import React, { useState, useEffect } from "react";
import Image from 'next/image';
import Schedule from "./Schedule";
import KnowledgeProfile from "./KnowledgeProfile";
import AdaptiveTutoring from "./AdaptiveTutoring";
import FloatingButton from "./FloatingButton";
import { FetchedActivity, Test } from "@/types";
import ChatBot from "@/components/chatbot/ChatBot";
import ScreenshotButton from "@/components/chatbot/ScreenshotButton";
import TestPage from "../test/page";
import TestingSuit from "./TestingSuit";
import { toast } from "@/components/ui/use-toast";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import TestComponent from "@/components/test-component";
import { DialogOverlay } from "@radix-ui/react-dialog";

const Page = () => {
  const [activeTab, setActiveTab] = useState("Schedule");
  const [activities, setActivities] = useState<FetchedActivity[]>([]);
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatbotContext, setChatbotContext] = useState("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const scrollPosition = 130;
  const height = "660px";
  const [tests, setTests] = useState<Test[]>([]);
  const [showScorePopup, setShowScorePopup] = useState(false);
  const [testScore, setTestScore] = useState(0);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const [showDiagnosticTest, setShowDiagnosticTest] = useState(false);
  const [diagnosticTestId, setDiagnosticTestId] = useState<string | null>(null);

  useEffect(() => {
    fetchActivities();
    fetchTests();
  }, []);

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
        body: JSON.stringify({ score }), // You might want to send the score or other relevant data
      });

      if (!response.ok) {
        throw new Error("Failed to update knowledge profile");
      }

      toast({
        title: "Success",
        description: "Knowledge profile updated successfully!",
        duration: 3000,
      });

      // Refresh activities and tests after updating profile
      await fetchActivities();
      await fetchTests();
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
    }
  };

  const fetchTests = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/test");
      if (!response.ok) throw new Error("Failed to fetch tests");
      const data = await response.json();
      setTests(data.tests);
    } catch (error) {
      console.error("Error fetching tests:", error);
      setError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowDiagnosticTest = async () => {
    try {
      const response = await fetch('/api/test?diagnostic=true');
      if (response.ok) {
        const { testId } = await response.json();
        setDiagnosticTestId(testId);
        setShowDiagnosticTest(true);
      }
    } catch (error) {
      console.error('Error fetching diagnostic test:', error);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "Schedule":
        return <Schedule 
        activities={activities} 
        onShowDiagnosticTest={handleShowDiagnosticTest}
      />;
      case "KnowledgeProfile":
        return (
          <AdaptiveTutoring
            toggleChatBot={toggleChatBot}
            setChatbotContext={setChatbotContext}
          />
        );
      case "AdaptiveTutoring":
        return "";
      case "thinkcard":
        return "Think Cards";
      case "test":
        return <TestingSuit tests={tests} />;
      default:
        return null;
    }
  };

  useEffect(() => {
    window.scrollTo({ top: scrollPosition, behavior: "smooth" });
  }, []);

  const toggleChatBot = () => {
    setShowChatbot(!showChatbot);
  };

  return (
    <div className="container py-10">
      <div className="text-white flex gap-6">
        <div className="w-3/4 relative">
          <h2 className="text-white text-2xl font-thin leading-normal shadow-text">
            {activeTab === "Schedule"
              ? "calendar."
              : activeTab === "KnowledgeProfile"
              ? "adaptive tutoring suite."
              : activeTab === "thinkcard"
              ? "think Card"
              : activeTab === "test"
              ? "testing suite"
              : ""}
          </h2>
          <div className="relative">
            <div className="p-3 gradientbg" style={{ minHeight: height }}>
              {renderContent()}
            </div>
            <FloatingButton onTabChange={setActiveTab} />
          </div>
        </div>
        <div className="w-1/4">
          <h2 className="text-white text-2xl font-thin leading-normal shadow-text">
            &nbsp;
          </h2>
          <div className="gradientbg p-3" style={{ minHeight: height }}>
            <KnowledgeProfile activities={activities} />
          </div>
        </div>
      </div>
      {/* Chatbot */}
      <div className="fixed inset-0 pointer-events-none z-50">
        <div className="absolute bottom-6 right-6 flex flex-col items-end pointer-events-auto">
          {showChatbot && (
            <div
              className="bg-white rounded-lg shadow-lg overflow-hidden mb-4"
              style={{ width: "370px", height: "600px" }}
            >
              <ChatBot context={chatbotContext} />
            </div>
          )}
          <button
            className="w-20 h-20 rounded-full overflow-hidden shadow-lg transition duration-120 ease-in-out transform hover:-translate-y-1 hover:scale-105 focus:outline-none"
            onClick={() => setShowChatbot((prev) => !prev)}
            aria-label={showChatbot ? "Close Chat" : "Open Chat"}
          >
            <Image
              src="/Kalypso.png"
              alt="Chat with Kalypso"
              width={80}
              height={80}
              className="w-full h-full object-cover"
            />
          </button>
        </div>
      </div>
       {/* Diagnostic Test Dialog */}
      <Dialog open={showDiagnosticTest} onOpenChange={setShowDiagnosticTest}>
      <DialogOverlay className="fixed inset-0 bg-black bg-opacity-0 z-50" />
        <DialogContent className="max-w-4xl w-full max-h-[90vh] flex flex-col bg-[#001226] text-white border border-sky-500">
          <DialogHeader className="border-b border-sky-500 pb-4">
            <DialogTitle className="text-2xl font-semibold text-sky-300">Diagnostic Test</DialogTitle>
            <DialogDescription className="text-gray-300">
              Complete this test to help us understand your current knowledge level.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-grow overflow-auto py-4">
            {diagnosticTestId && <TestComponent testId={diagnosticTestId} onTestComplete={handleTestComplete} />}
          </div>
        </DialogContent>
      </Dialog>

      {/* Score Popup */}
      <Dialog open={showScorePopup} onOpenChange={setShowScorePopup}>
        <DialogContent className="bg-[#0A2540] text-white border border-sky-500">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold text-sky-300">Test Completed!</DialogTitle>
            <DialogDescription className="text-gray-300">
              Great job on completing the diagnostic test.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-xl">Your Score: <span className="font-bold text-sky-300">{testScore.toFixed(2)}%</span></p>
          </div>
          <div className="flex justify-end">
            <Button 
              onClick={() => setShowScorePopup(false)}
              className="bg-sky-500 hover:bg-sky-600 text-white"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Page;