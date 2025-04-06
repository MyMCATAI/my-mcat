//components/CompleteTopicButton.tsx
import React from 'react';
import { Check } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import toast from "react-hot-toast";
import { useAudio } from "@/store/selectors";

interface CompleteTopicButtonProps {
  categoryId: string;
  categoryName: string;
  onComplete?: (categoryId: string) => void;
  setShowConfetti?: (show: boolean) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const CompleteTopicButton: React.FC<CompleteTopicButtonProps> = ({
  categoryId,
  categoryName,
  onComplete,
  setShowConfetti,
  isOpen,
  onOpenChange,
}) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const audio = useAudio();

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
      audio.playSound('levelup');

      // Show confetti
      if (setShowConfetti) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 4000);
      }

      // Close dialog
      onOpenChange(false);

      toast.success(`${categoryName} completed!`);

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
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
            onClick={() => onOpenChange(false)}
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
  );
};

export default CompleteTopicButton;