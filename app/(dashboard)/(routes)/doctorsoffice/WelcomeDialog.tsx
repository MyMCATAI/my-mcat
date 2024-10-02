import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface WelcomeDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenMarketplace: () => void;
}

const WelcomeDialog: React.FC<WelcomeDialogProps> = ({ isOpen, onOpenChange, onOpenMarketplace }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[33vw] bg-[--theme-doctorsoffice-accent] border text-[--theme-text-color] border-[--theme-border-color]">
        <DialogHeader>
          <DialogTitle className="text-white text-center">{"Welcome to Your Doctor's Office!"}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="mb-4">
            <video
              src="https://my-mcat.s3.us-east-2.amazonaws.com/tutorial/TutorialVid.mp4"
              controls
              className="w-full"
            >
              Your browser does not support the video tag.
            </video>
          </div>
          <p className="text-center mb-4">Congratulations on starting your medical journey! Purchase a room to begin your practice.</p>
          <Button onClick={onOpenMarketplace} className="w-full bg-[--theme-hover-color] text-[--theme-hover-text] hover:bg-opacity-80">
            Open Marketplace
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeDialog;