"use client";
import React, { useState } from "react";
import Image from "next/image";
import profile from "../../../../public/profile.svg";

const tabs = [
  { id: "tab1", label: "Future", content: "Future", image: profile },
  { id: "tab2", label: "Present", content: "Present", image: "/setting.svg" },
  { id: "tab3", label: "Past", content: "Past", image: profile },
];

const KnowledgeProfile = () => {
  const [activeTab, setActiveTab] = useState("tab1");

  const activeImage = tabs.find(tab => tab.id === activeTab)?.image || profile;

  return (
    <>
      <h2 className="text-2xl mb-2">knowledge profile</h2>
      <div className="relative p-2 mt-4">
        <div className="absolute inset-0 min-h-[880px] gradientbg"></div>
        <div className="relative z-10 text-white p-2 rounded-lg">
          <div
            className="p-2 flex justify-center"
            style={{ backgroundColor: "rgba(7, 46, 111, 0.5)"}}
          >
            <div style={{ width:"200px", height:"170px" }}>
            <Image src={activeImage} alt="Profile" width={0} height={0} style={{width:"100%"}}  />
            </div>
        
          </div>
          <div className="mt-4">
            <div className="flex w-full">
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

            <div className="mt-4">
              {tabs.map(
                (tab) =>
                  activeTab === tab.id && (
                    <div key={tab.id} className="bg-[#7A99E4] h-[570px] p-1">
                      <div>{tab.content}</div>
                    </div>
                  )
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default KnowledgeProfile;
