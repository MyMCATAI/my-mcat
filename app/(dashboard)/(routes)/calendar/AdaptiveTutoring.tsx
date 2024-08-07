"use client";
import React, { useEffect, useState, useCallback } from "react";
import SettingContent from "./SettingContent";
import Image from "next/image";
import Quiz, { QuizQuestion } from "@/components/quiz";
import ReactPlayer from "react-player";
import { useToast } from "@/components/ui/use-toast";
import { Category } from "@/types";
import Icon from "@/components/ui/icon";
import image from "@/public/atomic.png";

interface ContentItem {
  id: string;
  title: string;
  link: string;
  type: string;
  transcript?: string;
}

//todo move this to index
interface AdaptiveTutoringProps {
  toggleChatBot: () => void;
  setChatbotContext: (context: string) => void;
}

const AdaptiveTutoring: React.FC<AdaptiveTutoringProps> = ({
  toggleChatBot,
  setChatbotContext,
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [showVideo, setShowVideo] = useState(true);
  const [showPDF, setShowPDF] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [content, setContent] = useState<ContentItem[]>([]);
  const [currentContentId, setCurrentContentId] = useState<string | null>(null);

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const { toast } = useToast();

  const fetchContent = useCallback(async (conceptCategory: string) => {
    try {
      const response = await fetch(
        `/api/content?conceptCategory=${conceptCategory.replace(/ /g, "_")}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setContent(data.content);
      updateContentVisibility(data.content);
    } catch (error) {
      console.error("Error fetching content:", error);
    }
  }, []);

  useEffect(() => {
    fetchContent("atoms");
    fetchQuestions("atoms");
    fetchCategories(true);
  }, [fetchContent]);

  useEffect(() => {
    if (content.length > 0) {
      const firstItem = content.find(
        (item) => item.type === "video" || item.type === "reading"
      );
      if (firstItem) {
        setCurrentContentId(firstItem.id);
      }
    }
  }, [content]);

  const extractVideoId = (url: string) => {
    const urlParams = new URLSearchParams(new URL(url).search);
    return urlParams.get("v");
  };

  const handleContentClick = (contentId: string) => {
    setCurrentContentId(contentId);
    const clickedContent = content.find((item) => item.id === contentId);
    if (clickedContent) {
      if (clickedContent.type === "video") {
        setShowVideo(true);
        setShowPDF(false);
        setIsPlaying(true);
      } else if (clickedContent.type === "reading") {
        setShowPDF(true);
        setShowVideo(false);
      }

      console.log(clickedContent.transcript);
      setChatbotContext(
        clickedContent.transcript
          ? "Here's a transcript of the content that I'm currently looking at: " +
              clickedContent.transcript +
              " Only refer to this if I ask a question directly about what I'm studying"
          : ""
      );
    }
  };

  const handleChatClick = () => {
    toggleChatBot();
  };

  const fetchQuestions = async (conceptCategory: string) => {
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
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  };

  const fetchCategories = async (useKnowledgeProfiles: boolean = false) => {
    try {
      const url = new URL("/api/category", window.location.origin);
      url.searchParams.append("page", "1");
      url.searchParams.append("pageSize", "5");
      if (useKnowledgeProfiles) {
        url.searchParams.append("useKnowledgeProfiles", "true");
      }

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

  const handleUpdateKnowledgeProfile = async () => {
    setIsUpdatingProfile(true);
    try {
      const response = await fetch("/api/knowledge-profile/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to update knowledge profile");
      }

      toast({
        title: "Success",
        description: "Knowledge profile updated successfully!",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error updating knowledge profile:", error);
      toast({
        title: "Error",
        description: "Failed to update knowledge profile. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const toggleSettings = () => {
    setShowSettings((prev) => !prev);
  };

  const handleCameraClick = () => {
    setShowVideo(true);
    setShowPDF(false);
    setShowQuiz(false);

    const firstVideo = content.find((item) => item.type === "video");
    if (firstVideo) {
      setCurrentContentId(firstVideo.id);
      setIsPlaying(true);
    }
  };

  const handleBookClick = () => {
    setShowPDF(true);
    setShowVideo(false);
    setShowQuiz(false);

    const firstPDF = content.find((item) => item.type === "reading");
    if (firstPDF) {
      setCurrentContentId(firstPDF.id);
    }
  };

  const handleQuizTabClick = () => {
    setShowQuiz(true);
    setShowVideo(false);
    setShowPDF(false);
    setCurrentContentId(null);
  };

  const toggleSearch = () => {
    setShowSearch((prev) => !prev);
  };

  const handleCardClick = (index: number) => {
    setSelectedCard(index);
    fetchContent(categories[index].conceptCategory);
    fetchQuestions(categories[index].conceptCategory);
  };

  const updateContentVisibility = (fetchedContent: ContentItem[]) => {
    const hasVideos = fetchedContent.some((item) => item.type === "video");
    const hasReadings = fetchedContent.some((item) => item.type === "reading");

    setShowVideo(hasVideos);
    setShowPDF(hasReadings && !hasVideos);
    setShowQuiz(!hasVideos && !hasReadings);

    if (hasVideos) {
      const firstVideo = fetchedContent.find((item) => item.type === "video");
      if (firstVideo) {
        setCurrentContentId(firstVideo.id);
      }
    } else if (hasReadings) {
      const firstReading = fetchedContent.find(
        (item) => item.type === "reading"
      );
      if (firstReading) {
        setCurrentContentId(firstReading.id);
      }
    } else {
      setCurrentContentId(null);
    }
  };

  const currentContent = content.find((item) => item.id === currentContentId);

  return (
    <div className="relative p-1">
      <div className="relative z-10 text-white rounded-lg">
        {showSettings && (
          <div className="absolute top-10 right-2 w-200 bg-white text-black p-4 rounded-lg shadow-lg z-50">
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
        <div className="flex items-stretch w-full mb-2">
          <div className="flex-grow mr-5">
            <div className="grid grid-cols-7 gap-3">
              {categories.slice(0, 5).map((category, index) => (
                <div
                  key={index}
                  className="text-white overflow-hidden rounded-lg text-center mb-2 relative group min-h-[80px] cursor-pointer transition-all hover:scale-105 hover:shadow-xl flex flex-col justify-between items-center"
                  style={{ backgroundColor: '#001226' }}
                  onClick={() => handleCardClick(index)}
                >
                  <div className="relative w-full h-full flex flex-col justify-center items-center">
                    <div className="opacity-0 group-hover:opacity-100 absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center transition-opacity duration-300">
                      <p className="text-white text-sm" style={{ fontSize: '0.70rem'}}>
                        {category?.conceptCategory || "No title"}
                      </p>
                    </div>
                    <div className="m-auto" style={{ color: 'white'}}>
                      <Icon name={category.icon} className="w-10 h-10" />
                    </div>
                  </div>
                </div>
              ))}
              <div className="col-span-2">
                <div className="flex flex-col w-full">
                    <div className="card bg-[#042b61] p-3 rounded-[0px] mb-2">
                      <p className="text-white text-center text-sm [] mb-2"style={{fontSize: '0.70rem'}}>
                      </p>
                      <input
                        type="text"
                        className="w-full p-1 rounded border border-gray-300 bg-[#294773] rounded-[5px] text-[#808080]"
                        defaultValue="link new content"                    
                     />
                    </div>
                </div>
              </div>
            </div>
          </div>
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
              <button
                onClick={handleUpdateKnowledgeProfile}
                className={`p-2 mr-2 ${
                  isUpdatingProfile ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={isUpdatingProfile}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="#ffffff"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-12h2v4h4v2h-4v4h-2v-4H7v-2h4V8z" />
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
          <div className="col-span-11">
            <div className="bg-[#001226] rounded-lg overflow-hidden">
              <div className="bg-[#001226] py-1 flex items-center justify-center gap-4 mt-2">
                <button
                  onClick={handleCameraClick}
                  className="p-2 hover:bg-[#3D5788] rounded"
                >
                  <Image
                    src="/camera.svg"
                    width={24}
                    height={24}
                    alt="camera"
                  />
                </button>
                <button
                  onClick={handleBookClick}
                  className="p-2 hover:bg-[#3D5788] rounded"
                >
                  <Image
                    src="/bookopened.svg"
                    width={24}
                    height={24}
                    alt="book opened"
                  />
                </button>
                <p className="text-m px-10">
                  {selectedCard !== null
                    ? categories[selectedCard].conceptCategory
                    : "atoms"}
                </p>
                <button
                  onClick={handleQuizTabClick}
                  className="p-2 hover:bg-[#3D5788] rounded"
                >
                  <Image src="/exam.svg" width={30} height={30} alt="exam" />
                </button>
                <button
                  onClick={handleChatClick}
                  className="p-2 hover:bg-[#3D5788] rounded"
                >
                  <Image src="/cat.svg" width={30} height={30} alt="cat" />
                </button>
              </div>

              <div className="p-4">
                {showVideo &&
                  currentContent &&
                  currentContent.type === "video" && (
                    <ReactPlayer
                      className="w-full h-full"
                      url={currentContent.link}
                      playing={isPlaying}
                      muted
                      width="100%"
                      height="430px"
                      onEnded={() => setIsPlaying(false)}
                      controls={true}
                    />
                  )}

                {showPDF &&
                  currentContent &&
                  currentContent.type === "reading" && (
                    <iframe
                      src={currentContent.link.replace("/view", "/preview")}
                      className="w-full rounded-lg"
                      height="430"
                      title={currentContent.title}
                    ></iframe>
                  )}

                {showQuiz && <Quiz questions={questions} shuffle={true} />}
              </div>
            </div>
          </div>

          <div className="col-span-1 ">
            <div className=" h-[520px] overflow-auto">
              {showVideo && (
                <>
                  {content
                    .filter((item) => item.type === "video")
                    .map((video, index) => {
                      const videoId = extractVideoId(video.link);
                      return (
                        <div
                          key={index}
                          onClick={() => handleContentClick(video.id)}
                          className="cursor-pointer mb-2"
                        >
                          {videoId && (
                            <div>
                              <Image
                                src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                                alt={`Thumbnail ${index}`}
                                width={100}
                                height={90}
                                className={`relative w-30 h-18 bg-black cursor-pointer rounded-lg ${
                                  currentContentId === video.id && isPlaying
                                    ? "border-4 border-white"
                                    : ""
                                }`}
                              />
                              <p className="text-xs mt-1 text-white truncate">
                                {video.title}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </>
              )}
              {showPDF && (
                <div className="flex flex-wrap gap-4">
                  {content
                    .filter((item) => item.type === "reading")
                    .map((pdf, index) => (
                      <div
                        key={index}
                        onClick={() => handleContentClick(pdf.id)}
                        className={`cursor-pointer w-40 h-28 flex items-center justify-center bg-[#001226] rounded-lg overflow-hidden ${
                          currentContentId === pdf.id
                            ? "border-4 border-blue-500"
                            : ""
                        }`}
                      >
                        <div className="text-center p-2">
                          <svg
                            className="w-4 h-4 mx-auto mb-1 text-black"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                            />
                          </svg>
                          <p className="text-xs font-medium text-white">
                            {pdf.title}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdaptiveTutoring;
