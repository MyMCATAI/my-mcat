import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { toast } from 'react-hot-toast';
import { useUser } from "@clerk/nextjs";

interface TutorialVidDialogProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
}

const TutorialVidDialog: React.FC<TutorialVidDialogProps> = ({ isOpen, onClose, videoUrl }) => {
  const { user } = useUser();
  const [showMessageForm, setShowMessageForm] = useState(false);
  const [messageForm, setMessageForm] = useState({ message: '' });

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('You must be logged in to send a message.');
      return;
    }
    try {
      const response = await fetch('/api/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageForm.message,
        }),
      });

      if (response.ok) {
        toast.success('Message sent successfully!');
        setShowMessageForm(false);
        setMessageForm({ message: '' });
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] w-full h-full p-0 bg-transparent flex flex-col overflow-hidden border-none">
        <div className="flex-grow flex flex-col h-full">
          <div className="w-full flex-grow overflow-hidden">
            <video
              src={videoUrl}
              controls
              className="w-full h-full object-contain"
            >
              Your browser does not support the video tag.
            </video>
          </div>
          <div className="w-full p-4">
            {!showMessageForm ? (
              <button 
                onClick={() => setShowMessageForm(true)}
                className="w-full py-2 border border-[--theme-border-color] bg-[--theme-leaguecard-color] text-[--theme-text-color] rounded-md hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text] transition-opacity flex items-center justify-center sm:ml-auto"
              >
                Send us quick message
              </button>
            ) : (
              <form onSubmit={handleSendMessage} className="space-y-2">
                <textarea
                  placeholder="Your message"
                  value={messageForm.message}
                  onChange={(e) => setMessageForm({ message: e.target.value })}
                  className="w-full p-2 rounded resize-none text-gray-800"
                  required
                  rows={3}
                />
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setShowMessageForm(false)}
                    className="py-2 px-4 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="py-2 px-4 bg-gray-200 text-black rounded-md hover:opacity-60 transition-opacity"
                  >
                    Send
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TutorialVidDialog;
