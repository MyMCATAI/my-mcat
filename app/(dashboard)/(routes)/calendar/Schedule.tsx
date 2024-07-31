"use client";
import React, { useState, useEffect } from "react";
import { format, addDays } from "date-fns";
import { useUser } from "@clerk/nextjs";
import SettingContent from "./SettingContent";
const Schedule = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showSettings, setShowSettings] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    setCurrentDate(new Date());
  }, []);

  const event = [
    {
      day: "Today",
      message: `Hi, ${
        user?.firstName ?? "Guest"
      }. Today you’re going to do content for three concepts and around 100 thinkcards. Don’t forget to do CARs as well :). Remember your test is in 10 days!`,
    },
    {
      day: "Tomorrow",
      message: "25 UWorld, 20 AAMC, 120 thinkcards",
    },
    {
      day: "overmorrow",
      message: "Take AAMC FL 1",
    },
  ];

  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  return (
    <>
      <div className=" text-white rounded-lg">
        <div>
          <div className="text-end mb-3">
            <button onClick={toggleSettings} className="ms-auto">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="#ffffff"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9.25001 22L8.85001 18.8C8.63335 18.7167 8.42918 18.6167 8.23751 18.5C8.04585 18.3833 7.85835 18.2583 7.67501 18.125L4.70001 19.375L1.95001 14.625L4.52501 12.675C4.50835 12.5583 4.50001 12.4458 4.50001 12.3375V11.6625C4.50001 11.5542 4.50835 11.4417 4.52501 11.325L1.95001 9.375L4.70001 4.625L7.67501 5.875C7.85835 5.74167 8.05001 5.61667 8.25001 5.5C8.45001 5.38333 8.65001 5.28333 8.85001 5.2L9.25001 2H14.75L15.15 5.2C15.3667 5.28333 15.5708 5.38333 15.7625 5.5C15.9542 5.61667 16.1417 5.74167 16.325 5.875L19.3 4.625L22.05 9.375L19.475 11.325C19.4917 11.4417 19.5 11.5542 19.5 11.6625V12.3375C19.5 12.4458 19.4833 12.5583 19.45 12.675L22.025 14.625L19.275 19.375L16.325 18.125C16.1417 18.2583 15.95 18.3833 15.75 18.5C15.55 18.6167 15.35 18.7167 15.15 18.8L14.75 22H9.25001ZM11 20H12.975L13.325 17.35C13.8417 17.2167 14.3208 17.0208 14.7625 16.7625C15.2042 16.5042 15.6083 16.1917 15.975 15.825L18.45 16.85L19.425 15.15L17.275 13.525C17.3583 13.2917 17.4167 13.0458 17.45 12.7875C17.4833 12.5292 17.5 12.2667 17.5 12C17.5 11.7333 17.4833 11.4708 17.45 11.2125C17.4167 10.9542 17.3583 10.7083 17.275 10.475L19.425 8.85L18.45 7.15L15.975 8.2C15.6083 7.81667 15.2042 7.49583 14.7625 7.2375C14.3208 6.97917 13.8417 6.78333 13.325 6.65L13 4H11.025L10.675 6.65C10.1583 6.78333 9.67918 6.97917 9.23751 7.2375C8.79585 7.49583 8.39168 7.80833 8.02501 8.175L5.55001 7.15L4.57501 8.85L6.72501 10.45C6.64168 10.7 6.58335 10.95 6.55001 11.2C6.51668 11.45 6.50001 11.7167 6.50001 12C6.50001 12.2667 6.51668 12.525 6.55001 12.775C6.58335 13.025 6.64168 13.275 6.72501 13.525L4.57501 15.15L5.55001 16.85L8.02501 15.8C8.39168 16.1833 8.79585 16.5042 9.23751 16.7625C9.67918 17.0208 10.1583 17.2167 10.675 17.35L11 20ZM12.05 15.5C13.0167 15.5 13.8417 15.1583 14.525 14.475C15.2083 13.7917 15.55 12.9667 15.55 12C15.55 11.0333 15.2083 10.2083 14.525 9.525C13.8417 8.84167 13.0167 8.5 12.05 8.5C11.0667 8.5 10.2375 8.84167 9.56251 9.525C8.88751 10.2083 8.55001 11.0333 8.55001 12C8.55001 12.9667 8.88751 13.7917 9.56251 14.475C10.2375 15.1583 11.0667 15.5 12.05 15.5Z"
                  fill="#ffffff"
                />
              </svg>
            </button>
          </div>

          {showSettings && (
            <div className="absolute top-10 right-1 w-100 bg-white text-black p-1 rounded-lg shadow-lg z-[9999999]">
              <SettingContent />
            </div>
          )}
        </div>
        <div
          className="bg-[#2D4778] text-white px-4 py-4 rounded-[30px] text-center mb-5"
          style={{ filter: "drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.50))" }}
        >
          <p className="text-2xl">{event[0].day}</p>
          <div className="px-4  mt-3 overflow-auto">
            <p className="py-4 text-[16px]">{event[0].message}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 ">
          {event.slice(1).map((event, index) => (
            <div
              className="bg-[#5D84CE] text-white p-4 rounded-[10px] text-center mb-5  group"
              style={{ boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px" }}
              key={index}
            >
              <p className="text-2xl">{event.day}</p>
              <div className="px-4 py-5 mt-3 overflow-auto">
                <p>{event.message}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-4 gap-4 mb-4">
          {[...Array(16)].map((_, index) => {
            const futureDate = addDays(currentDate, index + 3);
            return (
              <div
                key={index}
                className="bg-[#7AA3E4] text-white p-3 rounded-[10px] h-[100px] relative flex justify-between group overflow-hidden shadow-md transition-transform duration-300 ease-in-out transform hover:scale-105"
                aria-label={`Day ${format(futureDate, "d")}`}
              >
                <div className="text-sm">{format(futureDate, "d")}</div>
                <span className="text-sm">{format(futureDate, "MMM")}</span>
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p>Task will be shown here</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default Schedule;
