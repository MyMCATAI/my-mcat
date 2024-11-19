"use client";
import React, { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import Quiz, { QuizQuestion } from "@/components/quiz";
import ReactPlayer from "react-player";
import { useToast } from "@/components/ui/use-toast";
import { Category } from "@/types";
import Icon from "@/components/ui/icon";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import {
  ChevronDown,
  ChevronUp,
  Podcast,
  Maximize2,
  Minimize2,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadingSkeleton } from "./ATSSkeleton";
import { ThemedSkeleton } from "@/components/ATS/ThemedSkeleton";
import { useTheme } from "@/contexts/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { FaSpotify, FaApple, FaHeadphones } from "react-icons/fa";
import ATSSettingContent from "./ATSSettingContent";
import {
  TooltipProvider,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  useMessages,
  RcbPostInjectMessageEvent,
  useFlow,
  useTextArea,
} from "react-chatbotify";
import { getRelevantTranscript } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  setChatbotContext: (context: {
    contentTitle: string;
    context: string;
  }) => void;
  chatbotRef: React.MutableRefObject<{
    sendMessage: (message: string) => void;
  }>;
}

type PlatformType = 'spotify' | 'apple' | 'mymcat';

const platformText: Record<PlatformType, string> = {
  spotify: 'Spotify',
  apple: 'Apple Music',
  mymcat: 'MyMCAT'
};

