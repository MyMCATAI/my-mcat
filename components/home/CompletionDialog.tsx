import Image from "next/image";
import ReactConfetti from "react-confetti";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CompletionDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const CompletionDialog: React.FC<CompletionDialogProps> = ({ isOpen, onClose }) => {
  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    // Set window size on mount and update on resize
    const updateWindowSize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateWindowSize();
    window.addEventListener("resize", updateWindowSize);

    return () => window.removeEventListener("resize", updateWindowSize);
  }, []);

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <ReactConfetti
            width={windowSize.width}
            height={windowSize.height}
            recycle={true}
            numberOfPieces={200}
          />
        </div>
      )}
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent 
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-8 rounded-xl shadow-xl max-w-2xl w-full z-50" 
          style={{ 
            backgroundColor: 'var(--theme-leaguecard-color)',
            borderColor: 'var(--theme-border-color)'
          }}>
          <DialogHeader className="text-center mb-6">
            <DialogTitle 
              className="text-center text-4xl font-bold animate-pulse-subtle"
              style={{ color: 'var(--theme-hover-color)' }}>
              You&apos;re Done!
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-6 space-y-6">
            <div className="relative w-[31rem] h-56 overflow-hidden ml-20">
              <Image
                src="/Kalypsoapproval.gif"
                alt="Kalypso Approval"
                layout="fill"
                objectFit="cover"
                objectPosition="center top"
                priority
                className="rounded-lg"
              />
            </div>
            <p className="text-center text-2xl font-semibold" style={{ color: 'var(--theme-text-color)' }}>
              Congratulations! You&apos;ve completed all your tasks for today! 🎉
            </p>
            <p className="text-center text-lg" style={{ color: 'var(--theme-text-color)', opacity: 0.8 }}>
              Please go touch grass now.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CompletionDialog;