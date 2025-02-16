import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import Image from "next/image";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  setUserScore: (score: number) => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, setUserScore }) => {
  const [feedback, setFeedback] = useState("");

  const handleFeedbackSubmit = async (feedback: string) => {
    try {
      // Send feedback via email
      const emailResponse = await fetch("/api/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient: "kalypso@mymcat.ai",
          message: feedback,
        }),
      });

      if (!emailResponse.ok) {
        throw new Error("Failed to send feedback email");
      }

      // Reward the user with 5 coins using incrementScore
      const response = await fetch("/api/user-info", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 5 }), // Increment score by 5
      });

      if (!response.ok) {
        throw new Error("Failed to update user score");
      }

      const data = await response.json();
      setUserScore(data.score);
      toast.success("Thank you for your feedback! You've earned 5 coins.");

      // Mark feedback as submitted
      localStorage.setItem('feedbackSubmitted', 'true');
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("Failed to submit feedback. Please try again.");
    }
  };


  const handleSubmit = () => {
    if (feedback) {
      handleFeedbackSubmit(feedback);
      setFeedback("");
      onClose();
    } else {
      toast.error("Please enter your feedback.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-opacity-50 bg-black border-4 border-[--theme-gradient-startstreak] p-8 rounded-lg shadow-lg max-w-xl">
        <div className="flex">
          <Image
            src="/kalypsodistressed.gif"
            alt="Kalypso"
            width={140}
            height={140}
            className="mb-4"
          />
          <div className="ml-4 flex-1 flex items-center">
            <DialogTitle className="text-white font-bold text-center">
              Oh no! You don&apos;t have enough coins to start a new game! Give us your feedback and earn 5 coins! <br />
              <span className="text-yellow-300">This is only a one-time offer!</span>
            </DialogTitle>
          </div>
        </div>
        <div className="mt-4 flex items-center">
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Enter your feedback or feature request here..."
            className="w-full p-2 border rounded text-black bg-white"
          />
          <Button onClick={handleSubmit} className="ml-2 bg-white text-black hover:bg-gray-200 text-xs">
            →
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackModal; 