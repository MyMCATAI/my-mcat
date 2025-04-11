"use client"

import React, { useState, useEffect, useRef, useContext, useCallback } from "react";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { useAudio, useTheme, useUser, useUI, useGame, useKnowledge } from '@/store/selectors';
import { useAllCalendarActivities } from "@/hooks/useCalendarActivities";
import { useExamActivities, FetchedActivity } from "@/hooks/useCalendarActivities";
import TestCalendar from '@/components/calendar/TestCalendar';
import type { CalendarEvent } from "@/types/calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "@/components/styles/CustomCalendar.css";
import UserContextPanel from "./UserContextPanel";
import { 
  generateKnowledgeSummary, 
  generateUserContext, 
  checkAndGenerateWelcomeMessage,
  formatWelcomeMessage,
  getTimeGreeting,
  getTodaysStudyActivities,
  getUpcomingExamActivities,
  getUpcomingWeekActivities,
  createFirstPersonContext
} from "@/components/chatgpt/AIUtils";
import {
  setupCommandKeyToggleHandler,
  setupTextareaEnterHandler
} from "@/components/chatgpt/KeyboardUtils";
import {
  createDebouncedAudioToggle,
  createVoiceAudioHandlers
} from "@/components/chatgpt/AudioUtils";
import {
  processExamActivities,
  processStudyActivities,
  combineCalendarEvents,
} from "@/components/chatgpt/CalendarUtils";
import {
  generateChatbotFlow,
  generateChatbotSettings,
  generateChatbotStyles
} from "@/components/chatgpt/ChatbotConfig";
import {
  createContextLogObject,
  logDebugData
} from "@/components/chatgpt/DebugUtils";
import PromptSuggestions from "@/components/chatgpt/PromptSuggestions";

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
  activities?: FetchedActivity[];
  containerProps?: React.HTMLAttributes<HTMLDivElement>;
}

