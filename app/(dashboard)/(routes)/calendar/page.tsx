"use client";
import React, { useState, useEffect } from "react";
import Schedule from "./Schedule";
import KnowledgeProfile from "./KnowledgeProfile";
import AdaptiveTutoring from "./AdaptiveTutoring";
import FloatingButton from "./FloatingButton";
import { FetchedActivity } from "@/types";
import ChatBot from "@/components/chatbot/ChatBot";
import ScreenshotButton from "@/components/chatbot/ScreenshotButton";

const Page = () => {
  const [activeTab, setActiveTab] = useState("Schedule");
  const [activities, setActivities] = useState<FetchedActivity[]>([]);
  const [showChatbot, setShowChatbot] = useState(false);

  const scrollPosition = 130;
  const height = "660px";

  useEffect(() => {
    fetchActivities();
  }, []);

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

  const renderContent = () => {
    switch (activeTab) {
      case "Schedule":
        return <Schedule activities={activities} />;
      case "KnowledgeProfile":
        return <AdaptiveTutoring />;
      case "AdaptiveTutoring":
        return "";
      default:
        return null;
    }
  };

  useEffect(() => {
    window.scrollTo({ top: scrollPosition, behavior: "smooth" });
  }, []);

  return (
    <div className="container py-10">
      <div className="text-white flex gap-6">
        <div className="w-3/4 relative">
          <h2 className="text-white text-2xl font-thin leading-normal shadow-text">
            {activeTab === "Schedule" ? "calendar." : "adaptive tutoring suite."}
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
            knowledge profile
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
              style={{ width: '370px', height: '600px' }}
            >
              <ChatBot />
            </div>
          )}
          <button
            className="w-20 h-20 rounded-full overflow-hidden shadow-lg transition duration-120 ease-in-out transform hover:-translate-y-1 hover:scale-105 focus:outline-none"
            onClick={() => setShowChatbot((prev) => !prev)}
            aria-label={showChatbot ? 'Close Chat' : 'Open Chat'}
          >
            <img
              src="/Kalypso.png"
              alt="Chat with Kalypso"
              className="w-full h-full object-cover"
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Page;