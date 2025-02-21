"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

interface KalypsoDialogueStepProps {
  onComplete: () => void;
  firstName?: string;
  targetScore?: number;
  targetMedSchool?: string;
}

export const KalypsoDialogueStep = ({ 
  onComplete, 
  firstName = "future doctor",
  targetScore,
  targetMedSchool,
}: KalypsoDialogueStepProps) => {
  const [messageId, setMessageId] = useState(1);
  const [kalypsoMessage, setKalypsoMessage] = useState(
    `Hey ${firstName}! 👋 I'm Kalypso, your superkitty companion! I see you're aiming for ${targetScore ? `a ${targetScore}+ MCAT score` : 'a competitive MCAT score'}${targetMedSchool ? ` to get into ${targetMedSchool}` : ''}. That's an awesome goal, and I'm here to help you achieve it! ✨`
  );

  const handleKalypsoDialogue = useCallback(() => {
    switch (messageId) {
      case 1:
        setKalypsoMessage(
          `First up ${firstName}, let me introduce you to our amazing <strong>Anki game</strong>! 🎮\n\n` +
          `Anki is boring and doesn't have multiple choice questions or videos incorporated into it. We do!\n\n` +
          `Imagine learning MCAT concepts while running your own virtual clinic. You'll <strong>earn points</strong>, unlock achievements, and compete with other pre-med students.\n\n` +
          `The best part? It's <strong>free</strong>! 🏥✨`
        );
        setMessageId(2);
        break;
      case 2:
        setKalypsoMessage(
          `But if you need need a self-paced MCAT course, ${firstName}, our <strong>Gold Plan</strong> is where the magic happens! 🌟\n\n` +
          `It works with your AAMC and UWorld and has ALL the content you need to study from the BEST resources like Khan Academy and Chad's Prep.\n\n` +
          `Our real value add is that our algorithm picks the best content for your weaknesses. We'll work together on a <strong>personalized study strategy</strong> designed to help you reach that ${targetScore ? `${targetScore}+ score` : 'target score'}.\n\n` +
          `You'll get:\n` +
          `• All of the videos, readings, quizzes you need\n` +
          `• An adaptive study schedule that works with your resources\n` +
          `• Daily CARS passages with an AI tutor\n` +
          `• Full length review testing suite\n` +
          `• 24/7 support from lil ol'me\n\n` +
          `• In a system that learns what you know\n` +
          `🚀📚`
        );
        setMessageId(3);
        break;
      case 3:
        setKalypsoMessage(
          `And for those aiming for excellence${targetMedSchool ? ` (perfect for ${targetMedSchool} aspirants)` : ''}, there's <strong>MD Platinum</strong> experience! 💫\n\nJoin an <strong>elite community</strong> of future physicians and get:\n• 36 hours of MCAT instruction\n• Peer-based learning groups\n• Your Curriculum designed by medical educators\n• Full access to our software suite\n• Direct access to the founders\n\nIt's the most comprehensive MCAT prep ever created! 🎓✨`
        );
        setMessageId(4);
        break;
      
      case 4:
        onComplete();
        setMessageId(5);
        break;
    }
  }, [messageId, onComplete, firstName, targetScore, targetMedSchool]);

  // Only return null after we've triggered the completion
  if (messageId > 5) return null;

  return (
    <div className="relative min-h-[60vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-8 rounded-xl 
          ${messageId === 1 ? 'bg-gradient-to-br from-gray-950 via-slate-900 to-gray-900' : ''}
          ${messageId === 2 ? 'bg-gradient-to-br from-[#1a1a3e] via-[#1a1a34] to-[#1a1a2a]' : ''}
          ${messageId === 3 ? 'bg-gradient-to-br from-[#1a1a3e] via-[#1a1a34] to-[#1a1a2a]' : ''}
          ${messageId === 4 ? 'bg-gradient-to-br from-[#1a1a3e] via-[#1a1a34] to-[#1a1a2a]' : ''}
          hover:shadow-lg hover:shadow-blue-400/20
          max-w-2xl mx-auto space-y-6 relative overflow-hidden group border border-white/10`}
      >
        {/* Glow Effect - Show for specific plans */}
        {messageId >= 2 && messageId <= 4 && (
          <div className={`absolute inset-0 bg-gradient-to-r from-blue-400/0 via-blue-400/5 to-blue-400/0
            opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
        )}

        {/* Plan Image - Show for specific plans */}
        {messageId >= 2 && messageId <= 4 && (
          <div className="absolute top-4 right-4">
            <Image
              src={messageId === 2 ? "/kalypsotalk.gif" : messageId === 3 ? "/MD_Premium_Pro.png" : "/MDPremium.png"}
              alt={messageId === 2 ? "Game" : messageId === 3 ? "Gold Plan" : "Premium Plan"}
              width={40}
              height={40}
              className="rounded-lg object-contain scale-110 transition-transform duration-300 group-hover:scale-125"
              style={{ animation: 'float 3s ease-in-out infinite' }}
            />
          </div>
        )}

        <p 
          className="text-white text-xl font-light relative leading-relaxed whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ __html: kalypsoMessage.replace(/\n/g, '<br />') }}
        />

        <div className="flex justify-end relative">
          <motion.button
            onClick={handleKalypsoDialogue}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className={`px-8 py-3 rounded-xl transition-all duration-300 font-medium
              bg-gradient-to-r from-purple-500 to-pink-500 text-white
              hover:from-purple-600 hover:to-pink-600
              hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-purple-400/50`}
          >
            {messageId === 4 ? "Let's Get Started!" : "Continue"}
          </motion.button>
        </div>
      </motion.div>

      {kalypsoMessage && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: "0%" }}
          transition={{ type: "spring", duration: 1 }}
          className="fixed -bottom-6 left-1/2 -translate-x-1/2 md:bottom-0 md:right-8 md:translate-x-0 md:left-auto z-50 pointer-events-none"
        >
          <div className="w-[20rem] h-[24rem] md:w-[24rem] md:h-[24rem] lg:w-[32rem] lg:h-[32rem] relative">
            <Image
              src="/kalypsoend.gif"
              alt="Kalypso"
              fill
              className="object-contain"
              priority
            />
          </div>
        </motion.div>
      )}
    </div>
  );
}; 