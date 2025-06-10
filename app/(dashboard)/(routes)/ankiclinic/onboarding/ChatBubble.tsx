import React from 'react';
import { motion } from 'framer-motion';

/* ----- Types ---- */
interface ChatBubbleProps {
  children: React.ReactNode;
  showAnalysis?: boolean;
  showScheduleGeneration?: boolean;
  showFinalCalendar?: boolean;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ 
  children, 
  showAnalysis = false, 
  showScheduleGeneration = false, 
  showFinalCalendar = false 
}) => {
  /* ---- Render Methods ----- */
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, x: 20 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.8, x: 20 }}
      transition={{ delay: 0.3 }}
      className={`fixed right-[20rem] md:right-[33rem] z-[10002] w-auto min-w-[32rem] max-w-3xl ${
        showAnalysis || showScheduleGeneration || showFinalCalendar ? 'bottom-20 md:bottom-32' : 'bottom-60 md:bottom-80'
      }`}
    >
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl relative border border-gray-200 dark:border-gray-700 max-h-[75vh] flex flex-col">
        {/* Enhanced Arrow pointing to Kalypso */}
        <div className="absolute -right-4 bottom-8 w-0 h-0 border-l-[20px] border-l-white dark:border-l-gray-800 border-t-[15px] border-t-transparent border-b-[15px] border-b-transparent drop-shadow-lg"></div>
        
        {/* Scrollable content area */}
        <div className="p-10 md:p-12 overflow-y-auto flex-1">
          <div className="space-y-6">
            {children}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatBubble; 