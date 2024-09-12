import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import ScreenshotButton from "@/components/chatbot/ScreenshotButton";
import FileUploadComponent from './fileUpload';

const ChatBot = dynamic(() => import('react-chatbotify'), { ssr: false });

interface MyChatBotProps {
  chatbotContext?: {
    contentTitle: string;
    context: string;
  };
  isVoiceEnabled?: boolean;
  width?: string | number;
  backgroundColor?: string;
}

const MyChatBot: React.FC<MyChatBotProps> = ({ 
  chatbotContext, 
  isVoiceEnabled = false, 
  width = '100%',
  backgroundColor = 'white'
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(isVoiceEnabled);
  const [hintEnabled, setHintEnabled] = useState(false);
  const [vocabEnabled, setVocabEnabled] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const context = chatbotContext?.context;
  const contentTitle = chatbotContext?.contentTitle;

  useEffect(() => {
    setIsMounted(true);

    const timer = setTimeout(() => {
      const botMessage = "Howdy";
      window.dispatchEvent(new CustomEvent('chatbot-event', {
        detail: { message: botMessage },
      }));
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const sendMessage = async (message: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, context, threadId, generateAudio: audioEnabled }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Received response:', data);

      if (data.threadId) {
        setThreadId(data.threadId);
      }

      if (audioEnabled && data.audio) {
        playAudio(data.audio);
      }

      return data.message;
    } catch (error) {
      console.error('Error:', error);
      setError(`An error occurred: ${error instanceof Error ? error.message : String(error)}`);
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
    const audioBlob = new Blob([arrayBuffer], { type: 'audio/mp3' });
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

  const handleScreenshot = (blob: Blob) => {
    console.log('Screenshot taken:', blob);
    // Add logic here to handle the screenshot
  };

  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled);
  };

  const toggleHint = () => {
    setHintEnabled(!hintEnabled);
  };

  const toggleVocab = () => {
    setVocabEnabled(!vocabEnabled);
  };

  const helpOptions = ["Hint", "Vocab"];
  const flow = {
    start: {
      message: `Hi! I'm Kalypso the cat, your MCAT assistant. ${contentTitle ? `Looks like you're working on ${contentTitle}.` : ""} How can I help you today?`,
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
      embedded: true,
      showHeader: true,
      showFooter: false,
    },
    chatWindow: {
      showScrollbar: true, // Change this from 'true' to true
    },
    chatHistory: { storageKey: "mcat_assistant_chat_history" },
    header: {
      showAvatar: false,
      title: (
        <div className="flex items-center justify-between w-full">
          <div className="flex space-x-2">
            <button 
              onClick={toggleAudio}
              className={`px-2 text-sm ${audioEnabled ? 'bg-blue-500' : 'bg-gray-400'} text-black rounded hover:bg-blue-600 transition-colors`}
            >
              {audioEnabled ? '🔊' : '🔇'}
            </button>
            <button 
              onClick={toggleHint}
              className={`px-2 text-sm ${hintEnabled ? 'bg-yellow-500' : 'bg-gray-400'} text-black rounded hover:bg-yellow-600 transition-colors`}
            >
              💡
            </button>
            <button 
              onClick={toggleVocab}
              className={`px-2 text-sm ${vocabEnabled ? 'bg-green-500' : 'bg-gray-400'} text-black rounded hover:bg-green-600 transition-colors`}
            >
              📖
            </button>
          </div>
          <div 
            style={{cursor: "pointer", margin: 0, fontSize: 10, fontWeight: ""}} 
            onClick={() => window.open("https://www.youtube.com/watch?v=dQw4w9WgXcQ")}
          >
          </div>
        </div>
      )
    },
    notification: {
      disabled: true,
    },
    voice: {
      disabled: !audioEnabled,
      defaultToggledOn: audioEnabled,
      language: "en-US",
      autoSendDisabled: true,
      sendAsAudio: false,
    },
    botBubble: { 
      simStream: true, 
      streamSpeed: audioEnabled ? 80 : 20,
    },
  };

  const styles = {
    chatWindowStyle: {
      backgroundColor: backgroundColor,
      inlineSize: width,
      height: 'calc(100vh - 30rem)', // Subtracts 2rem from top and bottom
      margin: '2rem .5rem', // Adds margin to top/bottom and sides
    },
    botBubbleStyle: {
      fontSize: "0.75rem",
      fontFamily: "Consolas, monospace",
      color: 'white',
      backgroundColor: '#3b3b3d'
    },
    userBubbleStyle: {
      fontSize: "0.75rem",
      fontFamily: "Consolas, monospace",
      color: 'white',
      backgroundColor: '#0e85ff'
    },
    headerStyle: {background: 'transparent', height: '0rem'},
    chatInputContainerStyle: {
      backgroundColor: 'transparent',
    },
    chatInputAreaStyle: {
      border: '1px solid #ccc',
      borderRadius: '8px',
      backgroundColor: 'transparent',
    },
  };

  const themes = [{ id: "simple_blue", version: "0.1.0" }];

  if (!isMounted) {
    return null; // or a loading spinner
  }

  return (
    <div style={{ inlineSize: width, backgroundColor: backgroundColor }}>
      <style jsx global>{`
        .rcb-chat-input::before {
          content: none !important;
        }
      `}</style>
      <ChatBot
        settings={settings}
        styles={styles}
        themes={themes}
        flow={flow}
      />
      {error && <p style={{color: 'red'}}>{error}</p>}
      {isPlaying && isVoiceEnabled && <button onClick={stopAudio}>Stop Audio</button>}
    </div>
  );
};

const App: React.FC<MyChatBotProps> = ({ chatbotContext, isVoiceEnabled, width, backgroundColor }) => {
  return (
    <div style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
      <MyChatBot 
        chatbotContext={chatbotContext} 
        isVoiceEnabled={isVoiceEnabled} 
        width={width} 
        backgroundColor={backgroundColor}
      />
    </div>
  );
};

export default App;