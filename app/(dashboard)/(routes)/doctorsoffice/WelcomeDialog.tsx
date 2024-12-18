import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FaDiscord, FaLock } from "react-icons/fa";
import { useRouter } from 'next/navigation';
import { PurchaseButton } from '@/components/purchase-button';
import toast from 'react-hot-toast';
import { useUserInfo } from '@/hooks/useUserInfo';

interface WelcomeDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onClinicUnlocked?: () => Promise<void>;
}

const CLINIC_COST = 10;

const WelcomeDialog: React.FC<WelcomeDialogProps> = ({ 
  isOpen, 
  onOpenChange,
  onClinicUnlocked
}) => {
  const router = useRouter();
  const { userInfo } = useUserInfo();

  const [isClinicUnlocked, setIsClinicUnlocked] = useState(false);
  
  useEffect(() => {
    if (userInfo?.unlocks && Array.isArray(userInfo.unlocks)) {
      setIsClinicUnlocked(userInfo.unlocks.includes('game'));
    }
  }, [userInfo]);

  const handleOpenChange = (open: boolean) => {
    // Only allow closing the dialog if the clinic is unlocked
    if (!open && !isClinicUnlocked) {
      return;
    }
    onOpenChange(open);
  };

  const unlock = async () => {
    try {
      if (!userInfo || userInfo.score < CLINIC_COST) {
        toast.error('You do not have enough coins to unlock the clinic.');
        return;
      }

      const response = await fetch('/api/user-info', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          unlockGame: true,
          decrementScore: CLINIC_COST
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to unlock clinic');
      }

      const data = await response.json();
      setIsClinicUnlocked(true);
      toast.success('Welcome to the Anki Clinic!');
      
      if (onClinicUnlocked) {
        await onClinicUnlocked();
      }
    } catch (error) {
      console.error('Error unlocking clinic:', error);
      toast.error('Failed to unlock clinic. Please try again.');
    }
  };

  const handleGoToDashboard = () => {
    router.push('/home');
    onOpenChange(false);
  };

  return (
    <Dialog 
      open={isOpen && !isClinicUnlocked} // Force dialog to stay open if not unlocked
      onOpenChange={handleOpenChange}
      modal={true}
    >
      <DialogContent 
        className="max-w-[33rem] bg-[--theme-doctorsoffice-accent] border text-[--theme-text-color] border-[--theme-border-color]"
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
                {userInfo && userInfo.score >= CLINIC_COST ? (
                  <Button 
                    onClick={unlock}
                    className="w-full py-6 text-lg font-semibold bg-[--theme-hover-color] text-[--theme-hover-text] hover:bg-opacity-75"
                  >
                    Use {CLINIC_COST} coins to unlock the Anki Clinic!
                  </Button>
                ) : (
                  <PurchaseButton
                    text="Purchase coins to unlock Clinic"
                    className="w-full py-6 text-lg font-semibold bg-[--theme-hover-color] text-[--theme-hover-text] hover:bg-opacity-75"
                  />
                )}
              </div>
            )}
            <div className="flex gap-2">
              <a 
                href="https://discord.gg/rTxN7wkh6e" 
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
