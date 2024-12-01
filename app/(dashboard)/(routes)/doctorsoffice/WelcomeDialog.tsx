import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FaDiscord } from "react-icons/fa";
import { useRouter } from 'next/navigation';

interface WelcomeDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const WelcomeDialog: React.FC<WelcomeDialogProps> = ({ isOpen, onOpenChange }) => {
  const router = useRouter();

  const handleGoToDashboard = () => {
    router.push('/home');
    onOpenChange(false);
  };

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={() => {}}
      modal={true}
    >
      <DialogContent 
        className="max-w-[33vw] bg-[--theme-doctorsoffice-accent] border text-[--theme-text-color] border-[--theme-border-color]"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
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
            We are still working on the Anki Clinic, a fun and competitive Anki experience. Join our discord for updates!
          </p>
          <div className="space-y-2">
            <a 
              href="https://discord.gg/rTxN7wkh6e"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="w-full bg-[--theme-hover-color] text-[--theme-hover-text] hover:bg-opacity-75">
                <FaDiscord className="w-5 h-5 mr-2" />
                Join Discord
              </Button>
            </a>
            <Button 
              onClick={handleGoToDashboard}
              className="w-full bg-[--theme-hover-color] text-[--theme-hover-text] hover:bg-opacity-75"
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeDialog;
