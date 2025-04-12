"use client";

import React, { useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { IoClose } from 'react-icons/io5';

// Dynamically import ChatContainer to avoid loading it until needed
const DynamicChatContainer = dynamic(() => import('@/components/chatgpt/ChatContainer'), {
  loading: () => <div className="p-4 text-center">Loading chat...</div>,
  ssr: false
});

interface BubblePosition {
  x: number;
  y: number;
  angle: number;
  rect: DOMRect | null;
}

interface ChatBubbleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  position: BubblePosition;
  activities?: any[]; // Use the proper type from your actual implementation
  size?: number;
}

const ChatBubbleDialog: React.FC<ChatBubbleDialogProps> = ({
  isOpen,
  onClose,
  position,
  activities = [],
  size = 192
}) => {
  const chatRef = useRef<HTMLDivElement>(null);
  const chatbotRef = useRef<{ sendMessage: (message: string, context?: string) => void }>({
    sendMessage: () => {}
  });

  // Handle escape key to close dialog
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  // Calculate position for the bubble pointer
  const getPointerPosition = () => {
    const angle = position.angle || 45;
    
    // Position based on angle
    if (angle <= 45 || angle > 315) {
      return { left: 0, top: '50%', transform: 'translate(-50%, -50%)', rotate: angle + 90 };
    } else if (angle <= 135) {
      return { left: '50%', top: 0, transform: 'translate(-50%, -50%)', rotate: angle + 90 };
    } else if (angle <= 225) {
      return { left: '100%', top: '50%', transform: 'translateY(-50%)', rotate: angle + 90 };
    } else {
      return { left: '50%', bottom: 0, transform: 'translate(-50%, 50%)', rotate: angle + 90 };
    }
  };

  // Calculate center position for the chat bubble
  const getChatPosition = () => {
    if (!position.rect) return { left: '50%', top: '50%' };
    
    return {
      left: `${position.rect.left + size/2 + position.x}px`,
      top: `${position.rect.top + size/2 + position.y - 50}px` // Offset upward a bit
    };
  };

  // Function to render dialog content
  const renderDialog = () => {
    const bubbleWidth = Math.min(600, window.innerWidth * 0.85);
    const bubbleHeight = Math.min(500, window.innerHeight * 0.6);
    const pointerStyles = getPointerPosition();
    
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay to capture clicks outside */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/25 z-[999998]"
              onClick={onClose}
            />
            
            <motion.div
              ref={chatRef}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ 
                duration: 0.3,
                type: "spring",
                damping: 20,
                stiffness: 300
              }}
              className="fixed bg-[--theme-mainbox-color] rounded-[20px] shadow-xl z-[999999]"
              style={{ 
                ...getChatPosition(),
                transform: 'translate(-50%, -50%)',
                width: bubbleWidth,
                height: bubbleHeight
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button 
                onClick={onClose}
                className="absolute right-2 top-2 z-10 bg-gray-800 text-white rounded-full p-1 hover:bg-red-500 transition-colors"
                aria-label="Close chat"
              >
                <IoClose size={20} />
              </button>
              
              {/* Chat container */}
              <div className="w-full h-full p-2 overflow-hidden rounded-[20px] flex flex-col chat-outer-container">
                <DynamicChatContainer 
                  className="w-full h-full flex flex-col" 
                  chatbotRef={chatbotRef}
                  activities={activities}
                  containerProps={{
                    style: {
                      height: '100%',
                      width: '100%',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column'
                    },
                    className: "chat-layout-fixed"
                  }}
                />
              </div>
              
              {/* Inject custom CSS to fix layout issues */}
              <style jsx global>{`
                /* Force the chat container to take up full space */
                .chat-outer-container {
                  position: relative;
                  max-height: 100%;
                }
                
                /* ---- Aggressive overrides for chat component ---- */
                
                /* Override the negative height calculation */
                .rcb-chat-window {
                  height: 100% !important;
                  max-height: 100% !important;
                  min-height: 0 !important;
                  position: absolute !important;
                  inset: 0 !important;
                  width: 100% !important;
                }
                
                /* Fix the header */
                .rcb-chat-header-container {
                  position: absolute !important;
                  top: 0 !important;
                  left: 0 !important;
                  right: 0 !important;
                  width: 100% !important;
                  z-index: 10 !important;
                }
                
                /* Fix the chat body container to make scrolling work */
                .rcb-chat-body-container {
                  position: absolute !important;
                  top: 50px !important; /* Adjust based on header height */
                  bottom: 60px !important; /* Adjust based on input height */
                  left: 0 !important;
                  right: 0 !important;
                  overflow-y: auto !important;
                  overflow-x: hidden !important;
                  height: auto !important;
                  scrollbar-width: thin !important;
                  scrollbar-color: rgba(76, 181, 230, 0.5) transparent !important;
                }
                
                /* Show scrollbars */
                .rcb-chat-body-container::-webkit-scrollbar {
                  width: 6px !important;
                  height: 6px !important;
                }
                
                .rcb-chat-body-container::-webkit-scrollbar-thumb {
                  background-color: rgba(76, 181, 230, 0.5) !important;
                  border-radius: 6px !important;
                }
                
                /* Fix input positioning and ensure theme compatibility */
                .rcb-chat-input {
                  position: absolute !important;
                  bottom: 0 !important;
                  left: 0 !important;
                  right: 0 !important;
                  width: 100% !important;
                  z-index: 20 !important;
                  background-color: var(--theme-leaguecard-color, rgba(231, 250, 251, 0.95)) !important;
                  border-top: 1px solid var(--theme-border-color, rgba(200, 200, 200, 0.2)) !important;
                }
                
                /* Ensure input text is visible on all themes */
                .rcb-chat-input-textarea {
                  color: var(--theme-text-color, #333) !important;
                  background-color: var(--theme-mainbox-color, white) !important;
                  border: 1px solid var(--theme-border-color, #e0e0e0) !important;
                  border-radius: 8px !important;
                }
                
                /* Add a placeholder color */
                .rcb-chat-input-textarea::placeholder {
                  color: var(--theme-text-color, #333) !important;
                  opacity: 0.5 !important;
                }
                
                /* Fix send button and its hover state */
                .rcb-chat-input-submit-button {
                  background-color: var(--theme-doctorsoffice-accent, #4CB5E6) !important;
                  color: white !important;
                }
                
                .rcb-chat-input-submit-button:hover {
                  background-color: var(--theme-hover-color, #2a9cd2) !important;
                }
                
                /* Fix prompt suggestions */
                .prompt-suggestions {
                  position: absolute !important;
                  bottom: 65px !important;
                  left: 8px !important;
                  right: 8px !important;
                  z-index: 15 !important;
                  background-color: transparent !important;
                  backdrop-filter: blur(1px) !important;
                  border-radius: 12px !important;
                  padding: 8px !important;
                  display: flex !important;
                  justify-content: center !important;
                  gap: 8px !important;
                  border: none !important;
                }
                
                /* Minimize prompt buttons to show only emojis */
                .prompt-suggestions button {
                  width: 38px !important;
                  height: 38px !important;
                  padding: 0 !important;
                  display: flex !important;
                  align-items: center !important;
                  justify-content: center !important;
                  border-radius: 50% !important;
                  overflow: hidden !important;
                  background-color: transparent !important;
                  backdrop-filter: blur(0.5px) !important;
                  border: 1px solid var(--theme-border-color, rgba(200, 200, 200, 0.3)) !important;
                }
                
                /* Show only the emoji/icon and hide text */
                .prompt-suggestions button span:first-child {
                  font-size: 18px !important;
                  margin: 0 !important;
                }
                
                .prompt-suggestions button span:not(:first-child) {
                  display: none !important;
                }
                
                /* Make messages look proper */
                .rcb-bot-message-container,
                .rcb-user-message-container {
                  padding: 4px 12px !important;
                  margin-bottom: 8px !important;
                }
                
                /* Fix message width */
                .rcb-message-bubble {
                  max-width: 85% !important;
                }
                
                /* Force any problematic ID-based styles to comply */
                [id^="rcb-"] .rcb-chat-window {
                  height: 100% !important;
                }
                
                /* Target specific problematic height calculation */
                div[style*="height: calc(-9rem + 100vh)"] {
                  height: 100% !important;
                }
              `}</style>
              
              {/* Speech bubble pointer */}
              <div 
                className="absolute w-4 h-8 bg-[--theme-mainbox-color]"
                style={{
                  left: pointerStyles.left,
                  top: pointerStyles.top,
                  bottom: pointerStyles.bottom,
                  transform: pointerStyles.transform,
                  rotate: `${pointerStyles.rotate}deg`,
                  clipPath: 'polygon(50% 100%, 0 -1px, 100% -1px)',
                  filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.1))',
                }}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  };

  // Use createPortal to render at the document body level
  if (typeof window === 'undefined') return null;
  
  return createPortal(
    renderDialog(),
    document.body
  );
};

export default ChatBubbleDialog; 