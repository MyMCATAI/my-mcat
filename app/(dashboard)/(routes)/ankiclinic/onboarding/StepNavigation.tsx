import React from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';

/* ----- Types ---- */
interface StepNavigationProps {
  currentStep: number;
  totalSteps: number;
  actionText: string;
  isCompleting: boolean;
  showPrevious: boolean;
  showSkip: boolean;
  onPrevious: () => void;
  onSkip: () => void;
  onAction: () => void;
}

const StepNavigation: React.FC<StepNavigationProps> = ({
  currentStep,
  totalSteps,
  actionText,
  isCompleting,
  showPrevious,
  showSkip,
  onPrevious,
  onSkip,
  onAction
}) => {
  /* ---- Render Methods ----- */
  return (
    <div className="p-8 border-t border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-gray-50/80 via-blue-50/40 to-purple-50/40 dark:from-gray-750/80 dark:via-gray-800/60 dark:to-gray-750/80 rounded-b-3xl backdrop-blur-sm">
      <div className="flex justify-between items-center">
        <div className="flex space-x-4">
          {Array.from({ length: totalSteps }, (_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className={`w-5 h-5 rounded-full transition-all duration-300 shadow-md ${
                i === currentStep 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 scale-110' 
                  : i < currentStep 
                    ? 'bg-gradient-to-r from-green-400 to-green-600' 
                    : 'bg-gray-300 dark:bg-gray-600'
              }`}
            />
          ))}
        </div>
        
        <div className="flex space-x-5">
          {showPrevious && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onPrevious}
              className="px-8 py-3 text-lg font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Previous
            </motion.button>
          )}
          
          {showSkip && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onSkip}
              className="px-8 py-3 text-lg font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Skip
            </motion.button>
          )}
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onAction}
            disabled={isCompleting}
            className="px-10 py-3 text-lg font-bold bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl transition-all duration-200 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
          >
            {isCompleting ? (
              <>
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Setting up...
              </>
            ) : (
              <>
                {actionText}
                <Play className="w-6 h-6" />
              </>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default StepNavigation; 