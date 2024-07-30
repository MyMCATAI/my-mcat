import React, { useState } from "react";
import Image from "next/image";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import  profile  from "../../../../public/setting.svg";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

interface Tab {
  id: string;
  label: string;
}

interface Option {
  id: string;
  label: string;
}

const tabs: Tab[] = [
  { id: "tab1", label: "Calendar" },
  { id: "tab2", label: "Tutoring" },
  { id: "tab3", label: "Flashcards" },
];

const options: Option[] = [
  { id: "option1", label: "When is your test?" },
  { id: "option2", label: "When can you take full lengths?" },
  { id: "option3", label: "How many hours each day?" },
  { id: "option4", label: "What resources do you have?" },
];

const days: string[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const resources: string[] = ["UWorld", "AAMC", "Kaplan Books"];

const SettingContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("tab1");
  const [activeOption, setActiveOption] = useState<string | null>(null);
  const [calendarValue, setCalendarValue] = useState<Value>(new Date());
  const [fullLengthsDays, setFullLengthsDays] = useState<Record<string, boolean>>({});
  const [hoursPerDay, setHoursPerDay] = useState<Record<string, string>>({});
  const [selectedResources, setSelectedResources] = useState<Record<string, boolean>>({});

  const handleOptionClick = (optionId: string) => {
    setActiveOption(activeOption === optionId ? null : optionId);
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return "";
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  const renderOptionContent = () => {
    switch (activeOption) {
      case "option1":
        return (
          <div className="bg-white p-4 rounded-lg shadow-md">
            <Calendar onChange={setCalendarValue} value={calendarValue} />
          </div>
        );
      case "option2":
        return (
          <div className="bg-white p-4 rounded-lg shadow-md">
            {days.map((day) => (
              <div key={day} className="flex items-center justify-between mb-2">
                <span>{day}</span>
                <input
                  type="checkbox"
                  checked={fullLengthsDays[day] || false}
                  onChange={(e) => setFullLengthsDays({ ...fullLengthsDays, [day]: e.target.checked })}
                />
              </div>
            ))}
          </div>
        );
      case "option3":
        return (
          <div className="bg-white p-4 rounded-lg shadow-md">
            {days.map((day) => (
              <div key={day} className="flex items-center justify-between mb-2">
                <span>{day}</span>
                <input
                  type="number"
                  value={hoursPerDay[day] || ""}
                  onChange={(e) => setHoursPerDay({ ...hoursPerDay, [day]: e.target.value })}
                  className="w-16 p-1 border rounded"
                />
              </div>
            ))}
          </div>
        );
      case "option4":
        return (
          <div className="bg-white p-4 rounded-lg shadow-md">
            {resources.map((resource) => (
              <div key={resource} className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={selectedResources[resource] || false}
                  onChange={(e) => setSelectedResources({ ...selectedResources, [resource]: e.target.checked })}
                />
                <span className="ml-2">{resource}</span>
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-blue-100 p-6 rounded-lg shadow-lg">
      <div className="bg-white rounded-t-lg overflow-hidden">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`flex-1 py-2 px-4 text-sm font-medium ${
                activeTab === tab.id
                  ? "bg-[#021326] text-white"
                  : "bg-white text-black hover:bg-gray-100"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "tab1" && (
        <div className="bg-white p-4 space-y-4">
          {options.map((option) => (
            <div key={option.id} className="relative">
              <button
                className={`w-full text-left p-3 rounded-lg ${
                  activeOption === option.id
                    ? "bg-purple-500 text-white"
                    : "bg-gray-100 text-black hover:bg-gray-200"
                }`}
                onClick={() => handleOptionClick(option.id)}
              >
               <div className="flex justify-between items-center">
                <span>{option.label}</span>
                {option.id === "option1" && calendarValue instanceof Date && (
                  <span className="text-sm font-medium">
                    {formatDate(calendarValue)}
                  </span>
                )}
              </div>
              </button>
              {activeOption === option.id && (
                <div className="mt-2">
                  {renderOptionContent()}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="p-2">
        <Image src={profile} alt="Profile" style={{width: "100%"}} />
      </div>
    </div>
  );
};

export default SettingContent;