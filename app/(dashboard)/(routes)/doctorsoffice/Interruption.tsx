//app/(dashboard)/(routes)/doctorsoffice/Interruption.tsx

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAudio } from '@/contexts/AudioContext';

interface InterruptionProps {
  isVisible: boolean;
  onClose: () => void;
  message: string;
  imageUrl: string;
  duration?: number;
  audioUrl?: string;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
}

const Interruption = ({
  isVisible,
  onClose,
  message,
  imageUrl,
  duration = 5000,
  audioUrl = 'warning',
  position = 'top-left'
}: InterruptionProps) => {

  const [typedText, setTypedText] = useState("");
  const { playSound } = useAudio();

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
  };

  useEffect(() => {
    let typingTimer: NodeJS.Timeout;
    let dismissTimer: NodeJS.Timeout;

    if (isVisible) {
      // Start typing animation
      let index = 0;
      typingTimer = setInterval(() => {
        setTypedText(message.slice(0, index + 1));
        index++;
        if (index >= message.length) {
          clearInterval(typingTimer);
        }
      }, 50);

      // Play sound
      if (audioUrl) {
        playSound(audioUrl);
      }

      // Auto-dismiss
      dismissTimer = setTimeout(() => {
        onClose();
      }, duration);
    }

    return () => {
      clearInterval(typingTimer);
      clearTimeout(dismissTimer);
    };
  }, [isVisible, message, duration, audioUrl, onClose, playSound]);

  const handleClick = () => {
    onClose();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ x: -200, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -200, opacity: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 100 }}
          className={`absolute z-50 ${positionClasses[position]}`}
        >
          <div className="flex items-start gap-4">
            <div className="w-32 h-32 bg-[--theme-doctorsoffice-accent] border-2 border-[--theme-border-color] rounded-lg overflow-hidden">
              <button
                onClick={handleClick}
                className="w-full h-full relative overflow-hidden transition duration-200 ease-in-out transform hover:-translate-y-2 focus:outline-none"
              >
                <img
                  src={imageUrl}
                  alt="Interruption Character"
                  className="w-full h-full object-cover transform scale-[2] translate-y-[45%]"
                />
              </button>
            </div>
            
            {typedText && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative mt-4"
              >
                <div className="bg-white p-4 rounded-2xl shadow-lg relative">
                  <div className="absolute w-4 h-4 bg-white transform rotate-45 left-[-0.5rem] top-6" />
                  <p className="text-black font-semibold text-lg whitespace-pre-wrap">
                    {typedText}
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Interruption; 