"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { Styles } from "react-chatbotify";
import Image from "next/image";
import { useAudio } from "@/store/selectors";

const DynamicChatBot = dynamic(() => import("react-chatbotify"), {
  ssr: false,
});

interface ChatBotProps {
  chatbotContext?: {
    contentTitle: string;
    context: string;
  } | null
  width?: string | number;
  height?: string | number;
  backgroundColor?: string;
  avatar?: string;
  chatbotRef?: React.MutableRefObject<{
    sendMessage: (message: string, messageContext?: string) => void;
  }>;
}

const ChatBot: React.FC<ChatBotProps> = ({
  chatbotContext,
  width = "100%",
  height = "100%",
  backgroundColor = "transparent",
  avatar,
  chatbotRef,
}) => {
  const audio = useAudio();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const context = chatbotContext?.context;
  const contentTitle = chatbotContext?.contentTitle;
  const [isFirstResponse, setIsFirstResponse] = useState(true);
  const [cmdPressed, setCmdPressed] = useState(false);
  const cmdPressedRef = useRef(false);
  const cmdPressedTime = useRef<number | null>(null);
  const cmdReleaseTimer = useRef<NodeJS.Timeout | null>(null);
  const [lastToggleTime, setLastToggleTime] = useState<number>(0);
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Shortcut button actions
  const shortcuts = [
    { emoji: "📅", prompt: "What's on my schedule today?", tooltip: "Schedule" },
    { emoji: "📊", prompt: "Show me my tutor's last report", tooltip: "Report" },
    { emoji: "❓", prompt: "Give me a practice question", tooltip: "Question" },
    { emoji: "💪", prompt: "Help me stay motivated with my MCAT prep", tooltip: "Motivation" }
  ];

  const handleShortcutClick = (prompt: string) => {
    const textarea = document.querySelector('.rcb-chat-input-textarea');
    if (textarea instanceof HTMLTextAreaElement) {
      textarea.value = prompt;
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      
      const enterEvent = new KeyboardEvent('keydown', {
        key: 'Enter',
        code: 'Enter',
        keyCode: 13,
        which: 13,
        bubbles: true,
      });
      
      textarea.focus();
      setTimeout(() => {
        textarea.dispatchEvent(enterEvent);
      }, 100);
    }
  };

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
  }, []);

  useEffect(() => {
    if (!isMounted) {
      setIsMounted(true);

      const timer = setTimeout(() => {
        const botMessage = "Howdy";
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
    const handleKeyDown = (event: KeyboardEvent) => {
      console.log('[ChatBot] KeyDown:', event.key, 'repeat:', event.repeat, 'cmdPressedRef:', cmdPressedRef.current);
      if ((event.key === 'Meta' || event.key === 'Control') && !event.repeat) {
        // Only set command pressed if no other keys are already pressed
        if (!cmdPressedRef.current) {
          console.log('[ChatBot] Setting cmdPressedRef to true');
          cmdPressedRef.current = true;
          cmdPressedTime.current = Date.now();
          setCmdPressed(true);
        }
      } else if (cmdPressedRef.current) {
        // If any other key is pressed while Command is down, mark it as a combo
        // This prevents toggling audio when Command is used for shortcuts like Cmd+Tab
        console.log('[ChatBot] Combo detected, clearing cmdPressedTime');
        cmdPressedTime.current = null;
        
        // Also clear the cmd pressed state immediately for common system shortcuts
        if (event.key === 'Tab' || event.key === 'c' || event.key === 'v' || event.key === 'x' || event.key === 'z') {
          cmdPressedRef.current = false;
          setCmdPressed(false);
        }
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      console.log('[ChatBot] KeyUp:', event.key, 'cmdPressedRef:', cmdPressedRef.current, 'cmdPressedTime:', cmdPressedTime.current);
      if (event.key === 'Meta' || event.key === 'Control') {
        // Only toggle if it was a standalone Command press (not part of a combo)
        if (cmdPressedRef.current && cmdPressedTime.current) {
          const pressDuration = Date.now() - cmdPressedTime.current;
          console.log('[ChatBot] Command press duration:', pressDuration, 'ms');
          if (pressDuration < 500) { // Only toggle if pressed for less than 500ms
            // Clear any existing timer to prevent multiple toggles
            if (cmdReleaseTimer.current) {
              clearTimeout(cmdReleaseTimer.current);
            }
            
            console.log('[ChatBot] Setting up toggleAudio timer');
            cmdReleaseTimer.current = setTimeout(() => {
              console.log('[ChatBot] Executing toggleAudio from timer');
              toggleAudio();
              cmdReleaseTimer.current = null;
            }, 50); // Small delay to ensure no other keys were pressed
          }
        }
        cmdPressedRef.current = false;
        cmdPressedTime.current = null;
        setCmdPressed(false);
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

  // Show shortcuts after initial mount and first message
  useEffect(() => {
    if (isMounted) {
      // Show shortcuts after a short delay to ensure chat is ready
      const timer = setTimeout(() => {
        setShowShortcuts(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isMounted]);

  const sendMessage = async (message: string, messageContext?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          context: messageContext || context,
          threadId,
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

      return data.message;
    } catch (error) {
      console.error("Error:", error);
      setError(
        `An error occurred: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const playAudio = (audioBase64: string) => {
    console.log('[ChatBot] Playing audio from base64');
    
    // Use the dedicated voice playback method
    setIsPlaying(true);
    audio.playVoice(audioBase64)
      .catch((error: Error) => {
        console.error('[ChatBot] Error playing voice audio:', error);
      })
      .finally(() => {
        // Voice playback automatically cleans up when done
        setTimeout(() => {
          setIsPlaying(false);
        }, 500);
      });
  };

  const stopAudio = () => {
    console.log('[ChatBot] Stopping audio');
    setIsPlaying(false);
    audio.stopVoice();
  };

  const toggleAudio = () => {
    // Prevent rapid toggling by enforcing a minimum time between toggles
    const now = Date.now();
    const timeSinceLastToggle = now - lastToggleTime;
    
    console.log('[ChatBot] toggleAudio called, time since last toggle:', timeSinceLastToggle, 'ms');
    
    // Only allow toggle if it's been at least 500ms since the last toggle
    if (timeSinceLastToggle < 500) {
      console.log('[ChatBot] Ignoring toggle, too soon after last toggle');
      return;
    }
    
    setLastToggleTime(now);
    
    if (!audioEnabled) {
      console.log('[ChatBot] Enabling audio and playing sound');
      audio.playSound('chatbot-open');
    } else {
      console.log('[ChatBot] Disabling audio');
    }
    setAudioEnabled(!audioEnabled);
  };

  const flow = {
    start: {
      message: "Meow there! I'm Kalypso. I can answer questions about your studying or content.",
      path: "loop",
    },
    loop: {
      message: async (params: { userInput: string, messageContext?: string }) => {
        const response = await sendMessage(params.userInput, params.messageContext);
        return response || "I'm sorry, I couldn't process your request. Please try again.";
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
          <div
            style={{
              cursor: "pointer",
              margin: 0,
              fontSize: 10,
              fontWeight: "",
            }}
            onClick={() =>
              window.open("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
            }
          ></div>
          <div className="flex text-[--theme-text-color] items-center">
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
      height: "calc(100vh - 11.8rem)",
      width: "100%",
      backgroundColor: backgroundColor,
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
      backgroundColor: backgroundColor,
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
      backgroundColor: "#0d85ff",
      textAlign: "left",
    },
    headerStyle: {
      background: "transparent",
      height: "0rem",
      border: "transparent",
    },
    chatHistoryButtonStyle: {
      fontSize: "0.5rem !important", 
    },
  };

  const themes = [{ id: "simple_blue", version: "0.1.0" }];

  if (!isMounted) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[--theme-text-color]" />
      </div>
    );
  }

  return (
    <div
      className="w-full rounded-lg shadow-lg overflow-hidden flex flex-col relative"
      style={{
        boxShadow: "var(--theme-box-shadow)",
        border: "1px solid var(--theme-border-color)",
        width: width,
        height: height,
        backgroundColor: backgroundColor,
      }}
    >
      {avatar && (
        <div
          style={{
            position: "absolute",
            top: "0.625rem",
            right: "0.625rem",
            width: "4.375rem",
            height: "4.375rem",
            overflow: "hidden",
            zIndex: 9999,
            borderRadius: "50%",
            backgroundColor: "var(--theme-doctorsoffice-accent)",
          }}
        >
          <Image
            src={avatar}
            alt="Kalypso"
            width={100}
            height={140}
            className="object-cover object-[top_center]"
            style={{ transform: "scale(2)", transformOrigin: "top center" }}
          />
        </div>
      )}
      <div className="flex-1 relative w-full" style={{ overflow: 'auto' }}>
        <DynamicChatBot
          settings={{
            ...settings,
            chatWindow: {
              ...settings.chatWindow,
              autoJumpToBottom: true,
            }
          }}
          styles={styles}
          themes={themes}
          flow={flow}
        />
        {/* Shortcut buttons positioned below last bot message */}
        {showShortcuts && (
          <div 
            className="absolute z-10 pointer-events-none"
            style={{
              bottom: '120px', // Position above input area
              left: '20px',
              right: '20px',
            }}
          >
            <div className="flex gap-2 justify-start pointer-events-auto">
              {shortcuts.map((shortcut, index) => (
                <button
                  key={index}
                  onClick={() => handleShortcutClick(shortcut.prompt)}
                  className="w-8 h-8 rounded-full bg-[--theme-leaguecard-color] hover:bg-[--theme-hover-color] border border-[--theme-border-color] flex items-center justify-center text-sm transition-all duration-200 hover:scale-110 shadow-md"
                  title={shortcut.tooltip}
                  style={{ 
                    backdropFilter: 'blur(10px)',
                    backgroundColor: 'rgba(var(--theme-leaguecard-color-rgb, 255, 255, 255), 0.9)'
                  }}
                >
                  {shortcut.emoji}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {isPlaying && audioEnabled && (
        <button onClick={stopAudio}>Stop Audio</button>
      )}
    </div>
  );
};

export default ChatBot;
