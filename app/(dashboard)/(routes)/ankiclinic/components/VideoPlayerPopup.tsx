// VideoPlayerPopup.tsx
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from 'lucide-react';

interface VideoPlayerPopupProps {
  videoId: string;
  title: string;
  isOpen: boolean;
  onClose: () => void;
}

const VideoPlayerPopup: React.FC<VideoPlayerPopupProps> = ({
  videoId,
  title,
  isOpen,
  onClose
}) => {
  // Extract video ID from full URL if needed
  const getYoutubeId = (url: string): string => {
    if (url.includes('youtube.com')) {
      const urlParams = new URLSearchParams(new URL(url).search);
      return urlParams.get('v') || url;
    } else if (url.includes('youtu.be')) {
      return url.split('/').pop() || url;
    }
    return url; // If it's already an ID
  };

  const embedId = getYoutubeId(videoId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl w-full p-0 bg-[--theme-mainbox-color] overflow-hidden">
        <DialogHeader className="p-4 flex flex-row items-center justify-between">
          <DialogTitle className="text-[--theme-text-color] font-medium">
            {title}
          </DialogTitle>
          <DialogClose asChild>
            <Button 
              variant="ghost" 
              className="h-8 w-8 p-0 rounded-full"
              onClick={onClose}
            >
              <X className="h-4 w-4 text-[--theme-text-color]" />
              <span className="sr-only">Close</span>
            </Button>
          </DialogClose>
        </DialogHeader>
        <div className="aspect-video w-full">
          <iframe 
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${embedId}`}
            title={title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoPlayerPopup;