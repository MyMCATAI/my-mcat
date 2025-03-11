"use client"

import { cn } from "@/lib/utils";

/* ----- Types ---- */
export type MessageRole = "user" | "assistant" | "system";

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
  className?: string;
}

const ChatMessage = ({ message, className }: ChatMessageProps) => {
  /* ---- Render Methods ----- */
  const isUser = message.role === "user";
  
  return (
    <div 
      className={cn(
        "transition-colors duration-300",
        isUser 
          ? "bg-[--theme-leaguecard-color]"
          : "bg-transparent bg-opacity-30",
        className
      )}
    >
      <div className="max-w-5xl mx-auto px-4 py-4 flex gap-3 items-start">
        {/* Avatar */}
        {!isUser && (
          <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[--theme-doctorsoffice-accent] flex items-center justify-center animate-float">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path>
              <path d="M3 15h14a2 2 0 1 1 0 4H3"></path>
              <path d="M21 12H7a2 2 0 0 0 0 4h8"></path>
            </svg>
          </div>
        )}
        
        {/* Message content */}
        <div className={cn(
          "flex-1",
          isUser && "flex justify-end"
        )}>
          <div className="flex items-center gap-2 mb-1">
            <div className="font-medium text-sm text-[--theme-text-color]">
              {isUser ? "You" : "Kalypso AI"}
            </div>
            <span className="text-xs text-[--theme-text-color] opacity-50">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <div className={cn(
            "text-sm max-w-[80%] px-4 py-2 rounded-lg",
            isUser 
              ? "ml-auto bg-[--theme-doctorsoffice-accent] text-white"
              : "bg-[--theme-botchatbox-color] text-[--theme-text-color]"
          )}>
            {message.content}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage; 