const ChatContainer = ({ className, chatbotRef, activities, containerProps }: ChatContainerProps) => {
  /* ---- State ----- */
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [isFirstResponse, setIsFirstResponse] = useState(true);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());
  const [isBotResponding, setIsBotResponding] = useState(false);
  const [welcomeVisible, setWelcomeVisible] = useState(true); // Always true - welcome message is permanently visible
  const [welcomeMessage, setWelcomeMessage] = useState<string | null>(null);
  const [isTutorReportOpen, setIsTutorReportOpen] = useState(false);
  const [isWelcomeMessageTemporary, setIsWelcomeMessageTemporary] = useState(false);
  const [messageCount, setMessageCount] = useState(0); // Track number of messages
  
  // Add game state
  const { streakDays, testScore, userLevel, totalPatients } = useGame();
  
  // Get both exam and study activities
  const { activities: examActivities, loading: examLoading, fetchExamActivities } = useExamActivities();
  const { activities: studyActivities, loading: studyLoading, refetch: refetchStudyActivities } = useAllCalendarActivities();
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  
  // Get current theme
  const currentTheme = useTheme();
  
  /* ---- Refs --- */
  const audio = useAudio();
  
  // Get user data from store to pass to the API
  const { userInfo } = useUser();
  const { isSubscribed } = useUser();
  
  // Get knowledge profile data
  const { 
    weakestConcepts, 
    sectionSummaries, 
    overallMastery,
    isLoading: knowledgeLoading, 
    fetchKnowledgeProfiles,
    checkAndUpdateKnowledgeProfiles
  } = useKnowledge();
  
  // Create audio handlers using utility functions
  const audioHandlers = createVoiceAudioHandlers(audio);
  
  // Create debounced audio toggle
  const toggleAudio = createDebouncedAudioToggle(
    (newState) => {
      if (!audioEnabled) {
        audio.playSound('chatbot-open');
      }
      setAudioEnabled(newState);
    },
    audioEnabled,
    500
  );
  
  // Setup command key handler for audio toggling
  useEffect(() => {
    const cmdKeyHandler = setupCommandKeyToggleHandler(toggleAudio);
    // Setup listeners and get cleanup function
    const cleanup = cmdKeyHandler.setupListeners();
    // Return cleanup to remove listeners when component unmounts
    return cleanup;
  }, [toggleAudio]);
  
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
    
    // Only fetch once per session check - but only if we have a non-temporary message
    if (!isWelcomeMessageTemporary && sessionStorage.getItem(prefetchKey)) {
      return;
    }
    
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
      if (isWelcomeMessageTemporary || !welcomeMessage) {
        try {
          // Create context data for welcome message using our first-person context
          const firstPersonContext = createFirstPersonContext(
            userInfo,
            isSubscribed,
            {
              userLevel,
              streakDays,
              totalPatients,
              testScore
            },
            {
              weakestConcepts,
              sectionSummaries,
              overallMastery
            },
            {
              examActivities,
              studyActivities
            },
            {
              audioEnabled
            }
          );
          
          // Create welcome context structured for the formatter
          const welcomeContext = {
            user: {
              userId: userInfo?.userId,
              firstName: userInfo?.firstName,
              subscription: isSubscribed ? 'Premium' : 'Free',
              hasFullProfile: !!userInfo?.onboardingInfo?.onboardingComplete
            },
            game: {
              level: userLevel,
              streakDays,
              totalPatients,
              testScore
            },
            knowledge: {
              overallMastery: overallMastery ? `${Math.round(overallMastery * 100)}%` : null,
              weakestConcepts: weakestConcepts?.slice(0, 3).map(concept => ({
                concept: concept.concept,
                section: concept.section,
                mastery: `${Math.round(concept.mastery * 100)}%`
              })),
              sectionSummaries: sectionSummaries?.map(section => ({
                name: section.section,
                mastery: `${Math.round(section.averageMastery * 100)}%`,
                conceptCount: section.totalConcepts
              }))
            },
            calendar: {
              totalExams: examActivities?.length || 0,
              totalStudyActivities: studyActivities?.length || 0,
              todaysActivities: getTodaysStudyActivities(studyActivities),
              upcomingExams: getUpcomingExamActivities(examActivities)
            },
            time: {
              greeting: getTimeGreeting(),
              hour: new Date().getHours(),
              isWeekend: [0, 6].includes(new Date().getDay()),
              isLateNight: new Date().getHours() >= 22 || new Date().getHours() <= 5
            }
          };
          
          // Use our context to generate a message
          const message = formatWelcomeMessage(welcomeContext);
          
          // Cache the message
          localStorage.setItem(localStorageKey, JSON.stringify({
            message,
            timestamp: Date.now()
          }));
          
          // Update state
          setWelcomeMessage(message);
          setIsWelcomeMessageTemporary(false);
          
          // Only now mark the prefetch as complete since we have a real message
          sessionStorage.setItem(prefetchKey, 'true');
        } catch (error) {
          console.error("[Welcome] Error generating welcome message:", error);
          
          // Use a fallback message in case of error
          const fallbackMessage = `Hello ${userInfo?.firstName || 'there'}! Welcome to MyMCAT.ai. How can I help you today?`;
          setWelcomeMessage(fallbackMessage);
          setIsWelcomeMessageTemporary(false);
          
          // Still mark prefetch as complete even with fallback
          sessionStorage.setItem(prefetchKey, 'true');
        }
      }
    };
    
    prefetchWelcomeMessage();
    
    return () => {
      // Cleanup
    };
  }, [
    userInfo, welcomeMessage, examActivities, studyActivities, 
    streakDays, testScore, userLevel, totalPatients, 
    examLoading, studyLoading, isWelcomeMessageTemporary,
    overallMastery, weakestConcepts, sectionSummaries
  ]);
  
  useEffect(() => {
    if (!isMounted) {
      setIsMounted(true);
    }
    
    // Welcome message will always be visible now
    setWelcomeVisible(true);
    
    // No need for a timer to hide the welcome message
    
    return () => {
      // Cleanup
    };
  }, [isMounted]);
  
  useEffect(() => {
    if (chatbotRef) {
      // Use textarea enter handler to set up message sending
      const textareaHandler = setupTextareaEnterHandler('.rcb-chat-input-textarea', (message, context) => {
        if (chatbotRef.current) {
          chatbotRef.current.sendMessage(message, context);
        }
      });
      
      chatbotRef.current = {
        sendMessage: textareaHandler.simulateEnterKeyPress
      };
    }
  }, [chatbotRef]);
  
  useEffect(() => {
    if (examActivities && studyActivities) {
      // Use calendar utils to process and combine activities
      const examEvents = processExamActivities(examActivities);
      const studyEvents = processStudyActivities(studyActivities);
      const combined = combineCalendarEvents(examEvents, studyEvents);
      
      setCalendarEvents(combined);
    }
  }, [examActivities, studyActivities]);

  useEffect(() => {
    if (isCalendarModalOpen) {
      fetchExamActivities();
      refetchStudyActivities();
    }
  }, [isCalendarModalOpen, fetchExamActivities, refetchStudyActivities]);
  
  /* --- Animations & Effects --- */
  // Debug useEffect to log all available context
  useEffect(() => {
    // Use debug utils to create and log context
    const contextLogObject = createContextLogObject(
      userInfo,
      isSubscribed,
      {
        streakDays,
        testScore,
        userLevel,
        totalPatients
      },
      {
        weakestConcepts,
        sectionSummaries,
        overallMastery,
        isLoading: knowledgeLoading
      },
      {
        examActivities,
        studyActivities
      },
      {
        currentTheme,
        audioEnabled
      },
      {
        welcomeMessage,
        welcomeVisible,
        isWelcomeMessageTemporary
      }
    );
    
    // Create knowledge summary for logging
    const knowledgeSummary = generateKnowledgeSummary(
      weakestConcepts,
      sectionSummaries,
      overallMastery
    );
    
    // Log debug data
    logDebugData(
      contextLogObject,
      {
        examActivity: examActivities?.length ? examActivities[0] : undefined,
        studyActivity: studyActivities?.length ? studyActivities[0] : undefined,
        userInfo,
        weakestConcept: weakestConcepts?.length ? weakestConcepts[0] : undefined,
        sectionSummary: sectionSummaries?.length ? sectionSummaries[0] : undefined,
        knowledgeSummary: knowledgeSummary
      }
    );
  }, [
    userInfo, isSubscribed, streakDays, testScore, userLevel, totalPatients,
    examActivities, studyActivities, currentTheme, audioEnabled,
    welcomeMessage, welcomeVisible, isWelcomeMessageTemporary,
    weakestConcepts, sectionSummaries, overallMastery, knowledgeLoading
  ]);
  
  // Fetch knowledge profiles on mount and check if update is needed
  useEffect(() => {
    // First fetch current data
    fetchKnowledgeProfiles();
    
    // Then check if we need to update (only if we have a user ID)
    if (userInfo?.userId) {
      checkAndUpdateKnowledgeProfiles(userInfo.userId);
    }
  }, [fetchKnowledgeProfiles, checkAndUpdateKnowledgeProfiles, userInfo?.userId]);
  
  // Add detailed context logging for welcome message fabrication
  useEffect(() => {
    // Only log once we have all the data loaded
    if (!examLoading && !studyLoading && !knowledgeLoading && userInfo) {
      // Create context data for welcome message
      const welcomeContext = {
        user: {
          userId: userInfo?.userId,
          firstName: userInfo?.firstName,
          subscription: isSubscribed ? 'Premium' : 'Free',
          hasFullProfile: !!userInfo?.onboardingInfo?.onboardingComplete
        },
        game: {
          level: userLevel,
          streakDays,
          totalPatients,
          testScore
        },
        knowledge: {
          overallMastery: overallMastery ? `${Math.round(overallMastery * 100)}%` : null,
          weakestConcepts: weakestConcepts?.slice(0, 3).map(concept => ({
            concept: concept.concept,
            section: concept.section,
            mastery: `${Math.round(concept.mastery * 100)}%`
          })),
          sectionSummaries: sectionSummaries?.map(section => ({
            name: section.section,
            mastery: `${Math.round(section.averageMastery * 100)}%`,
            conceptCount: section.totalConcepts
          }))
        },
        calendar: {
          totalExams: examActivities?.length || 0,
          totalStudyActivities: studyActivities?.length || 0,
          todaysActivities: getTodaysStudyActivities(studyActivities),
          upcomingExams: getUpcomingExamActivities(examActivities),
          // Add the weekly activities for future use
          weeklyActivities: getUpcomingWeekActivities(studyActivities, examActivities)
        },
        time: {
          greeting: getTimeGreeting(),
          hour: new Date().getHours(),
          isWeekend: [0, 6].includes(new Date().getDay()),
          isLateNight: new Date().getHours() >= 22 || new Date().getHours() <= 5
        }
      };
      
      // Generate a sample welcome message
      const sampleMessage = formatWelcomeMessage(welcomeContext);
      
      // Create first-person context for comparison
      const firstPersonContext = createFirstPersonContext(
        userInfo,
        isSubscribed,
        {
          userLevel,
          streakDays,
          totalPatients,
          testScore
        },
        {
          weakestConcepts,
          sectionSummaries,
          overallMastery
        },
        {
          examActivities,
          studyActivities
        },
        {
          audioEnabled
        }
      );
      
    }
  }, [
    examActivities, studyActivities, userInfo, isSubscribed, 
    streakDays, testScore, userLevel, totalPatients,
    weakestConcepts, sectionSummaries, overallMastery,
    examLoading, studyLoading, knowledgeLoading, audioEnabled
  ]);
  
  // Add this effect to track messages in the chat window
  useEffect(() => {
    // Function to listen for DOM changes to detect new messages
    const observeMessages = () => {
      // Check for the chatbot container first
      const chatContainer = document.querySelector('.rcb-chat-container');
      if (!chatContainer) return;
      
      // Setup observer to watch for changes in the message container
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            // Count the user messages
            const userMessages = document.querySelectorAll('.rcb-message-container .rcb-message-bubble.rcb-message-bubble-user');
            // Update message count based on UI rather than our own counter
            setMessageCount(userMessages.length);
          }
        });
      });
      
      // Start observing the container for DOM changes
      const messagesContainer = chatContainer.querySelector('.rcb-chat-messages');
      if (messagesContainer) {
        observer.observe(messagesContainer, { childList: true, subtree: true });
      }
      
      // Return cleanup function
      return () => {
        observer.disconnect();
      };
    };
    
    // Start observing once mounted
    if (isMounted) {
      // Wait a bit for the chat to initialize
      const timer = setTimeout(observeMessages, 1000);
      return () => clearTimeout(timer);
    }
  }, [isMounted]);
  
  /* ---- Event Handlers ----- */
  const handleSendMessage = async (message: string, messageContext?: string) => {
    // Increment message count when a message is sent
    setMessageCount(prev => prev + 1);
    
    setIsLoading(true);
    setError(null);
    setIsBotResponding(true);
    
    // Generate a first-person narrative context for the AI
    const firstPersonContext = createFirstPersonContext(
      userInfo,
      isSubscribed,
      {
        userLevel,
        streakDays,
        totalPatients,
        testScore
      },
      {
        weakestConcepts,
        sectionSummaries,
        overallMastery
      },
      {
        examActivities,
        studyActivities
      },
      {
        audioEnabled
      }
    );
    
    // Combine any existing message context with our first-person context
    const combinedContext = messageContext ? 
      `${messageContext}\n\n===== USER CONTEXT =====\nThe following is a first-person description of my current status, schedule, knowledge profile, and preferences. Use this information to personalize your responses and provide relevant advice about my MCAT studies.\n\n${firstPersonContext}\n===== END USER CONTEXT =====` :
      `===== USER CONTEXT =====\nThe following is a first-person description of my current status, schedule, knowledge profile, and preferences. Use this information to personalize your responses and provide relevant advice about my MCAT studies.\n\n${firstPersonContext}\n===== END USER CONTEXT =====`;
      
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
        audioHandlers.playVoiceAudio(data.audio);
        setIsPlaying(true);
        
        // Set isPlaying to false after a short delay
        setTimeout(() => {
          setIsPlaying(false);
        }, 500);
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

  const stopAudio = () => {
    setIsPlaying(false);
    audioHandlers.stopVoiceAudio();
  };

  // Add a handler for prompt suggestions
  const handleSuggestionClick = (prompt: string) => {
    if (chatbotRef && chatbotRef.current) {
      chatbotRef.current.sendMessage(prompt);
    }
  };

  /* ---- ChatBot Settings ----- */
  // Use utility function to generate chatbot flow
  const flow = generateChatbotFlow(
    handleSendMessage,
    async () => {
      // If we already have the welcome message from prefetching
        if (welcomeMessage) {
          return welcomeMessage;
        }
        
      // If we have all the necessary data but somehow don't have a welcome message yet
      if (userInfo && !examLoading && !studyLoading && !knowledgeLoading) {
        // Create context data for welcome message
        const welcomeContext = {
          user: {
            userId: userInfo?.userId,
            firstName: userInfo?.firstName,
            subscription: isSubscribed ? 'Premium' : 'Free',
            hasFullProfile: !!userInfo?.onboardingInfo?.onboardingComplete
          },
          game: {
            level: userLevel,
            streakDays,
            totalPatients,
            testScore
          },
          knowledge: {
            overallMastery: overallMastery ? `${Math.round(overallMastery * 100)}%` : null,
            weakestConcepts: weakestConcepts?.slice(0, 3).map(concept => ({
              concept: concept.concept,
              section: concept.section,
              mastery: `${Math.round(concept.mastery * 100)}%`
            })),
            sectionSummaries: sectionSummaries?.map(section => ({
              name: section.section,
              mastery: `${Math.round(section.averageMastery * 100)}%`,
              conceptCount: section.totalConcepts
            }))
          },
          calendar: {
            totalExams: examActivities?.length || 0,
            totalStudyActivities: studyActivities?.length || 0,
            todaysActivities: getTodaysStudyActivities(studyActivities),
            upcomingExams: getUpcomingExamActivities(examActivities),
            weeklyActivities: getUpcomingWeekActivities(studyActivities, examActivities)
          },
          time: {
            greeting: getTimeGreeting(),
            hour: new Date().getHours(),
            isWeekend: [0, 6].includes(new Date().getDay()),
            isLateNight: new Date().getHours() >= 22 || new Date().getHours() <= 5
          }
        };
        
        // Use our utility function to format the welcome message
        return formatWelcomeMessage(welcomeContext);
      }
      
      // Fallback message
      return `Hello ${userInfo?.firstName || 'there'}! Welcome to MyMCAT.ai. How can I help you today?`;
    }
  );

  // Use utility function to generate chatbot settings
  const settings = generateChatbotSettings(
    audioEnabled,
    currentTheme,
    activeTab,
    QUICK_ACTIONS,
    handleTabClick,
    toggleAudio
  );

  // Use utility function to generate chatbot styles
  const styles = generateChatbotStyles(currentTheme);

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
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
      ...(containerProps?.style || {})
    }}
    {...containerProps}
    >
      {/* Chatbot container */}
      <div className="flex-1 relative">
        <DynamicChatBot
          settings={settings}
          styles={styles}
          themes={themes}
          flow={flow}
        />
        
        {/* User Context Panel for onboarding tasks */}
        <UserContextPanel activities={activities} />
        
        {/* Prompt Suggestions */}
        <PromptSuggestions 
          onSendMessage={handleSuggestionClick}
          messageCount={messageCount}
          currentTheme={currentTheme}
          className="absolute bottom-0 left-0 right-0 z-10"
        />
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

    </div>
  );
};

export default ChatContainer; 