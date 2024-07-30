"use client";
import React, { useState } from "react";
import Schedule from "./Schedule";
import KnowledgeProfile from "./KnowledgeProfile";
import AdaptiveTutoring from "./AdaptiveTutoring";

const Page = () => {
  const [activeTab, setActiveTab] = useState("Schedule");

  const renderContent = () => {
    switch (activeTab) {
      case "Schedule":
        return <Schedule />;
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
            <KnowledgeProfile />
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
