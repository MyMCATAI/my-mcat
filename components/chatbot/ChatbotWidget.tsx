import React, { useState, useRef, useEffect } from 'react';
import ChatBot from "@/components/chatbot/ChatBot";
import Draggable, { DraggableEventHandler } from 'react-draggable';
import Image from 'next/image';

interface ChatbotContext {
  contentTitle: string;
  context: string;
}

interface ChatbotWidgetProps {
  chatbotContext: ChatbotContext;
  chatbotWidth?: number | string;
  chatbotHeight?: number | string;
  buttonSize?: number | string;
  backgroundColor?: string;
  isVoiceEnabled?: boolean
}

type KalypsoState = 'wait' | 'talk' | 'end' | 'start';

const ChatbotWidget: React.FC<ChatbotWidgetProps> = ({ 
  chatbotContext, 
  chatbotWidth = 375, 
  chatbotHeight = 490, 
  buttonSize = 240,
  backgroundColor,
  isVoiceEnabled
}) => {
  const [showChatbot, setShowChatbot] = useState<boolean>(false);
  const [kalypsoState, setKalypsoState] = useState<KalypsoState>('wait');
  const [kalypsoSrc, setKalypsoSrc] = useState('/kalypsowait.gif');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const clickStartTimeRef = useRef<number | null>(null);

  const switchKalypsoState = (newState: KalypsoState): void => {
    setKalypsoState(newState);
    setKalypsoSrc(`/kalypso${newState}.gif`);
  };

  const handleDragStart = () => {
    dragTimeoutRef.current = setTimeout(() => {
      setIsDragging(true);
      setKalypsoSrc('/kalypsofloating.gif');
    }, 2000);
  };

  const handleDragStop = () => {
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current);
    }
    setIsDragging(false);
    if (showChatbot) {
      switchKalypsoState('end');
    } else {
      switchKalypsoState('wait');
    }
  };

  const toggleChatBot = (): void => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (!showChatbot) {
      setShowChatbot(true); // Immediately show the chatbot
      switchKalypsoState('talk');
      timeoutRef.current = setTimeout(() => {
        switchKalypsoState('end');
      }, 2000);
    } else {
      setShowChatbot(false); // Immediately hide the chatbot
      switchKalypsoState('start');
      timeoutRef.current = setTimeout(() => {
        switchKalypsoState('wait');
      }, 5000);
    }
  };

  useEffect(() => {
    switchKalypsoState('wait');
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <Draggable
        position={position}
        onStart={handleDragStart}
        onStop={(e, data) => {
          setPosition({ x: data.x, y: data.y });
          handleDragStop();
        }}
        onDrag={(e, data) => {
          if (isDragging) {
            setPosition({ x: data.x, y: data.y });
          }
        }}
        bounds="parent"
      >
        <div className="absolute bottom-7 right-8 flex flex-col items-end pointer-events-auto">
          {showChatbot && (
            <div
              className="rounded-lg shadow-lg overflow-hidden mb-4"
              style={{
                width: chatbotWidth,
                height: chatbotHeight,
                boxShadow: 'var(--theme-box-shadow)',
                border: '2px solid var(--theme-border-color)',
              }}
            >
              <ChatBot chatbotContext={chatbotContext} width={chatbotWidth} backgroundColor={backgroundColor} isVoiceEnabled={isVoiceEnabled}/>
            </div>
          )}
          <button
            className="overflow-hidden transition duration-120 ease-in-out transform hover:-translate-y-1 hover:scale-105 focus:outline-none"
            onClick={toggleChatBot}
            aria-label={showChatbot ? "Close Chat" : "Open Chat"}
            style={{
              width: buttonSize,
              height: buttonSize,
            }}
          >
            <img
              src={kalypsoSrc}
              alt="Chat with Kalypso"
              className="w-full h-full object-contain"
            />
          </button>
        </div>
      </Draggable>
    </div>
  );
};

export default ChatbotWidget;