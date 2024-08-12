import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface InterludeProps {
  onComplete: () => void;
}

const Interlude: React.FC<InterludeProps> = ({ onComplete }) => {
  const [text, setText] = useState('');
  const fullText = 'Welcome to your personalized MCAT study session. Let\'s begin by reviewing your progress and setting goals for today.';

  useEffect(() => {
    let i = 0;
    const typingInterval = setInterval(() => {
      if (i < fullText.length) {
        setText(fullText.slice(0, i + 1));
        i++;
      } else {
        clearInterval(typingInterval);
      }
    }, 50);

    return () => clearInterval(typingInterval);
  }, []);

  return (
    <div className="relative h-screen bg-black flex items-start justify-start p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-blue-500 font-mono text-sm sm:text-base md:text-lg lg:text-xl"
        style={{ maxWidth: '80%' }}
      >
        {text}
      </motion.div>
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 0.5 }}
        className="absolute bottom-8 right-8 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        onClick={onComplete}
      >
        Click for calendar &gt;&gt;
      </motion.button>
    </div>
  );
};

export default Interlude;