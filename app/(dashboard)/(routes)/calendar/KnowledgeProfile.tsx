"use client";
import React, { useState } from "react";
import Image from "next/image";
import profile from "../../../../public/profile.svg";

const tabs = [
  { id: "tab1", label: "Future", content: "Future" },
  { id: "tab2", label: "Present", content: "Present" },
  { id: "tab3", label: "Past", content: "Past" },
];

const KnowledgeProfile = () => {
  const [activeTab, setActiveTab] = useState("tab1");

  return (
    <>
      <h2 className="text-2xl mb-2">Knowledge Profile</h2>
      <div className="relative p-2 mt-4">
        <div
          className="absolute inset-0 rounded-lg min-h-[865px]"
          style={{
            opacity: 0.9,
            background:
              "linear-gradient(178deg, rgba(48,104,185,1) 0%, rgba(181,213,245,1) 21%, rgba(191,221,253,1) 99%);",
            boxShadow: "0px 0px 4px 2px #000",
            backgroundColor:"white",
            zIndex: 0,
          }}
        ></div>
        <div className="relative z-10 text-white p-2 rounded-lg">
          <div className="p-2 bg-[#072e6f]">
            <Image src={profile} alt="Profile" style={{ width: "100%" }} />
          </div>
          <div className="mt-4">
            <div className="flex w-full ">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`flex-1 text-[12px] py-1 border border-[#79747E] text-center ${
                    activeTab === tab.id
                      ? "bg-[#021326] text-white"
                      : "bg-white text-black"
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            {/* Tab Content */}
            <div className="mt-4">
              {tabs.map(
                (tab) =>
                  activeTab === tab.id && <div key={tab.id}>{tab.content}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default KnowledgeProfile;
