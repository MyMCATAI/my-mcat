"use client";
import React, { useState, useMemo } from "react";
import Image from "next/image";
import profile from "../../../../public/knowledge.png";
import { format, isBefore, isAfter, startOfDay } from 'date-fns';
import { FetchedActivity } from '@/types';

interface KnowledgeProfileProps {
  activities: FetchedActivity[];
}

const KnowledgeProfile: React.FC<KnowledgeProfileProps> = ({ activities }) => {
  const [activeTab, setActiveTab] = useState("tab1");

  const categorizedActivities = useMemo(() => {
    const today = startOfDay(new Date());
    return {
      past: activities.filter(activity => isBefore(new Date(activity.scheduledDate), today)),
      present: activities.filter(activity => format(new Date(activity.scheduledDate), 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')),
      future: activities.filter(activity => isAfter(new Date(activity.scheduledDate), today))
    };
  }, [activities]);

  const tabs = [
    { id: "tab1", label: "present", content: categorizedActivities.future, image: profile },
    { id: "tab2", label: "past", content: categorizedActivities.present, image: profile },
    { id: "tab3", label: "profile", content: categorizedActivities.past, image: profile },
  ];

  const activeImage = tabs.find(tab => tab.id === activeTab)?.image || profile;

  const renderActivities = (activities: FetchedActivity[]) => (
    <div className="overflow-y-auto h-full">
      {activities.length > 0 ? (
        activities.map((activity, index) => (
          <div key={index} className="mb-2 p-2 bg-[#021326] rounded">
            <p className="text-sm font-bold text-center mt-4 text-sm mt-1  text-white text-lg  leading-normal shadow-text">{activity.activityTitle}</p>
            <p className="text-sm font-bold text-center mt-4 text-sm mt-1  text-white text-lg  leading-normal shadow-text">{format(new Date(activity.scheduledDate), 'MMM d, yyyy')}</p>
          </div>
        ))
      ) : (
        <p className="text-center mt-4 text-sm mt-1  text-white text-lg font-light leading-normal shadow-text">No activities</p>
      )}
    </div>
  );

  return (
    <div className="relative p-2 mt-4">
      <div className="relative z-10 text-white p-2 rounded-lg">
        <div
          className="p-2 flex justify-center"
          style={{ backgroundColor: "rgba(7, 46, 111, 0.5)" }}
        >
          <div style={{ width: "200px", height: "170px" }}>
            <Image src={activeImage} alt="Profile" width={200} height={170} style={{ width: "100%", height: "100%" }} />
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
                  <div key={tab.id} className="bg-[#001226] h-[367px] p-1">
                    {renderActivities(tab.content)}
                  </div>
                )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeProfile;