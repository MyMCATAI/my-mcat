"use client";
import React, { useEffect, useState } from "react";
import SettingContent from "./SettingContent";
import Image from "next/image";
import Quiz from "@/components/quiz";
import { mockMcatQuiz } from "../quiz/quiz";
import ReactPlayer from "react-player";
import prisma from "@/lib/prismadb";
import { getCategories } from "@/lib/category";
import ChatBot from "@/components/chatbot/ChatBot";

interface ContentItem {
  id: string;
  title: string;
  link: string;
  type: string;
}

interface Question {
  id: string;
  questionContent: string;
  questionOptions: string[];
}

interface GetCategoriesParams {
  page?: number;
  pageSize?: number;
}

const AdaptiveTutoring = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [showVideo, setShowVideo] = useState(true);
  const [showPDF, setShowPDF] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [content, setContent] = useState<ContentItem[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [videoUrls, setVideoUrls] = useState<string[]>([]);
  const [currentVideoUrl, setCurrentVideoUrl] = useState(videoUrls[0]);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    fetchContent("atoms");
    fetchQuestions("atoms");
    fetchCategories();
  }, []);

  useEffect(() => {
    const videoContent = content.filter(item => item.type === "video").map(item => item.link);
    setVideoUrls(videoContent);
    if (videoContent.length > 0) {
      setCurrentVideoUrl(videoContent[0]);
    }
  }, [content]);  

  const extractVideoId = (url: string) => {
    const urlParams = new URLSearchParams(new URL(url).search);
    return urlParams.get("v");
  };

  const handleThumbnailClick = (url: string) => {
    setCurrentVideoUrl(url);
    setIsPlaying(true);
  };

  const fetchContent = async (conceptCategory: string) => {
    try {
      const response = await fetch(
        `/api/content?conceptCategory=${conceptCategory.replace(/ /g, "_")}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setContent(data.content);
      console.log("Content:", data.content);
    } catch (error) {
      console.error("Error fetching content:", error);
    }
  };

  const fetchQuestions = async (conceptCategory: string) => {
    console.log("fetchQuestions");

    try {
      const response = await fetch(
        `/api/question?conceptCategory=${conceptCategory.replace(
          / /g,
          "_"
        )}&page=1&pageSize=10`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setQuestions(data.category.questions);
      console.log("Questions:", data.category.questions);
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/category?page=1&pageSize=10');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      console.log("data",data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  interface QuizData {
    questions: {
      question: string;
      options: string[];
      image?: string;
    }[];
    timeLimit: string;
  }

  const typedQuiz = mockMcatQuiz as QuizData;
  const conceptCategories = [
    {
      title: "Atoms",
      icon: "/atomic.svg",
      bgColor: "#b1c03a",
      description: "Exploring the fundamentals of atomic theory.",
    },
    {
      title: "Sensation",
      icon: "/sensation.svg",
      bgColor: "#B925FF",
      description: "Understanding sensory processes.",
    },
    {
      title: "Kinematics",
      icon: "/newton.svg",
      bgColor: "#009918",
      description: "Examining Newton's laws of motion.",
    },
    {
      title: "Respiration and Circulation",
      icon: "/respiration.svg",
      bgColor: "#3294FF",
      description: "Learning about the process of respiration.",
    },
    {
      title: "Bioenergetics and Regulation of Metabolism",
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
    setShowQuiz(false);
  };

  const handleBookClick = () => {
    setShowPDF(true);
    setShowVideo(false);
    setShowQuiz(false);
  };

  const toggleSearch = () => {
    setShowSearch((prev) => !prev);
  };

  const handleCardClick = (index: number) => {
    setSelectedCard(index);
    fetchContent(conceptCategories[index].title);
  };
  const handleQuizTabClick = () => {
    setShowQuiz(true);
    setShowVideo(false);
    setShowPDF(false);
  };

  return (
    <div className="relative p-1">
      <div className="relative z-10 text-white rounded-lg">
        {showSettings && (
          <div className="absolute top-10 right-2 w-100 bg-white text-black p-4 rounded-lg shadow-lg z-50">
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

        <div className="grid grid-cols-12 gap-4 mb-2">
          <div className="col-span-10">
            <div className="grid grid-cols-5 gap-4 mb-2">
              {conceptCategories.map((category, index) => (
                <div
                  key={index}
                  className="text-white p-2 rounded-lg text-center mb-2 relative group min-h-[100px] cursor-pointer transition-transform hover:scale-105 shadow-lg"
                  style={{ backgroundColor: category.bgColor }}
                  onClick={() => handleCardClick(index)}
                >
                  <p className="text-md font-bold mb-2">{category.title}</p>
                  <Image
                    src={category.icon}
                    alt={category.title}
                    width={60}
                    height={60}
                    className="mx-auto"
                  />
                </div>
              ))}
            </div>
          </div>
          {/* <div className="col-span-4">
            <div className="flex flex-col w-full">
              <div className="card bg-[#446695] p-2 rounded-[20px] mb-2">
                <p className="text-white text-center text-sm mb-2">
                  (paste your own content link here)
                </p>
                <input
                  type="text"
                  className="w-full p-2 rounded border border-gray-300 bg-[#D9D9D9] rounded-[30px] text-black"
                />
              </div>
            </div>
          </div> */}
          <div className="col-span-1">
            <div className="flex items-end">
              <button onClick={toggleSearch} className="p-2">
                <svg
                  width="24"
                  height="24"
                  fill="#ffffff"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="m21.75 20.063-5.816-5.818a7.523 7.523 0 0 0 1.44-4.433c0-4.17-3.393-7.562-7.562-7.562-4.17 0-7.562 3.392-7.562 7.562s3.392 7.562 7.562 7.562a7.523 7.523 0 0 0 4.433-1.44l5.818 5.816 1.687-1.688ZM9.812 14.986a5.174 5.174 0 1 1-.002-10.35 5.174 5.174 0 0 1 0 10.349Z"></path>
                </svg>
              </button>
              <button onClick={toggleSettings} className="p-2">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="#ffffff"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9.25001 22L8.85001 18.8C8.63335 18.7167 8.42918 18.6167 8.23751 18.5C8.04585 18.3833 7.85835 18.2583 7.67501 18.125L4.70001 19.375L1.95001 14.625L4.52501 12.675C4.50835 12.5583 4.50001 12.4458 4.50001 12.3375V11.6625C4.50001 11.5542 4.50835 11.4417 4.52501 11.325L1.95001 9.375L4.70001 4.625L7.67501 5.875C7.85835 5.74167 8.05001 5.61667 8.25001 5.5C8.45001 5.38333 8.65001 5.28333 8.85001 5.2L9.25001 2H14.75L15.15 5.2C15.3667 5.28333 15.5708 5.38333 15.7625 5.5C15.9542 5.61667 16.1417 5.74167 16.325 5.875L19.3 4.625L22.05 9.375L19.475 11.325C19.4917 11.4417 19.5 11.5542 19.5 11.6625V12.3375C19.5 12.4458 19.4833 12.5583 19.45 12.675L22.025 14.625L19.275 19.375L16.325 18.125C16.1417 18.2583 15.95 18.3833 15.75 18.5C15.55 18.6167 15.35 18.7167 15.15 18.8L14.75 22H9.25001ZM12.05 15.5C13.0167 15.5 13.8417 15.1583 14.525 14.475C15.2083 13.7917 15.55 12.9667 15.55 12C15.55 11.0333 15.2083 10.2083 14.525 9.525C13.8417 8.84167 13.0167 8.5 12.05 8.5C11.0667 8.5 10.2375 8.84167 9.56251 9.525C8.88751 10.2083 8.55001 11.0333 8.55001 12C8.55001 12.9667 8.88751 13.7917 9.56251 14.475C10.2375 15.1583 11.0667 15.5 12.05 15.5Z"
                    fill="#ffffff"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-10">
            <div className="bg-[#91a2b7] rounded-lg overflow-hidden">
              <div className="bg-[#2D4778] py-2 flex items-center justify-center gap-4 mt-2">
                <button
                  onClick={handleCameraClick}
                  className="p-2 hover:bg-[#3D5788] rounded"
                >
                  <Image
                    src="/camera.svg"
                    width={30}
                    height={30}
                    alt="camera"
                  />
                </button>
                <button
                  onClick={handleBookClick}
                  className="p-2 hover:bg-[#3D5788] rounded"
                >
                  <Image
                    src="/bookopened.svg"
                    width={30}
                    height={30}
                    alt="book opened"
                  />
                </button>
                <p className="text-lg px-3">
                  {selectedCard !== null
                    ? conceptCategories[selectedCard].description
                    : "Light and Sound"}
                </p>
                <button
                  onClick={handleQuizTabClick}
                  className="p-2 hover:bg-[#3D5788] rounded"
                >
                  <Image src="/exam.svg" width={30} height={30} alt="exam" />
                </button>
                <button className="p-2 hover:bg-[#3D5788] rounded">
                  <Image src="/cat.svg" width={30} height={30} alt="cat" />
                </button>
              </div>

              <div className="p-4">
                {showVideo && (
                  <>
                    <ReactPlayer
                      className="w-full h-full"
                      url={currentVideoUrl}
                      playing={isPlaying}
                      muted
                      width="100%"
                      height="330px"
                      onEnded={() => setIsPlaying(false)}
                      controls={true}
                    />
                  </>
                )}

                {showPDF && (
                  <iframe
                    src="/sample.pdf"
                    className="w-full rounded-lg"
                    height="320"
                    title="PDF Document"
                  ></iframe>
                )}
                {showQuiz && <Quiz quiz={typedQuiz} shuffle={true} />}
              </div>
            </div>
          </div>
          <div className="col-span-2">
            <div className=" h-[420px] overflow-auto">
              {showVideo && (
                <>
                  {videoUrls.map((url, index) => {
                    const videoId = extractVideoId(url);
                    return (
                      <div
                        key={index}
                        onClick={() => handleThumbnailClick(url)}
                        className="cursor-pointer "
                      >
                        {videoId && (
                          <Image
                            src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                            alt={`Thumbnail ${index}`}
                            width={140}
                            height={60}
                            className={`relative w-40 h-28 bg-black cursor-pointer rounded-lg mb-2 ${
                              currentVideoUrl === url && isPlaying
                                ? "border-4 border-white"
                                : ""
                            }`}
                          />
                        )}
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* New content list */}
      <div className="mt-4">
        <h3 className="text-xl font-bold mb-2">Related Content</h3>
        <ul className="space-y-2">
          {content.map((item) => (
            <li key={item.id} className="bg-white text-gray-800 p-2 rounded">
              <h4 className="font-semibold">{item.title}</h4>
              <p className="text-sm">Type: {item.type}</p>
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                View Content
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4">
        <h3 className="text-xl font-bold mb-2">Practice Questions</h3>
        <ul className="space-y-2">
          {questions.map((question) => (
            <li
              key={question.id}
              className="bg-white text-gray-800 p-2 rounded"
            >
              <p className="font-semibold">{question.questionContent}</p>
              <ul className="list-disc pl-5 mt-2">
                {question.questionOptions.map((option, index) => (
                  <li key={index}>{option}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AdaptiveTutoring;
