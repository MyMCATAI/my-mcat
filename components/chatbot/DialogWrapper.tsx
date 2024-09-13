// components/DialogWrapper.tsx
"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DialogWrapperProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  // Remove onNeverShowAgain prop
  onClose?: () => void;
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
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border-blue-500 p-6 text-center shadow-lg rounded-lg bg-gray-900/70 text-white max-h-[80vh] overflow-y-auto",
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


const DialogWrapper: React.FC<DialogWrapperProps> = ({
  isOpen,
  onOpenChange,
  title,
  description,
  onClose,
}) => {
  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent onClose={onClose}>
        <h2 className="text-xl font-semibold mb-4 text-blue-500 text-center">Welcome to CARs!</h2>
        <div className="text-lg space-y-6">
          <p>This tool helps you take tests and review your work more effectively.</p>
        
          <div className="space-y-6">
            <div className="bg-gray-800 p-4 rounded-lg shadow-md">
              <h3 className="font-semibold text-blue-500 mb-2">Audio Toggle Button</h3>
              <div className="text-4xl mb-2">🔊</div>
              <p>Turn this on to enable audio. Yes, you can talk to Kalypso, and he&apos;ll talk back. While he won&apos;t give you answers, he will guide you with answering questions or reading a passage.</p>
            </div>
            
            <div className="bg-gray-800 p-4 rounded-lg shadow-md">
              <h3 className="font-semibold text-blue-500 mb-2">Hint Button</h3>
              <div className="text-4xl mb-2">💡</div>
              <p>If you&apos;re stuck on a question, use this to highlight important parts of the passage. These hints might be near your own highlights or somewhere else entirely.</p>
            </div>
            
            <div className="bg-gray-800 p-4 rounded-lg shadow-md">
              <h3 className="font-semibold text-blue-500 mb-2">Dictionary Button</h3>
              <div className="text-4xl mb-2">📖</div>
              <p>When this is on (blue), press &quot;Cmd+i&quot; to get definitions for words you don&apos;t know. These words are saved for later review. You can also use &quot;Cmd+i&quot; when it&apos;s off to check words after the test.</p>
            </div>
          </div>
          
          <p>After the test, you&apos;ll get a score based on your answers, time, and how well you used tools like highlighting and elimination.</p>
          
          <p>Good luck :3</p>
        </div>
        <div className="mt-4 flex justify-end space-x-2">
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
      </DialogContent>
    </DialogPrimitive.Root>
  );
};

export default DialogWrapper;
