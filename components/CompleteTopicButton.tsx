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
import { useToast } from "@/components/ui/use-toast";

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
  const { toast } = useToast();

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

      // Play sound
      audioRef.current?.play();

      // Show confetti
      if (setShowConfetti) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }

      toast({
        title: "Topic Completed! 🎉",
        description: `You've completed ${categoryName}. Great job!`,
      });
      
      setIsOpen(false);
      
      // Call onComplete with the categoryId
      if (onComplete) {
        onComplete(categoryId);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark topic as complete. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
        size="sm"
      >
        <Check className="w-4 h-4" />
        {`Complete ${categoryName}`}
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
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              {"Cancel"}
            </Button>
            <Button
              onClick={handleComplete}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? "Completing..." : "Yes, Complete Topic"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CompleteTopicButton;