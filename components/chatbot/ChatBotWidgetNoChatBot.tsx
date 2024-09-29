// File: /components/chatbot/ChatBotWidgetNoChatBot.tsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ReportData } from "@/types";

interface KalypsoData {
  averageTestScore: number;
  averageTimePerQuestion: number;
  testsCompleted: number;
  totalTestsTaken: number;
  totalQuestionsAnswered: number;
  totalCupcakes: number;
}

interface ChatBotWidgetNoChatBotProps {
  reportData: ReportData | null;
  onResponse?: (message: string, dismissFunc: () => void) => void;
}

type KalypsoState = 'wait' | 'talk' | 'end' | 'start';

const ChatBotWidgetNoChatBot: React.FC<ChatBotWidgetNoChatBotProps> = ({ reportData, onResponse }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [kalypsoState, setKalypsoState] = useState<KalypsoState>('wait');
  const [kalypsoSrc, setKalypsoSrc] = useState('/kalypsowait.gif');
  const [showDots, setShowDots] = useState(false);

  const handleClick = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    setKalypsoState('talk');
    setKalypsoSrc('/kalypsotalk.gif');
    setShowDots(true);

    // Wait for 2 seconds (duration of kalypsotalk animation)
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (!reportData) {
      handleResponse("Oops! I couldn't find your report data. Please make sure you're logged in and have completed some tests.");
      return;
    }

    try {
      const kalypsoData: KalypsoData = {
        averageTestScore: reportData.averageTestScore,
        averageTimePerQuestion: reportData.averageTimePerQuestion,
        testsCompleted: reportData.testsCompleted,
        totalTestsTaken: reportData.totalTestsTaken,
        totalQuestionsAnswered: reportData.totalQuestionsAnswered,
        totalCupcakes: reportData.userScore || 0,
      };
      const response = await axios.post('/api/kalypso', {
        data: kalypsoData,
      });
      handleResponse(response.data.message);
    } catch (error: any) {
      console.error('[ChatBotWidgetNoChatBot] Error:', error);
      handleResponse("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
      setShowDots(false);
    }
  };

  const handleResponse = (responseMessage: string) => {
    setKalypsoState('end');
    setKalypsoSrc('/kalypsoend.gif');
    if (typeof onResponse === 'function') {
      onResponse(responseMessage, handleMessageDismiss);
    }
  };

  const handleMessageDismiss = () => {
    setKalypsoState('start');
    setKalypsoSrc('/kalypsostart.gif');
    
    // After playing kalypsostart, return to wait state
    setTimeout(() => {
      setKalypsoState('wait');
      setKalypsoSrc('/kalypsowait.gif');
    }, 4900); // Adjust this timeout based on the duration of kalypsostart animation
  };

  return (
    <div className="relative w-32 h-32">
      {showDots && (
        <div className="absolute top-2 left-2 z-10">
          <span className="inline-flex text-3xl font-bold">
            <span className="animate-bounce mr-1">.</span>
            <span className="animate-bounce animation-delay-200 mr-1">.</span>
            <span className="animate-bounce animation-delay-400">.</span>
          </span>
        </div>
      )}
      <button
        className="overflow-hidden transition duration-120 ease-in-out transform hover:-translate-y-1 hover:scale-105 focus:outline-none"
        onClick={handleClick}
        aria-label="Interact with Kalypso the Chatbot"
        style={{
          width: '8rem',
          height: '8rem',
          overflow: 'hidden',
          position: 'relative',
          cursor: 'pointer',
        }}
        disabled={isLoading}
      >
        <img
          src={kalypsoSrc}
          alt="Kalypso"
          className="w-full h-full object-cover transform scale-[1.8] translate-y-[40%]"
        />
      </button>
    </div>
  );
};

export default ChatBotWidgetNoChatBot;
