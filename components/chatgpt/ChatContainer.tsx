"use client"

import { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import { Styles } from "react-chatbotify";
import { useAudio } from '@/store/selectors';
import { useAllCalendarActivities } from "@/hooks/useCalendarActivities";
import { useExamActivities } from "@/hooks/useCalendarActivities";
import TestCalendar from '@/components/calendar/TestCalendar';
import { X } from "lucide-react";
import { CalendarEvent } from "@/types/calendar";
// Import required CSS for the calendar
import "react-big-calendar/lib/css/react-big-calendar.css";
import "@/components/styles/CustomCalendar.css";
import React from "react";

// Dynamically import the chatbot component
const DynamicChatBot = dynamic(() => import("react-chatbotify"), {
  ssr: false,
});

/* --- Constants ----- */
const QUICK_ACTIONS = [
  { id: "schedule", text: "Schedule", prompt: "What's my Schedule" },
  { id: "knowledge", text: "Knowledge Profile", prompt: "Show me my Knowledge Profile" }
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
  
  // Get both exam and study activities
  const { activities: examActivities, loading: examLoading, fetchExamActivities } = useExamActivities();
  const { activities: studyActivities, loading: studyLoading, refetch: refetchStudyActivities } = useAllCalendarActivities();
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  
  /* ---- Refs --- */
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const cmdPressedRef = useRef(false);
  const cmdPressedTime = useRef<number | null>(null);
  const cmdReleaseTimer = useRef<NodeJS.Timeout | null>(null);
  const { 
    playSound, 
    playVoice, 
    stopVoice,
    audioContext
  } = useAudio();

  /* --- Animations & Effects --- */
  useEffect(() => {
    if (!isMounted) {
      setIsMounted(true);

      const timer = setTimeout(() => {
        const botMessage = "Hello! I'm Kalypso AI, your medical education assistant. How can I help with your studies today?";
        window.dispatchEvent(
          new CustomEvent("chatbot-event", {
            detail: { message: botMessage },
          })
        );
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isMounted]);
  
  useEffect(() => {
    if (chatbotRef) {
      chatbotRef.current = {
        sendMessage: (message: string, messageContext?: string) => {
          // Set the textarea value and simulate Enter press
          const textarea = document.querySelector('.rcb-chat-input-textarea');
          if (textarea instanceof HTMLTextAreaElement) {
            // Set value and trigger input event
            textarea.value = message || '';
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
              if (textarea && textarea.value && textarea.value.trim()) {
                textarea.dispatchEvent(enterEvent);
              }
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
  
  /* ---- Memoized Values ---- */
  // Memoize the styles object to prevent recreation on every render
  const styles = React.useMemo<Styles>(() => ({
    chatWindowStyle: {
      display: "flex",
      flexDirection: "column" as const,
      height: "calc(100vh - 8rem)",
      width: "100%",
      backgroundColor: "var(--theme-leaguecard-color)",
      position: "relative",
      zIndex: 1,
    },
    bodyStyle: {
      flexGrow: 1,
      overflowY: "auto" as const,
    },
    chatInputContainerStyle: {
      position: 'sticky',
      bottom: 0,
      backgroundColor: "var(--theme-leaguecard-color)",
      borderTop: "1px solid var(--theme-border-color)",
      padding: "1rem",
      width: "100%",
      zIndex: 2,
    },
    chatInputAreaStyle: {
      border: "1px solid var(--theme-border-color)",
      borderRadius: "8px",
      backgroundColor: "transparent",
      color: "var(--theme-text-color)",
      width: "100%",
    },
    botBubbleStyle: {
      fontSize: ".9rem",
      fontFamily:
        "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
      color: "var(--theme-text-color)",
      backgroundColor: "var(--theme-botchatbox-color)",
    },
    userBubbleStyle: {
      fontSize: ".9rem",
      fontFamily:
        "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
      color: "white",
      backgroundColor: "var(--theme-userchatbox-color)",
      textAlign: "left",
    },
    headerStyle: {
      background: "transparent",
      borderBottom: "1px solid var(--theme-border-color)",
      padding: "0.75rem 1rem",
    },
    chatHistoryButtonStyle: {
      fontSize: "0.5rem !important", 
    },
  }), []); // Empty dependency array means this will only be created once

  // Memoize the themes array
  const themes = React.useMemo(() => [
    { id: "simple_blue", version: "0.1.0" }
  ], []);
  
  /* ---- Event Handlers ----- */
  const handleSendMessage = async (userInput: string, messageContext?: string) => {
    if (!userInput || !userInput.trim()) {
      return "Please enter a message to send.";
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Call the API
      const response = await fetch("/api/conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userInput,
          threadId,
          context: messageContext,
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
      
      return data.message || "I'm sorry, I couldn't process your request.";
    } catch (error) {
      console.error("Error:", error);
      setError(`An error occurred: ${error instanceof Error ? error.message : String(error)}`);
      return "Sorry, there was an error processing your request. Please try again.";
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId === "schedule") {
      setIsCalendarModalOpen(true);
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
    console.log('Selected event:', event);
  };

  const handleEventUpdate = async () => {
    await fetchExamActivities();
    await refetchStudyActivities();
  };

  const playAudio = (audioBase64: string) => {
    if (!audioBase64) {
      console.warn('No audio data provided to playAudio');
      return;
    }
    
    setIsPlaying(true);
    
    // Use the voice channel instead of music channel
    try {
      playVoice(audioBase64);
    } catch (error) {
      console.error('Error playing voice audio:', error);
      setIsPlaying(false);
    }
    
    // Set isPlaying to false after a short delay
    setTimeout(() => {
      setIsPlaying(false);
    }, 500);
  };

  const stopAudio = () => {
    setIsPlaying(false);
    stopVoice();
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
      try {
        playSound('chatbot-open');
      } catch (error) {
        console.error('Error playing sound:', error);
      }
    }
    
    setAudioEnabled(!audioEnabled);
  };

  /* ---- ChatBot Settings ----- */
  const flow = {
    start: {
      message: "Hello! I'm Kalypso AI, your medical education assistant. How can I help with your studies today?",
      path: "loop",
    },
    loop: {
      message: async (params: { userInput: string, messageContext?: string }) => {
        try {
          if (!params.userInput || !params.userInput.trim()) {
            return "Please enter a message.";
          }
          const response = await handleSendMessage(params.userInput, params.messageContext);
          return response;
        } catch (error) {
          console.error('Error in chatbot flow:', error);
          return "Sorry, there was an error processing your request. Please try again.";
        }
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
          <div className="text-[--theme-text-color]">
          </div>
          <div className="flex text-[--theme-text-color] items-center gap-3">
            <div className="flex items-center">
              <button
                onClick={toggleAudio}
                className="px-2 py-1 text-xs bg-transparent hover:bg-[--theme-hover-color] transition-colors"
                style={{
                  color: audioEnabled
                    ? "var(--theme-hover-color)"
                    : "var(--gray-600)",
                }}
              >
                {audioEnabled ? "🔊" : "🔇"}
              </button>
              <span
                className="text-[9px] ml-1"
                style={{ color: "var(--gray-600)" }}
              >
                {audioEnabled ? "speak with the mic" : "toggle voice with 'cmd' key"}
              </span>
            </div>
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.id}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium transition-colors duration-300", 
                  "bg-[--theme-leaguecard-color] text-[--theme-text-color] border border-[--theme-border-color]", 
                  "hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text]",
                  activeTab === action.id && "bg-[--theme-hover-color] text-[--theme-hover-text]"
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

  /* ---- Render Methods ----- */
  if (!isMounted) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[--theme-text-color]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full rounded-lg overflow-hidden border border-[--theme-border-color] bg-[--theme-leaguecard-color]">
      {/* Chatbot container */}
      <div className="flex-1 relative">
        <DynamicChatBot
          settings={settings}
          styles={styles}
          themes={themes}
          flow={flow}
        />
      </div>

      {/* Audio control indicator */}
      {isPlaying && audioEnabled && (
        <div className="absolute bottom-4 right-4 bg-[--theme-doctorsoffice-accent] text-white px-3 py-1 rounded-full text-xs flex items-center gap-2">
          <span className="animate-pulse">🔊</span>
          <button onClick={stopAudio} className="hover:underline">Stop Audio</button>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="p-4 bg-red-500 bg-opacity-10 border border-red-500 text-red-500 rounded-lg m-4">
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
          <div className="w-[90vw] max-w-6xl max-h-[90vh] bg-transparent rounded-xl overflow-hidden">
            <div className="p-4 h-[calc(90vh-4rem)] overflow-auto">
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
    </div>
  );
};

export default ChatContainer; 