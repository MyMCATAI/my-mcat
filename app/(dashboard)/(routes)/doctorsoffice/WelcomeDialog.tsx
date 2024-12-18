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

const WelcomeDialog: React.FC<WelcomeDialogProps> = ({ 
  isOpen, 
  onOpenChange,
  onClinicUnlocked
}) => {
  const router = useRouter();
  const { userInfo } = useUserInfo();

  const handleOpenChange = (open: boolean) => {
    // Prevent dialog from being closed
    return;
  };

  const handleGoToDashboard = () => {
    router.push('/home');
  };

  return (
    <Dialog 
      open={isOpen} // Always show dialog when isOpen is true
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
