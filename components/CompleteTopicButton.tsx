import React, { useState, useRef, useEffect } from 'react';
import { Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
interface CompleteTopicButtonProps {
  categoryId: string;
  categoryName: string;
  onComplete?: (categoryId: string) => void;
  setShowConfetti?: (show: boolean) => void;
}

const CompleteTopicButton: React.FC<CompleteTopicButtonProps> = ({
  categoryId,
  categoryName,
  onComplete,
  setShowConfetti,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio('/levelup.mp3');
  }, []);

  const handleComplete = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/category/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ categoryId }),
      });

      if (!response.ok) {
        throw new Error('Failed to complete category');
      }

      // Increment user score by 1
      const scoreResponse = await fetch('/api/user-info', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 1 }),
      });

      if (!scoreResponse.ok) {
        throw new Error('Failed to update user score');
      }

      // Play sound
      audioRef.current?.play();

      // Show confetti
      if (setShowConfetti) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }

      toast.success("Cha-ching! Topic completed! One coin! 🎉");
      
      setIsOpen(false);
      
      // Call onComplete with the categoryId
      if (onComplete) {
        onComplete(categoryId);
      }
    } catch (error) {
      toast.error("Failed to mark topic as complete. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-[300px]">
      <Button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white w-full"
        size="sm"
      >
        <Check className="w-4 h-4" />
        <span className="truncate">{`Complete ${categoryName}`}</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-primary">
              Complete {categoryName}?
            </DialogTitle>
            <DialogDescription>
              {"Are you confident that you've mastered this topic? By marking it as complete, you're indicating that you understand the core concepts and are ready to move on."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <button
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
              className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:opacity-80 transition-opacity duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleComplete}
              disabled={isLoading}
              className="px-4 py-2 rounded-md bg-green-600 text-white hover:opacity-90 transition-opacity duration-200"
            >
              {isLoading ? "Completing..." : "Complete"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CompleteTopicButton;