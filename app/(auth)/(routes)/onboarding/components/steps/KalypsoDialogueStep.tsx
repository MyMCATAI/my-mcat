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
    `Hey ${firstName}! 👋 I'm Kalypso, your personal AI MCAT mentor! I see you're aiming for ${targetScore ? `a ${targetScore}+ MCAT score` : 'a competitive MCAT score'}${targetMedSchool ? ` to get into ${targetMedSchool}` : ''}. That's an awesome goal, and I'm here to help you achieve it! ✨`
  );

  const handleKalypsoDialogue = useCallback(() => {
    switch (messageId) {
      case 1:
        setKalypsoMessage(
          `First up ${firstName}, let me introduce you to our amazing <strong>Doctor's Office game</strong>! 🎮\n\nImagine learning MCAT concepts while running your own virtual clinic - diagnosing patients, solving medical mysteries, and applying scientific concepts in real-world scenarios.\n\nYou'll <strong>earn points</strong>, unlock achievements, and compete with other pre-med students. The best part? It's <strong>free forever</strong>! 🏥✨`
        );
        setMessageId(2);
        break;
      case 2:
        setKalypsoMessage(
          `Ready to supercharge your MCAT prep, ${firstName}? Our <strong>Gold Plan</strong> is where the magic happens! 🌟\n\nAs your dedicated AI tutor, I'll craft a <strong>personalized study strategy</strong> designed to help you reach that ${targetScore ? `${targetScore}+ score` : 'target score'}. You'll get:\n• Daily CARS passages with detailed analysis\n• Full-length tests with AI-powered reviews\n• Adaptive quizzes targeting your weak spots\n• 24/7 AI tutoring support\n\nIt's like having a brilliant MCAT tutor in your pocket! 🚀📚`
        );
        setMessageId(3);
        break;
      case 3:
        setKalypsoMessage(
          `And for those aiming for excellence${targetMedSchool ? ` (perfect for ${targetMedSchool} aspirants)` : ''}, there's our <strong>MD Premium</strong> experience! 💫\n\nJoin an <strong>elite community</strong> of future physicians and get:\n• 1-on-1 expert tutoring sessions\n• Private Discord community access\n• Score improvement guarantee\n• Priority AI support\n• Exclusive study resources\n\nIt's the most comprehensive MCAT prep ever created! 🎓✨`
        );
        setMessageId(4);
        break;
      case 4:
        setKalypsoMessage(
          `${firstName}, you've already taken the first step by being here - that's huge! 🌟\n\n${targetMedSchool ? `I know getting into ${targetMedSchool} is your dream, and ` : ''}I'll be right here to support your journey${targetScore ? ` to that ${targetScore}+ score` : ''}.\n\nReady to transform your MCAT prep into an exciting adventure? Let's make those med school dreams come true! 💪🎉`
        );
        setMessageId(5);
        break;
      case 5:
        onComplete();
        setMessageId(6);
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
          ${messageId === 2 ? 'bg-gradient-to-br from-emerald-950 via-green-900 to-emerald-900' : ''}
          ${messageId === 3 ? 'bg-gradient-to-br from-amber-950 via-yellow-900 to-amber-900' : ''}
          ${messageId === 4 ? 'bg-gradient-to-br from-sky-950 via-blue-900 to-sky-900' : ''}
          ${messageId === 1 || messageId >= 5 ? 'bg-gradient-to-br from-gray-950 via-slate-900 to-gray-900' : ''}
          hover:shadow-lg hover:shadow-${messageId === 2 ? 'emerald' : messageId === 3 ? 'amber' : messageId === 4 ? 'sky' : 'gray'}-400/20
          max-w-2xl mx-auto space-y-6 relative overflow-hidden group border border-white/10`}
      >
        {/* Glow Effect - Show for specific plans */}
        {messageId >= 2 && messageId <= 4 && (
          <div className={`absolute inset-0 bg-gradient-to-r 
            ${messageId === 2 ? 'from-emerald-400/0 via-emerald-400/10 to-emerald-400/0' : ''}
            ${messageId === 3 ? 'from-amber-400/0 via-amber-400/10 to-amber-400/0' : ''}
            ${messageId === 4 ? 'from-sky-400/0 via-sky-400/10 to-sky-400/0' : ''}
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
              ${messageId <= 2 
                ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400 text-amber-950' 
                : 'bg-blue-600 text-white'} 
              hover:opacity-90 focus:outline-none focus:ring-2 
              ${messageId <= 2 ? 'focus:ring-amber-400/50' : 'focus:ring-blue-400/50'}`}
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