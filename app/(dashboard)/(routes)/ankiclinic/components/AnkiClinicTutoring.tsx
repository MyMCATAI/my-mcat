"use client";
import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import Image from "next/image";
import Quiz from "@/components/Quiz";
import ReactPlayer from "react-player";
import { useToast } from "@/components/ui/use-toast";
import { Category } from "@/types";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, Podcast, Maximize2, Minimize2, Check, Video, BookOpen, ClipboardCheck, HelpCircle, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadingSkeleton } from "../../home/ATSSkeleton";
import { motion } from "framer-motion";
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { getRelevantTranscript } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import CompleteTopicButton from "@/components/CompleteTopicButton";
import ReactConfetti from "react-confetti";
import { useAudio } from '@/store/selectors';

interface ContentItem {
  id: string;
  title: string;
  link: string;
  type: string;
  transcript?: string;
  summary?: string;
  conceptCategory?: string;
}

interface AnkiClinicTutoringProps {
  toggleChatBot: () => void;
  setChatbotContext: (context: {
    contentTitle: string;
    context: string;
  }) => void;
  chatbotRef: React.MutableRefObject<{
    sendMessage: (message: string) => void;
  }>;
  onActivityChange: (type: string, location: string, metadata?: any) => Promise<void>;
  className?: string;
  onClose?: () => void;
}

interface CategoryWithCompletion extends Category {
  isCompleted?: boolean;
  sample?: number;
}

