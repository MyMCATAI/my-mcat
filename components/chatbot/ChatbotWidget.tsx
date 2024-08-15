import React, { useState, useRef, useEffect } from 'react';
import ChatBot from "@/components/chatbot/ChatBot";

interface ChatbotContext {
  contentTitle: string;
  context: string;
}

interface ChatbotWidgetProps {
  chatbotContext: ChatbotContext;
}

type KalypsoState = 'wait' | 'talk' | 'end' | 'start';

const ChatbotWidget: React.FC<ChatbotWidgetProps> = ({ chatbotContext }) => {
  const [showChatbot, setShowChatbot] = useState<boolean>(false);
  const [kalypsoState, setKalypsoState] = useState<KalypsoState>('wait');
  const kalypsoRef = useRef<HTMLImageElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const switchKalypsoState = (newState: KalypsoState): void => {
    setKalypsoState(newState);
    if (kalypsoRef.current) {
      kalypsoRef.current.src = `/kalypso${newState}.gif`;
    }
  };

  const toggleChatBot = (): void => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (!showChatbot) {
      switchKalypsoState('talk');
      timeoutRef.current = setTimeout(() => {
        switchKalypsoState('end');
        setShowChatbot(true);
      }, 2000);
    } else {
      setShowChatbot(false);
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
      <div className="absolute bottom-6 right-8 flex flex-col items-end pointer-events-auto">
        {showChatbot && (
          <div
            className="bg-black rounded-lg shadow-lg overflow-hidden mb-4"
            style={{
              width: "375px",
              height: "490px",
              boxShadow: '0 0 20px 8px rgba(0, 123, 255, 0.5)',
            }}
          >
            <ChatBot chatbotContext={chatbotContext} />
          </div>
        )}
        <button
          className="w-60 h-60 rounded-full overflow-hidden shadow-lg transition duration-120 ease-in-out transform hover:-translate-y-1 hover:scale-105 focus:outline-none"
          onClick={toggleChatBot}
          aria-label={showChatbot ? "Close Chat" : "Open Chat"}
        >
          <img
            ref={kalypsoRef}
            src="/kalypsowait.gif"
            alt="Chat with Kalypso"
            className="w-full h-full object-cover"
          />
        </button>
      </div>
    </div>
  );
};

export default ChatbotWidget;