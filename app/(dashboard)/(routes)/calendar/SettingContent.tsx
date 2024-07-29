"use client";
import React, { useState } from "react";
import Image from "next/image";
import profile from "../../../../public/setting.svg";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
const tabs = [
  { id: "tab1", label: "Calendar", content: "Calendar" },
  { id: "tab2", label: "Tutoring", content: "Tutoring" },
  { id: "tab3", label: "Flashcards", content: "Flashcards" },
];

const hours = [
  {
    day: "Monday",
    number: 5,
  },
  {
    day: "Tuesday",
    number: 5,
  },
  {
    day: "Wednesday",
    number: 5,
  },
  {
    day: "Thursday",
    number: 5,
  },
  {
    day: "Friday",
    number: 5,
  },
  {
    day: "Saturday",
    number: 5,
  },
  {
    day: "Sunday",
    number: 5,
  },
];
const length = [
  {
    day: "Monday",
  },
  {
    day: "Tuesday",
  },
  {
    day: "Wednesday",
  },
  {
    day: "Thursday",
  },
  {
    day: "Friday",
  },
  {
    day: "Saturday",
  },
  {
    day: "Sunday",
  },
];
const SettingContent = () => {
  const [activeTab, setActiveTab] = useState("tab1");
  const [value, onChange] = useState<any>(new Date());

  return (
    <>
      <div className="relative">
        <div className="relative z-10 text-white p-2 rounded-lg">
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
              {activeTab === "tab1" && (
                <div className="text-black">
                  <div>
                    <Calendar onChange={onChange} value={value} />
                  
                  </div>
                </div>
              )}
              {activeTab === "tab2" && (
                <div className="text-black">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="border border-[#79747E] p-1 text-[14px]">
                          Day
                        </th>
                        <th className="border border-[#79747E] p-1 text-[14px]">
                          Available
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {length.map((length, index) => (
                        <tr key={index}>
                          <td className="border border-[#79747E] p-1 text-[14px]">
                            {length.day}
                          </td>
                          <td className="border border-[#79747E] p-1 text-center">
                            <input type="checkbox" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {activeTab === "tab3" && (
                <div className="text-black">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="border border-[#79747E] p-1 text-[14px]">
                          Day
                        </th>
                        <th className="border border-[#79747E] p-1 text-[14px]">
                          Hours
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {hours.map((hours, index) => (
                        <tr key={index}>
                          <td className="border border-[#79747E] p-1 text-[14px]">
                            {hours.day}
                          </td>
                          <td className="border border-[#79747E] p-1 text-[14px] text-center">
                            {hours.number}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
          <div className="p-2">
            <Image src={profile} alt="Profile" style={{ width: "100%" }} />
          </div>
        </div>
      </div>
    </>
  );
};

export default SettingContent;
