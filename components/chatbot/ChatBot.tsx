"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { Styles } from "react-chatbotify";
import Image from "next/image";

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
    sendMessage: (message: string) => void;
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const context = chatbotContext?.context;
  const contentTitle = chatbotContext?.contentTitle;
  const [isFirstResponse, setIsFirstResponse] = useState(true);
  const [cmdPressed, setCmdPressed] = useState(false);
  const cmdPressedRef = useRef(false);
  const cmdPressedTime = useRef<number | null>(null);
  const cmdReleaseTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (chatbotRef) {
      chatbotRef.current = {
        sendMessage: (message: string) => {
          
          // Set the textarea value and simulate Enter press
          const textarea = document.querySelector('textarea');
          if (textarea) {
            // Set value
            textarea.value = message;
            
            // Create and dispatch Enter keydown event
            const enterEvent = new KeyboardEvent('keydown', {
              key: 'Enter',
              code: 'Enter',
              keyCode: 13,
              which: 13,
              bubbles: true
            });
            
            // Focus the textarea and dispatch the event
            textarea.focus();
            setTimeout(() => {
              textarea.dispatchEvent(enterEvent);
            }, 50);
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
      if (event.key === 'Meta' || event.key === 'Control') {
        if (!cmdPressedRef.current) {
          cmdPressedRef.current = true;
          cmdPressedTime.current = Date.now();
          setCmdPressed(true);
        }
      } else {
        cmdPressedRef.current = false;
        cmdPressedTime.current = null;
        setCmdPressed(false);
        if (cmdReleaseTimer.current) {
          clearTimeout(cmdReleaseTimer.current);
        }
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === 'Meta' || event.key === 'Control') {
        if (cmdPressedRef.current && cmdPressedTime.current) {
          const pressDuration = Date.now() - cmdPressedTime.current;
          if (pressDuration < 500) { // Only toggle if pressed for less than 500ms
            cmdReleaseTimer.current = setTimeout(() => {
              toggleAudio();
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

  const sendMessage = async (message: string) => {

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          context,
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
    const audioData = atob(audioBase64);
    const arrayBuffer = new ArrayBuffer(audioData.length);
    const view = new Uint8Array(arrayBuffer);
    for (let i = 0; i < audioData.length; i++) {
      view[i] = audioData.charCodeAt(i);
    }
    const audioBlob = new Blob([arrayBuffer], { type: "audio/mp3" });
    const audioUrl = URL.createObjectURL(audioBlob);

    if (audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.play();
    } else {
      const audioElement = new Audio(audioUrl);
      audioElement.onplay = () => setIsPlaying(true);
      audioElement.onended = () => setIsPlaying(false);
      audioElement.play();
      audioRef.current = audioElement;
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const toggleAudio = () => {
    setAudioEnabled((prev) => !prev);
  };

  const flow = {
    start: {
      message: "Meow there! I'm Kalypso. I can answer questions about your studying or content.",
      path: "loop",
    },
    loop: {
      message: async (params: { userInput: string }) => {
        const response = await sendMessage(params.userInput);
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
            layout="responsive"
            width={100}
            height={140}
            objectFit="cover"
            objectPosition="top center"
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
      </div>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {isPlaying && audioEnabled && (
        <button onClick={stopAudio}>Stop Audio</button>
      )}
    </div>
  );
};

export default ChatBot;
