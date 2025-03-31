"use client"

import { useState, useEffect, useRef, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import type { Styles } from "react-chatbotify";
import { useAudio, useTheme } from '@/store/selectors';
import { useAllCalendarActivities } from "@/hooks/useCalendarActivities";
import { useExamActivities } from "@/hooks/useCalendarActivities";
import TestCalendar from '@/components/calendar/TestCalendar';
import { X } from "lucide-react";
import type { CalendarEvent } from "@/types/calendar";
// import TutorReportModal from "./TutorReportModal";
// Import required CSS for the calendar
import "react-big-calendar/lib/css/react-big-calendar.css";
import "@/components/styles/CustomCalendar.css";
import { useUser, useUI } from "@/store/selectors";
import { generateWelcomeMessage } from "@/components/chatgpt/ChatContainerInitialMesage";
import { useGame } from "@/store/selectors";

// Dynamically import the chatbot component
const DynamicChatBot = dynamic(() => import("react-chatbotify"), {
  ssr: false,
});

/* --- Constants ----- */
const QUICK_ACTIONS = [
  { id: "schedule", text: "What's my schedule?", prompt: "What's on my schedule today?" },
  { id: "knowledge", text: "What was in my tutor's last report?", prompt: "Show me my tutor's last report" },
  // { id: "next-exam", text: "Next exam?", prompt: "When is my next practice exam?" }
];

/* ----- Types ---- */
interface ChatContainerProps {
  className?: string;
  chatbotRef?: React.MutableRefObject<{
    sendMessage: (message: string, messageContext?: string) => void;
  }>;
}

const ChatContainer = ({ className, chatbotRef }: ChatContainerProps) => {
  /* ---- State ----- */
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [isFirstResponse, setIsFirstResponse] = useState(true);
  const [lastToggleTime, setLastToggleTime] = useState<number>(0);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());
  const [isBotResponding, setIsBotResponding] = useState(false);
  const [welcomeVisible, setWelcomeVisible] = useState(true);
  const [welcomeMessage, setWelcomeMessage] = useState<string | null>(null);
  const [isTutorReportOpen, setIsTutorReportOpen] = useState(false);
  const [isWelcomeMessageTemporary, setIsWelcomeMessageTemporary] = useState(false);
  
  // Add game state
  const { streakDays, testScore, userLevel, totalPatients } = useGame();
  
  // Get both exam and study activities
  const { activities: examActivities, loading: examLoading, fetchExamActivities } = useExamActivities();
  const { activities: studyActivities, loading: studyLoading, refetch: refetchStudyActivities } = useAllCalendarActivities();
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  
  // Get current theme
  const currentTheme = useTheme();
  
  // Get theme-specific styles
  const getThemeStyles = () => {
    switch(currentTheme) {
      case 'sakuraTrees':
        return {
          botBubbleBg: 'rgba(251, 240, 248, 0.85)',
          userBubbleBg: 'rgba(196, 122, 155, 0.85)',
          overlayBg: 'rgba(250, 238, 244, 0.3)',
          inputBg: 'rgba(251, 240, 248, 0.6)'
        };
      case 'sunsetCity':
        return {
          botBubbleBg: 'rgba(36, 23, 58, 0.85)',
          userBubbleBg: 'rgba(255, 99, 71, 0.85)',
          overlayBg: 'rgba(36, 23, 58, 0.3)',
          inputBg: 'rgba(36, 23, 58, 0.6)'
        };
      case 'mykonosBlue':
        return {
          botBubbleBg: 'rgba(231, 250, 251, 0.85)',
          userBubbleBg: 'rgba(30, 129, 176, 0.85)',
          overlayBg: 'rgba(231, 250, 251, 0.3)',
          inputBg: 'rgba(231, 250, 251, 0.6)'
        };
      default:
        return {
          botBubbleBg: 'rgba(0, 18, 38, 0.85)',
          userBubbleBg: 'rgba(0, 122, 252, 0.85)',
          overlayBg: 'rgba(0, 18, 38, 0.3)',
          inputBg: 'rgba(0, 18, 38, 0.6)'
        };
    }
  };
  
  const themeStyles = getThemeStyles();
  
  /* ---- Refs --- */
  const cmdPressedRef = useRef(false);
  const cmdPressedTime = useRef<number | null>(null);
  const cmdReleaseTimer = useRef<NodeJS.Timeout | null>(null);
  const audio = useAudio();
  
  // Get user data from store to pass to the API
  const { userInfo } = useUser();
  const { isSubscribed } = useUser();
  
  // Prefetch welcome message as soon as the component mounts
  useEffect(() => {
    // Define keys once to ensure consistency
    const localStorageKey = `welcome-message-${userInfo?.userId || 'anonymous'}`;
    const lastApiCallTimeKey = `welcome-api-last-call-${userInfo?.userId || 'anonymous'}`;
    const prefetchKey = `prefetch-${userInfo?.userId || 'anonymous'}`;
    
    // Check if we already have a welcome message in state
    if (welcomeMessage && !isWelcomeMessageTemporary) {
      return;
    }
    
    // Only fetch once per session check
    if (sessionStorage.getItem(prefetchKey)) {
      return;
    }
    
    // Mark this fetch as attempted for this session
    sessionStorage.setItem(prefetchKey, 'true');
    
    const prefetchWelcomeMessage = async () => {
      // Wait for activities to load
      if (examLoading || studyLoading) {
        // Set a fallback message if we need to show something immediately
        const loadingMessage = `Hello ${userInfo?.firstName || 'there'}! I'm loading your recent activities...`;
        setWelcomeMessage(loadingMessage);
        setIsWelcomeMessageTemporary(true);  // Mark this message as temporary
        return;
      }

      // If we had a temporary message and now activities are loaded, update it
      if (isWelcomeMessageTemporary) {
        // Generate template welcome message with user context
        const gameState = {
          streakDays,
          testScore,
          userLevel,
          totalPatients
        };

        // Generate the welcome message using our template function
        const templateMessage = generateWelcomeMessage({
          userInfo,
          examActivities,
          studyActivities,
          gameState
        });
        
        // Use the template message
        setWelcomeMessage(templateMessage);
        setIsWelcomeMessageTemporary(false); // No longer temporary
        
        // Cache the message with timestamp for future use
        localStorage.setItem(localStorageKey, JSON.stringify({
          message: templateMessage,
          timestamp: Date.now()
        }));
        
        return;
      }

      // Generate template welcome message with user context
      const gameState = {
        streakDays,
        testScore,
        userLevel,
        totalPatients
      };

      // Generate the welcome message using our template function
      const templateMessage = generateWelcomeMessage({
        userInfo,
        examActivities,
        studyActivities,
        gameState
      });
      
      // Use the template message
      setWelcomeMessage(templateMessage);
      
      // Cache the message with timestamp for future use
      localStorage.setItem(localStorageKey, JSON.stringify({
        message: templateMessage,
        timestamp: Date.now()
      }));
    };
    
    prefetchWelcomeMessage();
    
    return () => {
      // Cleanup
    };
  }, [userInfo, welcomeMessage, examActivities, studyActivities, streakDays, testScore, userLevel, totalPatients, examLoading, studyLoading, isWelcomeMessageTemporary]);
  
  useEffect(() => {
    if (!isMounted) {
      setIsMounted(true);
    }
    
    // Hide welcome message after 10 seconds
    const welcomeTimer = setTimeout(() => {
      setWelcomeVisible(false);
    }, 10000);
    
    return () => clearTimeout(welcomeTimer);
  }, [isMounted]);
  
  useEffect(() => {
    if (chatbotRef) {
      chatbotRef.current = {
        sendMessage: (message: string, messageContext?: string) => {
          // Set the textarea value and simulate Enter press
          const textarea = document.querySelector('.rcb-chat-input-textarea');
          if (textarea instanceof HTMLTextAreaElement) {
            // Set value and trigger input event
            textarea.value = message;
            textarea.dispatchEvent(new Event('input', { bubbles: true }));
            
            // Create and dispatch Enter keydown event
            const enterEvent = new KeyboardEvent('keydown', {
              key: 'Enter',
              code: 'Enter',
              keyCode: 13,
              which: 13,
              bubbles: true,
              // Add the context as custom data
              ...(messageContext && { __context: messageContext })
            });
            
            // Focus the textarea and dispatch the event
            textarea.focus();
            setTimeout(() => {
              textarea.dispatchEvent(enterEvent);
            }, 100);
          }
        }
      };
    }
  }, [chatbotRef]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.key === 'Meta' || event.key === 'Control') && !event.repeat) {
        // Only set command pressed if no other keys are already pressed
        if (!cmdPressedRef.current) {
          cmdPressedRef.current = true;
          cmdPressedTime.current = Date.now();
        }
      } else if (cmdPressedRef.current) {
        // If any other key is pressed while Command is down, mark it as a combo
        // This prevents toggling audio when Command is used for shortcuts
        cmdPressedTime.current = null;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === 'Meta' || event.key === 'Control') {
        // Only toggle if it was a standalone Command press (not part of a combo)
        if (cmdPressedRef.current && cmdPressedTime.current) {
          const pressDuration = Date.now() - cmdPressedTime.current;
          if (pressDuration < 500) { // Only toggle if pressed for less than 500ms
            // Clear any existing timer to prevent multiple toggles
            if (cmdReleaseTimer.current) {
              clearTimeout(cmdReleaseTimer.current);
            }
            
            cmdReleaseTimer.current = setTimeout(() => {
              toggleAudio();
              cmdReleaseTimer.current = null;
            }, 50); // Small delay to ensure no other keys were pressed
          }
        }
        cmdPressedRef.current = false;
        cmdPressedTime.current = null;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (cmdReleaseTimer.current) {
        clearTimeout(cmdReleaseTimer.current);
      }
    };
  }, []);
  
  useEffect(() => {
    if (examActivities && studyActivities) {
      const examEvents = examActivities.map((activity) => {
        // Map exam titles to shorter display names
        let displayTitle = "EXAM";
        if (activity.activityTitle === "MCAT Exam") {
          displayTitle = "MCAT";
        } else if (activity.activityTitle.includes("Unscored Sample")) {
          displayTitle = "Unscored";
        } else if (activity.activityTitle.includes("Full Length Exam")) {
          const number = activity.activityTitle.match(/\d+/)?.[0];
          displayTitle = `FL${number}`;
        } else if (activity.activityTitle.includes("Sample Scored")) {
          displayTitle = "Scored";
        }

        return {
          id: activity.id,
          title: displayTitle,
          start: new Date(activity.scheduledDate),
          end: new Date(activity.scheduledDate),
          allDay: true,
          activityText: activity.activityText,
          hours: activity.hours,
          activityType: activity.activityType,
          resource: { 
            ...activity, 
            eventType: 'exam' as const,
            fullTitle: activity.activityTitle,
            activityText: activity.activityText,
            hours: activity.hours,
            activityType: activity.activityType,
            activityTitle: activity.activityTitle,
            status: activity.status
          }
        };
      });

      const studyEvents = studyActivities.map((activity) => ({
        id: activity.id,
        title: activity.activityTitle,
        start: new Date(activity.scheduledDate),
        end: new Date(activity.scheduledDate),
        allDay: true,
        activityText: activity.activityText,
        hours: activity.hours,
        activityType: activity.activityType,
        resource: { 
          ...activity, 
          eventType: 'study' as const,
          fullTitle: `${activity.activityTitle} (${activity.hours}h)`,
          activityText: activity.activityText,
          hours: activity.hours,
          activityType: activity.activityType,
          activityTitle: activity.activityTitle,
          status: activity.status
        }
      }));

      setCalendarEvents([...examEvents, ...studyEvents]);
    }
  }, [examActivities, studyActivities]);

  useEffect(() => {
    if (isCalendarModalOpen) {
      fetchExamActivities();
      refetchStudyActivities();
    }
  }, [isCalendarModalOpen, fetchExamActivities, refetchStudyActivities]);
  
  /* ---- Event Handlers ----- */
  const handleSendMessage = async (message: string, messageContext?: string) => {
    setIsLoading(true);
    setError(null);
    setIsBotResponding(true);
    
    // Create a comprehensive user context object
    const userProfileContext = {
      user: {
        id: userInfo?.userId || 'anonymous',
        name: userInfo?.firstName || 'User',
        subscription: isSubscribed ? 'premium' : 'free'
      },
      game: {
        level: userLevel || 'Beginner',
        streakDays: streakDays || 0,
        totalPatients: totalPatients || 0,
        testScore: testScore || 0,
        anki: {
          clinicStatus: 'PATIENT LEVEL', // Updated to use the string you mentioned for game status
          patientsPerDay: 20, // Replace with actual data from your state if available
          totalTreated: totalPatients || 0
        }
      },
      activities: {
        examCount: examActivities?.length || 0,
        studyCount: studyActivities?.length || 0,
        upcomingExam: examActivities?.length > 0 ? {
          title: examActivities[0].activityTitle,
          date: examActivities[0].scheduledDate
        } : null
      },
      preferences: {
        audio: audioEnabled
      }
    };
    
    // Combine any existing message context with our profile context
    const combinedContext = messageContext ? 
      messageContext + "\n\nUser Profile: " + JSON.stringify(userProfileContext) :
      "User Profile: " + JSON.stringify(userProfileContext);
      
    try {    
      const response = await fetch('/api/conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          threadId,
          context: combinedContext,
          generateAudio: audioEnabled,
          assistantId: 'asst_7jwxyFZEYOYZlduxQrnFLZl8'
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.threadId) {
        setThreadId(data.threadId);
      }
      
      if (audioEnabled && data.audio) {
        playAudio(data.audio);
      }
      
      // Check if this is the first response and tutorial hasn't been played
      if (isFirstResponse) {
        setIsFirstResponse(false);
        const tutorialPart4Played = localStorage.getItem("tutorialPart4Played");
        if (!tutorialPart4Played || tutorialPart4Played === "false") {
          window.dispatchEvent(new Event("startTutorialPart4"));
          localStorage.setItem("tutorialPart4Played", "true");
        }
      }
      
      setTimeout(() => {
        setIsBotResponding(false);
      }, 3000);
      
      return data.message || "I'm sorry, I couldn't process your request.";
    } catch (error) {
      console.error("Error:", error);
      setError(`An error occurred: ${error instanceof Error ? error.message : String(error)}`);
      setIsBotResponding(false);
      return "Sorry, there was an error processing your request. Please try again.";
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId === "schedule") {
      setIsCalendarModalOpen(true);
    } else if (tabId === "knowledge") {
      setIsTutorReportOpen(true);
    } else {
      const action = QUICK_ACTIONS.find(a => a.id === tabId);
      if (action && chatbotRef) {
        chatbotRef.current.sendMessage(action.prompt);
      }
    }
  };

  const handleCalendarNavigate = (date: Date) => {
    setCalendarDate(date);
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    // Optionally handle event selection
  };

  const handleEventUpdate = async () => {
    await fetchExamActivities();
    await refetchStudyActivities();
  };

  const playAudio = (audioBase64: string) => {
    setIsPlaying(true);
    
    // Use the voice channel instead of music channel
    audio.playVoice(audioBase64);
    
    // Set isPlaying to false after a short delay
    setTimeout(() => {
      setIsPlaying(false);
    }, 500);
  };

  const stopAudio = () => {
    setIsPlaying(false);
    audio.stopVoice();
  };

  const toggleAudio = () => {
    // Prevent rapid toggling by enforcing a minimum time between toggles
    const now = Date.now();
    const timeSinceLastToggle = now - lastToggleTime;
    
    // Only allow toggle if it's been at least 500ms since the last toggle
    if (timeSinceLastToggle < 500) {
      return;
    }
    
    setLastToggleTime(now);
    
    if (!audioEnabled) {
      audio.playSound('chatbot-open');
    }
    setAudioEnabled(!audioEnabled);
  };

  /* ---- ChatBot Settings ----- */
  const flow = {
    start: {
      message: async () => {
        // Define keys once to ensure consistency - same as in prefetch effect
        const localStorageKey = `welcome-message-${userInfo?.userId || 'anonymous'}`;
        const lastApiCallTimeKey = `welcome-api-last-call-${userInfo?.userId || 'anonymous'}`;
        
        // We already have the message from prefetching
        if (welcomeMessage) {
          return welcomeMessage;
        }
        
        // As a fallback, if somehow we don't have it yet
        
        // Check cache in localStorage first before making any API calls 
        const cachedData = localStorage.getItem(localStorageKey);
        
        if (cachedData) {
          try {
            const { message, timestamp } = JSON.parse(cachedData);
            const now = Date.now();
            const cacheAge = now - timestamp;
            const MAX_CACHE_AGE = 24 * 60 * 60 * 1000; // 24 hours - Match prefetch cache duration
            
            // Use cached message if it's not too old
            if (cacheAge < MAX_CACHE_AGE) {
              return message;
            }
          } catch (err) {
            // Silent error handling
          }
        }
        
        // Check rate limiting
        const lastApiCallTime = localStorage.getItem(lastApiCallTimeKey);
        if (lastApiCallTime) {
          const now = Date.now();
          const timeSinceLastCall = now - Number(lastApiCallTime);
          const MIN_API_CALL_INTERVAL = 10000; // 10 seconds - Match prefetch rate limit
          
          if (timeSinceLastCall < MIN_API_CALL_INTERVAL) {
            // Try to use cached message even if older
            if (cachedData) {
              try {
                const { message } = JSON.parse(cachedData);
                return message;
              } catch (err) {
                // Silent error - we'll use fallback below
              }
            }
            
            // Return a fallback message if no cache
            const fallbackMessage = "Meow there, I'm Kalypso! It's great to see you again. How can I help with your MCAT study today?";
            return fallbackMessage;
          }
        }
        
        // Making the API call directly without rate limiting check, since this is the fallback
        // Record API call time
        localStorage.setItem(lastApiCallTimeKey, Date.now().toString());
        
        setIsBotResponding(true);
        const fallbackFetchStartTime = Date.now();
        try {
          // Using a longer timeout since this is our last attempt
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout (longer than prefetch)
          
          const response = await fetch("/api/kalypso/welcome", {
            method: "GET", 
            cache: 'no-cache',
            headers: {
              'Cache-Control': 'max-age=300' // Cache for 5 minutes
            },
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            throw new Error(`Failed to fetch welcome message: ${response.status}`);
          }
          
          const data = await response.json();
          
          // Cache the successful response - SAME AS IN PREFETCH
          localStorage.setItem(localStorageKey, JSON.stringify({
            message: data.message,
            timestamp: Date.now()
          }));
          
          setIsBotResponding(false);
          return data.message;
        } catch (error) {
          setIsBotResponding(false);
          
          // Check for stale cache as last resort before using hardcoded fallback
          const staleCachedData = localStorage.getItem(localStorageKey);
          if (staleCachedData) {
            try {
              const { message } = JSON.parse(staleCachedData);
              return message;
            } catch (err) {
              // Silent error handling
            }
          }
          
          // Return a fallback message if the API call fails
          const fallbackMessage = "Meow there, I'm Kalypso! It's great to see you again. How can I help with your MCAT study today?";
          return fallbackMessage;
        }
      },
      path: "loop",
    },
    loop: {
      message: async (params: { userInput: string, messageContext?: string }) => {
        const response = await handleSendMessage(params.userInput, params.messageContext);
        return response;
      },
      path: "loop",
    },
  };

  const settings = {
    general: {
      embedded: true,
      showHeader: true,
      showFooter: false,
    },
    event: {
      rcbUserSubmitText: true,
      rcbPreInjectMessage: true,
      rcbPostInjectMessage: true,
    },
    chatWindow: {
      autoJumpToBottom: true,
    },
    chatInput: {
      enabledPlaceholderText: "Chat with Kalypso",
      color: "var(--theme-text-color)",
      blockSpam: true,
    },
    chatHistory: { 
      storageKey: "mcat_assistant_chat_history", 
      disabled: true,
      initialMessages: []
    },
    header: {
      showAvatar: false,
      title: (
        <div className="flex items-center justify-between w-full">
          <div className="flex text-[--theme-text-color] items-center gap-3">
            <div className="flex items-center">
              <button
                onClick={toggleAudio}
                className={cn(
                  "px-2 py-1 text-xs rounded-full transition-colors",
                  audioEnabled ? "text-[--theme-hover-color]" : "text-[--theme-text-color] hover:text-[--theme-hover-color]"
                )}
              >
                {audioEnabled ? "🔊" : "🔇"}
              </button>
              <span
                className="text-[9px] ml-1 text-[--theme-text-color]"
              >
                {audioEnabled ? "speak with the mic" : "toggle voice with 'cmd' key"}
              </span>
            </div>
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.id}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium transition-colors duration-300", 
                  "border border-[--theme-border-color]", 
                  activeTab === action.id 
                    ? "bg-[--theme-hover-color] text-[--theme-hover-text]"
                    : "bg-[rgba(255,255,255,0.1)] text-[--theme-text-color] hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text]"
                )}
                onClick={() => handleTabClick(action.id)}
              >
                {action.text}
              </button>
            ))}
          </div>
        </div>
      ),
    },
    notification: {
      disabled: true,
    },
    voice: {
      disabled: !audioEnabled,
      defaultToggledOn: true,
      language: "en-US",
      autoSendDisabled: false,
      autoSendPeriod: 3000,
      sendAsAudio: false,
      timeoutPeriod: 50000,
    },
    botBubble: {
      simStream: true,
      streamSpeed: audioEnabled ? 80 : 25,
    },
  };

  const styles: Styles = {
    chatWindowStyle: {
      display: "flex",
      flexDirection: "column" as const,
      height: "calc(100vh - 9rem)",
      width: "100%",
      backgroundColor: "transparent",
      position: "relative",
      zIndex: 1,
    },
    bodyStyle: {
      flexGrow: 1,
      overflowY: "auto" as const,
      backgroundColor: "transparent",
    },
    chatInputContainerStyle: {
      position: 'sticky',
      bottom: 0,
      backgroundColor: currentTheme === 'cyberSpace' ? 'rgba(0, 0, 0, 0.3)' :
                      currentTheme === 'sakuraTrees' ? 'rgba(251, 240, 248, 0.3)' :
                      currentTheme === 'sunsetCity' ? 'rgba(36, 23, 58, 0.3)' :
                      currentTheme === 'mykonosBlue' ? 'rgba(231, 250, 251, 0.3)' :
                      'rgba(0, 0, 0, 0.3)',
      backdropFilter: "blur(10px)",
      borderTop: `2px solid ${
        currentTheme === 'cyberSpace' ? 'rgba(59, 130, 246, 0.5)' :
        currentTheme === 'sakuraTrees' ? 'rgba(235, 128, 176, 0.5)' :
        currentTheme === 'sunsetCity' ? 'rgba(255, 99, 71, 0.5)' :
        currentTheme === 'mykonosBlue' ? 'rgba(76, 181, 230, 0.5)' :
        'var(--theme-border-color)'
      }`,
      padding: "1rem",
      width: "100%",
      zIndex: 2,
      boxShadow: currentTheme === 'cyberSpace' ? "0 -5px 15px -5px rgba(0, 123, 255, 0.2)" :
                currentTheme === 'sakuraTrees' ? "0 -5px 15px -5px rgba(255, 0, 89, 0.2)" :
                currentTheme === 'sunsetCity' ? "0 -5px 15px -5px rgba(255, 99, 71, 0.2)" :
                currentTheme === 'mykonosBlue' ? "0 -5px 15px -5px rgba(30, 129, 176, 0.2)" :
                "0 -5px 15px -5px rgba(0, 0, 0, 0.1)",
    },
    chatInputAreaStyle: {
      border: `1px solid ${
        currentTheme === 'cyberSpace' ? 'rgba(59, 130, 246, 0.7)' :
        currentTheme === 'sakuraTrees' ? 'rgba(235, 128, 176, 0.7)' :
        currentTheme === 'sunsetCity' ? 'rgba(255, 99, 71, 0.7)' :
        currentTheme === 'mykonosBlue' ? 'rgba(76, 181, 230, 0.7)' :
        'var(--theme-border-color)'
      }`,
      borderRadius: "12px",
      backgroundColor: currentTheme === 'cyberSpace' ? 'rgba(255, 255, 255, 0.1)' :
                     currentTheme === 'sakuraTrees' ? 'rgba(255, 255, 255, 0.2)' :
                     currentTheme === 'sunsetCity' ? 'rgba(255, 255, 255, 0.1)' :
                     currentTheme === 'mykonosBlue' ? 'rgba(255, 255, 255, 0.2)' :
                     'rgba(255, 255, 255, 0.1)',
      color: "var(--theme-text-color)",
      width: "100%",
      boxShadow: `0 0 10px 2px ${
        currentTheme === 'cyberSpace' ? 'rgba(0, 123, 255, 0.15)' :
        currentTheme === 'sakuraTrees' ? 'rgba(255, 0, 89, 0.15)' :
        currentTheme === 'sunsetCity' ? 'rgba(255, 99, 71, 0.15)' :
        currentTheme === 'mykonosBlue' ? 'rgba(30, 129, 176, 0.15)' :
        'rgba(0, 0, 0, 0.1)'
      }`,
      backdropFilter: "blur(5px)",
    },
    botBubbleStyle: {
      fontSize: "1rem",
      fontWeight: "500",
      fontFamily:
        "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
      color: "var(--theme-text-color)",
      backgroundColor: currentTheme === 'cyberSpace' ? 'rgba(0, 18, 38, 0.95)' :
                     currentTheme === 'sakuraTrees' ? 'rgba(251, 240, 248, 0.95)' :
                     currentTheme === 'sunsetCity' ? 'rgba(36, 23, 58, 0.95)' :
                     currentTheme === 'mykonosBlue' ? 'rgba(231, 250, 251, 0.95)' :
                     themeStyles.botBubbleBg,
      backdropFilter: "blur(10px)",
      // Add theme-specific glow (box-shadow) with enhanced intensity
      boxShadow: currentTheme === 'cyberSpace' ? "0 0 10px 4px rgba(0, 123, 255, 0.4), 0 2px 5px rgba(0, 0, 0, 0.1)" :
                currentTheme === 'sakuraTrees' ? "0 0 10px 4px rgba(255, 0, 89, 0.4), 0 2px 5px rgba(0, 0, 0, 0.1)" :
                currentTheme === 'sunsetCity' ? "0 0 14px 5px rgba(255, 99, 71, 0.4), 0 2px 5px rgba(0, 0, 0, 0.1)" :
                currentTheme === 'mykonosBlue' ? "0 0 10px 8px rgba(30, 129, 176, 0.4), 0 2px 5px rgba(0, 0, 0, 0.1)" :
                "0 2px 5px rgba(0, 0, 0, 0.1)",
      borderRadius: "0.75rem 0.75rem 0.75rem 0.25rem",
      borderLeft: currentTheme === 'cyberSpace' ? "3px solid #3b82f6" :
                 currentTheme === 'sakuraTrees' ? "3px solid #eb80b0" :
                 currentTheme === 'sunsetCity' ? "3px solid #ff9baf" :
                 currentTheme === 'mykonosBlue' ? "3px solid #4cb5e6" :
                 "3px solid var(--theme-hover-color)",
    },
    userBubbleStyle: {
      fontSize: "1rem",
      fontWeight: "500",
      fontFamily:
        "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
      color: "white",
      backgroundColor: currentTheme === 'cyberSpace' ? 'rgba(0, 122, 252, 0.95)' :
                     currentTheme === 'sakuraTrees' ? 'rgba(196, 122, 155, 0.95)' :
                     currentTheme === 'sunsetCity' ? 'rgba(255, 99, 71, 0.95)' :
                     currentTheme === 'mykonosBlue' ? 'rgba(30, 129, 176, 0.95)' :
                     themeStyles.userBubbleBg,
      backdropFilter: "blur(10px)",
      // Add theme-specific glow (box-shadow) with enhanced intensity
      boxShadow: currentTheme === 'cyberSpace' ? "0 0 10px 4px rgba(0, 123, 255, 0.4), 0 2px 5px rgba(0, 0, 0, 0.1)" :
                currentTheme === 'sakuraTrees' ? "0 0 10px 4px rgba(255, 0, 89, 0.4), 0 2px 5px rgba(0, 0, 0, 0.1)" :
                currentTheme === 'sunsetCity' ? "0 0 14px 5px rgba(255, 99, 71, 0.4), 0 2px 5px rgba(0, 0, 0, 0.1)" :
                currentTheme === 'mykonosBlue' ? "0 0 10px 8px rgba(30, 129, 176, 0.4), 0 2px 5px rgba(0, 0, 0, 0.1)" :
                "0 2px 5px rgba(0, 0, 0, 0.1)",
      borderRadius: "0.75rem 0.75rem 0.25rem 0.75rem",
      borderRight: currentTheme === 'cyberSpace' ? "3px solid #007afc" :
                  currentTheme === 'sakuraTrees' ? "3px solid #b85475" :
                  currentTheme === 'sunsetCity' ? "3px solid #ff6347" :
                  currentTheme === 'mykonosBlue' ? "3px solid #1e81b0" :
                  "3px solid var(--theme-hover-color)",
      textAlign: "left",
    },
    headerStyle: {
      background: themeStyles.overlayBg, // Theme-specific header background
      backdropFilter: "blur(5px)",
      borderBottom: "1px solid var(--theme-border-color)",
      padding: "0.75rem 1rem",
    },
    chatHistoryButtonStyle: {
      fontSize: "0.5rem !important", 
    },
  };

  const themes = [{ id: "simple_blue", version: "0.1.0" }];

  /* ---- Render Methods ----- */
  if (!isMounted) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[--theme-text-color]" />
      </div>
    );
  }

  return (
    <div className={cn(
      `flex flex-col h-full rounded-lg overflow-hidden border theme-${currentTheme}-chat`,
      "shadow-lg",
      className
    )}
    style={{ 
      borderColor: 'var(--theme-border-color)',
      borderWidth: '1px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
    }}>
      {/* Chatbot container */}
      <div className="flex-1 relative">
        <DynamicChatBot
          settings={settings}
          styles={styles}
          themes={themes}
          flow={flow}
        />
        
        {/* Themed welcome banner - only show when not responding */}
        {!isBotResponding && welcomeVisible && (
          <div 
            className="absolute top-16 right-5 w-48 p-3 rounded-lg backdrop-blur-sm text-xs z-10 animate-slide-in"
            style={{ 
              backgroundColor: themeStyles.botBubbleBg,
              borderLeft: `3px solid var(--theme-hover-color)`,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
            }}>
            <p className="mb-2 font-medium">Welcome to your {currentTheme === 'mykonosBlue' ? 'Mykonos retreat' 
                                            : currentTheme === 'sakuraTrees' ? 'Sakura garden'
                                            : currentTheme === 'sunsetCity' ? 'Sunset city'
                                            : 'Cyber space'}</p>
            <p>Ask Kalypso about your MCAT study plan, or try scheduling a new task.</p>
          </div>
        )}
      </div>

      {/* Audio control indicator */}
      {isPlaying && audioEnabled && (
        <div className="absolute bottom-4 right-4 bg-[--theme-doctorsoffice-accent] text-white px-3 py-1 rounded-full text-xs flex items-center gap-2 backdrop-blur-sm">
          <span className="animate-pulse">🔊</span>
          <button onClick={stopAudio} className="hover:underline">Stop Audio</button>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="p-4 bg-red-500 bg-opacity-10 border border-red-500 text-red-500 rounded-lg m-4 backdrop-blur-sm">
          {error}
        </div>
      )}

      {/* Calendar Modal */}
      {isCalendarModalOpen && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsCalendarModalOpen(false);
            }
          }}
        >
          <div className="w-[90vw] max-w-6xl h-full bg-transparent rounded-xl overflow-hidden">
            <div className="p-4 h-full overflow-auto">
              {(examLoading || studyLoading) ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[--theme-text-color]" />
                </div>
              ) : (
                <div className="h-full flex flex-col min-h-[500px]">
                  <TestCalendar
                    events={calendarEvents}
                    date={calendarDate}
                    onNavigate={handleCalendarNavigate}
                    onSelectEvent={handleSelectEvent}
                    chatbotRef={chatbotRef}
                    onEventUpdate={handleEventUpdate}
                    buttonLabels={{
                      generate: "Generate Tasks",
                      hideSummarize: true
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tutor Report Modal
      {isTutorReportOpen && (
        <TutorReportModal onClose={() => setIsTutorReportOpen(false)} />
      )} */}
    </div>
  );
};

export default ChatContainer; 