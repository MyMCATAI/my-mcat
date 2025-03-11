"use client"

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import ChatSidebar from "./ChatSidebar";
import ChatContainer from "./ChatContainer";

/* ----- Types ---- */
interface ChatLayoutProps {
  className?: string;
  isSubscribed?: boolean;
  chatbotRef?: React.MutableRefObject<{
    sendMessage: (message: string, messageContext?: string) => void;
  }>;
}

const ChatLayout = ({ className, isSubscribed = true, chatbotRef }: ChatLayoutProps) => {
  /* ---- State ----- */
  const [windowHeight, setWindowHeight] = useState<number>(0);
  
  /* --- Animations & Effects --- */
  useEffect(() => {
    // Update window height on mount and resize
    const updateHeight = () => {
      setWindowHeight(window.innerHeight);
    };
    
    updateHeight();
    window.addEventListener('resize', updateHeight);
    
    return () => {
      window.removeEventListener('resize', updateHeight);
    };
  }, []);
  
  /* ---- Render Methods ----- */
  return (
    <div className="w-full px-[2rem] lg:px-[2.7rem] xl:px-[7rem] py-2 h-full">
      <div 
        className="text-[--theme-text-color] flex gap-[1.5rem] overflow-visible h-full"
        style={{
          minHeight: 'calc(100vh - 80px)', // Adjust to ensure it fills most of the viewport
        }}
      >
        {/* Main chat container */}
        <div className="w-[70%] lg:w-[73%] xl:w-[75%] h-full">
          <ChatContainer chatbotRef={chatbotRef} />
        </div>
        
        {/* Sidebar */}
        <div className="w-[30%] lg:w-[27%] xl:w-[25%] h-full">
          <ChatSidebar isSubscribed={isSubscribed} />
        </div>
      </div>
    </div>
  );
};

export default ChatLayout; 