const AnkiClinicTutoring: React.FC<AnkiClinicTutoringProps> = ({
  toggleChatBot,
  setChatbotContext,
  chatbotRef,
  onActivityChange,
  className,
  onClose,
}) => {
  const { toast } = useToast();
  const audio = useAudio();
  
  // State
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [contentType, setContentType] = useState("video");
  const [isLoading, setIsLoading] = useState(true);
  const [content, setContent] = useState<ContentItem[]>([]);
  const [currentContentId, setCurrentContentId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [checkedCategories, setCheckedCategories] = useState<CategoryWithCompletion[]>([]);
  const [playedSeconds, setPlayedSeconds] = useState<number>(0);
  const [isPdfLoading, setIsPdfLoading] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);
  const [selectedTopicToComplete, setSelectedTopicToComplete] = useState<{id: string, name: string} | null>(null);

  // Add this to find the current content from the content array based on currentContentId 
  const currentContent = content.find(item => item.id === currentContentId) || null;

  // Helper functions
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };
  
  const formatSummary = (summary: string): string => {
    // Make sure the summary has proper line breaks
    return summary.replace(/\n/g, '\n\n');
  };

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Get URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const conceptCategoriesParam = urlParams.get('conceptCategories');
      
      // Construct API URL with parameters
      const apiUrl = new URL('/api/category', window.location.origin);
      apiUrl.searchParams.append('useKnowledgeProfiles', 'true');
      apiUrl.searchParams.append('page', '1');
      apiUrl.searchParams.append('pageSize', '6');
      apiUrl.searchParams.append('excludeCompleted', 'true');
      
      // Add concept categories if they exist in URL
      if (conceptCategoriesParam) {
        apiUrl.searchParams.append('conceptCategories', conceptCategoriesParam);
      }
      
      const response = await fetch(apiUrl.toString());
      
      if (!response.ok) throw new Error("Failed to fetch categories");
      
      const data = await response.json();
      const categories = data.items as CategoryWithCompletion[];
      
      // Set checked categories to returned categories
      setCheckedCategories(categories);
      
      // Select first category if none selected
      if (!selectedCategory && categories.length > 0) {
        setSelectedCategory(categories[0].conceptCategory);
        await fetchContentAndQuestions(categories[0].conceptCategory);
      }

    } catch (error) {
      console.error("Error fetching categories:", error);
      toast({
        title: "Error",
        description: "Failed to load categories. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, toast]);

  // Initial fetch of categories
  useEffect(() => {
    fetchCategories();
  }, []);

  // Handle topic completion
  const handleTopicComplete = async (categoryId: string) => {
    try {
      await fetch('/api/category/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId }),
      });

      await fetchCategories();
      
      // Show confetti
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);

    } catch (error) {
      console.error("Error completing topic:", error);
      toast({
        title: "Error",
        description: "Failed to complete topic. Please try again.",
        variant: "destructive",
      });
    }
  };

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
  }, [currentContentId, content, setChatbotContext, playedSeconds]);

  // Content fetching
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
        const contentData = await fetchContent(category);
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

  // Fetch content when selected category changes
  useEffect(() => {
    if (selectedCategory) {
      fetchContentAndQuestions(selectedCategory);
    }
  }, [selectedCategory, fetchContentAndQuestions]);

  // Set content type and current content based on available content
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

  // Helper functions for UI components
  const extractVideoId = (url: string) => {
    try {
      const baseUrl = url.split("&")[0];
      const vMatch = baseUrl.match(/(?:v=|\/)([\w-]{11})(?:\?|&|\/|$)/);
      return vMatch ? vMatch[1] : null;
    } catch (error) {
      console.error("Error extracting video ID:", error);
      return null;
    }
  };

  const extractFileId = (url: string): string => {
    const match = url.match(/\/d\/(.+?)\/view/);
    return match ? match[1] : "";
  };

  // Also need to add this handler function for content selection
  const handleContentClick = useCallback((contentId: string) => {
    setCurrentContentId(contentId);
    const clickedContent = content.find(item => item.id === contentId);
    if (clickedContent) {
      if (clickedContent.type === "video") {
        setContentType("video");
        setIsPlaying(true);
      } else if (clickedContent.type === "reading") {
        setContentType("reading");
        setIsPdfLoading(true);
      }
    }
  }, [content]);

  // Event handlers
  const handleCameraClick = () => {
    audio.playSound("button-click");
    setContentType("video");
    
    // Find the first video if available
    const firstVideo = content.find((item) => item.type === "video");
    if (firstVideo) {
      setCurrentContentId(firstVideo.id);
    }
  };

  const handleBookClick = () => {
    audio.playSound("button-click");
    setContentType("reading");
    
    // Find the first reading if available
    const firstReading = content.find((item) => item.type === "reading");
    if (firstReading) {
      setCurrentContentId(firstReading.id);
      setIsPdfLoading(true);
    }
  };

  const handleQuizClick = () => {
    audio.playSound("button-click");
    setContentType("quiz");
  };

  const handleCatClick = (type: string) => {
    audio.playSound("catpaws");
    const currentContent = content.find((item) => item.id === currentContentId);
    
    if (currentContent) {
      const message = type === "explain" 
        ? `Explain this: ${currentContent.title}`
        : `Ask me a question about: ${currentContent.title}`;
      
      chatbotRef.current.sendMessage(message);
      toggleChatBot();
    } else {
      chatbotRef.current.sendMessage(`Let's talk about ${selectedCategory || 'this topic'}`);
      toggleChatBot();
    }
  };

  // Add the missing toggleFullScreen function
  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  // Add the missing dialog handler
  const handleCompleteDialogOpenChange = (open: boolean) => {
    setIsCompleteDialogOpen(open);
    if (!open) {
      setSelectedTopicToComplete(null);
    }
  };

  // Add a new handler for the close button
  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  // Add this to help debug - force set loading to false after a timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        console.log("Force ending loading state after timeout");
        setIsLoading(false);
        
        // If no content loaded, add some debug content
        if (content.length === 0) {
          console.log("No content loaded, adding debug content");
          setContent([
            {
              id: 'debug-reading-1',
              title: 'Debug Reading Material',
              link: 'https://example.com/debug-reading',
              type: 'reading'
            },
            {
              id: 'debug-video-1',
              title: 'Debug Video',
              link: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
              type: 'video'
            }
          ]);
          
          // Set a default category since one isn't loading
          setSelectedCategory("electrochemistry");
          
          // Populate checked categories for the complete button
          setCheckedCategories([{
            id: "debug-category",
            name: "Electrochemistry",
            isCompleted: false,
            section: "Debug Section",
            subjectCategory: "Debug Subject",
            contentCategory: "Debug Content",
            conceptCategory: "electrochemistry",
            generalWeight: 0,
            color: "#FFFFFF",
            icon: "atoms",
            podcastLinks: ""
          }]);
        }
      }
    }, 5000); // 5 second timeout
    
    return () => clearTimeout(timer);
  }, [isLoading, content]);

  // Render methods
  return (
    <div className={`relative pt-0 h-full flex flex-col overflow-visible ${className || ''}`}>
      {/* X button in top left - more visible */}
      <button 
        onClick={handleClose}
        className="absolute top-4 left-4 z-[150] bg-red-600 hover:bg-red-700 text-white p-3 rounded-full transition-colors shadow-md"
      >
        <X className="w-6 h-6" />
      </button>

      {showConfetti && (
        <ReactConfetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={200}
          gravity={0.2}
        />
      )}

      <div className="grid grid-cols-12 text-[--theme-text-color] gap-3 px-0 flex-grow overflow-visible">
        <div className="col-span-11 h-full overflow-visible">
          <div
            className="bg-[--theme-adaptive-tutoring-color] rounded-lg px-2 h-full flex flex-col overflow-visible"
            style={{
              boxShadow: "var(--theme-adaptive-tutoring-boxShadow)",
            }}
          >
            {/* Video/Reading/Quiz buttons */}
            <div className="py-2 flex items-center justify-center gap-4 mt-2 ml-2 mr-2 relative">
              {/* Video button with Lucide icon */}
              <button
                onClick={handleCameraClick}
                className={`flex items-center justify-center w-12 h-12 rounded-full transition-colors ${
                  contentType === "video"
                    ? "bg-[--theme-hover-color] text-[--theme-hover-text]"
                    : "bg-[--theme-border-color] text-[--theme-text-color] hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text]"
                }`}
              >
                <Video className="w-5 h-5" />
              </button>

              {/* Current topic title */}
              <div className="flex-grow text-center">
                <h2 className="text-xl font-bold truncate">
                  {selectedCategory ? 
                    selectedCategory.split('_').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                    ).join(' ') 
                    : "Electrochemistry"}
                </h2>
              </div>

              {/* Additional Video button (left of reading) */}
              <button
                onClick={handleCameraClick}
                className={`flex items-center justify-center w-12 h-12 rounded-full transition-colors ${
                  contentType === "video"
                    ? "bg-[--theme-hover-color] text-[--theme-hover-text]"
                    : "bg-[--theme-border-color] text-[--theme-text-color] hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text]"
                }`}
              >
                <Video className="w-5 h-5" />
              </button>

              {/* Reading button with Lucide icon */}
              <button
                onClick={handleBookClick}
                className={`flex items-center justify-center w-12 h-12 rounded-full transition-colors ${
                  contentType === "reading"
                    ? "bg-[--theme-hover-color] text-[--theme-hover-text]"
                    : "bg-[--theme-border-color] text-[--theme-text-color] hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text]"
                }`}
              >
                <BookOpen className="w-5 h-5" />
              </button>

              {/* Quiz button with Lucide icon */}
              <button
                onClick={handleQuizClick}
                className={`flex items-center justify-center w-12 h-12 rounded-full transition-colors ${
                  contentType === "quiz"
                    ? "bg-[--theme-hover-color] text-[--theme-hover-text]"
                    : "bg-[--theme-border-color] text-[--theme-text-color] hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text]"
                }`}
              >
                <ClipboardCheck className="w-5 h-5" />
              </button>

              {/* Cat (Ask AI) button with Lucide icon */}
              <div className="relative">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button 
                      className="flex items-center justify-center w-12 h-12 rounded-full bg-[--theme-border-color] text-[--theme-text-color] hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text] transition-colors"
                    >
                      <HelpCircle className="w-5 h-5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="bottom" align="end">
                    <DropdownMenuItem onClick={() => handleCatClick("explain")}>
                      Explain this topic
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleCatClick("quiz")}>
                      Ask me questions
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Complete topic button - already using Lucide Check icon */}
              <button
                onClick={() => {
                  if (checkedCategories.length > 0) {
                    const category = checkedCategories[0]; // Use first category
                    setSelectedTopicToComplete({
                      id: category.id,
                      name: category.name ?? category.conceptCategory // Provide fallback for optional name
                    });
                    setIsCompleteDialogOpen(true);
                  } else {
                    toast({
                      title: "No topic selected",
                      description: "Please select a topic first",
                      variant: "destructive"
                    });
                  }
                }}
                className="flex items-center justify-center w-12 h-12 rounded-full bg-green-600 hover:bg-green-700 text-white transition-colors"
              >
                <Check className="w-5 h-5" />
              </button>
            </div>

            {/* Main content area */}
            <div className="p-2 flex-grow overflow-y-auto scrollbar-hide">
              {isLoading ? (
                <LoadingSkeleton />
              ) : (
                <>
                  {contentType === "video" &&
                    currentContent &&
                    currentContent.type === "video" && (
                      <div className="flex flex-col h-full">
                        <div className="flex-grow min-h-0">
                          <ReactPlayer
                            className="w-full h-full"
                            url={currentContent.link}
                            playing={isPlaying}
                            width="100%"
                            height="100%"
                            onProgress={({ playedSeconds }) =>
                              setPlayedSeconds(playedSeconds)
                            }
                            onEnded={() => setIsPlaying(false)}
                            controls={true}
                          />
                        </div>
                        <div className="mt-4 flex justify-between items-center flex-shrink-0">
                          <Collapsible open={isSummaryOpen}>
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

                          <a
                            href="https://app.termly.io/policy-viewer/policy.html?policyUUID=bbaa0360-e283-49d9-b273-19f54d765254"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-[--theme-hover-color] hover:underline"
                          >
                            Disclaimer
                          </a>
                        </div>
                      </div>
                    )}

                  {contentType === "reading" &&
                    currentContent &&
                    currentContent.type === "reading" && (
                      <div className="flex flex-col h-full">
                        <div className="relative flex-grow min-h-0">
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
                                {isPdfLoading && (
                                  <div className="absolute inset-0 bg-[--theme-adaptive-tutoring-color] rounded-lg flex flex-col gap-4 p-6">
                                    <div className="flex items-center gap-4">
                                      <Skeleton className="h-8 w-8" />
                                      <Skeleton className="h-8 w-48" />
                                    </div>
                                    <Skeleton className="h-full w-full" />
                                  </div>
                                )}
                                <iframe
                                  src={`https://drive.google.com/file/d/${extractFileId(
                                    currentContent.link
                                  )}/preview`}
                                  className={`w-full h-full rounded-lg ${isPdfLoading ? 'hidden' : ''}`}
                                  title={currentContent.title}
                                  allow="autoplay"
                                  onLoad={() => setIsPdfLoading(false)}
                                ></iframe>
                              </div>
                            </DialogContent>
                          </Dialog>
                          {isPdfLoading && (
                            <div className="absolute inset-0 bg-[--theme-adaptive-tutoring-color] rounded-lg flex flex-col gap-4 p-6">
                              <div className="flex items-center gap-4">
                                <Skeleton className="h-8 w-8" />
                                <Skeleton className="h-8 w-48" />
                              </div>
                              <Skeleton className="h-full w-full" />
                            </div>
                          )}
                          <iframe
                            src={`https://drive.google.com/file/d/${extractFileId(
                              currentContent.link
                            )}/preview`}
                            className={`w-full h-full rounded-lg ${isPdfLoading ? 'hidden' : ''}`}
                            title={currentContent.title}
                            allow="autoplay"
                            onLoad={() => setIsPdfLoading(false)}
                          ></iframe>
                        </div>
                        <div className="mt-4 flex justify-between items-center flex-shrink-0">
                          <Collapsible open={isSummaryOpen}>
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

                          <a
                            href="https://app.termly.io/policy-viewer/policy.html?policyUUID=bbaa0360-e283-49d9-b273-19f54d765254"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-[--theme-hover-color] hover:underline"
                          >
                            Disclaimer
                          </a>
                        </div>
                      </div>
                    )}
                  {contentType === "quiz" && selectedCategory && (
                    <div className="h-full">
                      <Quiz
                        category={selectedCategory}
                        shuffle={true}
                        setChatbotContext={setChatbotContext}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="col-span-1">
          <div className="h-full overflow-y-auto">
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
                            <div>
                              <Image
                                src={
                                  videoId
                                    ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
                                    : "/knowledge.png"
                                }
                                alt={`Thumbnail ${index}`}
                                width={140}
                                height={90}
                                className={`relative w-30 h-18 bg-black cursor-pointer rounded-lg ${
                                  currentContentId === video.id && isPlaying
                                    ? "border-4 border-[--theme-border-color]"
                                    : ""
                                }`}
                              />
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <p className="text-xs mt-1 text-[--theme-text-color] truncate">
                                      {video.title}
                                    </p>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="text-xs">{video.title}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </div>
                        );
                      })}
                  </>
                )}
                {contentType === "reading" && (
                  <div className="flex flex-wrap gap-4 mt-8">
                    {content
                      .filter((item) => item.type === "reading")
                      .map((pdf, index) => (
                        <div
                          key={index}
                          onClick={() => handleContentClick(pdf.id)}
                          className={`cursor-pointer w-40 h-32 flex items-center justify-center bg-[--theme-leaguecard-color] rounded-lg overflow-hidden ${
                            currentContentId === pdf.id
                              ? "border-4 border-[--theme-border-color]"
                              : "border border-[--theme-border-color]"
                          }`}
                        >
                          <div className="text-center text-[--theme-text-color] p-2">
                            <BookOpen className="w-6 h-6 mx-auto mb-2" />
                            <p className="text-sm font-medium line-clamp-2">{pdf.title}</p>
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

      {selectedTopicToComplete && (
        <CompleteTopicButton
          categoryId={selectedTopicToComplete.id}
          categoryName={selectedTopicToComplete.name}
          onComplete={handleTopicComplete}
          setShowConfetti={setShowConfetti}
          isOpen={isCompleteDialogOpen}
          onOpenChange={handleCompleteDialogOpenChange}
        />
      )}
    </div>
  );
};

export default AnkiClinicTutoring; 