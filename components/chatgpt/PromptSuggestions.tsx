import React from "react";
import { cn } from "@/lib/utils";

/* ----- Types ---- */
interface PromptSuggestionsProps {
  onSendMessage: (message: string) => void;
  className?: string;
  messageCount: number;
  currentTheme: string;
}

interface SuggestionButton {
  text: string;
  prompt: string;
  icon?: string;
}

/* --- Constants ----- */
const SUGGESTIONS: SuggestionButton[] = [
  { 
    text: "What's my schedule?", 
    prompt: "What's on my schedule today?",
    icon: "📅"
  },
  { 
    text: "What should I focus on?", 
    prompt: "Based on my knowledge profile, what topics should I focus on today?",
    icon: "🎯"
  },
  { 
    text: "Give me a practice question", 
    prompt: "Can you give me a practice question on a topic I need to work on?",
    icon: "❓"
  },
  { 
    text: "Help me stay motivated", 
    prompt: "I'm feeling a bit tired. Can you give me some motivation to keep studying?",
    icon: "💪"
  }
];

const PromptSuggestions = ({ onSendMessage, className, messageCount, currentTheme }: PromptSuggestionsProps) => {
  // Only show suggestions when there are no messages
  if (messageCount > 0) {
    return null;
  }

  return (
    <div className={cn(
      "prompt-suggestions p-4 w-full flex flex-wrap justify-center gap-2 animate-fadeIn",
      `theme-${currentTheme}-suggestions`,
      className
    )}
    style={{
      position: 'absolute',
      bottom: '80px', // Position above chat input
      left: '0',
      right: '0',
      zIndex: 50, // Higher z-index to appear above other elements
      padding: '12px',
      backdropFilter: 'blur(2px)',
      borderRadius: '12px',
      margin: '0 16px',
      backgroundColor: 'transparent'
    }}>
      {SUGGESTIONS.map((suggestion, index) => (
        <button
          key={index}
          onClick={() => onSendMessage(suggestion.prompt)}
          className={cn(
            "px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
            "border border-[--theme-border-color] bg-transparent text-[--theme-text-color]",
            "hover:bg-[--theme-hover-color]/30 hover:text-[--theme-hover-text]",
            "flex items-center gap-2 shadow-sm hover:shadow-md backdrop-blur-[1px]",
            "focus:outline-none focus:ring-2 focus:ring-[--theme-hover-color] focus:ring-opacity-50"
          )}
        >
          {suggestion.icon && <span className="text-base">{suggestion.icon}</span>}
          <span>{suggestion.text}</span>
        </button>
      ))}
    </div>
  );
};

export default PromptSuggestions; 