import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FaDiscord } from "react-icons/fa";
import { useRouter } from 'next/navigation';
import { useUserInfo } from '@/hooks/useUserInfo';

interface WelcomeDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onClinicUnlocked?: () => Promise<void>;
}

const WelcomeDialog: React.FC<WelcomeDialogProps> = ({ 
  isOpen, 
  onOpenChange,
  onClinicUnlocked
}) => {
  const router = useRouter();
  const { userInfo, unlockGame } = useUserInfo();
  const [isFullscreenPromptVisible, setIsFullscreenPromptVisible] = useState(false);
  const [isClinicUnlocked, setIsClinicUnlocked] = useState(false);

  useEffect(() => {
    // Listen for a custom event from FullscreenPrompt
    const handleFullscreenPromptChange = (e: CustomEvent) => {
      setIsFullscreenPromptVisible(e.detail.isVisible);
    };

    window.addEventListener('fullscreenPromptChange', handleFullscreenPromptChange as EventListener);
    return () => {
      window.removeEventListener('fullscreenPromptChange', handleFullscreenPromptChange as EventListener);
    };
  }, []);

  useEffect(() => {
    if (userInfo?.unlocks) {
      const unlocksArray = typeof userInfo.unlocks === 'string' 
        ? JSON.parse(userInfo.unlocks) 
        : userInfo.unlocks;
      setIsClinicUnlocked(Array.isArray(unlocksArray) && unlocksArray.includes('game'));
    }
  }, [userInfo]);

  const handleOpenChange = (open: boolean) => {
    // Only prevent closing if fullscreen prompt is not visible
    if (!open && !isFullscreenPromptVisible) {
      return;
    }
    onOpenChange(open);
  };

  const unlock = async () => {
    try {
      // Close modal using handleOpenChange instead of onOpenChange
      handleOpenChange(false);
      
      // Handle async operations after
      await unlockGame();
      if (onClinicUnlocked) {
        await onClinicUnlocked();
      }
    } catch (error) {
      console.error('Error unlocking clinic:', error);
    }
  };

  const handleGoToDashboard = () => {
    router.push('/home');
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="z-[100]">
        <DialogHeader>
          <DialogTitle className="text-[--theme-text-color] text-center">{"Welcome to The Anki Clinic!"}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="mb-4">
            <video
              src="https://my-mcat.s3.us-east-2.amazonaws.com/tutorial/MyMCATAnkiTeaser.mp4"
              controls
              className="w-full"
            >
              {"Your browser does not support the video tag."}
            </video>
          </div>
          <p className="text-center text-[--theme-text-color] mb-4">
            {"Welcome to the Anki Clinic, a fun and competitive Anki experience! Join our Discord community to connect with other students and access additional study resources."}
          </p>
          <div className="space-y-4">
            {!isClinicUnlocked && (
              <div className="mb-4">
                <Button 
                  onClick={unlock}
                  className="w-full py-6 text-lg font-semibold bg-[--theme-hover-color] text-[--theme-hover-text] hover:bg-opacity-75"
                >
                  {"Let's Play!"}
                </Button>
              </div>
            )}
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
              <Button 
                onClick={handleGoToDashboard}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white text-sm"
              >
                {"Go to Dashboard"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeDialog;
