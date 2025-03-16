"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { Styles } from "react-chatbotify";
import Image from "next/image";
import { useAudio } from "@/store/selectors";
import { useATSStore } from "@/store/slices/atsSlice";
import { KALYPSO_PROMPTS } from "@/store/slices/atsVariables";

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
  const { videoPause: ATSVideoPause } = useATSStore();
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
  const hasAskedAlphaCarbonQuestion = useRef(false);
  const isProcessingPauseRef = useRef(false);

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
      console.log("[DEBUG] ChatBot mounted, isMounted set to true");
    }
  }, [isMounted]);

  // Log component state on each render for debugging
  useEffect(() => {
    console.log("[DEBUG] Component state:", {
      isMounted,
      isLoading,
      hasAskedAlphaCarbonQuestion: hasAskedAlphaCarbonQuestion.current,
      isProcessingPause: isProcessingPauseRef.current,
      videoPause: ATSVideoPause,
      threadId,
      audioEnabled
    });
  });

  // Handle video pause to ask alpha carbon question
  useEffect(() => {
    console.log("[DEBUG] Video pause effect triggered. ATSVideoPause:", ATSVideoPause, 
      "hasAskedAlphaCarbonQuestion:", hasAskedAlphaCarbonQuestion.current,
      "isProcessingPause:", isProcessingPauseRef.current);
    
    if (ATSVideoPause && !hasAskedAlphaCarbonQuestion.current && !isProcessingPauseRef.current) {
      console.log("[DEBUG] Conditions met to ask alpha carbon question");
      
      // Set processing flag to prevent multiple triggers
      isProcessingPauseRef.current = true;
      console.log("[DEBUG] Set isProcessingPauseRef to true");
      
      // Play notification sound
      console.log("[DEBUG] Playing meow sound");
      audio.playSound('meow'); // Use 'meow' sound file
      
      // Wait a moment then add the alpha carbon question
      console.log("[DEBUG] Setting timeout for alpha carbon question");
      setTimeout(() => {
        console.log("[DEBUG] Timeout triggered, preparing to ask alpha carbon question");
        
        try {
          // Use the sendMessage API directly
          const botMessage = KALYPSO_PROMPTS.ALPHA_CARBON;
          console.log("[DEBUG] Alpha carbon question:", botMessage);
          
          // Add the message directly to the chat as a bot message
          console.log("[DEBUG] Calling sendBotMessage with alpha carbon question");
          sendBotMessage(botMessage);
          
          // Mark as asked
          hasAskedAlphaCarbonQuestion.current = true;
          console.log("[DEBUG] hasAskedAlphaCarbonQuestion set to true");
        } catch (error) {
          console.error("[DEBUG] Error sending alpha carbon question:", error);
        } finally {
          // Reset processing flag
          isProcessingPauseRef.current = false;
          console.log("[DEBUG] Reset isProcessingPauseRef to false");
        }
      }, 1000);
    } else {
      console.log("[DEBUG] Conditions NOT met to ask alpha carbon question. Reasons:", {
        videoPaused: ATSVideoPause,
        alreadyAsked: hasAskedAlphaCarbonQuestion.current,
        currentlyProcessing: isProcessingPauseRef.current
      });
    }
  }, [ATSVideoPause, audio]);

  // Add rcbAddMessage to window for bot messages
  useEffect(() => {
    // Define a function to add messages to the chat
    window.rcbAddMessage = (message: any) => {
      console.log("[DEBUG] rcbAddMessage called with:", message);
      
      try {
        // Find the chatbot instance
        const chatbot = document.querySelector('.rcb-chatbot');
        if (!chatbot) {
          console.error("[DEBUG] Chatbot element not found");
          console.error("[DEBUG] Available elements:", {
            body: document.body.innerHTML.substring(0, 200) + '...',
            chatbotParent: document.querySelector('.flex-1.relative.w-full')?.innerHTML.substring(0, 200) + '...'
          });
          return false;
        }
        
        console.log("[DEBUG] Chatbot element found");
        
        // Find the chat window
        const chatWindow = chatbot.querySelector('.rcb-chat-window');
        if (!chatWindow) {
          console.error("[DEBUG] Chat window not found");
          console.error("[DEBUG] Chatbot children:", Array.from(chatbot.children).map(child => child.className));
          
          // Try a more direct approach - find any element that might contain messages
          const possibleChatWindows = chatbot.querySelectorAll('div');
          console.log("[DEBUG] Possible chat windows found:", possibleChatWindows.length);
          
          if (possibleChatWindows.length > 0) {
            // Use the first div with some height that's not the header
            for (let i = 0; i < possibleChatWindows.length; i++) {
              const el = possibleChatWindows[i];
              const style = window.getComputedStyle(el);
              const isHeader = el.classList.contains('rcb-header');
              
              if (!isHeader && parseInt(style.height) > 50) {
                console.log("[DEBUG] Using alternative chat window:", el);
                
                // Create a new message element
                const messageEl = document.createElement('div');
                messageEl.className = message.type === 'bot' ? 'rcb-bot-bubble' : 'rcb-user-bubble';
                messageEl.textContent = message.message;
                messageEl.style.padding = '10px';
                messageEl.style.margin = '10px';
                messageEl.style.borderRadius = '8px';
                
                if (message.type === 'bot') {
                  messageEl.style.backgroundColor = 'var(--theme-botchatbox-color)';
                  messageEl.style.color = 'var(--theme-text-color)';
                } else {
                  messageEl.style.backgroundColor = '#0d85ff';
                  messageEl.style.color = 'white';
                }
                
                // Append the message
                el.appendChild(messageEl);
                
                // Scroll to bottom
                el.scrollTop = el.scrollHeight;
                console.log("[DEBUG] Message appended to alternative chat window");
                return true;
              }
            }
          }
          
          return false;
        }
        
        console.log("[DEBUG] Chat window found");
        
        // Create a new message element
        const messageEl = document.createElement('div');
        messageEl.className = message.type === 'bot' ? 'rcb-bot-bubble' : 'rcb-user-bubble';
        messageEl.textContent = message.message;
        console.log("[DEBUG] Created message element with class:", messageEl.className);
        
        // Add inline styles to ensure proper display
        messageEl.style.padding = '10px';
        messageEl.style.margin = '10px';
        messageEl.style.borderRadius = '8px';
        
        if (message.type === 'bot') {
          messageEl.style.backgroundColor = 'var(--theme-botchatbox-color)';
          messageEl.style.color = 'var(--theme-text-color)';
        } else {
          messageEl.style.backgroundColor = '#0d85ff';
          messageEl.style.color = 'white';
        }
        
        // Append the message
        chatWindow.appendChild(messageEl);
        console.log("[DEBUG] Message appended to chat window");
        
        // Scroll to bottom
        chatWindow.scrollTop = chatWindow.scrollHeight;
        console.log("[DEBUG] Scrolled to bottom of chat window");
        
        return true;
      } catch (error) {
        console.error("[DEBUG] Error in rcbAddMessage:", error);
        
        // Try a more direct approach as fallback
        try {
          // Find any element that might be the chat window
          const chatWindows = document.querySelectorAll('.rcb-chatbot div');
          for (let i = 0; i < chatWindows.length; i++) {
            const el = chatWindows[i];
            if (el.scrollHeight > 100) {
              // Create a new message element
              const messageEl = document.createElement('div');
              messageEl.textContent = message.message;
              messageEl.style.padding = '10px';
              messageEl.style.margin = '10px';
              messageEl.style.borderRadius = '8px';
              
              if (message.type === 'bot') {
                messageEl.style.backgroundColor = 'var(--theme-botchatbox-color)';
                messageEl.style.color = 'var(--theme-text-color)';
              } else {
                messageEl.style.backgroundColor = '#0d85ff';
                messageEl.style.color = 'white';
              }
              
              // Append the message
              el.appendChild(messageEl);
              
              // Scroll to bottom
              el.scrollTop = el.scrollHeight;
              console.log("[DEBUG] Message appended to fallback element");
              return true;
            }
          }
        } catch (fallbackError) {
          console.error("[DEBUG] Fallback approach also failed:", fallbackError);
        }
        
        return false;
      }
    };
    
    console.log("[DEBUG] rcbAddMessage function added to window");
    
    return () => {
      delete window.rcbAddMessage;
      console.log("[DEBUG] rcbAddMessage function removed from window");
    };
  }, []);

  // Function to directly inject a bot message into the DOM
  const injectBotMessageDirectly = (message: string) => {
    console.log("[DEBUG] Attempting to inject bot message directly:", message);
    
    try {
      // Find the first bot message to insert after
      const firstBotMessage = document.querySelector('.rcb-bot-bubble');
      if (firstBotMessage) {
        console.log("[DEBUG] Found first bot message to insert after");
        
        // Create a new message element
        const messageEl = document.createElement('div');
        messageEl.className = 'rcb-bot-bubble';
        messageEl.textContent = message;
        
        // Add inline styles to ensure proper display
        messageEl.style.padding = '10px';
        messageEl.style.margin = '10px';
        messageEl.style.borderRadius = '8px';
        messageEl.style.backgroundColor = 'var(--theme-botchatbox-color)';
        messageEl.style.color = 'var(--theme-text-color)';
        messageEl.style.maxWidth = '80%';
        messageEl.style.wordWrap = 'break-word';
        
        // Insert after the first bot message
        if (firstBotMessage.parentNode) {
          firstBotMessage.parentNode.insertBefore(messageEl, firstBotMessage.nextSibling);
          console.log("[DEBUG] Bot message inserted after first bot message");
          
          // Find the chat window to scroll
          const chatWindow = firstBotMessage.closest('.rcb-chat-window') || 
                            firstBotMessage.closest('.rcb-chatbot > div');
          
          if (chatWindow) {
            // Scroll to bottom
            chatWindow.scrollTop = chatWindow.scrollHeight;
            console.log("[DEBUG] Scrolled chat window to bottom");
          }
          
          return true;
        }
      }
      
      // Fallback: try to find the chat window directly
      console.log("[DEBUG] Fallback: searching for chat window directly");
      const chatbotContainer = document.querySelector('.flex-1.relative.w-full');
      if (!chatbotContainer) {
        console.error("[DEBUG] Chatbot container not found");
        return false;
      }
      
      // Find the chat window - try multiple selectors
      let chatWindow = chatbotContainer.querySelector('.rcb-chat-window');
      
      if (!chatWindow) {
        // Try to find any scrollable div that might be the chat window
        const divs = chatbotContainer.querySelectorAll('div');
        for (const div of divs) {
          if (div.scrollHeight > 100 && !div.classList.contains('rcb-header') && 
              !div.classList.contains('rcb-chat-input-container')) {
            chatWindow = div;
            break;
          }
        }
      }
      
      if (!chatWindow) {
        console.error("[DEBUG] Chat window not found for direct injection");
        return false;
      }
      
      // Create a new message element
      const messageEl = document.createElement('div');
      messageEl.className = 'rcb-bot-bubble';
      messageEl.textContent = message;
      
      // Add inline styles to ensure proper display
      messageEl.style.padding = '10px';
      messageEl.style.margin = '10px';
      messageEl.style.borderRadius = '8px';
      messageEl.style.backgroundColor = 'var(--theme-botchatbox-color)';
      messageEl.style.color = 'var(--theme-text-color)';
      messageEl.style.maxWidth = '80%';
      messageEl.style.wordWrap = 'break-word';
      
      // Find the input container to insert before
      const inputContainer = chatbotContainer.querySelector('.rcb-chat-input-container');
      
      if (inputContainer && inputContainer.parentNode === chatWindow) {
        // Insert before the input container
        chatWindow.insertBefore(messageEl, inputContainer);
        console.log("[DEBUG] Bot message inserted before input container");
      } else {
        // Append to the chat window
        chatWindow.appendChild(messageEl);
        console.log("[DEBUG] Bot message appended to chat window");
      }
      
      // Scroll to bottom
      chatWindow.scrollTop = chatWindow.scrollHeight;
      
      console.log("[DEBUG] Bot message directly injected into DOM");
      return true;
    } catch (error) {
      console.error("[DEBUG] Error injecting bot message directly:", error);
      return false;
    }
  };

  // Function to send a bot message directly to the API
  const sendBotMessage = async (message: string) => {
    console.log("[DEBUG] sendBotMessage called with:", message);
    
    try {
      console.log("[DEBUG] Preparing API request payload:", {
        message,
        context,
        threadId,
        generateAudio: audioEnabled,
        isBot: true
      });
      
      // First try to inject the message directly into the DOM
      const directInjectionResult = injectBotMessageDirectly(message);
      console.log("[DEBUG] Direct injection result:", directInjectionResult);
      
      const response = await fetch("/api/conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          context,
          threadId,
          generateAudio: audioEnabled,
          assistantId: 'asst_7jwxyFZEYOYZlduxQrnFLZl8',
          isBot: true // Flag to indicate this is a bot message
        }),
      });
      
      console.log("[DEBUG] API response status:", response.status);
      
      if (!response.ok) {
        console.error("[DEBUG] API request failed with status:", response.status);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("[DEBUG] Bot message API response data:", data);
      
      if (data.threadId) {
        setThreadId(data.threadId);
        console.log("[DEBUG] Thread ID set to:", data.threadId);
      }
      
      // If direct injection failed, try using the event system
      if (!directInjectionResult) {
        // Add the message to the chat UI
        console.log("[DEBUG] Creating bot message event");
        const botMessageEvent = new CustomEvent("rcb-bot-message", {
          detail: { 
            message: message,
            response: data.message || message
          }
        });
        
        console.log("[DEBUG] Dispatching bot message event");
        window.dispatchEvent(botMessageEvent);
        console.log("[DEBUG] Bot message event dispatched");
      }
      
      return data.message;
    } catch (error) {
      console.error("[DEBUG] Error sending bot message:", error);
      console.error("[DEBUG] Error details:", {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : 'No stack trace'
      });
      setError(`An error occurred: ${error instanceof Error ? error.message : String(error)}`);
      return null;
    }
  };

  // Add event listener for bot messages
  useEffect(() => {
    console.log("[DEBUG] Setting up rcb-bot-message listener");
    
    const handleBotMessage = (event: CustomEvent) => {
      console.log("[DEBUG] Bot message event received:", event.detail);
      
      // Get the message from the event
      const message = event.detail.response || event.detail.message;
      console.log("[DEBUG] Extracted message from event:", message);
      
      // Add the message to the flow
      const flowMessage = {
        message,
        type: 'bot'
      };
      
      // Update the flow to include this message
      console.log("[DEBUG] Adding bot message to flow:", flowMessage);
      
      // Use the flow system to add the message
      if (window.rcbAddMessage) {
        console.log("[DEBUG] rcbAddMessage function found, calling it");
        const result = window.rcbAddMessage(flowMessage);
        console.log("[DEBUG] rcbAddMessage result:", result);
      } else {
        console.error("[DEBUG] rcbAddMessage not available");
        console.error("[DEBUG] DOM state:", {
          chatbotExists: !!document.querySelector('.rcb-chatbot'),
          chatWindowExists: !!document.querySelector('.rcb-chat-window'),
          textareaExists: !!document.querySelector('.rcb-chat-input-textarea')
        });
      }
    };
    
    window.addEventListener("rcb-bot-message", handleBotMessage as EventListener);
    console.log("[DEBUG] rcb-bot-message listener added");
    
    return () => {
      window.removeEventListener("rcb-bot-message", handleBotMessage as EventListener);
      console.log("[DEBUG] rcb-bot-message listener removed");
    };
  }, []);

  // Add keyboard shortcut for testing
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Press Alt+Q to manually trigger the alpha carbon question
      if (event.altKey && event.key === 'q') {
        console.log("[DEBUG] Manual trigger (Alt+Q) for alpha carbon question");
        const botMessage = KALYPSO_PROMPTS.ALPHA_CARBON;
        sendBotMessage(botMessage);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Add command key handler for audio toggle
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
        // This prevents toggling audio when Command is used for shortcuts
        console.log('[ChatBot] Combo detected, clearing cmdPressedTime');
        cmdPressedTime.current = null;
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

  const sendMessage = async (message: string, messageContext?: string) => {
    console.log("[DEBUG] sendMessage called with:", { message, messageContext });
    setIsLoading(true);
    setError(null);
    try {
      console.log("[DEBUG] Sending POST request to /api/conversation");
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
        console.error("[DEBUG] API request failed:", response.status);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("[DEBUG] API response received:", data);

      if (data.threadId) {
        setThreadId(data.threadId);
        console.log("[DEBUG] Thread ID set:", data.threadId);
      }

      if (audioEnabled && data.audio) {
        console.log("[DEBUG] Playing audio response");
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
      console.error("[DEBUG] Error in sendMessage:", error);
      setError(
        `An error occurred: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      return null;
    } finally {
      setIsLoading(false);
      console.log("[DEBUG] sendMessage completed");
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
      message: KALYPSO_PROMPTS.INITIAL,
      path: "loop",
    },
    loop: {
      message: async (params: { userInput: string, messageContext?: string }) => {
        console.log("[DEBUG] Flow loop triggered with params:", params);
        const response = await sendMessage(params.userInput, params.messageContext);
        console.log("[DEBUG] Flow loop received response:", response);
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
      rcbBotMessage: true,
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
      disabled: true, // Disable chat history to remove the button
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
    console.log("[DEBUG] Component not mounted yet, showing loading spinner");
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[--theme-text-color]" />
      </div>
    );
  }

  console.log("[DEBUG] Rendering chatbot component");

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
      </div>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {isPlaying && audioEnabled && (
        <button onClick={stopAudio}>Stop Audio</button>
      )}
    </div>
  );
};

// Add rcbAddMessage to the Window interface
declare global {
  interface Window {
    rcbAddMessage?: (message: any) => boolean;
  }
}

export default ChatBot;
