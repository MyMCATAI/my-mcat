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
  onFocus?: () => void;
  onBlur?: () => void;
  mode?: 'gameReview' | 'hint' | 'questionReview';
}

const ChatBot: React.FC<ChatBotProps> = ({
  chatbotContext,
  width = "100%",
  height = "100%",
  backgroundColor = "transparent",
  avatar,
  chatbotRef,
  onFocus,
  onBlur,
  mode = 'gameReview',
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [isFirstResponse, setIsFirstResponse] = useState(true);
  const context = chatbotContext?.context ;
  const contentTitle = chatbotContext?.contentTitle;

  const userPrompts: { [key: string]: string } = {
    'hint': "Can you give me a hint about this question without directly revealing the answer?",
    'questionReview': "Can you explain why this is the correct answer?"
  };

  useEffect(() => {
    if (chatbotRef) {
      chatbotRef.current = {
        sendMessage: (message: string) => {
          // Set the textarea value and simulate Enter press
          const textarea = document.querySelector('.rcb-chat-input-textarea');
          if (textarea) {
            // Set value
            (textarea as HTMLTextAreaElement).value = message;
            
            // Create and dispatch Enter keydown event
            const enterEvent = new KeyboardEvent('keydown', {
              key: 'Enter',
              code: 'Enter',
              keyCode: 13,
              which: 13,
              bubbles: true
            });
            
            // Focus the textarea and dispatch the event
            (textarea as HTMLTextAreaElement).focus();
            setTimeout(() => {
              (textarea as HTMLTextAreaElement).dispatchEvent(enterEvent);
            }, 50);

          }
        }
      };
    }
  }, []);

  useEffect(() => {
    if (!isMounted) {
      setIsMounted(true);
    }
  }, [isMounted]);

  useEffect(() => {
    if (isMounted) {
      const timer = setTimeout(() => {
        const botMessage = getInitialMessage();
        window.dispatchEvent(
          new CustomEvent("chatbot-event", {
            detail: { message: botMessage },
          })
        );

        bindTextareaFocusAndBlur();
        // Send automatic message if mode has a corresponding prompt
        if (mode in userPrompts && chatbotRef?.current) {
          setTimeout(() => {
            chatbotRef.current.sendMessage(userPrompts[mode]);
          }, 500);
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isMounted]);

  const bindTextareaFocusAndBlur = () => {
    if (!onFocus || !onBlur) return;
    const textarea = document.querySelector('.rcb-chat-input-textarea');
    if (textarea) {
      textarea.addEventListener('focus', onFocus);
      textarea.addEventListener('blur', onBlur);
    }
  }

  useEffect(() => {
    setThreadId(null);
  }, [mode]);

  const getModifiedContext = (originalContext: string | undefined, mode: string) => {
    if (!originalContext) return "";
    
    switch (mode) {
      case 'hint':
        return `${originalContext}\n\nIMPORTANT INSTRUCTIONS: You are in hint mode. DO NOT reveal the correct answer under any circumstances, even if directly asked. Instead, provide helpful hints and guide the user to understand the concepts needed to solve this question. If asked for the answer, remind the user that you can only provide hints to help them arrive at the answer themselves.`;
      default:
        return originalContext;
    }
  };

  const sendMessage = async (message: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          context: getModifiedContext(context, mode),
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

  const getInitialMessage = () => {
    switch (mode) {
      case 'hint':
        return "Meow! I'm Kalypso. Need some help on this question?";
      case 'questionReview':
        return "Meow! I'm Kalypso. Want me to explain the correct answer?";
      case 'gameReview':
        return "Meow! I'm Kalypso. For videos and readings on your weaknesses, press the back button in the top left and click the hat in Needs Review. Otherwise, ask me anything!";
    }
  };

  const flow = {
    start: {
      message: getInitialMessage(),
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
      height: "100%",
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
    <div style={{ height: "100%" }} className="w-full flex flex-col h-full [&_.rcb-chatbot-global]:h-full [&_.rcb-window-embedded]:h-full [&_[id^='rcb-']]:h-full [&_[id^='rcb-']>div]:h-full [&_[style*='font-family']]:h-full [&_[style*='font-family']>div]:h-full">
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
      <div className="flex-1 h-full">
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
