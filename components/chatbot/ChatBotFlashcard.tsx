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
  const [isFirstResponse, setIsFirstResponse] = useState(true);
  const context = chatbotContext?.context;
  const contentTitle = chatbotContext?.contentTitle;

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

  const flow = {
    start: {
      message: "Meow! I'm Kalypso. For videos and readings on your weaknesses, press the back button in the top left and click the hat in Needs Review. Otherwise, ask me anything!",
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
        </div>
      ),
    },
    notification: {
      disabled: true,
    },
    voice: {
      disabled: true,
    },
    botBubble: {
      simStream: true,
      streamSpeed: 25,
    },
  };

  const styles: Styles = {
    chatWindowStyle: {
      display: "flex",
      flexDirection: "column" as const,
      height: "calc(100vh - 14rem)",
      width: "100%",
      backgroundColor: backgroundColor,
      position: "relative",
      zIndex: 1,
      boxShadow: "none",
    },
    bodyStyle: {
      flexGrow: 1,
      overflowY: "auto" as const,
    },
    chatInputContainerStyle: {
      position: 'sticky',
      bottom: 0,
      backgroundColor: backgroundColor,
      borderTop: "transparent",
      padding: "1rem",
      width: "100%",
      zIndex: 2,
    },
    chatInputAreaStyle: {
      border: "2px solid var(--theme-border-color)",
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
        <div className="animate-spin rounded-full h-8 w-8" />
      </div>
    );
  }

  return (
    <div
      className="w-full overflow-hidden flex flex-col relative"
      style={{
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
      </div>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default ChatBot;
