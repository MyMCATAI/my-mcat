'use client'

import React, { useState, useEffect, useRef, useContext } from 'react';
import dynamic from 'next/dynamic';
import { VocabContext } from '@/contexts/VocabContext';
import VocabList from '@/components/VocabList';
import DialogWrapper from './DialogWrapper';
import { Question } from "@/types"; // Make sure to import the Question type
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const ChatBot = dynamic(() => import('react-chatbotify'), { ssr: false });

interface MyChatBotProps {
  chatbotContext?: {
    contentTitle: string;
    context: string;
  };
  isVoiceEnabled?: boolean;
  width?: string | number;
  backgroundColor?: string;
  question: Question |null;
  handleShowHint?: (responseText: string) => void;

}

const MyChatBot: React.FC<MyChatBotProps> = ({ 
  chatbotContext, 
  isVoiceEnabled = false, 
  width = '100%',
  backgroundColor = 'white',
  question,
  handleShowHint
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
    if(!handleShowHint) return
    if (!hintEnabled && question?.context) {
      handleShowHint(question.context);
    } else {
      handleShowHint('');
    }
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

  const helpOptions = ["Hint", "Vocab"];
  const flow = {
    start: {
      message: `Meow there! Need help?`,
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

  const renderHintContent = (context: string) => {
    return (
      <div className="markdown-content">
        {context.split('\n').map((paragraph, index) => {
          if (paragraph.startsWith('*')) {
            return (
              <ul key={index} className="list-disc pl-5 my-2">
                <li>{index === 0 ? <strong>{paragraph.substring(1).trim()}</strong> : paragraph.substring(1).trim()}</li>
              </ul>
            );
          } else if (/^\d+\./.test(paragraph)) {
            return (
              <ol key={index} className="list-decimal pl-5 my-2">
                <li>{index === 0 ? <strong>{paragraph.substring(paragraph.indexOf('.') + 1).trim()}</strong> : paragraph.substring(paragraph.indexOf('.') + 1).trim()}</li>
              </ol>
            );
          } else {
            return <p key={index} className="my-2">{index === 0 ? <strong>{paragraph}</strong> : paragraph}</p>;
          }
        })}
      </div>
    );
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
    chatHistory: { storageKey: "mcat_assistant_chat_history" },
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
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    onClick={toggleHint}
                    className={`px-2 text-sm ${hintEnabled ? 'bg-blue-500' : 'bg-gray-200'} text-black rounded hover:bg-blue-600 transition-colors`}
                  >
                    💡
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" sideOffset={5} className="max-w-[600px] max-h-[800px] overflow-auto">
                  {question?.context && renderHintContent(question.context)}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <button 
              onClick={toggleCmdI}
              className={`px-2 text-sm ${isCmdIEnabled ? 'bg-blue-500' : 'bg-gray-200'} text-black rounded hover:bg-blue-600 transition-colors`}
            >
              📖
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
  };

  const styles = {
    chatWindowStyle: {
      backgroundColor: backgroundColor,
      inlineSize: width,
      height: 'calc(100vh - 30rem)',
      margin: '2rem .5rem',
    },
    botBubbleStyle: {
      fontSize: "0.875rem",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
      color: 'black',
      backgroundColor: '#e8e8ea'
    },
    userBubbleStyle: {
      fontSize: "0.875rem",
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
    chatHistoryButtonStyle: {
      fontSize: '0.5rem !important', // Even smaller font size with !important
    },
  };

  const themes = [{ id: "simple_blue", version: "0.1.0" }];

  if (!isMounted) {
    return null;
  }

  return (
    <div style={{ 
      inlineSize: width, 
      backgroundColor: backgroundColor, 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%', 
      position: 'relative',
      border: '1px solid #ccc', // Add this line for a light gray border
      borderRadius: '8px', // Optional: add rounded corners
      padding: '10px', // Optional: add some padding
    }}>
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
        videoSrc='https://my-mcat.s3.us-east-2.amazonaws.com/tutorial/TestComponent.mp4'
        />
    </div>
  );
};

const App: React.FC<MyChatBotProps> = ({ chatbotContext, isVoiceEnabled, width, backgroundColor, question, handleShowHint }) => {
  return (
    <div style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
      <MyChatBot 
        chatbotContext={chatbotContext} 
        isVoiceEnabled={isVoiceEnabled} 
        width={width} 
        backgroundColor={backgroundColor}
        question={question}
        handleShowHint={handleShowHint}
      />
    </div>
  );
};

export default App;