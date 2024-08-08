import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import profile from "../../../../public/knowledge.png";
import { format, isBefore, isAfter, startOfDay } from 'date-fns';
import { FetchedActivity } from '@/types';
import Icon from "@/components/ui/icon";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Category {
  conceptCategory: string;
  icon: string;
  color: string;
}

interface KnowledgeProfileProps {
  activities: FetchedActivity[];
}

type TabContent = {
  categories: Category[];
  activities: FetchedActivity[];
};

const KnowledgeProfile: React.FC<KnowledgeProfileProps> = ({ activities }) => {
  const [activeTab, setActiveTab] = useState("tab0");
  const [categories, setCategories] = useState<Category[]>([]);

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

  const categorizedActivities = useMemo(() => {
    const today = startOfDay(new Date());
    return {
      past: activities.filter(activity => isBefore(new Date(activity.scheduledDate), today)),
      present: activities.filter(activity => format(new Date(activity.scheduledDate), 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')),
      future: activities.filter(activity => isAfter(new Date(activity.scheduledDate), today))
    };
  }, [activities]);

  const tabs = [
    { id: "tab0", label: "KC", content: { categories, activities: [] } },
    { id: "tab1", label: "Future", content: { categories: [], activities: categorizedActivities.future } },
    { id: "tab2", label: "Present", content: { categories: [], activities: categorizedActivities.present } },
    { id: "tab3", label: "Past", content: { categories: [], activities: categorizedActivities.past } },
  ];

  const renderActivities = (activities: FetchedActivity[]) => (
    <ScrollArea className="h-[330px]">
      {activities.length > 0 ? (
        activities.map((activity, index) => (
          <div key={index} className="mb-2 p-2 bg-[#021326] rounded">
            <p className="text-sm font-bold text-center text-white leading-normal shadow-text">{activity.activityTitle}</p>
            <p className="text-sm font-bold text-center text-white leading-normal shadow-text">{format(new Date(activity.scheduledDate), 'MMM d, yyyy')}</p>
          </div>
        ))
      ) : (
        <p className="text-center mt-4 text-white text-lg font-light leading-normal shadow-text">No activities</p>
      )}
    </ScrollArea>
  );

  const renderCategories = (categories: Category[]) => (
    <ScrollArea className="h-[330px]">
      {categories.map((category, index) => (
        <div
          key={index}
          className="flex items-center p-2 mb-2 bg-[#021326] rounded-lg hover:bg-[#072E6F] transition-colors duration-200"
        >
          <div className="mr-3">
            <Icon 
              name={category.icon} 
              className="w-6 h-6" 
              color={category.color}
            />
          </div>
          <p className="text-white text-sm">{category.conceptCategory}</p>
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
          <div className="mt-4 bg-[#7A99E4] h-[330px] p-1">
            {renderContent(tabs.find(tab => tab.id === activeTab)!.content)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeProfile;