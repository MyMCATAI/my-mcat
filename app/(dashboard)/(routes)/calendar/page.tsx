"use client";
import React, { useState, useEffect } from "react";
import Schedule from "./Schedule";
import KnowledgeProfile from "./KnowledgeProfile";
import AdaptiveTutoring from "./AdaptiveTutoring";
import FloatingButton from "./FloatingButton";
import { FetchedActivity } from "@/types";

const Page = () => {
  const [activeTab, setActiveTab] = useState("Schedule");
  const [activities, setActivities] = useState<FetchedActivity[]>([]);
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
    </div>
  );
};

export default Page;