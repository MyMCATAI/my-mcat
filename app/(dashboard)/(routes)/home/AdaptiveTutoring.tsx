  "use client";
  import React, { useEffect, useState, useCallback } from "react";
  import SettingContent from "./SettingContent";
  import Image from "next/image";
  import Quiz, { QuizQuestion } from "@/components/quiz";
  import ReactPlayer from "react-player";
  import { useToast } from "@/components/ui/use-toast";
  import { Category } from "@/types";
  import Icon from "@/components/ui/icon";
  import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
  import { ChevronDown, ChevronUp } from "lucide-react";
  import ReactMarkdown from 'react-markdown';
import { Skeleton } from "@/components/ui/skeleton";
import { LoadingSkeleton } from "./ATSSkeleton";
import { ThemedSkeleton } from "@/components/ATS/ThemedSkeleton";

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
    
    return (
      <div className="relative p-2 h-full flex flex-col">
        <div className="relative z-10 text-white rounded-lg">
          {showSettings && (
            <div className="absolute top-10 right-2 w-200 bg-white text-black p-4 rounded-lg shadow-lg z-50">
              <SettingContent onShowDiagnosticTest={()=>console.log("todo, implement this")} />
            </div>
          )}
          {showSearch && (
            <div className="flex mb-4">
              <input
                type="text"
                placeholder="Enter a category..."
                className="p-2 rounded-l-lg border text-white w-full bg-transparent"
              />
              <button className="bg-white text-[#03275f] p-2 rounded-r-lg">
                Search
              </button>
            </div>
          )}
          {showLink && (
            <div className="flex mb-4">
              <div className="w-full">
                <p className="text-white text-center text-sm" style={{fontSize: '0.70rem'}}>
                </p>
                <input
                  type="text"
                  placeholder="Enter link for custom content to generate flashcards & practice questions..."
                  className="p-2 rounded-l-lg border text-white w-full bg-transparent"
                />
              </div>
              <button className="bg-white text-[#03275f] p-2 rounded-r-lg">
                Generate
              </button>
            </div>
          )}
        </div>
        <div className="flex items-stretch w-full mb-3">
          <div className="flex-grow mr-4">
            <div className="grid grid-cols-7 gap-3">
            {isLoading
              ? (['cat', 'medicine', 'study', 'vaccine', 'science', 'education', 'genetics'] as const).map((theme, index) => (
                <ThemedSkeleton key={index} theme={theme} />
              ))
              : categories?.slice(0, 7).map((category, index) => (
                <div
                  key={index}
                  className="text-white overflow-hidden rounded-lg text-center mb-2 relative group min-h-[100px] cursor-pointer transition-all hover:scale-105 hover:shadow-xl flex flex-col justify-between items-center"
                  style={{ 
                    backgroundColor: '#001226',
                    boxShadow: '0 0 10px 2px rgba(0, 123, 255, 0.5)',
                    transition: 'box-shadow 0.3s ease-in-out'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 0 20px 7px rgba(0, 123, 255, 0.8)'}
                  onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 0 10px 2px rgba(0, 123, 255, 0.5)'}
                  onClick={() => handleCardClick(index)}
                >
                  <div className="relative w-full h-full flex flex-col justify-center items-center">
                    <div className="opacity-0 group-hover:opacity-100 absolute inset-0 gb-black bg-opacity-50 flex items-center justify-center transition-opacity duration-300">
                      <p className="text-white text-sm" style={{ fontSize: '0.70rem'}}>
                        {category?.conceptCategory || "No title"}
                      </p>
                    </div>
                    <div className="m-auto">
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
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button onClick={handleUpdateKnowledgeProfile} className="p-2 hover:bg-[#3D6788] rounded">
                <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16.4697 9.46967C16.1768 9.76256 16.1768 10.2374 16.4697 10.5303C16.7626 10.8232 17.2374 10.8232 17.5303 10.5303L16.4697 9.46967ZM19.5303 8.53033C19.8232 8.23744 19.8232 7.76256 19.5303 7.46967C19.2374 7.17678 18.7626 7.17678 18.4697 7.46967L19.5303 8.53033ZM18.4697 8.53033C18.7626 8.82322 19.2374 8.82322 19.5303 8.53033C19.8232 8.23744 19.8232 7.76256 19.5303 7.46967L18.4697 8.53033ZM17.5303 5.46967C17.2374 5.17678 16.7626 5.17678 16.4697 5.46967C16.1768 5.76256 16.1768 6.23744 16.4697 6.53033L17.5303 5.46967ZM19 8.75C19.4142 8.75 19.75 8.41421 19.75 8C19.75 7.58579 19.4142 7.25 19 7.25V8.75ZM16.7 8L16.6993 8.75H16.7V8ZM12.518 10.252L13.1446 10.6642L13.1446 10.6642L12.518 10.252ZM10.7414 11.5878C10.5138 11.9338 10.6097 12.3989 10.9558 12.6266C11.3018 12.8542 11.7669 12.7583 11.9946 12.4122L10.7414 11.5878ZM11.9946 12.4122C12.2222 12.0662 12.1263 11.6011 11.7802 11.3734C11.4342 11.1458 10.9691 11.2417 10.7414 11.5878L11.9946 12.4122ZM10.218 13.748L9.59144 13.3358L9.59143 13.3358L10.218 13.748ZM6.041 16V16.75H6.04102L6.041 16ZM5 15.25C4.58579 15.25 4.25 15.5858 4.25 16C4.25 16.4142 4.58579 16.75 5 16.75V15.25ZM11.9946 11.5878C11.7669 11.2417 11.3018 11.1458 10.9558 11.3734C10.6097 11.6011 10.5138 12.0662 10.7414 12.4122L11.9946 11.5878ZM12.518 13.748L13.1446 13.3358L13.1446 13.3358L12.518 13.748ZM16.7 16V15.25H16.6993L16.7 16ZM19 16.75C19.4142 16.75 19.75 16.4142 19.75 16C19.75 15.5858 19.4142 15.25 19 15.25V16.75ZM10.7414 12.4122C10.9691 12.7583 11.4342 12.8542 11.7802 12.6266C12.1263 12.3989 12.2222 11.9338 11.9946 11.5878L10.7414 12.4122ZM10.218 10.252L9.59143 10.6642L9.59144 10.6642L10.218 10.252ZM6.041 8L6.04102 7.25H6.041V8ZM5 7.25C4.58579 7.25 4.25 7.58579 4.25 8C4.25 8.41421 4.58579 8.75 5 8.75V7.25ZM17.5303 13.4697C17.2374 13.1768 16.7626 13.1768 16.4697 13.4697C16.1768 13.7626 16.1768 14.2374 16.4697 14.5303L17.5303 13.4697ZM18.4697 16.5303C18.7626 16.8232 19.2374 16.8232 19.5303 16.5303C19.8232 16.2374 19.8232 15.7626 19.5303 15.4697L18.4697 16.5303ZM19.5303 16.5303C19.8232 16.2374 19.8232 15.7626 19.5303 15.4697C19.2374 15.1768 18.7626 15.1768 18.4697 15.4697L19.5303 16.5303ZM16.4697 17.4697C16.1768 17.7626 16.1768 18.2374 16.4697 18.5303C16.7626 18.8232 17.2374 18.8232 17.5303 18.5303L16.4697 17.4697ZM17.5303 10.5303L19.5303 8.53033L18.4697 7.46967L16.4697 9.46967L17.5303 10.5303ZM19.5303 7.46967L17.5303 5.46967L16.4697 6.53033L18.4697 8.53033L19.5303 7.46967ZM19 7.25H16.7V8.75H19V7.25ZM16.7007 7.25C14.7638 7.24812 12.956 8.22159 11.8914 9.8398L13.1446 10.6642C13.9314 9.46813 15.2676 8.74861 16.6993 8.75L16.7007 7.25ZM11.8914 9.83979L10.7414 11.5878L11.9946 12.4122L13.1446 10.6642L11.8914 9.83979ZM10.7414 11.5878L9.59144 13.3358L10.8446 14.1602L11.9946 12.4122L10.7414 11.5878ZM9.59143 13.3358C8.80541 14.5306 7.47115 15.25 6.04098 15.25L6.04102 16.75C7.97596 16.7499 9.78113 15.7767 10.8446 14.1602L9.59143 13.3358ZM6.041 15.25H5V16.75H6.041V15.25ZM10.7414 12.4122L11.8914 14.1602L13.1446 13.3358L11.9946 11.5878L10.7414 12.4122ZM11.8914 14.1602C12.956 15.7784 14.7638 16.7519 16.7007 16.75L16.6993 15.25C15.2676 15.2514 13.9314 14.5319 13.1446 13.3358L11.8914 14.1602ZM16.7 16.75H19V15.25H16.7V16.75ZM11.9946 11.5878L10.8446 9.83979L9.59144 10.6642L10.7414 12.4122L11.9946 11.5878ZM10.8446 9.8398C9.78113 8.2233 7.97596 7.25005 6.04102 7.25L6.04098 8.75C7.47115 8.75004 8.80541 9.46939 9.59143 10.6642L10.8446 9.8398ZM6.041 7.25H5V8.75H6.041V7.25ZM16.4697 14.5303L18.4697 16.5303L19.5303 15.4697L17.5303 13.4697L16.4697 14.5303ZM18.4697 15.4697L16.4697 17.4697L17.5303 18.5303L19.5303 16.5303L18.4697 15.4697Z" fill="#efefef" />
                </svg>
              </button>
              <button onClick={toggleSettings} className="p-2 hover:bg-[#3D6788] rounded">
                <svg width="20" height="20" viewBox="0 0 22 22" fill="#ffffff" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.25001 22L8.85001 18.8C8.63335 18.7167 8.42918 18.6167 8.23751 18.5C8.04585 18.3833 7.85835 18.2583 7.67501 18.125L4.70001 19.375L1.95001 14.625L4.52501 12.675C4.50835 12.5583 4.50001 12.4458 4.50001 12.3375V11.6625C4.50001 11.5542 4.50835 11.4417 4.52501 11.325L1.95001 9.375L4.70001 4.625L7.67501 5.875C7.85835 5.74167 8.05001 5.61667 8.25001 5.5C8.45001 5.38333 8.65001 5.28333 8.85001 5.2L9.25001 2H14.75L15.15 5.2C15.3667 5.28333 15.5708 5.38333 15.7625 5.5C15.9542 5.6167 16.1417 5.74167 16.325 5.875L19.3 4.625L22.05 9.375L19.475 11.325C19.4917 11.4417 19.5 11.5542 19.5 11.6625V12.3375C19.5 12.4458 19.4833 12.5583 19.45 12.675L22.025 14.625L19.275 19.375L16.325 18.125C16.1417 18.2583 15.95 18.3833 15.75 18.5C15.55 18.6167 15.35 18.7167 15.15 18.8L14.75 22H9.25001ZM12.05 15.5C13.0167 15.5 13.8417 15.1583 14.525 14.475C15.2083 13.7917 15.55 12.9667 15.55 12C15.55 11.0333 15.2083 10.2083 14.525 9.525C13.8417 8.84167 13.0167 8.5 12.05 8.5C11.0667 8.5 10.2375 8.84167 9.56251 9.525C8.88751 10.2083 8.55001 11.0333 8.55001 12C8.55001 12.9667 8.88751 13.7917 9.56251 14.475C10.2375 15.1583 11.0667 15.5 12.05 15.5Z" />
                </svg>
              </button>
              <button
                onClick={toggleLink}
                className={`p-2 hover:bg-[#3D6788] rounded ${
                  isUpdatingProfile ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={isUpdatingProfile}
              >
                <svg width="20" height="20" viewBox="0 0 22 22" fill="#ffffff" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-12h2v4h4v2h-4v4h-2v-4H7v-2h4V8z" />
                </svg>
              </button>
              <button onClick={toggleSearch} className="p-2 hover:bg-[#3D5788] rounded">
                <svg width="20" height="20" fill="#ffffff" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="m21.75 20.063-5.816-5.818a7.523 7.523 0 0 0 1.44-4.433c0-4.17-3.393-7.562-7.562-7.562-4.17 0-7.562 3.392-7.562 7.562s3.392 7.562 7.562 7.562a7.523 7.523 0 0 0 4.433-1.44l5.818 5.816 1.687-1.688ZM9.812 14.986a5.174 5.174 0 1 1-.002-10.35 5.174 5.174 0 0 1 0 10.349Z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-12 gap-3 px-2 flex-grow overflow-hidden">
          <div className="col-span-11 h-full">
            <div className="bg-[#001226] rounded-lg overflow-hidden px-4 h-full flex flex-col">
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
                  {selectedCategory || ""}
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

              <div className="p-2 flex-grow overflow-hidden">

              {isLoading ? (
                <LoadingSkeleton />
              ) : (
              <>
                {contentType ==="video" &&
                currentContent &&
                currentContent.type === "video" && (
                                    <div className="h-full">
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
                            <ChevronDown className="w-4 h-4 mr-1" />
                            Show Summary
                          </>
                        ) : (
                          <>
                            <ChevronUp className="w-4 h-4 mr-1" />
                            Hide Summary
                          </>
                        )}
                      </CollapsibleTrigger>
                      <CollapsibleContent className="text-sm text-gray-300 mt-2 pl-2 border-l border-gray-700">
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
                              Hide Summary
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4 mr-1" />
                              Show Summary
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
              {contentType ==="video" && (
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
              {contentType ==="reading" && (
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
              </>
            )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  export default AdaptiveTutoring;