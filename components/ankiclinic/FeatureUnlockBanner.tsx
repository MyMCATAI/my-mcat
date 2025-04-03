"use client";

import { useState, useEffect } from "react";
import { useFeatureUnlock } from "@/hooks/useFeatureUnlock";
import { useUser, useUI } from "@/store/selectors";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { NAVIGATION_ITEMS } from "../navigation/HoverSidebar";
import { motion } from "framer-motion";
import Image from "next/image";
import { useWindowSize } from '@/store/selectors';

export const FeatureUnlockBanner = () => {
  const [shouldShowBanner, setShouldShowBanner] = useState(false);
  
  const { coins } = useUser();
  const { context, setContext } = useUI();
  const { isFeatureUnlocked } = useFeatureUnlock();
  const windowSize = useWindowSize();
  const isMobile = !windowSize.isDesktop;
  
  // Check if banner was dismissed using UI context instead of localStorage
  const isBannerDismissed = context?.ankiClinicBannerDismissed || false;
  
  // Only show the banner if:
  // 1. Kalypso AI is not yet unlocked
  // 2. User has at least the minimum coins to unlock
  // 3. Banner was not explicitly dismissed
  useEffect(() => {
    const isKalypsoUnlocked = isFeatureUnlocked("kalypso-ai");
    const canUnlock = coins >= 5
    
    setShouldShowBanner(!isKalypsoUnlocked && canUnlock && !isBannerDismissed);
  }, [coins, isFeatureUnlocked, isBannerDismissed]);
  
  // Hide the banner when dismissed using Zustand context
  const handleDismiss = () => {
    setContext({ ...context, ankiClinicBannerDismissed: true });
  };
  
  if (!shouldShowBanner) return null;

  // Find the next unlockable item
  const nextUnlockable = NAVIGATION_ITEMS.find(item => 
    item.requiresUnlock && !isFeatureUnlocked(item.id) && coins >= (item.unlockCost || 0)
  );
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`relative ${isMobile ? 'mx-3 my-4' : 'm-8'} p-4 bg-gradient-to-r from-emerald-500/40 via-blue-500/30 to-purple-500/40 rounded-lg border border-emerald-300/50 shadow-lg backdrop-blur-sm`}
    >
      <button 
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-white/70 hover:text-white transition-colors"
      >
        <X size={18} />
      </button>
      
      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className={`p-2 bg-emerald-500/20 rounded-full flex-shrink-0 animate-pulse rotate-45`}>
          {isMobile ? (
            <ChevronRight className="w-8 h-8 text-emerald-400" />
          ) : (
            <ChevronLeft className="w-8 h-8 text-emerald-400" />
          )}
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-bold text-emerald-300 mb-1">You've earned enough coins!</h3>
          <div className="flex items-center gap-1 mb-2">
            <span className="text-white/80 text-sm">Your balance:</span>
            <div className="bg-emerald-500/20 px-2 py-0.5 rounded-full flex items-center">
              <span className="font-bold text-white">{coins}</span>
              <Image 
                src="/coin.png" 
                alt="coins" 
                width={16} 
                height={16} 
                className="ml-1" 
              />
            </div>
          </div>
          <p className="text-white/80 text-sm">
            {isMobile ? (
              <>Tap the <span className="font-bold text-emerald-300 animate-pulse">highlighted menu button</span> in the bottom right 
                <span className="inline-block animate-bounce rotate-45 mx-1">↘</span> 
                to access the navigation menu and unlock exciting features like {nextUnlockable?.name || "Kalypso AI"}.
              </>
            ) : (
              <>Hover near the <span className="font-bold text-emerald-300 animate-pulse">highlighted menu button</span> on the left edge of your screen 
                <span className="inline-block animate-bounce mx-1 rotate-45">↖</span> 
                to open the navigation sidebar and unlock exciting new features like {nextUnlockable?.name || "Kalypso AI"}.
              </>
            )}
          </p>
        </div>
      </div>
      
      {/* Visual connector to the sidebar button */}
      {!isMobile && (
        <motion.div 
          className="absolute left-[-65px] top-1/2 transform -translate-y-1/2 pointer-events-none"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <svg width="60" height="40" viewBox="0 0 60 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path 
              d="M2 20H58" 
              stroke="#10b981" 
              strokeWidth="2" 
              strokeDasharray="4 4"
            />
            <path 
              d="M15 5L2 20L15 35" 
              stroke="#10b981" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>
      )}
      
      {/* Mobile connector pointing to bottom right */}
      {isMobile && (
        <motion.div 
          className="absolute right-4 bottom-[-20px] transform rotate-45 pointer-events-none"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path 
              d="M5 5L35 35" 
              stroke="#10b981" 
              strokeWidth="2" 
              strokeDasharray="4 4" 
            />
            <path 
              d="M35 15V35H15" 
              stroke="#10b981" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>
      )}
      
      {/* Decorative elements */}
      <div className="absolute -bottom-1 -right-1 w-40 h-24 opacity-20 pointer-events-none">
        <svg xmlns="http://www.w3.org/2000/svg" width="160" height="100" viewBox="0 0 160 100" fill="none">
          <path d="M32 42C32 59.9 46.1 74 64 74C81.9 74 96 59.9 96 42C96 24.1 81.9 10 64 10" stroke="white" strokeWidth="2" strokeDasharray="4 4"/>
          <path d="M64 74C46.1 74 32 88.1 32 106C32 123.9 46.1 138 64 138C81.9 138 96 123.9 96 106" stroke="white" strokeWidth="2" strokeDasharray="4 4"/>
          <path d="M97 42C97 59.9 111.1 74 129 74C146.9 74 161 59.9 161 42C161 24.1 146.9 10 129 10" stroke="white" strokeWidth="2" strokeDasharray="4 4"/>
        </svg>
      </div>
    </motion.div>
  );
}; 