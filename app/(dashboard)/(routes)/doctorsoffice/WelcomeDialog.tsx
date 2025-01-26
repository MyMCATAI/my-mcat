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
  const { userInfo } = useUserInfo();
  const [isFullscreenPromptVisible, setIsFullscreenPromptVisible] = useState(false);

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

  const [isClinicUnlocked, setIsClinicUnlocked] = useState(false);
  
  useEffect(() => {
    if (userInfo?.unlocks && Array.isArray(userInfo.unlocks)) {
      setIsClinicUnlocked(userInfo.unlocks.includes('game'));
    }
  }, [userInfo]);

  const handleOpenChange = (open: boolean) => {
    // Don't allow closing if clinic is not unlocked
    if (!open && !isClinicUnlocked) {
      return;
    }
    // Only allow closing if FullscreenPrompt is visible
    if (!open && !isFullscreenPromptVisible) {
      return;
    }
    onOpenChange(open);
  };

  const unlock = async () => {
    try {
      const response = await fetch('/api/user-info', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          unlockGame: true
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to unlock clinic');
      }
      const data = await response.json();
      setIsClinicUnlocked(true);
      
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
    <Dialog 
      open={isOpen && !isClinicUnlocked}
      onOpenChange={handleOpenChange}
      modal={!isFullscreenPromptVisible}
    >
      <DialogContent 
        className="max-w-[33rem] bg-[--theme-doctorsoffice-accent] border text-[--theme-text-color] border-[--theme-border-color]"
        style={{ 
          visibility: isFullscreenPromptVisible ? 'hidden' : 'visible' 
        }}
        onClick={(e) => e.stopPropagation()}
      >
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
              Your browser does not support the video tag.
            </video>
          </div>
          <p className="text-center mb-4">
            Welcome to the Anki Clinic, a fun and competitive Anki experience! Join our Discord community to connect with other students and access additional study resources.
          </p>
          <div className="space-y-4">
            {!isClinicUnlocked && (
              <div className="mb-4">
                <Button 
                  onClick={unlock}
                  className="w-full py-6 text-lg font-semibold bg-[--theme-hover-color] text-[--theme-hover-text] hover:bg-opacity-75"
                >
                  Unlock the Anki Clinic!
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
                Go to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeDialog;
