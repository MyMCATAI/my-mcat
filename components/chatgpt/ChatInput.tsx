"use client"

import { useState, KeyboardEvent, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/* ----- Types ---- */
interface ChatInputProps {
  className?: string;
  onSendMessage: (message: string) => void;
}

const ChatInput = ({ className, onSendMessage }: ChatInputProps) => {
  /* ---- State ----- */
  const [message, setMessage] = useState("");
  
  /* ---- Refs --- */
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  /* --- Animations & Effects --- */
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [message]);

  /* ---- Event Handlers ----- */
  const handleSubmit = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage("");
      if (textareaRef.current) {
        textareaRef.current.style.height = '42px';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  /* ---- Render Methods ----- */
  return (
    <div className={cn(
      "py-3 px-4",
      className
    )}>
      <div className="relative flex items-center max-w-5xl mx-auto">
        <textarea
          ref={textareaRef}
          className={cn(
            "w-full p-3 pl-4 pr-12 rounded-full text-sm resize-none h-[42px] max-h-[150px] overflow-y-auto",
            "bg-[--theme-leaguecard-color] border border-[--theme-border-color]",
            "focus:outline-none focus:ring-1 focus:ring-[--theme-doctorsoffice-accent]",
            "text-[--theme-text-color] shadow-sm transition-all duration-300"
          )}
          placeholder="Ask Kalypso about your study plan..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          style={{ 
            minHeight: "42px"
          }}
        />
        <Button
          type="button"
          className={cn(
            "absolute right-3 p-1.5 rounded-full transition-colors duration-300",
            "bg-[--theme-doctorsoffice-accent] hover:bg-[--theme-doctorsoffice-accent] hover:opacity-90",
            "text-white shadow-sm",
            !message.trim() && "opacity-50 cursor-not-allowed"
          )}
          onClick={handleSubmit}
          disabled={!message.trim()}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-white"
          >
            <path d="m22 2-7 20-4-9-9-4Z" />
            <path d="M22 2 11 13" />
          </svg>
        </Button>
      </div>
      <div className="mt-2 text-xs text-center text-[--theme-text-color] opacity-70 max-w-5xl mx-auto">
        Kalypso AI is designed to assist with medical education. For medical emergencies, please contact a healthcare professional.
      </div>
    </div>
  );
};

export default ChatInput; 