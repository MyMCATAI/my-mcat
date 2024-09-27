// components/DialogWrapper.tsx
"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";
import { toast } from "react-hot-toast";
import { createPortal } from "react-dom";

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
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border-blue-500 p-6 text-center shadow-lg rounded-lg bg-gray-900 text-white max-h-[80vh] overflow-y-auto",
        "scrollbar-thin scrollbar-thumb-blue-500/30 scrollbar-track-transparent hover:scrollbar-thumb-blue-500/50",
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
    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-96 max-w-[90%]">
        <h3 className="text-lg font-semibold mb-4 text-white">Send us a message</h3>
        <form onSubmit={(e) => {
          e.preventDefault();
          onSubmit(message);
        }} className="space-y-4">
          <textarea
            placeholder="Your message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-2 rounded resize-none text-gray-800"
            required
            rows={4}
          />
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DialogWrapper: React.FC<DialogWrapperProps> = ({
  isOpen,
  onOpenChange,
  title,
  description,
  onClose,
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
            <h2 className="text-xl font-semibold mb-4 text-blue-500 text-center">Welcome to CARs!</h2>
            <div className="text-lg space-y-6">
              <p>{"You can trigger the chatbot by pressing Cmd+A while you're reading."}</p>
              <p>{"Refer to the bulletin for more information on best practices."}</p>
              <div className="space-y-6">
                <div className="bg-gray-800 p-4 rounded-lg shadow-md">
                  <h3 className="font-semibold text-blue-500 mb-2">{"Audio Toggle Button"}</h3>
                  <div className="text-4xl mb-2">{"🔊"}</div>
                  <p>
                    {"Turn this on to enable audio. Yes, you can talk to Kalypso, and he'll talk back. While he won't give you answers, he will guide you with answering questions or reading a passage."}
                  </p>
                </div>
                
                <div className="bg-gray-800 p-4 rounded-lg shadow-md">
                  <h3 className="font-semibold text-blue-500 mb-2">{"Hint Button"}</h3>
                  <div className="text-4xl mb-2">{"💡"}</div>
                  <p>
                    {"If you're stuck on a question, use this to highlight important parts of the passage. These hints might be near your own highlights or somewhere else entirely."}
                  </p>
                </div>
                
                <div className="bg-gray-800 p-4 rounded-lg shadow-md">
                  <h3 className="font-semibold text-blue-500 mb-2">{"Dictionary Button"}</h3>
                  <div className="text-4xl mb-2">{"📖"}</div>
                  <p>
                    {"When this is on (blue), press Cmd+i (or Ctrl+i on Windows) to get definitions for words you don't know. These words are saved for later review. You can also use this shortcut when it's off to check words after the test."}
                  </p>
                </div>
              </div>
              
              <p>
                {"After the test, you'll get a score based on your answers, time, and how well you used tools like highlighting and elimination. Soon we will have insights on your personalized CARs strategy once we collect enough data."}
              </p>
            </div>
            <div className="mt-4 flex justify-between space-x-2">
              <button
                onClick={() => setShowMessageForm(true)}
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-blue-600"
              >
                Send Message
              </button>
              <button
                onClick={() => {
                  onOpenChange(false);
                  if (onClose) onClose();
                }}
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-blue-600"
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
