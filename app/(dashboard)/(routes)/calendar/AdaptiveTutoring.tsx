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

  const event = [
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
    <>

        
        <div className=" text-white  rounded-lg">
          <div className="flex justify-end gap-2">
           
            <div className="text-end mb-3">
              <button onClick={toggleSearch} className="ms-auto">
                <Image
                  src={"/search.svg"}
                  alt="search icon"
                  width={24}
                  height={24}
                />
              </button>
            </div>
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
          <div className="mb-2">
              {showSearch && (
                <div className="flex mt-2 w-100">
                  <input
                    type="text"
                    placeholder="Search..."
                    className="p-1 rounded-l-lg border text-white w-full bg-transparent"
                  />
                  <button className="bg-[#ffffff] text-[#03275f] p-2 rounded-r-lg ">
                    Search
                  </button>
                </div>
              )}
            </div>

          <div className="grid grid-cols-5 gap-4 ">
            {event.map((event, index) => (
              <div
                className={` text-white p-4 rounded-[10px] text-center mb-5 relative group min-h-[150px] cursor-pointer`}
                style={{
                  boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px",
                  backgroundColor: event.bgColor,
                }}
                key={index}
                onClick={() => handleCardClick(index)}
              >
                <p className="text-md text-white">{event.day}</p>
                <div className="flex justify-center mt-2">
                  <Image
                    src={event.icon}
                    alt="icons"
                    width={100}
                    height={100}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="bg-[#91a2b7] h-[600px] rounded-[10px] pt-5 overflow-hidden">
            <div className="bg-[#2D4778] min-h-[30px] py-2 text-center flex gap-4 justify-center">
              <button onClick={handleCameraClick}>
                <Image
                  src={"/camera.svg"}
                  width={40}
                  height={40}
                  alt="camera"
                  className="mx-2"
                />
              </button>
              <button onClick={handleBookClick}>
                <Image
                  src={"/bookopened.svg"}
                  width={40}
                  height={40}
                  alt="book opened"
                />
              </button>
              <p className="text-lg mt-1 px-3">
                {selectedCard !== null
                  ? event[selectedCard].description
                  : "light and sound"}
              </p>
              <button>
                <Image src={"/exam.svg"} width={40} height={40} alt="exam"/>
              </button>
              <button>
                <Image src={"/cat.svg"} width={40} height={40} alt="cat" />
              </button>
            </div>

            <div className="p-4">
              {showVideo && (
                <iframe
                  className="w-full  rounded-[10px]"
                  style={{ height: "490px" }}
                  src="https://www.youtube.com/embed/NEW3QcXWKEU?si=RiPpAz42l5OUBmlW"
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                ></iframe>
              )}

              {showPDF && (
                <div className="pdf-container">
                  <iframe
                    src="/sample.pdf"
                    width="100%"
                    height="490px"
                  ></iframe>
                </div>
              )}
            </div>
          </div>
        </div>

    </>
  );
};

export default AdaptiveTutoring;
