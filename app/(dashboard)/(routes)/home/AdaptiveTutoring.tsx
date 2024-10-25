  "use client";
  import React, { useEffect, useState, useCallback, useRef } from "react";
  import SettingContent from "./SettingContent";
  import Image from "next/image";
  import Quiz, { QuizQuestion } from "@/components/quiz";
  import ReactPlayer from "react-player";
  import { useToast } from "@/components/ui/use-toast";
  import { Category } from "@/types";
  import Icon from "@/components/ui/icon";
  import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
  import { ChevronDown, ChevronUp, Podcast, Music, Headphones } from "lucide-react";
  import ReactMarkdown from 'react-markdown';
import { Skeleton } from "@/components/ui/skeleton";
import { LoadingSkeleton } from "./ATSSkeleton";
import { ThemedSkeleton } from "@/components/ATS/ThemedSkeleton";
import { useTheme } from "@/contexts/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { FaSpotify, FaApple, FaHeadphones } from 'react-icons/fa';
  interface ContentItem {
    id: string;
    title: string;
    link: string;
    type: string;
    transcript?: string;
    summary?: string; 
  }

  interface AdaptiveTutoringProps {
    toggleChatBot: () => void;
    setChatbotContext: (context: { contentTitle: string; context: string }) => void;
  }

  const AdaptiveTutoring: React.FC<AdaptiveTutoringProps> = ({
    toggleChatBot,
    setChatbotContext,
  }) => {
    const [isSummaryOpen, setIsSummaryOpen] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [contentType, setContentType] = useState("video");
    const [showSearch, setShowSearch] = useState(false);
    const [showLink, setShowLink] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const [selectedCard, setSelectedCard] = useState<number | null>(null);
    const [content, setContent] = useState<ContentItem[]>([]);
    const [currentContentId, setCurrentContentId] = useState<string | null>(null);

    const [questions, setQuestions] = useState<QuizQuestion[]>([]);

    const [isPlaying, setIsPlaying] = useState(false);
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);

    const { toast } = useToast();

    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const { theme } = useTheme();
    const [showPodcast, setShowPodcast] = useState(false);
    const [podcastPosition, setPodcastPosition] = useState({ top: 0, left: 0 });
    const podcastButtonRef = useRef<HTMLButtonElement>(null);
    const [isPodcastHovered, setIsPodcastHovered] = useState(false);

    // Fetch categories and set initial category
    useEffect(() => {
      const fetchInitialData = async () => {
        try {
          const categoriesData = await fetchCategories(true);
          setCategories(categoriesData);
          if (categoriesData.length > 0) {
            const initialCategory = categoriesData[0].conceptCategory;
            setSelectedCategory(initialCategory);
            await fetchContentAndQuestions(initialCategory);
          }
        } catch (error) {
          console.error("Error fetching initial data:", error);
        }
      };

      fetchInitialData();
    }, []);

    useEffect(() => {
      const currentContent = content.find((item) => item.id === currentContentId);
      if (currentContent && currentContent.type === "video") {
        setIsPlaying(true);
      } else {
        setIsPlaying(false);
      }
    }, [currentContentId, content]);


    
  // Update chatbot context when current content changes
  useEffect(() => {
    const currentContent = content.find((item) => item.id === currentContentId);
    if (currentContent && currentContent.transcript) {
      setChatbotContext({
        contentTitle: currentContent.title || "Untitled",
        context: `Here's a transcript of the content that I'm currently looking at: ${currentContent.transcript} Only refer to this if I ask a question directly about what I'm studying`,
      });
    }
  }, [currentContentId, content, setChatbotContext]);

  const updateContentVisibility = useCallback((fetchedContent: ContentItem[]) => {
    const hasVideos = fetchedContent.some((item) => item.type === "video");
    const hasReadings = fetchedContent.some((item) => item.type === "reading");

    if (hasVideos) {
      setContentType("video");
    } else if (hasReadings) {
      setContentType("reading");
    } else {
      setContentType("quiz");
    }

    if (hasVideos) {
      const firstVideo = fetchedContent.find((item) => item.type === "video");
      if (firstVideo) {
        setCurrentContentId(firstVideo.id);
      }
    } else if (hasReadings) {
      const firstReading = fetchedContent.find((item) => item.type === "reading");
      if (firstReading) {
        setCurrentContentId(firstReading.id);
      }
    } else {
      setCurrentContentId(null);
    }
  }, []);


    const extractVideoId = (url: string) => {
      const urlParams = new URLSearchParams(new URL(url).search);
      return urlParams.get("v");
    };

    const handleContentClick = (contentId: string) => {

      setCurrentContentId(contentId);
      const clickedContent = content.find((item) => item.id === contentId);
      if (clickedContent) {
        setContentType(clickedContent.type)
        
        if (clickedContent.type === "video") {
          setIsPlaying(true);
        }

        if (clickedContent.transcript) {
          setTimeout(() => {
              toggleChatBot();
          }, 10000);
      }      
        setChatbotContext({
          contentTitle: clickedContent.title,
          context: clickedContent.transcript
            ? "Here's a transcript of the content that I'm currently looking at: " +
              clickedContent.transcript +
              " Only refer to this if I ask a question directly about what I'm studying"
            : ""
        });
        
      }
    };

    const handleChatClick = () => {
      toggleChatBot();
    };

    const fetchContent = useCallback(async (conceptCategory: string) => {
      try {
        const response = await fetch(
          `/api/content?conceptCategory=${conceptCategory.replace(/ /g, "_")}`
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        return data.content;
      } catch (error) {
        console.error("Error fetching content:", error);
        return [];
      }
    }, []);
  
    const fetchQuestions = useCallback(async (conceptCategory: string) => {
      try {
        const response = await fetch(
          `/api/question?conceptCategory=${conceptCategory.replace(/ /g, "_")}&page=1&pageSize=10`
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        return data.category.questions;
      } catch (error) {
        console.error("Error fetching questions:", error);
        return [];
      }
    }, []);
  
    const fetchContentAndQuestions = useCallback(async (category: string) => {
      setIsLoading(true)
      try {
        const [contentData, questionsData] = await Promise.all([
          fetchContent(category),
          fetchQuestions(category),
        ]);
        setContent(contentData);
        setQuestions(questionsData);
        updateContentVisibility(contentData);
      } catch (error) {
        console.error("Error fetching content and questions:", error);
      } finally{
        setIsLoading(false)
      }
    }, [fetchContent, fetchQuestions]);
  
  // Fetch content and questions when selected category changes
  useEffect(() => {
    if (selectedCategory) {
      fetchContentAndQuestions(selectedCategory);
    }
  }, [selectedCategory, fetchContentAndQuestions]);

  // Update current content when content changes
  useEffect(() => {
    if (content.length > 0) {
      const firstItem = content.find(
        (item) => item.type === "video" || item.type === "reading"
      );
      if (firstItem) {
        setCurrentContentId(firstItem.id);
        setContentType(firstItem.type);
      }
    }
  }, [content]);

    const fetchCategories = useCallback(async (useKnowledgeProfiles: boolean = false) => {
      try {
        setIsLoading(true)
        const url = new URL("/api/category", window.location.origin);
        url.searchParams.append("page", "1");
        url.searchParams.append("pageSize", "7");
        if (useKnowledgeProfiles) {
          url.searchParams.append("useKnowledgeProfiles", "true");
        }
  
        const response = await fetch(url.toString());
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        return data.items;
      } catch (error) {
        console.error("Error fetching categories:", error);
        return [];
      }finally{
        setIsLoading(false)
      }
    }, []);
  
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
    
    const toggleLink = () => {
      setShowLink((prev) => !prev);
    };

    const handleCameraClick = () => {
      setContentType("video")
      
      const firstVideo = content.find((item) => item.type === "video");
      if (firstVideo) {
        setCurrentContentId(firstVideo.id);
        setIsPlaying(true);
      }
    };

    const handleBookClick = () => {
      setContentType("reading")

      const firstPDF = content.find((item) => item.type === "reading");
      if (firstPDF) {
        setCurrentContentId(firstPDF.id);
      }
    };

    const handleQuizTabClick = () => {
      setContentType("quiz")
      setCurrentContentId(null);
    };

    const toggleSearch = () => {
      setShowSearch((prev) => !prev);
    };

    const handleCardClick = (index: number) => {
      setSelectedCard(index);
      setSelectedCategory(categories[index].conceptCategory);
      fetchContent(categories[index].conceptCategory);
      fetchQuestions(categories[index].conceptCategory);
    };

    const currentContent = content.find((item) => item.id === currentContentId);

    const formatSummary = (summary: string) => {
      return summary
        .replace(/^(\w+.*?):/gm, '\n\n## $1\n\n')  // Use ## for main headers
        .replace(/^•\s*/gm, '\n- ')  // Replace bullet points with markdown list items
        .trim();  // Remove any leading/trailing whitespace
    };
    
    const updatePodcastPosition = useCallback(() => {
      if (podcastButtonRef.current) {
        const rect = podcastButtonRef.current.getBoundingClientRect();
        const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
        setPodcastPosition({
          top: rect.top / rootFontSize,
          left: rect.left / rootFontSize,
        });
      }
    }, []);

    useEffect(() => {
      updatePodcastPosition();
      window.addEventListener('resize', updatePodcastPosition);
      return () => window.removeEventListener('resize', updatePodcastPosition);
    }, [updatePodcastPosition]);

    useEffect(() => {
      let timeoutId: NodeJS.Timeout;
      if (isPodcastHovered) {
        setShowPodcast(true);
      } else {
        timeoutId = setTimeout(() => {
          setShowPodcast(false);
        }, 50);
      }

      return () => {
        if (timeoutId) clearTimeout(timeoutId);
      };
    }, [isPodcastHovered]);

    const handlePodcastMouseEnter = () => {
      setIsPodcastHovered(true);
      updatePodcastPosition();
    };

    const handlePodcastMouseLeave = () => {
      setIsPodcastHovered(false);
    };

    return (
      <div className="relative p-2 h-full flex flex-col overflow-hidden">
        <div className="relative z-10 text-[--theme-text-color] rounded-lg">
          {showSettings && (
            <div className="absolute top-10 right-2 w-200 bg-white text-black p-4 rounded-lg shadow-lg z-50">
              <SettingContent onShowDiagnosticTest={()=>console.log("todo, implement this")} />
            </div>
          )}
        </div>
        <div className="flex items-stretch w-full mb-3">
          <div className="flex-grow mr-2.5 ml-2">
            <div className="grid grid-cols-7 gap-3">
            {isLoading
              ? (['cat', 'medicine', 'study', 'vaccine', 'science', 'education', 'genetics'] as const).map((theme, index) => (
                <ThemedSkeleton key={index} theme={theme} />
              ))
              : categories?.slice(0, 7).map((category, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-lg text-center mb-2 relative group min-h-[6.25rem] cursor-pointer transition-all flex flex-col justify-between items-center"
                  style={{ 
                    backgroundColor: 'var(--theme-adaptive-tutoring-color)',
                    boxShadow: 'var(--theme-adaptive-tutoring-boxShadow)',
                    transition: 'box-shadow 0.3s ease-in-out, transform 0.3s ease-in-out'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = 'var(--theme-adaptive-tutoring-boxShadow-hover)';
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'var(--theme-adaptive-tutoring-boxShadow)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                  onClick={() => handleCardClick(index)}
                >
                  <div className="relative w-full h-full flex flex-col justify-center items-center">
                    <div className="opacity-0 group-hover:opacity-100 absolute inset-0 gb-black bg-opacity-50 flex items-end transition-opacity duration-300">
                      <p className="text-[--theme-text-color] text-xs p-1 mt-2 truncate w-full">
                        {category?.conceptCategory || "No title"}
                      </p>
                    </div>
                    <div className="m-auto transform scale-90">
                      <Icon 
                        name={category.icon} 
                        className="w-6 h-6" 
                        color={category.color}
                      />
                    </div>
                  </div>
                </div>
              ))
            }
            </div>
          </div>
          <div className="col-span-1">
            <div className="grid grid-cols-1 gap-2 mb-4 ml-10">
              <button onClick={toggleSettings} className="p-2 hover:bg-[#3D6788] rounded">
                <svg width="20" height="20" viewBox="0 0 22 22" fill="#ffffff" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.25001 22L8.85001 18.8C8.63335 18.7167 8.42918 18.6167 8.23751 18.5C8.04585 18.3833 7.85835 18.2583 7.67501 18.125L4.70001 19.375L1.95001 14.625L4.52501 12.675C4.50835 12.5583 4.50001 12.4458 4.50001 12.3375V11.6625C4.50001 11.5542 4.50835 11.4417 4.52501 11.325L1.95001 9.375L4.70001 4.625L7.67501 5.875C7.85835 5.74167 8.05001 5.61667 8.25001 5.5C8.45001 5.38333 8.65001 5.28333 8.85001 5.2L9.25001 2H14.75L15.15 5.2C15.3667 5.28333 15.5708 5.38333 15.7625 5.5C15.9542 5.6167 16.1417 5.74167 16.325 5.875L19.3 4.625L22.05 9.375L19.475 11.325C19.4917 11.4417 19.5 11.5542 19.5 11.6625V12.3375C19.5 12.4458 19.4833 12.5583 19.45 12.675L22.025 14.625L19.275 19.375L16.325 18.125C16.1417 18.2583 15.95 18.3833 15.75 18.5C15.55 18.6167 15.35 18.7167 15.15 18.8L14.75 22H9.25001ZM12.05 15.5C13.0167 15.5 13.8417 15.1583 14.525 14.475C15.2083 13.7917 15.55 12.9667 15.55 12C15.55 11.0333 15.2083 10.2083 14.525 9.525C13.8417 8.84167 13.0167 8.5 12.05 8.5C11.0667 8.5 10.2375 8.84167 9.56251 9.525C8.88751 10.2083 8.55001 11.0333 8.55001 12C8.55001 12.9667 8.88751 13.7917 9.56251 14.475C10.2375 15.1583 11.0667 15.5 12.05 15.5Z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-12 text-[--theme-text-color] gap-3 px-2 flex-grow overflow-visible">
          <div className="col-span-11 h-full overflow-visible">
            <div 
              className="bg-[--theme-adaptive-tutoring-color] rounded-lg px-4 h-full flex flex-col overflow-visible"
              style={{ 
                boxShadow: 'var(--theme-adaptive-tutoring-boxShadow)',
              }}
            >
              <div className="py-2 flex items-center justify-center gap-4 mt-2 ml-2 mr-2">
                <button
                  onClick={handleCameraClick}
                  className="p-2 hover:bg-[--theme-hover-color] rounded transition-colors duration-200"
                >
                  <div className="w-6 h-6 relative theme-box">
                    <Image
                      src="/camera.svg"
                      layout="fill"
                      objectFit="contain"
                      alt="camera"
                      className="theme-svg"
                    />
                  </div>
                </button>
                <button
                  onClick={handleBookClick}
                  className="p-2 hover:bg-[--theme-hover-color] rounded transition-colors duration-200"
                >
                  <div className="w-6 h-6 relative theme-box">
                    <Image
                      src="/bookopened.svg"
                      layout="fill"
                      objectFit="contain"
                      alt="book opened"
                      className="theme-svg"
                    />
                  </div>
                </button>
                <p className="text-m px-10">
                  {selectedCategory || ""}
                </p>
                <button
                  onClick={handleQuizTabClick}
                  className="p-2 hover:bg-[--theme-hover-color] rounded transition-colors duration-200"
                >
                  <div className="w-7 h-7 relative theme-box">
                    <Image
                      src="/exam.svg"
                      layout="fill"
                      objectFit="contain"
                      alt="exam"
                      className="theme-svg"
                    />
                  </div>
                </button>
                <button
                  onClick={handleChatClick}
                  className="p-2 hover:bg-[--theme-hover-color] rounded transition-colors duration-200"
                >
                  <div className="w-7 h-7 relative theme-box">
                    <Image
                      src="/cat.svg"
                      layout="fill"
                      objectFit="contain"
                      alt="cat"
                      className="theme-svg"
                    />
                  </div>
                </button>
              </div>

              <div className="p-2 flex-grow overflow-y-auto scrollbar-hide">
                {isLoading ? (
                  <LoadingSkeleton />
                ) : (
                  <>
                    {contentType ==="video" &&
                    currentContent &&
                    currentContent.type === "video" && (
                      <div className="h-[calc(100vh-23rem)]">
                        <ReactPlayer
                          className="w-full h-full"
                          url={currentContent.link}
                          playing={isPlaying}
                          muted
                          width="100%"
                          height="100%"
                          onEnded={() => setIsPlaying(false)}
                          controls={true}
                        />
                        <Collapsible className="mt-4" open={isSummaryOpen}> 
                          <CollapsibleTrigger
                            className="flex items-center text-sm text-blue-400 cursor-pointer"
                            onClick={() => setIsSummaryOpen(!isSummaryOpen)}
                          >
                            {isSummaryOpen ? (
                              <>
                                <ChevronUp className="w-4 h-4 ml-0 xl:ml-0 lg:ml-4 md:ml-4 mr-1" />
                                Hide Summary
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-4 h-4 ml-0 xl:ml-0 lg:ml-4 md:ml-4 mr-1" />
                                Show Summary
                              </>
                            )}
                          </CollapsibleTrigger>
                          <CollapsibleContent className="text-sm text-[--theme-text-color] mt-2 pl-2 border-l border-gray-700">
                            {currentContent && currentContent.summary ? (
                              <div className="summary-content">
                                <ReactMarkdown className="markdown-content">
                                  {formatSummary(currentContent.summary)}
                                </ReactMarkdown>
                              </div>
                            ) : (
                              "No summary available."
                            )}
                          </CollapsibleContent>
                        </Collapsible>
                      </div>
                    )}

                  {contentType === "reading" &&
                    currentContent &&
                    currentContent.type === "reading" && (
                      <>
                        <div className="h-full flex flex-col">
                          <iframe
                            src={currentContent.link.replace("/view", "/preview")}
                            className="w-full rounded-lg"
                            style={{ height: 'calc(100vh - 5rem)' }}
                            title={currentContent.title}
                          ></iframe>
                          <Collapsible className="mt-4">
                            <CollapsibleTrigger
                              className="flex items-center text-sm text-blue-400 cursor-pointer"
                              onClick={() => setIsSummaryOpen(!isSummaryOpen)}
                            >
                              {isSummaryOpen ? (
                                <>
                                  <ChevronUp className="w-4 h-4 mr-1" />
                                  Show Summary
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="w-4 h-4 mr-1" />
                                  Hide Summary
                                </>
                              )}
                            </CollapsibleTrigger>
                            <CollapsibleContent className="text-sm text-gray-300 mt-2 pl-2 border-l border-gray-700">
                              {currentContent && currentContent.summary ? (
                                <ReactMarkdown className="markdown-content">
                                  {formatSummary(currentContent.summary)}
                                </ReactMarkdown>
                              ) : (
                                "No summary available."
                              )}
                            </CollapsibleContent>
                          </Collapsible>
                        </div>
                      </>
                    )}

                  {contentType ==="quiz" && <Quiz questions={questions} shuffle={true} />}

                  </>
                )}
              </div>
            </div>
          </div>

          <div className="col-span-1">
            <div className="h-[calc(100vh-16rem)] overflow-auto">
              {isLoading ? (
                Array(5).fill(0).map((_, index) => (
                  <Skeleton key={index} className="h-[90px] w-full rounded-lg mb-2" />
                ))
              ) : (
                <>
                  {contentType === "video" && (
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
                                    width={140}
                                    height={90}
                                    className={`relative w-30 h-18 bg-black cursor-pointer rounded-lg ${
                                      currentContentId === video.id && isPlaying
                                        ? "border-4 border-white"
                                        : ""
                                    }`}
                                  />
                                  <p className="text-xs mt-1 text-[--theme-text-color] truncate">
                                    {video.title}
                                  </p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </>
                  )}
                  {contentType === "reading" && (
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
                  <div className="relative">
                    <button 
                      ref={podcastButtonRef}
                      className={`w-full h-[3.5rem] rounded-lg mt-2 flex items-center justify-center cursor-pointer relative z-50 transition-colors duration-300 ${
                        isPodcastHovered ? 'bg-[--theme-hover-color]' : 'bg-[--theme-adaptive-tutoring-color]'
                      }`}
                      onMouseEnter={handlePodcastMouseEnter}
                      onMouseLeave={handlePodcastMouseLeave}
                    >
                      <Podcast className={`w-8 h-8 transition-colors duration-300 ${
                        isPodcastHovered ? 'text-[--theme-hover-text]' : 'text-[--theme-text-color]'
                      }`} />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        
        {createPortal(
          <AnimatePresence>
            {showPodcast && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="fixed w-56 rounded-lg p-3 shadow-lg z-[9999] bg-[--theme-hover-color]"
                style={{
                  top: `${podcastPosition.top}rem`,
                  left: `${podcastPosition.left - 15}rem`,
                }}
                onMouseEnter={() => setIsPodcastHovered(true)}
                onMouseLeave={() => setIsPodcastHovered(false)}
              >
                {[
                  { icon: FaSpotify, text: "Listen on Spotify", link: "https://open.spotify.com/show/yourmcatpodcast" },
                  { icon: FaApple, text: "Listen on Apple", link: "https://podcasts.apple.com/us/podcast/yourmcatpodcast" },
                  { icon: FaHeadphones, text: "Listen on MyMCAT", link: "/podcast/mymcat" }
                ].map((option, index) => (
                  <a 
                    key={index}
                    href={option.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 w-full p-2 rounded transition-all duration-300 text-[--theme-hover-text] hover:bg-[rgba(255,255,255,0.1)]"
                  >
                    <option.icon className="w-5 h-5" />
                    <span className="text-sm">{option.text}</span>
                  </a>
                ))}
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
      </div>
    );
  };

  export default AdaptiveTutoring;

