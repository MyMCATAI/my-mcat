import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from 'react-hot-toast';

interface DownvoteFeedbackProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserTestId: string | null;
  currentQuestionId: string | null;
  currentQuestionContent: string | null;
}

const DownvoteFeedback: React.FC<DownvoteFeedbackProps> = ({
  isOpen,
  onClose,
  currentUserTestId,
  currentQuestionId,
  currentQuestionContent,
}) => {
  const [complaintCategory, setComplaintCategory] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentQuestionId || !currentUserTestId) return;

    if (complaintCategory && feedback) {
      try {
        const response = await fetch('/api/user-test/flagged-responses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userTestId: currentUserTestId,
            questionId: currentQuestionId,
            flagged: true,
            reviewNotes: feedback
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to update question flag status");
        }
        
        const msgresponse = await fetch("/api/send-message", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: `Question Downvoted\n\nQuestion ID: ${currentQuestionId}\nQuestion Content: ${currentQuestionContent}\n\nFeedback: ${feedback}\nCategory: ${complaintCategory}`,
          }),
        });

        if (!msgresponse.ok) {
          throw new Error("Failed to send downvote message");
        }

        toast.success("Question reported! Thank you for helping us improve.");
        onClose();
      } catch (error) {
        console.error("Error sending downvote:", error);
        toast.error("Failed to send feedback. Please try again.");
      }
    } else {
      toast.error("Please select a category and provide feedback.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-md z-[110]"
        closeButtonClassName="text-black hover:text-gray-700"
      >
        <DialogHeader>
          <DialogTitle className="text-center text-black">What can we improve?</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <RadioGroup onValueChange={setComplaintCategory} className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="answer_wrong" id="answer_wrong" />
              <Label htmlFor="answer_wrong" className="text-gray-800">Answer wrong</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="question_unfair" id="question_unfair" />
              <Label htmlFor="question_unfair" className="text-gray-800">Question unfair</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="hint_not_working" id="hint_not_working" />
              <Label htmlFor="hint_not_working" className="text-gray-800">Hint not working</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="other" id="other" />
              <Label htmlFor="other" className="text-gray-800">Other</Label>
            </div>
          </RadioGroup>
          <textarea
            name="message"
            placeholder="Your feedback"
            className="w-full p-2 rounded resize-none border text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            rows={6}
            value={feedback}
            onChange={(e) => {
              e.stopPropagation();
              setFeedback(e.target.value);
            }}
          />
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Send Feedback
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DownvoteFeedback; 