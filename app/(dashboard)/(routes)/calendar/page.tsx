"use client";
import React, { useState, useEffect } from "react";
import Schedule from "./Schedule";
import KnowledgeProfile from "./KnowledgeProfile";
import AdaptiveTutoring from "./AdaptiveTutoring";
import {FetchedActivity} from '@/types';

const Page = () => {
  const [activeTab, setActiveTab] = useState("Schedule");
  const [activities, setActivities] = useState<FetchedActivity[]>([]);


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

  return (
    <div className="">
      <div className="container py-10">
        <div className="text-white flex gap-10">
          <div className="" style={{ width: "75%" }}>
            {renderContent()}
          </div>
          <div style={{ width: "25%" }}>
            <KnowledgeProfile activities={activities}/>
          </div>
        </div>
        <div className="flex mt-20">
          <button
            className={`px-4 py-2 ${
              activeTab === "Schedule" ? "bg-blue-500" : "bg-gray-700"
            }`}
            onClick={() => setActiveTab("Schedule")}
          >
            schedule
          </button>
          <button
            className={`px-4 py-2 ${
              activeTab === "AdaptiveTutoring" ? "bg-blue-500" : "bg-gray-700"
            }`}
            onClick={() => setActiveTab("AdaptiveTutoring")}
          >
            adaptive Tutoring
          </button>
        </div>
      </div>
    </div>
  );
};

export default Page;
