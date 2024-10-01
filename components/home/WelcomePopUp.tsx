import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { motion } from 'framer-motion';

interface WelcomePopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const WelcomePopup: React.FC<WelcomePopupProps> = ({ open, onOpenChange }) => {
  const createShakeAnimation = (delay: number) => ({
    animate: { x: [0, -2, 2, -2, 2, 0] },
    transition: {
      duration: 0.4,
      repeat: Infinity,
      repeatType: "reverse" as const,
      repeatDelay: 1.2,
      delay: delay
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
      >
        <DialogContent 
          className="bg-[--theme-text-color] text-center p-8 bg-[--theme-leaguecard-color] border border-[--theme-border-color] rounded-lg p-6"
          closeButtonClassName="text-[--theme-text-color] hover:text-[--theme-text-color] focus:ring-[--theme-text-color]"
        >
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold text-[--theme-text-color] text-center mb-4">
              Welcome to MyMCAT!
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <section className="bg-[--theme-gradient-end] p-4 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold text-[--theme-border-color] mb-2">New Features:</h2>
              <ul className="list-none text-[--theme-text-color] space-y-2">
                <li>
                  <motion.span
                    animate={createShakeAnimation(0).animate}
                    transition={createShakeAnimation(0).transition}
                    className="inline-block"
                  >
                    🌟
                  </motion.span>{" "}
                  <motion.span
                    animate={createShakeAnimation(0.1).animate}
                    transition={createShakeAnimation(0.1).transition}
                    className="inline-block"
                  >
                    AI-Enhanced Critical Analysis and Reasoning Suite
                  </motion.span>
                </li>
                <li>
                  <motion.span
                    animate={createShakeAnimation(0.2).animate}
                    transition={createShakeAnimation(0.2).transition}
                    className="inline-block"
                  >
                    🎮
                  </motion.span>{" "}
                  <motion.span
                    animate={createShakeAnimation(0.3).animate}
                    transition={createShakeAnimation(0.3).transition}
                    className="inline-block"
                  >
                    Early Version of The Clinic, Our MCAT Game
                  </motion.span>
                </li>
              </ul>
            </section>
            <section className="text-[--theme-text-color]">
              <p className="text-lg mb-4">Click the blue question marks on the corners of the components for short, descriptive videos on our software.</p>
              <p className="text-lg">We recommend checking out the bulletin in the far right component to get started!</p>
              <p className="text-sm mt-4 italic">(Note: There are some bugs in our software: send us messages when you come across them, please.)</p>
            </section>
          </div>
          <DialogFooter className="mt-6">
          </DialogFooter>
        </DialogContent>
      </motion.div>
    </Dialog>
  );
};

export default WelcomePopup;