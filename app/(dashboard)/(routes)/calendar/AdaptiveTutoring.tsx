"use client";
import React, { useState } from "react";
import SettingContent from "./SettingContent";
import Image from "next/image";

const AdaptiveTutoring = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [showVideo, setShowVideo] = useState(true);
  const [showPDF, setShowPDF] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);

  const events = [
    {
      day: "atomic theory",
      icon: "/atomic.svg",
      bgColor: "#b1c03a",
      description: "Exploring the fundamentals of atomic theory.",
    },
    {
      day: "sensation",
      icon: "/sensation.svg",
      bgColor: "#B925FF",
      description: "Understanding sensory processes.",
    },
    {
      day: "newton",
      icon: "/newton.svg",
      bgColor: "#009918",
      description: "Examining Newton's laws of motion.",
    },
    {
      day: "respiration",
      icon: "/respiration.svg",
      bgColor: "#3294FF",
      description: "Learning about the process of respiration.",
    },
    {
      day: "molecular bio",
      icon: "/molecular.svg",
      bgColor: "#AE5353",
      description: "Studying the basics of molecular biology.",
    },
  ];

  const toggleSettings = () => {
    setShowSettings((prev) => !prev);
  };

  const handleCameraClick = () => {
    setShowVideo(true);
    setShowPDF(false);
  };

  const handleBookClick = () => {
    setShowPDF(true);
    setShowVideo(false);
  };

  const toggleSearch = () => {
    setShowSearch((prev) => !prev);
  };

  const handleCardClick = (index: any) => {
    setSelectedCard(index);
  };

  return (
    <div className="relative p-4 mt-4">
      <div className="absolute inset-0 min-h-[880px] gradientbg"></div>
      <div className="relative z-10 text-white rounded-lg">
        <h2 className="text-2xl mb-4">Adaptive Tutoring Suite</h2>
        
        <div className="flex justify-end gap-2 mb-4">
          <button onClick={toggleSearch} className="p-2">
            <Image src="/search.svg" alt="search icon" width={24} height={24} />
          </button>
          <button onClick={toggleSettings} className="p-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#ffffff" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.25001 22L8.85001 18.8C8.63335 18.7167 8.42918 18.6167 8.23751 18.5C8.04585 18.3833 7.85835 18.2583 7.67501 18.125L4.70001 19.375L1.95001 14.625L4.52501 12.675C4.50835 12.5583 4.50001 12.4458 4.50001 12.3375V11.6625C4.50001 11.5542 4.50835 11.4417 4.52501 11.325L1.95001 9.375L4.70001 4.625L7.67501 5.875C7.85835 5.74167 8.05001 5.61667 8.25001 5.5C8.45001 5.38333 8.65001 5.28333 8.85001 5.2L9.25001 2H14.75L15.15 5.2C15.3667 5.28333 15.5708 5.38333 15.7625 5.5C15.9542 5.61667 16.1417 5.74167 16.325 5.875L19.3 4.625L22.05 9.375L19.475 11.325C19.4917 11.4417 19.5 11.5542 19.5 11.6625V12.3375C19.5 12.4458 19.4833 12.5583 19.45 12.675L22.025 14.625L19.275 19.375L16.325 18.125C16.1417 18.2583 15.95 18.3833 15.75 18.5C15.55 18.6167 15.35 18.7167 15.15 18.8L14.75 22H9.25001ZM12.05 15.5C13.0167 15.5 13.8417 15.1583 14.525 14.475C15.2083 13.7917 15.55 12.9667 15.55 12C15.55 11.0333 15.2083 10.2083 14.525 9.525C13.8417 8.84167 13.0167 8.5 12.05 8.5C11.0667 8.5 10.2375 8.84167 9.56251 9.525C8.88751 10.2083 8.55001 11.0333 8.55001 12C8.55001 12.9667 8.88751 13.7917 9.56251 14.475C10.2375 15.1583 11.0667 15.5 12.05 15.5Z" fill="#ffffff"/>
            </svg>
          </button>
        </div>

        {showSettings && (
          <div className="absolute top-16 right-4 w-64 bg-white text-black p-4 rounded-lg shadow-lg z-50">
            <SettingContent />
          </div>
        )}

        {showSearch && (
          <div className="flex mb-4">
            <input
              type="text"
              placeholder="Search..."
              className="p-2 rounded-l-lg border text-white w-full bg-transparent"
            />
            <button className="bg-white text-[#03275f] p-2 rounded-r-lg">
              Search
            </button>
          </div>
        )}

        <div className="grid grid-cols-5 gap-4 mb-6">
          {events.map((event, index) => (
            <div
              key={index}
              className="text-white p-4 rounded-lg text-center mb-5 relative group min-h-[150px] cursor-pointer transition-transform hover:scale-105 shadow-lg"
              style={{ backgroundColor: event.bgColor }}
              onClick={() => handleCardClick(index)}
            >
              <p className="text-md font-bold mb-2">{event.day}</p>
              <Image src={event.icon} alt={event.day} width={100} height={100} className="mx-auto" />
            </div>
          ))}
        </div>

        <div className="bg-[#91a2b7] rounded-lg overflow-hidden">
          <div className="bg-[#2D4778] py-2 flex items-center justify-center gap-4">
            <button onClick={handleCameraClick} className="p-2 hover:bg-[#3D5788] rounded">
              <Image src="/camera.svg" width={30} height={30} alt="camera" />
            </button>
            <button onClick={handleBookClick} className="p-2 hover:bg-[#3D5788] rounded">
              <Image src="/bookopened.svg" width={30} height={30} alt="book opened" />
            </button>
            <p className="text-lg px-3">
              {selectedCard !== null ? events[selectedCard].description : "Light and Sound"}
            </p>
            <button className="p-2 hover:bg-[#3D5788] rounded">
              <Image src="/exam.svg" width={30} height={30} alt="exam" />
            </button>
            <button className="p-2 hover:bg-[#3D5788] rounded">
              <Image src="/cat.svg" width={30} height={30} alt="cat" />
            </button>
          </div>

          <div className="p-4">
            {showVideo && (
              <iframe
                className="w-full rounded-lg"
                height="490"
                src="https://www.youtube.com/embed/NEW3QcXWKEU?si=RiPpAz42l5OUBmlW"
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            )}

            {showPDF && (
              <iframe
                src="/sample.pdf"
                className="w-full rounded-lg"
                height="490"
                title="PDF Document"
              ></iframe>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdaptiveTutoring;
