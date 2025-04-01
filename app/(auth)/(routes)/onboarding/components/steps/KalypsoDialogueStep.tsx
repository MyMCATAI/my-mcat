"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

interface KalypsoDialogueStepProps {
  onComplete: () => void;
  firstName?: string;
  targetScore?: number | null;
  targetMedSchool?: string| null;
}

export const KalypsoDialogueStep = ({ 
  onComplete, 
  firstName = "future doctor",
  targetScore,
  targetMedSchool,
}: KalypsoDialogueStepProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGetStarted = useCallback(() => {
    setIsLoading(true);
    onComplete();
  }, [onComplete]);

  const kalypsoMessage = `Hey ${firstName}! 👋 I'm Kalypso, your superkitty companion! I see you're aiming for a ${targetScore || 'great'} MCAT score${targetMedSchool ? ` for ${targetMedSchool}` : ''}. Let's make it happen! ✨

• Interactive flashcards with videos
• AI-powered study plans
• Practice tests with analysis
• 24/7 support

Ready to ace the MCAT? 🚀`;

  return (
    <div className="relative min-h-[60vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8 rounded-xl bg-gradient-to-br from-gray-950 via-slate-900 to-gray-900
          hover:shadow-lg hover:shadow-blue-400/20
          max-w-2xl mx-auto space-y-6 relative overflow-hidden group border border-white/10"
      >
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-blue-400/5 to-blue-400/0
          opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <p 
          className="text-white text-xl font-light relative leading-relaxed whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ __html: kalypsoMessage.replace(/\n/g, '<br />') }}
        />

        <div className="flex justify-center relative">
          <motion.button
            onClick={handleGetStarted}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            disabled={isLoading}
            className="px-8 py-3 rounded-xl transition-all duration-300 font-medium
              bg-gradient-to-r from-purple-500 to-pink-500 text-white
              hover:from-purple-600 hover:to-pink-600
              hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-purple-400/50
              disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </span>
            ) : (
              "Let's Get Started!"
            )}
          </motion.button>
        </div>
      </motion.div>

      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: "0%" }}
        transition={{ type: "spring", duration: 1 }}
        className="fixed -bottom-6 left-1/2 -translate-x-1/2 md:bottom-0 md:right-8 md:translate-x-0 md:left-auto z-50 pointer-events-none"
      >
        <div className="w-[20rem] h-[24rem] md:w-[24rem] md:h-[24rem] lg:w-[32rem] lg:h-[32rem] relative">
          <Image
            src="/kalypso/kalypsoend.gif"
            alt="Kalypso"
            fill
            className="object-contain"
            priority
          />
        </div>
      </motion.div>
    </div>
  );
}; 