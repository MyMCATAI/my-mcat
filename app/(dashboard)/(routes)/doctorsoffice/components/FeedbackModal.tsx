import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

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
          to: ["Kalypso@mymcat.ai", "armaan@mymcat.ai"],
          subject: "User Feedback",
          text: feedback,
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
    <DialogContent className="bg-gradient-to-r from-blue-500 to-purple-500 p-6 rounded-lg shadow-lg">
      <DialogHeader>
        <DialogTitle className="text-white font-bold">
          Oh no! You don&apos;t have enough coins to start a new game! Give us your feedback and earn 5 coins! Remember: this is only a one-time offer!
        </DialogTitle>
      </DialogHeader>
      <textarea
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        placeholder="Enter your feedback or feature request here..."
        className="w-full p-2 border rounded text-black bg-white"
      />
      <Button onClick={handleSubmit} className="mt-4 bg-white text-black hover:bg-gray-200">
        Submit Feedback
      </Button>
    </DialogContent>
  </Dialog>
  );
};

export default FeedbackModal; 