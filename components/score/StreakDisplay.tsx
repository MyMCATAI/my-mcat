// components/streak/StreakPopup.tsx
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { FaFire } from "react-icons/fa";

interface StreakPopupProps {
  streak: number;
  isOpen: boolean;
  onClose: () => void;
}

const StreakPopup = ({ streak, isOpen, onClose }: StreakPopupProps) => {
  const [previousStreak, setPreviousStreak] = useState(streak);

  useEffect(() => {
    if (streak > previousStreak && streak > 1) {  // Only play on streak increases
      if (streak >= 30) {
        // Play only monthly streak sound for 30+ days
        const audio = new Audio('/streakmonth.mp3');
        audio.pause();
        audio.currentTime = 0;
        audio.play();
      } else {
        // Play daily streak sound for streaks below 30
        const audio = new Audio('/streakdaily.mp3');
        audio.pause();
        audio.currentTime = 0;
        audio.play();
      }
    }
    
    setPreviousStreak(streak);
  }, [streak, previousStreak]);

  const getStreakMessage = (streak: number) => {
    if (streak <= 1) {
      return null;
    } else {
      return {
        image: streak >= 30
          ? "/kalypsodancing.gif"
          : streak >= 14 
            ? "/kalypsofloatinghappy.gif"
            : streak >= 7 
              ? "/kalypsothumbs.gif"
              : "/kalypsoyouate.gif",
        title: `${streak} DAY STREAK!`,
        subtitle: streak >= 30
          ? "You're a rockstar!"
          : streak >= 14
            ? "I'm so proud of you! ❤️"
            : streak >= 7
              ? "You're becoming my bestie now!"
              : "You ate with that!",
        style: {
          objectPosition: streak >= 30
            ? 'center -50%'  // Dancing Kalypso position
            : streak >= 14
              ? 'center -100%'  // Floating happy Kalypso position
              : streak >= 7
                ? 'center -80%'  // Thumbs up Kalypso position
                : 'center center'  // Default typing position
        }
      };
    }
  };

  const message = getStreakMessage(streak);

  if (!message) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent 
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-0 rounded-2xl shadow-2xl max-w-[36rem] w-full z-[9999] overflow-hidden border-0"
            style={{ 
              backgroundColor: 'var(--theme-leaguecard-color)'
            }}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative"
            >
              {/* Streak Fire Background */}
              <div className="absolute inset-0 flex items-center justify-center opacity-10">
                <FaFire 
                  className="text-[20rem]" 
                  style={{ color: 'var(--theme-hover-color)' }}
                />
              </div>

              <div className="flex flex-col items-center justify-center p-8 space-y-6 relative z-10">
                {/* Kalypso Image */}
                <div className="relative w-[24rem] h-[16rem] rounded-xl overflow-hidden transform hover:scale-105 transition-transform duration-300">
                  <Image
                    src={message.image}
                    alt="Kalypso"
                    fill
                    className="object-cover"
                    style={{ 
                      ...message.style
                    }}
                  />
                </div>

                {/* Streak Counter */}
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="flex items-center gap-4 px-6 py-3 rounded-full shadow-lg"
                  style={{
                    background: `linear-gradient(to right, var(--theme-gradient-startstreak), var(--theme-gradient-endstreak))`
                  }}
                >
                  <FaFire className="text-4xl text-white animate-pulse" />
                  <h2 className="text-[2.5rem] font-bold text-white tracking-wider">
                    {message.title}
                  </h2>
                </motion.div>

                {/* Subtitle */}
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-center text-[1.5rem] font-medium"
                  style={{ color: 'var(--theme-text-color)' }}
                >
                  {message.subtitle}
                </motion.p>
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
};

export default StreakPopup;