import React, { useState, forwardRef, useImperativeHandle } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRouter } from 'next/navigation';
import FlashcardDeck from '../home/FlashcardDeck';
import { Cross2Icon } from '@radix-ui/react-icons';


interface FlashcardsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  roomId: string;
  buttonContent: React.ReactNode;
}

const FlashcardsDialog = forwardRef<{ open: () => void }, FlashcardsDialogProps>(({
  isOpen,
  onOpenChange,
  roomId,
  buttonContent,
}, ref) => {
  // Handle dialog open/close
  const handleOpenChange = (open: boolean) => {
    onOpenChange(open);
  };

  // Expose open method via ref
  useImperativeHandle(ref, () => ({
    open: () => onOpenChange(true)
  }));

  return (
    <>
      {buttonContent}
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-[80vw] h-[80vh] bg-[--theme-doctorsoffice-accent] border text-[--theme-text-color] border-[--theme-border-color] flex flex-col">
          <DialogHeader className="mb-2">
            <DialogTitle className="text-[--theme-hover-text] text-center items-center justify-center rounded-md bg-[--theme-hover-color] p-2 flex">
              <span className="flex-grow">{roomId} patient</span>
            </DialogTitle>
          </DialogHeader>
          <div className="flex-grow flex">
            {/* Main content area */}
            <div className="w-2/3 pr-2">
              <ScrollArea className="h-[calc(80vh-120px)] overflow-visible">
                <div className="p-4">
                  <FlashcardDeck roomId={roomId}/> {/* Create a new FlashcardDseck component */}
                </div>
              </ScrollArea>
            </div>
            
            {/* Sidebar area */}
            <div className="w-1/3 flex flex-col">
              <div className="flex-grow bg-[--theme-leaguecard-color] p-2 rounded-md mb-2 flex flex-col">
                <h3 className="text-lg font-semibold mb-2">Sidebar Title</h3>
                <ScrollArea className="flex-grow mb-2">
                  {/* Add your sidebar content here */}
                </ScrollArea>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
});

FlashcardsDialog.displayName = 'FlashcardsDialog';

export default FlashcardsDialog;
