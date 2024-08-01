"use client";
import React, { useState, useEffect } from "react";
import Schedule from "./Schedule";
import KnowledgeProfile from "./KnowledgeProfile";
import AdaptiveTutoring from "./AdaptiveTutoring";
import FloatingButton from "./FloatingButton";

const Page = () => {
  const [activeTab, setActiveTab] = useState(0);
  const height = "880px";
  const scrollPosition = 130;

  const renderContent = () => {
    switch (activeTab) {
      case 0:
        return <Schedule />;
      case 1:

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

  useEffect(() => {
    window.scrollTo({ top: scrollPosition, behavior: "smooth" });
  }, []);

  return (
    <div className="">
      <div className="container py-10">
        <div className="text-white flex gap-10">
          <div style={{ width: "75%" }} className="relative">
            <h2 className="text-2xl mb-2 text-white">
              {activeTab === 0 ? "Calendar" : "Adaptive tutoring suite."}
            </h2>
            <div className="relative">
              <div className={`p-3 gradientbg`} style={{ minHeight: height }}>
                {renderContent()}
              </div>
              <FloatingButton onTabChange={setActiveTab} />
            </div>
          </div>
          <div style={{ width: "25%" }}>
            <h2 className="text-2xl mb-2 text-white">Knowledge Profile</h2>
            <div className="gradientbg p-3" style={{ minHeight: height }}>
              <KnowledgeProfile />
            </div>
          </div>
        </div>
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
