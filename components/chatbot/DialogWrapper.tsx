// components/DialogWrapper.tsx
"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";
import { toast } from "react-hot-toast";

interface DialogWrapperProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onClose?: () => void;
}

interface MessageFormProps {
  onClose: () => void;
  onSubmit: (message: string) => void;
}

interface DialogContentProps {
  videoSrc: string;
  title: string;
  content: React.ReactNode;
}

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm",
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & { onClose?: () => void }
>(({ className, children, onClose, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border-gray-600 p-6 text-center shadow-lg rounded-lg bg-gray-100 text-gray-900 max-h-[80vh] overflow-y-auto",
        "scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent hover:scrollbar-thumb-gray-500",
        "dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close 
        className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 focus:outline-none"
        onClick={onClose}
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const MessageForm: React.FC<MessageFormProps> = ({ onClose, onSubmit }) => {
  const [message, setMessage] = useState('');

  return (
    <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-[60]">
      <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-lg w-96 max-w-[90%]">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Send us a message</h3>
        <form onSubmit={(e) => {
          e.preventDefault();
          onSubmit(message);
        }} className="space-y-4">
          <textarea
            placeholder="Your message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-2 rounded resize-none text-gray-800 bg-white dark:bg-gray-700 dark:text-gray-200"
            required
            rows={4}
          />
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-800 dark:bg-gray-600 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text]"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface DialogWrapperProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onClose?: () => void;
  videoSrc: string;
}

const DialogWrapper: React.FC<DialogWrapperProps> = ({
  isOpen,
  onOpenChange,
  onClose,
  videoSrc,
}) => {
  const [showMessageForm, setShowMessageForm] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = async (message: string) => {
    try {
      const response = await fetch('/api/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (response.ok) {
        toast.success('Message sent successfully!');
        setShowMessageForm(false);
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        setShowMessageForm(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent onClose={onClose} className="max-w-3xl w-full">
        <div className="relative">
          <div ref={dialogRef}>
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200 text-center">Welcome to CARs!</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 text-center">
              {"We recommend going home -> bulletin -> CARs strategies if it's your first time here."}
            </p>
            <div className="mb-6">
              <video
                className="w-full rounded-lg shadow-md"
                controls
                preload="metadata"
              >
                <source src={videoSrc} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
            <div className="space-y-6 text-sm">
              <div className="bg-gray-200 dark:bg-gray-700 p-4 rounded-lg shadow-md">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">{"Audio Toggle Button"}</h3>
                <div className="text-4xl mb-2">{"🔊"}</div>
                <p className="text-gray-700 dark:text-gray-300">
                  {"Turn this on to enable audio. Yes, you can talk to Kalypso, and he talks back."}
                </p>
              </div>
              
              <div className="bg-gray-200 dark:bg-gray-700 p-4 rounded-lg shadow-md">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">{"Hint Button"}</h3>
                <div className="text-4xl mb-2">{"💡"}</div>
                <p className="text-gray-700 dark:text-gray-300">
                  {"Highlight relevant context to know where to look for the correct answer."}
                </p>
              </div>
              
              <div className="bg-gray-200 dark:bg-gray-700 p-4 rounded-lg shadow-md">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">{"Dictionary Button"}</h3>
                <div className="text-4xl mb-2">{"📖"}</div>
                <p className="text-gray-700 dark:text-gray-300">
                  {"When this is on, press Cmd+i to get definitions for words you don't know."}
                </p>
              </div>
              
              <div className="bg-gray-200 dark:bg-gray-700 p-4 rounded-lg shadow-md">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">{"Hotlinks"}</h3>
                <div className="text-4xl mb-2">{"🔗"}</div>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                  {"Cmd+H = Highlight\nCmd+S = Strikethrough\nCmd+I = Lookup\nCmd+A = Kalypso"}
                </p>
              </div>
            </div>
            <div className="mt-6 text-gray-700 dark:text-gray-300 space-y-4">
            </div>
            <div className="mt-4 flex justify-between items-center">
              <button
                onClick={() => setShowMessageForm(true)}
                className="p-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-full hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text]"
                aria-label="Send Message"
              >
                <Mail className="h-5 w-5" />
              </button>
              <button
                onClick={() => {
                  onOpenChange(false);
                  if (onClose) onClose();
                }}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text]"
              >
                Close
              </button>
            </div>
            {showMessageForm && (
              <MessageForm 
                onClose={() => setShowMessageForm(false)} 
                onSubmit={handleSendMessage}
              />
            )}
          </div>
        </div>
      </DialogContent>
    </DialogPrimitive.Root>
  );
};

export default DialogWrapper;