const AdaptiveTutoring: React.FC<AdaptiveTutoringProps> = ({
  toggleChatBot,
  setChatbotContext,
  chatbotRef,
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
  const [isFullScreen, setIsFullScreen] = useState(false);

  const [checkedCategories, setCheckedCategories] = useState<Category[]>([]);
  const [playedSeconds, setPlayedSeconds] = useState<number>(0);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const [initialCategories, setInitialCategories] = useState<Category[]>([]);

  // Fetch categories and set initial category
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const categoriesData = await fetchCategories(true);
        setCategories(categoriesData);
        setInitialCategories(categoriesData);
        setCheckedCategories(categoriesData);
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
    // Create a set of unique categories based on checkedCategories and initialCategories
    const uniqueCategoriesMap = new Map();

    // Add checked categories first
    checkedCategories.forEach((category) => {
      uniqueCategoriesMap.set(category.id, category);
    });

    // Add initial categories that are not checked
    initialCategories.forEach((category) => {
      if (!uniqueCategoriesMap.has(category.id)) {
        uniqueCategoriesMap.set(category.id, category);
      }
    });

    // Convert the map back to an array
    const uniqueCategories = Array.from(uniqueCategoriesMap.values());

    // Update the categories state only if it has changed
    if (
      uniqueCategories.length !== categories.length ||
      uniqueCategories.some((cat, index) => cat.id !== categories[index].id)
    ) {
      setCategories(uniqueCategories);
    }
  }, [checkedCategories, initialCategories]);

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
      const relevantTranscript = getRelevantTranscript(
        currentContent.transcript,
        playedSeconds
      );
      setChatbotContext({
        contentTitle: currentContent.title || "Untitled",
        context: `Here's a transcript of the ${currentContent.type} I'm looking at: ${relevantTranscript}. Refer to this as context if I ask a question directly about what I'm studying`,
      });
    }
  }, [currentContentId, content, setChatbotContext]);

  // Separate effect for video timestamp updates
  useEffect(() => {
    const currentContent = content.find((item) => item.id === currentContentId);
    if (!currentContent?.transcript) return;

    // Initial context setup for any content type
    const initialTranscript = getRelevantTranscript(
      currentContent.transcript,
      playedSeconds
    );
    setChatbotContext({
      contentTitle: currentContent.title || "Untitled",
      context: `I'm currently at timestamp ${formatTime(
        playedSeconds
      )} in the ${
        currentContent.type
      }. Here's a transcript of what I'm looking at: ${initialTranscript}. Refer to this as context if I ask a question directly about what I'm studying`,
    });

    // Only set up interval for videos
    if (currentContent.type === "video" && isPlaying) {
      let lastPosition = Math.floor(playedSeconds / 30);

      const interval = setInterval(() => {
        const currentPosition = Math.floor(playedSeconds / 30);

        if (currentPosition !== lastPosition) {
          lastPosition = currentPosition;
          const relevantTranscript = getRelevantTranscript(
            currentContent.transcript!,
            playedSeconds
          );

          setChatbotContext({
            contentTitle: currentContent.title || "Untitled",
            context: `I'm currently at timestamp ${formatTime(
              playedSeconds
            )} in the video. Here's the recent transcript: ${relevantTranscript}`,
          });
        }
      }, 5000); // Check every 5 seconds

      return () => clearInterval(interval);
    }
  }, [currentContentId, content, isPlaying, playedSeconds]);

  const updateContentVisibility = useCallback(
    (fetchedContent: ContentItem[]) => {
      const hasVideos = fetchedContent.some((item) => item.type === "video");
      const hasReadings = fetchedContent.some(
        (item) => item.type === "reading"
      );

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
        const firstReading = fetchedContent.find(
          (item) => item.type === "reading"
        );
        if (firstReading) {
          setCurrentContentId(firstReading.id);
        }
      } else {
        setCurrentContentId(null);
      }
    },
    []
  );

  const extractVideoId = (url: string) => {
    const urlParams = new URLSearchParams(new URL(url).search);
    return urlParams.get("v");
  };

  const handleContentClick = (contentId: string) => {
    setCurrentContentId(contentId);
    const clickedContent = content.find((item) => item.id === contentId);
    console.log("Clicked Content:", clickedContent);
    if (clickedContent) {
      setContentType(clickedContent.type);

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
          ? "Here's a transcript of the " +
            clickedContent.type +
            " that I'm currently looking at: " +
            clickedContent.transcript +
            " Only refer to this if I ask a question directly about what I'm studying"
          : "",
      });
    }
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

  const fetchContentAndQuestions = useCallback(
    async (category: string) => {
      setIsLoading(true);
      try {
        const [contentData] = await Promise.all([
          fetchContent(category),
        ]);
        setContent(contentData);
        updateContentVisibility(contentData);
      } catch (error) {
        console.error("Error fetching content and questions:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [fetchContent]
  );

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

  const fetchCategories = useCallback(
    async (useKnowledgeProfiles: boolean = false) => {
      try {
        setIsLoading(true);
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
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

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
    setContentType("video");

    const firstVideo = content.find((item) => item.type === "video");
    if (firstVideo) {
      setCurrentContentId(firstVideo.id);
      setIsPlaying(true);
    }
  };

  const handleBookClick = () => {
    setContentType("reading");

    const firstPDF = content.find((item) => item.type === "reading");
    if (firstPDF) {
      setCurrentContentId(firstPDF.id);
    }
  };

  const handleQuizTabClick = () => {
    setContentType("quiz");

    if (!selectedCategory) {
      toast({
        title: "No Category Selected",
        description: "Please select a category first to view its quiz questions.",
        variant: "destructive",
      });
      return;
    }
    
    setCurrentContentId(null);
    setContent([]);
  };

  const handleCardClick = async (index: number) => {
    const selectedCategoryItem = checkedCategories[index];

    if (!selectedCategoryItem) {
      console.error("Category not found at index:", index);
      return;
    }

    setSelectedCard(index);
    const selectedCategory = selectedCategoryItem.conceptCategory;
    setSelectedCategory(selectedCategory);

    try {
      setIsLoading(true);
      const [contentData] = await Promise.all([
        fetchContent(selectedCategory),
      ]);

      setContent(contentData);
      updateContentVisibility(contentData);
    } catch (error) {
      console.error("Error loading content:", error);
      toast({
        title: "Error",
        description: "Failed to load content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const currentContent = content.find((item) => item.id === currentContentId);

  const formatSummary = (summary: string) => {
    return summary
      .replace(/^(\w+.*?):/gm, "\n\n## $1\n\n") // Use ## for main headers
      .replace(/^•\s*/gm, "\n- ") // Replace bullet points with markdown list items
      .trim(); // Remove any leading/trailing whitespace
  };

  const updatePodcastPosition = useCallback(() => {
    if (podcastButtonRef.current) {
      const rect = podcastButtonRef.current.getBoundingClientRect();
      const rootFontSize = parseFloat(
        getComputedStyle(document.documentElement).fontSize
      );
      setPodcastPosition({
        top: rect.top / rootFontSize,
        left: rect.left / rootFontSize,
      });
    }
  }, []);

  useEffect(() => {
    updatePodcastPosition();
    window.addEventListener("resize", updatePodcastPosition);
    return () => window.removeEventListener("resize", updatePodcastPosition);
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

  const handlePodcastMouseEnter = async () => {
    setIsPodcastHovered(true);
    updatePodcastPosition();
  };

  const handlePodcastMouseLeave = () => {
    setIsPodcastHovered(false);
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const handleCatClick = (type: "explain" | "question") => {
    const message =
      type === "explain"
        ? "I'm confused about this topic. Can you explain it to me?"
        : "Can you ask me a conceptual multiple choice question to test my understanding?";

    if (chatbotRef.current?.sendMessage) {
      chatbotRef.current.sendMessage(message);
    } else {
      console.warn("ChatBot ref not ready");
    }
  };

  const platformIcons: Record<PlatformType, any> = {
    spotify: FaSpotify,
    apple: FaApple,
    mymcat: FaHeadphones
  };

  const getPodcastPlatform = (link: string): PlatformType | null => {
    if (link.includes('spotify.com')) return 'spotify';
    if (link.includes('apple.com')) return 'apple';
    if (link.includes('/podcast/')) return 'mymcat';
    return null;
  };

  return (
    <div className="relative p-2 h-full flex flex-col overflow-visible">
      <div className="flex items-stretch w-full mb-3">
        <div className="flex-grow mr-2.5 ml-2">
          <div className="grid grid-cols-7 gap-3">
            {isLoading
              ? (
                  [
                    "cat",
                    "medicine",
                    "study",
                    "vaccine",
                    "science",
                    "education",
                    "genetics",
                  ] as const
                ).map((theme, index) => (
                  <ThemedSkeleton key={index} theme={theme} />
                ))
              : checkedCategories?.slice(0, 7).map((category, index) => (
                  <div
                    key={category.id}
                    className="relative z-10 rounded-lg text-center mb-2 group min-h-[6.25rem] cursor-pointer transition-all flex flex-col justify-between items-center"
                    style={{
                      backgroundColor: "var(--theme-adaptive-tutoring-color)",
                      boxShadow: "var(--theme-adaptive-tutoring-boxShadow)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow =
                        "var(--theme-adaptive-tutoring-boxShadow-hover)";
                      e.currentTarget.style.transform = "scale(1.05)";
                      e.currentTarget.style.zIndex = "30";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow =
                        "var(--theme-adaptive-tutoring-boxShadow)";
                      e.currentTarget.style.transform = "scale(1)";
                      e.currentTarget.style.zIndex = "10";
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
                ))}
          </div>
        </div>
        <div className="col-span-1">
          <div className="grid grid-cols-1 gap-2 mb-4 ml-14">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <button
                    onClick={toggleSettings}
                    className={`settings-button tutorial-settings-button p-2 rounded-full shadow-md ${
                      showSettings ? "bg-[--theme-hover-color]" : "bg-white"
                    }`}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill={showSettings ? "white" : "#333"}
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M9.25,22l-.4-3.2c-.216-.084-.42-.184-.612-.3c-.192-.117-.38-.242-.563-.375L4.7,19.375L1.95,14.625L4.525,12.675c-.016-.117-.024-.23-.024-.338V11.662c0-.108.008-.221.025-.337L1.95,9.375L4.7,4.625L7.675,5.875c.183-.134.375-.259.575-.375c.2-.117.4-.217.6-.3l.4-3.2H14.75l.4,3.2c.216.084.42.184.612.3c.192.117.38.242.563.375l2.975-.75l2.75,4.75l-2.575,1.95c.016.117.024.23.024.338v.675c0,.108-.008.221-.025.337l2.575,1.95l-2.75,4.75l-2.95-.75c-.183.133-.375.258-.575.375c-.2.117-.4.217-.6.3l-.4,3.2H9.25zM12.05,15.5c.966,0,1.791-.342,2.475-1.025c.683-.683,1.025-1.508,1.025-2.475c0-.966-.342-1.791-1.025-2.475c-.683-.683-1.508-1.025-2.475-1.025c-0.984,0-1.813,.342-2.488,1.025c-0.675,.683-1.012,1.508-1.012,2.475c0,.966,.337,1.791,1.012,2.475c.675,.683,1.504,1.025,2.488,1.025z"
                        fill={showSettings ? "white" : "#333"}
                      />
                    </svg>
                  </button>
                </TooltipTrigger>
                <TooltipContent>Settings</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-12 text-[--theme-text-color] gap-3 px-2 flex-grow overflow-visible">
        <div className="col-span-11 h-full overflow-visible">
          <div
            className="bg-[--theme-adaptive-tutoring-color] rounded-lg px-4 h-full flex flex-col overflow-visible"
            style={{
              boxShadow: "var(--theme-adaptive-tutoring-boxShadow)",
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
              <p className="text-m px-10">{selectedCategory || ""}</p>
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-2 hover:bg-[--theme-hover-color] rounded transition-colors duration-200">
                    <div className="w-7 h-7 relative theme-box">
                      <Image
                        src="/cat.svg"
                        layout="fill"
                        objectFit="contain"
                        alt="cat assistant"
                        className="theme-svg"
                      />
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => handleCatClick("explain")}>
                    Explain
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleCatClick("question")}>
                    Question
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="p-2 flex-grow overflow-y-auto scrollbar-hide">
              {isLoading ? (
                <LoadingSkeleton />
              ) : (
                <>
                  {contentType === "video" &&
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
                          onProgress={({ playedSeconds }) =>
                            setPlayedSeconds(playedSeconds)
                          }
                          onEnded={() => setIsPlaying(false)}
                          controls={true}
                        />
                        <Collapsible className="mt-4" open={isSummaryOpen}>
                          <CollapsibleTrigger
                            className="flex items-center text-sm text-[--theme-hover-color] cursor-pointer"
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
                      <div className="h-[calc(100vh-20.5rem)] overflow-y-auto">
                        <div
                          className="relative"
                          style={{ height: "calc(100% - 2.5rem)" }}
                        >
                          <Dialog
                            open={isFullScreen}
                            onOpenChange={setIsFullScreen}
                          >
                            <DialogTrigger asChild>
                              <button
                                onClick={toggleFullScreen}
                                className="absolute top-3 right-4 z-10 p-1.5 bg-[--theme-adaptive-tutoring-color] border border-[--theme-border-color] rounded-lg text-[--theme-text-color] hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text] transition-colors duration-200"
                                style={{
                                  width: "3.2rem",
                                  height: "3.2rem",
                                }}
                              >
                                <div className="flex items-center justify-center">
                                  <Maximize2 size={20} />
                                </div>
                              </button>
                            </DialogTrigger>
                            <DialogContent className="max-w-full w-[95vw] h-[95vh] bg-[--theme-leaguecard-color] p-0">
                              <div className="relative w-full h-full">
                                <button
                                  onClick={() => setIsFullScreen(false)}
                                  className="absolute top-2 right-2 z-10 p-3 bg-[--theme-adaptive-tutoring-color] border border-[--theme-border-color] rounded-lg text-[--theme-text-color] hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text] transition-colors duration-200"
                                  style={{
                                    width: "3.25rem",
                                    height: "3.25rem",
                                  }}
                                >
                                  <div className="flex items-center justify-center">
                                    <Minimize2 size={24} />
                                  </div>
                                </button>
                                <iframe
                                  src={`https://drive.google.com/file/d/${extractFileId(
                                    currentContent.link
                                  )}/preview`}
                                  className="w-full h-full rounded-lg"
                                  title={currentContent.title}
                                  allow="autoplay"
                                ></iframe>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <iframe
                            src={`https://drive.google.com/file/d/${extractFileId(
                              currentContent.link
                            )}/preview`}
                            className="w-full h-full rounded-lg"
                            title={currentContent.title}
                            allow="autoplay"
                          ></iframe>
                        </div>
                        <Collapsible className="mt-4" open={isSummaryOpen}>
                          <CollapsibleTrigger
                            className="flex items-center text-sm text-[--theme-hover-color] cursor-pointer"
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

                  {contentType === "quiz" && selectedCategory && (
                    <Quiz 
                      category={selectedCategory} 
                      shuffle={true} 
                      setChatbotContext={setChatbotContext}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="col-span-1">
          <div className="h-[calc(100vh-18rem)] overflow-visible">
            {isLoading ? (
              Array(5)
                .fill(0)
                .map((_, index) => (
                  <Skeleton
                    key={index}
                    className="h-[90px] w-full rounded-lg mb-5"
                  />
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
                                      ? "border-4 border-[--theme-border-color]"
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
                  <div className="flex flex-wrap gap-1.5">
                    {content
                      .filter((item) => item.type === "reading")
                      .map((pdf, index) => (
                        <div
                          key={index}
                          onClick={() => handleContentClick(pdf.id)}
                          className={`cursor-pointer w-40 h-28 flex items-center justify-center bg-[--theme-leaguecard-color] rounded-lg overflow-hidden ${
                            currentContentId === pdf.id
                              ? "border-4 border-[--theme-border-color]"
                              : ""
                          }`}
                        >
                          <div className="text-center text-[--theme-text-color] p-2">
                            <p className="text-xs font-medium">{pdf.title}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
                <div className="relative">
                  {/* Only show podcast button if category has valid podcast links */}
                  {(() => {
                    const currentCategory = categories.find(cat => cat.conceptCategory === selectedCategory);
                    const hasPodcastLinks = currentCategory?.podcastLinks && 
                      currentCategory.podcastLinks !== "" && 
                      currentCategory.podcastLinks !== "[]";

                    return hasPodcastLinks ? (
                      <button
                        ref={podcastButtonRef}
                        className={`w-full h-[3.5rem] rounded-lg mt-2 flex items-center justify-center cursor-pointer relative z-30 transition-colors duration-300 ${
                          isPodcastHovered
                            ? "bg-[--theme-hover-color]"
                            : "bg-[--theme-leaguecard-color]"
                        }`}
                        onMouseEnter={handlePodcastMouseEnter}
                        onMouseLeave={handlePodcastMouseLeave}
                      >
                        <Podcast
                          className={`w-8 h-8 transition-colors duration-300 ${
                            isPodcastHovered
                              ? "text-[--theme-hover-text]"
                              : "text-[--theme-text-color]"
                          }`}
                        />
                      </button>
                    ) : null;
                  })()}
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
              className="fixed w-56 rounded-lg p-3 shadow-lg z-[35] bg-[--theme-hover-color]"
              style={{
                top: `${podcastPosition.top - 5}rem`,
                left: `${podcastPosition.left - 15}rem`,
              }}
              onMouseEnter={() => setIsPodcastHovered(true)}
              onMouseLeave={() => setIsPodcastHovered(false)}
            >
              <h3 className="text-[--theme-hover-text] font-semibold mb-2">
                MyMCAT Podcast
              </h3>
              <hr className="border-[--theme-hover-text] opacity-30 mb-2" />
              {(() => {
                const currentCategory = categories.find(cat => cat.conceptCategory === selectedCategory);
                if (!currentCategory?.podcastLinks) return null;
                
                let links: string[] = [];
                try {
                  links = JSON.parse(currentCategory.podcastLinks);
                } catch (e) {
                  console.error('Error parsing podcast links:', e);
                  return null;
                }

                return links.map((link, index) => {
                  const platform = getPodcastPlatform(link);
                  if (!platform || !platformIcons[platform]) return null;

                  const Icon = platformIcons[platform];
                  
                  return (
                    <a
                      key={index}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 w-full p-2 rounded transition-all duration-300 text-[--theme-hover-text] hover:bg-[rgba(255,255,255,0.1)]"
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-sm">{platformText[platform]}</span>
                    </a>
                  );
                });
              })()}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Settings Button */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={toggleSettings}
          />
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-0 right-4 w-[26rem] bg-[--theme-leaguecard-color] rounded-lg border-[--theme-border-color] border-2 shadow-lg z-50 max-h-[80vh] flex flex-col"
          >
            <ATSSettingContent
              onClose={toggleSettings}
              checkedCategories={checkedCategories}
              setCheckedCategories={setCheckedCategories}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdaptiveTutoring;
// Add this helper function at the end of the file
function extractFileId(url: string): string {
  const match = url.match(/\/d\/(.+?)\/view/);
  return match ? match[1] : "";
}
