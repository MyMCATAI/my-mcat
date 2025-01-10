"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SettingContent from "@/components/calendar/SettingContent";

export default function ExamCalendarPage() {
  const router = useRouter();
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    // After video duration (11s) + small buffer, transition to settings
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 11500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#001226] flex items-center justify-center py-4">
      <AnimatePresence mode="wait">
        {showWelcome ? (
          <motion.div
            key="welcome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full flex items-center justify-center px-4 md:px-8"
          >
            <div className="w-full max-w-6xl flex flex-col md:flex-row items-center gap-8 md:gap-16">
              {/* Video Section - Left */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="w-full md:w-[25rem] aspect-[9/16] rounded-3xl overflow-hidden shadow-2xl bg-black/20"
              >
                <video
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                  src="https://my-mcat.s3.us-east-2.amazonaws.com/tutorial/KalypsoTrain2.mp4"
                />
              </motion.div>

              {/* Text Section - Right */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="flex-1 text-center md:text-left"
              >
                <div className="space-y-4 mb-4">
                  <h2 className="text-2xl md:text-3xl text-white/80 font-light">
                    Welcome to
                  </h2>
                  <h1 className="font-['Krungthep'] text-4xl md:text-6xl lg:text-7xl text-white">
                    mymcat.ai
                  </h1>
                </div>
              </motion.div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="settings"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full flex items-center justify-center px-4"
          >
            <div className="w-full max-w-5xl">
              <SettingContent 
                isInitialSetup={true}
                onComplete={async (result) => {
                  if (result.success) {
                    router.push('/home');
                  }
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
