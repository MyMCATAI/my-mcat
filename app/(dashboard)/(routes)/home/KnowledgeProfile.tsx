import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import profile from "../../../../public/knowledge.png";
import { format, isBefore, isAfter, startOfDay } from 'date-fns';
import { FetchedActivity } from '@/types';
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from 'next/link';

interface KnowledgeProfileProps {
  activities: FetchedActivity[];
}

const KnowledgeProfile: React.FC<KnowledgeProfileProps> = ({ activities: initialActivities }) => {
  const [activeTab, setActiveTab] = useState("tab2");
  const [activities, setActivities] = useState(initialActivities);

  const statusOrder = ["Not Started", "In Progress", "Complete"];
  

  useEffect(() => {
    setActivities(initialActivities)
  }, [initialActivities]);


  const updateActivityStatus = async (activityId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/calendar-activity', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: activityId, status: newStatus }),
      });
      if (!response.ok) throw new Error('Failed to update activity status');
      return await response.json();
    } catch (error) {
      console.error('Error updating activity status:', error);
      // Optionally, revert the optimistic update here
      throw error;
    }
  };

  const handleStatusToggle = async (activityId: string) => {
    const activityToUpdate = activities.find(activity => activity.id === activityId);
    if (!activityToUpdate) return;

    const currentStatusIndex = statusOrder.indexOf(activityToUpdate.status);
    const nextStatusIndex = (currentStatusIndex + 1) % statusOrder.length;
    const newStatus = statusOrder[nextStatusIndex];

    // Optimistic update
    setActivities(prevActivities => 
      prevActivities.map(activity => 
        activity.id === activityId ? { ...activity, status: newStatus } : activity
      )
    );

    try {
      await updateActivityStatus(activityId, newStatus);
    } catch (error) {
      // Revert the optimistic update if the API call fails
      setActivities(prevActivities => 
        prevActivities.map(activity => 
          activity.id === activityId ? { ...activity, status: activityToUpdate.status } : activity
        )
      );
    }
  };

  const categorizedActivities = useMemo(() => {
    const today = startOfDay(new Date());
    return {
      past: activities.filter(activity => isBefore(new Date(activity.scheduledDate), today)),
      present: activities.filter(activity => format(new Date(activity.scheduledDate), 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')),
      future: activities.filter(activity => isAfter(new Date(activity.scheduledDate), today))
    };
  }, [activities]);

  const tabs = [
    { id: "tab1", label: "Past", activities: categorizedActivities.past },
    { id: "tab2", label: "Today", activities: categorizedActivities.present },
    { id: "tab3", label: "Future", activities: categorizedActivities.future },
  ];
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Complete": return "bg-green-800";
      case "In Progress": return "bg-yellow-800";
      default: return "bg-red-800";
    }
  };

  const renderActivities = (activities: FetchedActivity[]) => (
    <ScrollArea className="h-[330px]">
      {activities.length > 0 ? (
        activities.map((activity) => {
          const minutesFormatted = (activity.hours * 60).toFixed(2);
          
          return (
            <div key={activity.id} className="mb-4 p-3 bg-[#021326] rounded">
              {activity.link ? (
                <Link
                  href={activity.link}
                  className="block text-sm font-bold text-white leading-normal shadow-text mb-1 hover:underline"
                >
                  {activity.activityTitle}
                </Link>
              ) : (
                <h3 className="text-sm font-bold text-white leading-normal shadow-text mb-1">
                  {activity.activityTitle}
                </h3>
              )}
              <p className="text-xs text-gray-300 mb-1">{activity.activityText}</p>
              <div className="flex justify-between items-center text-xs text-gray-400">
                <span>{format(new Date(activity.scheduledDate), 'MMM d, yyyy')}</span>
                <span>{minutesFormatted} minutes</span>
              </div>
              <div className="mt-2 flex justify-between items-center text-xs">
                <button
                  onClick={() => handleStatusToggle(activity.id)}
                  className={`px-2 py-1 rounded ${getStatusColor(activity.status)} hover:opacity-80 transition-opacity`}
                >
                  {activity.status}
                </button>
                <span className="text-blue-300">{activity.activityType}</span>
              </div>
            </div>
          );
        })
      ) : (
        <p className="text-center mt-4 text-white text-lg font-light leading-normal shadow-text">No activities</p>
      )}
    </ScrollArea>
  );

  return (
    <div className="relative p-2 mt-4">
      <div className="relative z-10 text-white p-2 rounded-lg">
        <div className="p-2 flex justify-center bg-[rgba(7,46,111,0.5)]">
          <div className="w-[200px] h-[170px]">
            <Image src={profile} alt="Profile" width={200} height={170} className="w-full h-full object-cover" />
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
          <div className="mt-4 bg-[#001226] h-[367px] p-1">
            {renderActivities(tabs.find(tab => tab.id === activeTab)?.activities || [])}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeProfile;