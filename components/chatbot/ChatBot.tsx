'use client'

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';

const DynamicChatBot = dynamic(() => import('react-chatbotify'), { ssr: false });

interface ChatBotProps {
  chatbotContext?: {
    contentTitle: string;
    context: string;
  };
  width?: string | number;
  height?: string | number;
  backgroundColor?: string;
}

const ChatBot: React.FC<ChatBotProps> = ({ 
  chatbotContext, 
  width = '100%',
  height = '100%',
  backgroundColor = 'transparent'
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

  const toggleAudio = () => {
    setAudioEnabled(prev => !prev);
  };

  const flow = {
    start: {
      message: `Meow there! I'm Kalypso the cat, your MCAT assistant. ${contentTitle ? `Cool ${contentTitle}.` : ""} How can I help you today?`,
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
      autoJumpToBottom: true,
    },
    chatInput: {
      enabledPlaceholderText: "Chat with Kalypso",
      color: 'var(--theme-text-color)',
    },
    chatHistory: { storageKey: "mcat_assistant_chat_history", disabled: true},
    header: {
      showAvatar: false,
      title: (
        <div className="flex items-center justify-between w-full">
          <div 
            style={{cursor: "pointer", margin: 0, fontSize: 10, fontWeight: ""}} 
            onClick={() => window.open("https://www.youtube.com/watch?v=dQw4w9WgXcQ")}
          >
          </div>
          <div className="flex text-[--theme-text-color] items-center">
            <button 
              onClick={toggleAudio}
              className="px-2 py-1 text-xs bg-transparent hover:bg-[--theme-hover-color] transition-colors"
              style={{ color: audioEnabled ? 'var(--theme-hover-color)' : 'var(--gray-600)' }}
            >
              {audioEnabled ? '🔊' : '🔇'}
            </button>
            <span className="text-[9px] ml-1" style={{ color: 'var(--gray-600)' }}>
              {audioEnabled ? 'press mic to use voice' : 'click to talk'}
            </span>
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
      autoSendPeriod: 1500,
      sendAsAudio: false,
      timeoutPeriod: 10000
    },
    botBubble: { 
      simStream: true,
      streamSpeed: audioEnabled ? 100 : 25,
    },
  };

  const styles = {
    chatWindowStyle: {
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 12.2rem)', // or whatever relative height you prefer
      width: '100%',
      backgroundColor: backgroundColor,
    },
    bodyStyle: {
      flexGrow: 1,
      overflowY: 'auto',
    },
    chatInputContainerStyle: {
      padding: '1rem',
      backgroundColor: 'transparent',
      border: 'transparent',
    },
    chatInputAreaStyle: {
      border: '1px solid var(--theme-border-color)',
      borderRadius: '8px',
      backgroundColor: 'transparent',
      color: 'var(--theme-text-color)',
      width: '100%',
    },
    botBubbleStyle: {
      fontSize: ".9rem",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
      color: 'var(--theme-text-color)',
      backgroundColor: 'var(--theme-botchatbox-color)',
    },
    userBubbleStyle: {
      fontSize: ".9rem",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
      color: 'white',
      backgroundColor: '#0d85ff',
      textAlign: 'left'
    },
    headerStyle: {background: 'transparent', height: '0rem', border: 'transparent'},
    chatHistoryButtonStyle: {
      fontSize: '0.5rem !important', // Even smaller font size with !important
    },
  };

  const themes = [{ id: "simple_blue", version: "0.1.0" }];

  if (!isMounted) {
    return null; // or a loading spinner
  }

  return (
    <div className="w-full rounded-lg shadow-lg overflow-hidden flex flex-col" style={{
      boxShadow: 'var(--theme-box-shadow)',
      border: '1px solid var(--theme-border-color)',
      width: width,
      height: height,
      backgroundColor: backgroundColor,
    }}>
      <DynamicChatBot
        settings={settings}
        styles={styles}
        themes={themes}
        flow={flow}
      />
      {error && <p style={{color: 'red'}}>{error}</p>}
      {isPlaying && audioEnabled && <button onClick={stopAudio}>Stop Audio</button>}
    </div>
  );
};

export default ChatBot;
