'use client'

import React, { useState, useEffect, useRef, useContext } from 'react';
import dynamic from 'next/dynamic';
import { VocabContext } from '@/contexts/VocabContext';
import VocabList from '@/components/VocabList';
import DialogWrapper from './DialogWrapper';

const ChatBot = dynamic(() => import('react-chatbotify'), { ssr: false });

interface MyChatBotProps {
  chatbotContext?: {
    contentTitle: string;
    context: string;
  };
  isVoiceEnabled?: boolean;
  width?: string | number;
  backgroundColor?: string;
  chatbotRef?: React.MutableRefObject<{
    sendMessage: (message: string) => void;
  }>;
}

const MyChatBot: React.FC<MyChatBotProps> = ({ 
  chatbotContext, 
  isVoiceEnabled = false, 
  width = '100%',
  backgroundColor = 'white',
  chatbotRef
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(isVoiceEnabled);
  const [hintEnabled, setHintEnabled] = useState(false);
  const [vocabEnabled, setVocabEnabled] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false); // New state for dialog
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const context = chatbotContext?.context;
  const contentTitle = chatbotContext?.contentTitle;

  const { toggleVocabList, isCmdIEnabled, toggleCmdI } = useContext(VocabContext);

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

  useEffect(() => {
    if (chatbotRef) {
      chatbotRef.current = {
        sendMessage: (message: string) => {
          const chatbotContainer = document.querySelector('[data-testid="chatbot-review"]');
          const textarea = chatbotContainer?.querySelector('textarea');
          if (textarea) {
            textarea.value = message;
            const enterEvent = new KeyboardEvent('keydown', {
              key: 'Enter',
              code: 'Enter',
              keyCode: 13,
              which: 13,
              bubbles: true
            });
            textarea.focus();
            setTimeout(() => {
              textarea.dispatchEvent(enterEvent);
            }, 50);
          }
        }
      };
    }
  }, [chatbotRef]);

  const handleOptionClick = (type: "question" | "summary") => {
    if (!chatbotRef?.current) return;
    
    const message = type === "question" 
      ? "Help me understand why this answer is correct"
      : "Can you summarize the key points of this passage?";

    chatbotRef.current.sendMessage(message);
  };

  const sendMessage = async (message: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message, 
          context, 
          threadId, 
          generateAudio: audioEnabled,
          assistantId: 'asst_61EMvczy4MpaJqUObrWceV9V'
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
    setAudioEnabled(!audioEnabled);
  };

  const toggleHint = () => {
    setHintEnabled(!hintEnabled);
  };

  const toggleVocab = () => {
    setVocabEnabled(!vocabEnabled);
  };

  const openDialog = () => {
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
  };

  const flow = {
    start: {
      message: "Meow there! Welcome to review. Please note that a question won't count as reviewed unless you spend a minute or more on it. Click the red question mark for more info :)",
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
      showScrollbar: true,
    },
    chatHistory: { storageKey: "mcat_review_chat_history", disabled: true},
    header: {
      showAvatar: false,
      title: (
        <div className="flex items-center justify-between w-full">
          <div className="flex space-x-2">
            <button 
              onClick={toggleAudio}
              className={`px-2 text-sm ${audioEnabled ? 'bg-blue-500' : 'bg-gray-200'} text-black rounded hover:bg-blue-600 transition-colors`}
            >
              {audioEnabled ? '🔊' : '🔇'}
            </button>
            <button 
              onClick={toggleHint}
              className={`px-2 text-sm ${hintEnabled ? 'bg-blue-500' : 'bg-gray-200'} text-black rounded hover:bg-blue-600 transition-colors`}
            >
              💡
            </button>
            <button 
              onClick={toggleCmdI}
              className={`px-2 text-sm ${isCmdIEnabled ? 'bg-blue-500' : 'bg-gray-200'} text-black rounded hover:bg-blue-600 transition-colors`}
            >
              📖
            </button>
            <button
              onClick={() => handleOptionClick("question")}
              className="px-2 text-sm bg-gray-200 text-black rounded hover:bg-blue-600 hover:text-white transition-colors"
            >
              Question Help
            </button>
            <button
              onClick={() => handleOptionClick("summary")}
              className="px-2 text-sm bg-gray-200 text-black rounded hover:bg-blue-600 hover:text-white transition-colors"
            >
              Passage Summary
            </button>
          </div>
          <button 
            onClick={openDialog}
            className="px-2 text-sm bg-transparent text-black rounded hover:bg-transparent transition-colors ml-2"
          >
            ❓
          </button>
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
      streamSpeed: audioEnabled ? 70 : 25,
    },
    options: {
      disabled: true, // Disable options to allow free-form conversation
    },
  };

  const styles = {
    chatWindowStyle: {
      backgroundColor: backgroundColor,
      inlineSize: width,
      height: 'calc(100vh - 25rem)', // Changed from 300px to 18.75rem
      maxHeight: '24rem', // Changed from 300px to 18.75rem
      margin: '0',
    },
    botBubbleStyle: {
      fontSize: "0.8rem", // Slightly increased font size
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
      color: 'black',
      backgroundColor: '#e8e8ea'
    },
    userBubbleStyle: {
      fontSize: "0.8rem", // Slightly increased font size
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
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
    return null;
  }

  return (
    <div 
      data-testid="chatbot-review"
      style={{ 
        inlineSize: width, 
        backgroundColor: backgroundColor, 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%', 
        position: 'relative' 
      }}
    >
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
      {vocabEnabled && (
        <div className="vocab-list-container">
          <VocabList />
          <button
            onClick={toggleVocab}
            className="mt-2 px-4 py-2 bg-red-500 text-white rounded"
          >
            Close
          </button>
        </div>
      )}
      <style jsx>{`
        .vocab-list-container {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 300px;
          max-height: 400px;
          overflow-y: auto;
          background-color: white;
          border: 1px solid #ccc;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          padding: 16px;
          z-index: 1000;
        }

        @media (max-width: 768px) {
          .vocab-list-container {
            width: 90%;
            left: 5%;
            right: 5%;
            top: 10px;
          }
        }
      `}</style>
      <DialogWrapper
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onClose={closeDialog} title={''} description={''}
        videoSrc='https://my-mcat.s3.us-east-2.amazonaws.com/tutorial/ReviewComponent.mp4'
        />
    </div>
  );
};

const App: React.FC<MyChatBotProps> = ({ chatbotContext, isVoiceEnabled, width, backgroundColor, chatbotRef }) => {
  return (
    <div style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
      <MyChatBot 
        chatbotContext={chatbotContext} 
        isVoiceEnabled={isVoiceEnabled} 
        width={width} 
        backgroundColor={backgroundColor}
        chatbotRef={chatbotRef}
      />
    </div>
  );
};

export default App;