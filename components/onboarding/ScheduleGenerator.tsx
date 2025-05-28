import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

/* --- Constants ----- */
const SCHEDULE_GENERATION_MESSAGES = [
  "Purr-using your past exams...",
  "Clawing at your vulnerabilities...", 
  "Picking out subjects...",
  "Nibbling on some catnip...",
  "Your study plan is now ready!"
];

/* ----- Types ---- */
interface ScheduleGeneratorProps {
  onComplete: () => void;
}

const ScheduleGenerator: React.FC<ScheduleGeneratorProps> = ({ onComplete }) => {
  /* ---- State ----- */
  const [isGenerating, setIsGenerating] = useState(true);
  const [generationMessages, setGenerationMessages] = useState<string[]>([]);

  /* --- Animations & Effects --- */
  useEffect(() => {
    // Show generation messages with delays
    for (let i = 0; i < SCHEDULE_GENERATION_MESSAGES.length; i++) {
      setTimeout(() => {
        setGenerationMessages(prev => [...prev, SCHEDULE_GENERATION_MESSAGES[i]]);
        
        // If this is the last message, complete generation
        if (i === SCHEDULE_GENERATION_MESSAGES.length - 1) {
          setTimeout(() => {
            setIsGenerating(false);
            onComplete();
          }, 1000);
        }
      }, i * 1000);
    }
  }, [onComplete]);

  /* ---- Render Methods ----- */
  return (
    <div className="space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 bg-clip-text text-transparent text-center"
      >
        Creating Your Study Plan 📅
      </motion.div>
      
      <div className="space-y-4 w-full max-w-md mx-auto">
        {generationMessages.map((message, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.4, type: "spring", stiffness: 100 }}
            className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 p-5 rounded-xl shadow-lg border border-blue-200/50 dark:border-gray-600/50"
          >
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse" />
              </div>
              <p className="text-gray-900 dark:text-white font-semibold text-lg">{message}</p>
            </div>
          </motion.div>
        ))}
        {isGenerating && generationMessages.length < SCHEDULE_GENERATION_MESSAGES.length && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center space-x-4 text-gray-900 dark:text-white p-5 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-gray-700 dark:to-gray-600 rounded-xl"
          >
            <div className="w-5 h-5 border-3 border-gradient-to-r from-blue-500 to-purple-500 border-t-transparent rounded-full animate-spin" />
            <span className="font-semibold text-lg">Generating your schedule...</span>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ScheduleGenerator; 