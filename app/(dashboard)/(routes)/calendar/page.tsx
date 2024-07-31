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
      </div>
    </div>
  );
};

export default Page;
