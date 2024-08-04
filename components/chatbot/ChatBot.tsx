import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import ScreenshotButton from "@/components/chatbot/ScreenshotButton";
import FileUploadComponent from './fileUpload';

const ChatBot = dynamic(() => import('react-chatbotify'), { ssr: false });


const MyChatBot = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
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
        body: JSON.stringify({ message, threadId }),
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
  
      // Update the threadId if it's returned in JSON response
      if (data.threadId) {
        setThreadId(data.threadId);
      }
  
      // Return the message based on content type
      if (typeof data === 'string') {
        return data;
      } else {
        return data.message;
      }
    } catch (error) {
      console.error('Error:', error);
      setError(`An error occurred: ${error instanceof Error ? error.message : String(error)}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleScreenshot = (blob: Blob) => {
    // Handle the screenshot blob here
    console.log('Screenshot taken:', blob);
    // You can add logic here to send the screenshot to the server or process it as needed
  };

  const flow = {
    start: {
      message: "Hi! I'm Kalypso the cat, your MCAT assistant. How can I help you today?",
      path: "loop"
    },
    loop: {
      message: async (params: { userInput: string }) => {
        const response = await sendMessage(params.userInput);
        if (response) {
          return response;
        } else {
          return "I'm sorry, I couldn't process your request. Please try again.";
        }
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
          <FileUploadComponent></FileUploadComponent>
        </div>
      )
    },
    voice: {
      disabled: false,
      defaultToggledOn: true,
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
      {isLoading && <p>Loading...</p>}
      {error && <p style={{color: 'red'}}>{error}</p>}
    </div>
  );
};

const App = () => {
  return (
    <div style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
      <MyChatBot />
    </div>
  );
};

export default App;