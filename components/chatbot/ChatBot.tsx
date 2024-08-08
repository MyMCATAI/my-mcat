import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import ScreenshotButton from "@/components/chatbot/ScreenshotButton";
import FileUploadComponent from './fileUpload';

const ChatBot = dynamic(() => import('react-chatbotify'), { ssr: false });

interface MyChatBotProps {
  chatbotContext?: {
    contentTitle: string;
    context: string;
  };  
}

const MyChatBot: React.FC<MyChatBotProps> = ({ chatbotContext }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const context = chatbotContext?.context
  const contentTitle = chatbotContext?.contentTitle

  useEffect(() => {
    setIsMounted(true);

    // Set a timer to send a message after a certain time
    const timer = setTimeout(() => {
      const botMessage = "Howdy"; // The message you want the bot to send
      // This is where you can programmatically push the message to the chat
      window.dispatchEvent(new CustomEvent('chatbot-event', {
        detail: {
          message: botMessage,
        },
      }));
    }, 1000);

    return () => clearTimeout(timer); // Cleanup the timer on unmount
  }, []);

  const sendMessage = async (message: string) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Sending message:', message);
      const response = await fetch('/api/conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, context, threadId }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const contentType = response.headers.get("content-type");
      let data;
  
      if (contentType && contentType.indexOf("application/json") !== -1) {
        data = await response.json();
        console.log('Received JSON response:', data);
      } else {
        data = await response.text();
        console.log('Received text response:', data);
      }
  
      if (data.threadId) {
        setThreadId(data.threadId);
      }
  
      return typeof data === 'string' ? data : data.message;
    } catch (error) {
      console.error('Error:', error);
      setError(`An error occurred: ${error instanceof Error ? error.message : String(error)}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleScreenshot = (blob: Blob) => {
    console.log('Screenshot taken:', blob);
    // Add logic here to handle the screenshot
  };

  const flow = {
    start: {
      message: `Hi! I'm Kalypso the cat, your MCAT assistant. ${contentTitle ? `looks like you're working on ${contentTitle}`:""}. How can I help you today?`,
      path: "loop"
    },
    loop: {
      message: async (params: { userInput: string }) => {
        const response = await sendMessage(params.userInput);
        return response || "I'm sorry, I couldn't process your request. Please try again.";
      },
      path: "loop"
    }
  };

  const settings = {
    general: {
      embedded: true
    },
    chatHistory: {
      storageKey: "mcat_assistant_chat_history"
    },
    header: {
      showAvatar: false,
      title: (
        <div className="flex items-center justify-between w-full">
          <div 
            style={{cursor: "pointer", margin: 0, fontSize: 10, fontWeight: ""}} 
            onClick={() => window.open("https://www.youtube.com/watch?v=dQw4w9WgXcQ")}
          >
          </div>
          <ScreenshotButton onScreenshot={handleScreenshot} />
          <FileUploadComponent />
        </div>
      )
    },
    voice: {
      disabled: false,
      defaultToggledOn: false,
      language: "en-US",
      autoSendDisabled: false,
      autoSendPeriod: 1000,
      sendAsAudio: false,
    },
    botBubble: {
      simStream: true
    },
  };

  const themes = [
    {id: "simple_blue", version: "0.1.0"},
  ];

  if (!isMounted) {
    return null; // or a loading spinner
  }

  return (
    <div>
      <ChatBot
        settings={settings}
        themes={themes}
        flow={flow}
      />
      {/* {isLoading && <p>Loading...</p>} */}
      {error && <p style={{color: 'red'}}>{error}</p>}
    </div>
  );
};

const App: React.FC<MyChatBotProps> = ({ chatbotContext }) => {
  return (
    <div style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
      <MyChatBot chatbotContext={chatbotContext} />
    </div>
  );
};

export default App;
