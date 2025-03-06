import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FaDiscord } from "react-icons/fa";
import { useRouter } from 'next/navigation';
import { useUserInfo } from '@/hooks/useUserInfo';

interface WelcomeDialogProps {
  isOpen: boolean;
  onUnlocked: () => void;
}

const WelcomeDialog: React.FC<WelcomeDialogProps> = ({ 
  isOpen, 
  onUnlocked
}) => {
  const { unlockGame } = useUserInfo();

  const unlock = async () => {
    try {
      await unlockGame();
      onUnlocked()
    } catch (error) {
      console.error('Error unlocking clinic:', error);
    }
  };


  return (
    <Dialog open={isOpen} >
      <DialogContent className="z-[100] bg-[--theme-leaguecard-color]">
        <DialogHeader>
          <DialogTitle className="text-[--theme-text-color] text-center">{"Welcome to The Anki Clinic!"}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-center text-[--theme-text-color] mb-4">
            {"Welcome to the Anki Clinic, a fun and competitive Anki experience! Join our Discord community to connect with other students and access additional study resources."}
          </p>
          <div className="space-y-4">
            <div className="mb-4">
              <Button 
                onClick={unlock}
                className="w-full py-6 text-lg font-semibold bg-[--theme-hover-color] text-[--theme-hover-text] hover:bg-opacity-75"
              >
                {"Let's Play!"}
              </Button>
            </div>
            <div className="flex gap-2">
              <a 
                href="https://discord.gg/DcHWnEu8Xb" 
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <Button className="w-full bg-gray-600 hover:bg-gray-700 text-white text-sm">
                  <FaDiscord className="w-4 h-4 mr-2" />
                  Join Discord
                </Button>
              </a>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeDialog;
