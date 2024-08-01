"use client";
import React, { useState, useEffect } from "react";
import Schedule from "./Schedule";
import KnowledgeProfile from "./KnowledgeProfile";
import AdaptiveTutoring from "./AdaptiveTutoring";
import FloatingButton from "./FloatingButton";
import {FetchedActivity} from '@/types';

const Page = () => {
  const [activeTab, setActiveTab] = useState("Schedule");
  const [activities, setActivities] = useState<FetchedActivity[]>([]);
  const scrollPosition = 130;
  const height = "880px";
  

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const response = await fetch('/api/calendar-activity');
      if (!response.ok) {
        throw new Error('Failed to fetch activities');
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
        return <Schedule activities={activities}/>;
      case "AdaptiveTutoring":
        return <AdaptiveTutoring />;
      default:
        return null;
    }
  };

  useEffect(() => {
    window.scrollTo({ top: scrollPosition, behavior: "smooth" });
  }, []);

  return (
    <div className="container py-10">
      <div className="text-white flex gap-10">
        <div className="w-3/4 relative">
          <h2 className="text-2xl mb-2 text-white">
            {activeTab === "Schedule" ? "Calendar" : "Adaptive tutoring suite"}
          </h2>
          <div className="relative">
            <div className="p-3 gradientbg" style={{ minHeight: height }}>
              {renderContent()}
            </div>
            <FloatingButton onTabChange={setActiveTab} />
          </div>
        </div>
        <div className="w-1/4">
          <h2 className="text-2xl mb-2 text-white">Knowledge Profile</h2>
          <div className="gradientbg p-3" style={{ minHeight: height }}>
            <KnowledgeProfile activities={activities} />
          </div>
        </div>
      </div>
      <div className="flex mt-20">
        <button
          className={`px-4 py-2 ${
            activeTab === "Schedule" ? "bg-blue-500" : "bg-gray-700"
          }`}
          onClick={() => setActiveTab("Schedule")}
        >
          Schedule
        </button>
        <button
          className={`px-4 py-2 ${
            activeTab === "AdaptiveTutoring" ? "bg-blue-500" : "bg-gray-700"
          }`}
          onClick={() => setActiveTab("AdaptiveTutoring")}
        >
          Adaptive Tutoring
        </button>
      </div>
    </div>
  );
};

export default Page;
