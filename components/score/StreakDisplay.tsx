// components/streak/StreakPopup.tsx
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useEffect, useRef } from "react";
import Image from "next/image";

interface StreakPopupProps {
  streak: number;
  isOpen: boolean;
  onClose: () => void;
}

const StreakPopup = ({ streak, isOpen, onClose }: StreakPopupProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (isOpen && audioRef.current) {
      audioRef.current.play().catch(error => {
        console.error("Error playing audio:", error);
      });
    }
  }, [isOpen]);

  const getStreakMessage = (streak: number) => {
    if (streak === 1) {
      return null;
    } else if (streak >= 2 && streak < 7) {
      return {
        image: "/kalypsotyping.gif",
        title: `You're on a ${streak} day streak!`,
        subtitle: "Heck yeah for locking in! 🔥"
      };
    } else {
      return {
        image: "/kalypsofloatinghappy.gif",
        title: `You're on a ${streak} day streak!`,
        subtitle: "I'm so proud of you! ❤️"
      };
    }
  };

  const message = getStreakMessage(streak);

  if (!message) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent 
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-6 rounded-lg shadow-xl max-w-[32rem] w-full z-[9999]"
          style={{ 
            backgroundColor: 'var(--theme-leaguecard-color)',
            borderColor: 'var(--theme-border-color)'
          }}
        >
          <div className="flex flex-col items-center justify-center p-4 space-y-6">
            <div className="relative w-[20rem] h-[12rem] overflow-hidden rounded-lg">
              <Image
                src={message.image}
                alt="Kalypso"
                layout="fill"
                objectFit="cover"
                objectPosition="center -50%"
                className={message.image.includes('kalypsofloating') ? 'scale-150' : ''}
              />
            </div>
            <h2 
              className="text-[2rem] font-bold text-center animate-pulse-subtle"
              style={{ color: 'var(--theme-hover-color)' }}
            >
              {message.title}
            </h2>
            <p 
              className="text-center text-[1.25rem]"
              style={{ color: 'var(--theme-text-color)', opacity: 0.8 }}
            >
              {message.subtitle}
            </p>
          </div>
        </DialogContent>
      </Dialog>
      <audio ref={audioRef} src="/streakdaily.mp3" />
    </>
  );
};

export default StreakPopup;