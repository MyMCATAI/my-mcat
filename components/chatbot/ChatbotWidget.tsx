import React, { useState, useRef, useEffect } from 'react';
import ChatBot from "@/components/chatbot/ChatBot";
import Draggable, { DraggableEventHandler } from 'react-draggable';

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
  chatbotWidth = 400, 
  chatbotHeight = 490, 
  buttonSize = 175,
  backgroundColor,
  isVoiceEnabled
}) => {
  const [showChatbot, setShowChatbot] = useState<boolean>(false);
  const [kalypsoState, setKalypsoState] = useState<KalypsoState>('wait');
  const kalypsoRef = useRef<HTMLImageElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const switchKalypsoState = (newState: KalypsoState): void => {
    setKalypsoState(newState);
    if (kalypsoRef.current) {
      kalypsoRef.current.src = `/kalypso${newState}.gif`;
    }
  };

  const toggleChatBot = (): void => {

    if (isDragging) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (!showChatbot) {
      switchKalypsoState('talk');
      setShowChatbot(true);
    } else {
      setShowChatbot(false);
      switchKalypsoState('start');
      timeoutRef.current = setTimeout(() => {
        switchKalypsoState('wait');
      }, 5000);
    }
  };

  const handleDragStart = () => {
    dragTimeoutRef.current = setTimeout(() => {
      setIsDragging(true);
    }, 200);
  };

  const handleDragStop = () => {
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current);
    }
    setTimeout(() => {
      setIsDragging(false);
    }, 0);
  };

  const handleDrag: DraggableEventHandler = (e, data) => {
    setPosition({ x: data.x, y: data.y });
  };

  const preventImageDrag = (e: React.DragEvent<HTMLImageElement>) => {
    e.preventDefault();
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
    <div ref={containerRef} className="fixed inset-0 pointer-events-none z-50">
      <Draggable
        position={position}
        onStart={handleDragStart}
        onDrag={handleDrag}
        onStop={handleDragStop}
        bounds="parent"
      >
        <div className="fixed bottom-6 right-12 flex flex-col items-end pointer-events-auto">
          {showChatbot && (
            <div
              className="rounded-lg shadow-lg overflow-hidden mb-4"
              style={{
                width: chatbotWidth,
                height: chatbotHeight,
                boxShadow: '0 0 15px 6px rgba(0, 123, 255, 0.4)',
              }}
            >
              <ChatBot chatbotContext={chatbotContext} width={chatbotWidth} backgroundColor={backgroundColor} isVoiceEnabled={isVoiceEnabled}/>
            </div>
          )}
          <button
            className="overflow-hidden transition duration-120 ease-in-out transform hover:-translate-y-1 hover:scale-105 focus:outline-none cursor-move"
            onClick={toggleChatBot}
            aria-label={showChatbot ? "Close Chat" : "Open Chat"}
            style={{
              width: buttonSize,
              height: buttonSize,
            }}
          >
            <img
              ref={kalypsoRef}
              src="/kalypsowait.gif"
              alt="Chat with Kalypso"
              className="w-full h-full object-cover pointer-events-none"
              onDragStart={preventImageDrag}
            />
          </button>
        </div>
      </Draggable>
    </div>
  );
};

export default ChatbotWidget;