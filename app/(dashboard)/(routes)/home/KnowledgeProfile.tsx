import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import profile from "../../../../public/knowledge.png";
import { format, isBefore, isAfter, startOfDay } from 'date-fns';
import { FetchedActivity } from '@/types';
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from 'next/link';
import Icon from "@/components/ui/icon";

interface KnowledgeProfileProps {
  activities: FetchedActivity[];
}

interface Category {
  conceptCategory: string;
  icon: string;
  color: string;
}

type TabContent = {
  categories: Category[];
  activities: FetchedActivity[];
};

const KnowledgeProfile: React.FC<KnowledgeProfileProps> = ({ activities: initialActivities }) => {
  const [activeTab, setActiveTab] = useState("tab2");
  const [activities, setActivities] = useState(initialActivities);
  const [categories, setCategories] = useState<Category[]>([]);

  const statusOrder = ["Not Started", "In Progress", "Complete"];
  
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const url = new URL("/api/category", window.location.origin);
      url.searchParams.append("page", "1");
      url.searchParams.append("pageSize", "7");
      url.searchParams.append("useKnowledgeProfiles", "true");

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setCategories(data.items);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

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
    { id: "tab1", label: "Future", content: { categories: [], activities: categorizedActivities.future } },
    { id: "tab2", label: "Present", content: { categories: [], activities: categorizedActivities.present } },
    { id: "tab3", label: "Past", content: { categories: [], activities: categorizedActivities.past } },
    { id: "tab4", label: "KC", content: { categories, activities: [] } },
  ];
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Complete": return "bg-green-800";
      case "In Progress": return "bg-yellow-800";
      default: return "bg-red-800";
    }
  };

  const renderActivities = (activities: FetchedActivity[]) => (
    <ScrollArea className="h-full">
      {activities.length > 0 ? (
        activities.map((activity) => {
          const minutesFormatted = (activity.hours * 60).toFixed(2);
          
          return (
            <div key={activity.id} className="mb-4 p-3 bg-[--theme-mainbox-color] rounded">
              {activity.link ? (
                <Link
                  href={activity.link}
                  className="block text-sm font-bold text-[--theme-text-color] leading-normal shadow-text mb-1 hover:underline"
                >
                  {activity.activityTitle}
                </Link>
              ) : (
                <h3 className="text-sm font-bold text-[--theme-text-color] leading-normal shadow-text mb-1">
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
        <p className="text-center mt-4 text-[--theme-text-color] text-lg font-light leading-normal shadow-text">No activities</p>
      )}
    </ScrollArea>
  );

  const renderCategories = (categories: Category[]) => (
    <ScrollArea className="h-full">
      {categories.map((category, index) => (
        <div
          key={index}
          className="flex items-center p-2 mb-2 bg-[[#021326]] rounded-lg hover:bg-[#072E6F] transition-colors duration-200"
        >
          <div className="mr-3">
            <Icon 
              name={category.icon} 
              className="w-6 h-6" 
              color={category.color}
            />
          </div>
          <p className="text-[--theme-text-color] text-sm">{category.conceptCategory}</p>
        </div>
      ))}
    </ScrollArea>
  );

  const renderContent = (content: TabContent) => {
    if (content.categories.length > 0) {
      return renderCategories(content.categories);
    } else {
      return renderActivities(content.activities);
    }
  };
  return (
    <div className="relative p-2 mt h-[683px]">
      <div className="relative z-10 text-[--theme-text-color] p-2 rounded-lg h-full flex flex-col">
        <div className="flex w-full">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`flex-1 text-[12px] py-1 border border-[#79747E] text-center ${
                activeTab === tab.id
                  ? "bg-[--theme-hover-color] text-[--theme-text-color]"
                  : "bg-white text-black"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="mt-4 bg-[--theme-mainbox-color] flex-grow mb-8 overflow-hidden">
          {renderContent(tabs.find(tab => tab.id === activeTab)!.content)}
        </div>
      </div>
    </div>
  );
};

export default KnowledgeProfile;