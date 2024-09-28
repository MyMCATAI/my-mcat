import React, { useState, useEffect } from 'react';
import { Question, UserResponse } from '@/types';
import { HelpCircle, Mail } from "lucide-react"; // Replace BookOpen with Mail
import ChatBotInLineForReview from '@/components/chatbot/ChatBotInLineForReview';
import { Passage } from '@/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from 'react-hot-toast'; // Import toast for notifications

interface ReviewQuestionComponentProps {
  question?: Question;
  passageData?: Passage;
  userResponse: UserResponse;
  onNext: () => void;
  onPrevious: () => void;
  isFirst: boolean;
  isLast: boolean;
  currentQuestionIndex: number;
  totalQuestions: number;
}

const ReviewQuestionComponent: React.FC<ReviewQuestionComponentProps> = ({
  question,
  userResponse,
  passageData,
  onNext,
  onPrevious,
  isFirst,
  isLast,
  currentQuestionIndex,
  totalQuestions
}) => {
  const [explanations, setExplanations] = useState<string[]>([]);
  const [selectedExplanationIndex, setSelectedExplanationIndex] = useState<number | null>(null);
  const [isExplanationsOpen, setIsExplanationsOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showDictionary, setShowDictionary] = useState(false);
  const [showExplanations, setShowExplanations] = useState(false);
  const [showMessageForm, setShowMessageForm] = useState(false);

  // State variables to track if explanations have been viewed
  const [hasViewedUserExplanation, setHasViewedUserExplanation] = useState(false);
  const [hasViewedCorrectExplanation, setHasViewedCorrectExplanation] = useState(false);

  useEffect(() => {
    if (question) {
      const options = JSON.parse(question.questionOptions);
      const answerNotes = JSON.parse(question.questionAnswerNotes || '[]');
      setExplanations(answerNotes);
      const userAnswerIndex = options.indexOf(userResponse.userAnswer);
      setSelectedExplanationIndex(userAnswerIndex);

      // Reset the viewed explanations when question changes
      setHasViewedUserExplanation(false);
      setHasViewedCorrectExplanation(false);
    }
  }, [question, userResponse]);

  // Function to update the user response
  const updateUserResponse = async (newReviewNote: string | null) => {
    if (!userResponse.id) return;

    const updatedResponse = {
      isReviewed: true,
      reviewNotes: newReviewNote 
        ? (userResponse.reviewNotes 
          ? `${userResponse.reviewNotes}\n\n${newReviewNote}`
          : newReviewNote)
        : userResponse.reviewNotes,
      userTestId: userResponse.userTestId,
      questionId: userResponse.questionId,
    };

    try {
      const response = await fetch('/api/user-test/response', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedResponse),
      });

      if (!response.ok) {
        throw new Error('Failed to update user response');
      }

      console.log('User response updated successfully');
    } catch (error) {
      console.error('Error updating user response:', error);
    }
  };

  // Function to check if conditions are met to call updateUserResponse
  useEffect(() => {
    const userGotItRight = userResponse.isCorrect;
    const needsToViewUserExplanation = !userGotItRight;

    if (
      hasViewedCorrectExplanation &&
      (userGotItRight || hasViewedUserExplanation)
    ) {
      updateUserResponse(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasViewedUserExplanation, hasViewedCorrectExplanation, userResponse]);

  const toggleExplanations = () => {
    setShowExplanations(!showExplanations);
  };

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

  if (!question) return null;
  const options = JSON.parse(question.questionOptions);
  const correctAnswerIndex = 0; // Assuming the correct answer is always the first option

  const getOptionClass = (index: number) => {
    if (index === correctAnswerIndex) {
      return 'bg-green-500 text-white';
    }
    if (index === options.indexOf(userResponse.userAnswer) && !userResponse.isCorrect) {
      return 'bg-red-500 text-white';
    }
    return 'bg-gray-200 text-black hover:bg-gray-300 cursor-pointer';
  };

  // Handlers for viewing explanations
  const handleViewUserExplanation = () => {
    setHasViewedUserExplanation(true);
  };

  const handleViewCorrectExplanation = () => {
    setHasViewedCorrectExplanation(true);
  };

  return (
    <div className="p-6 bg-white text-black h-full flex flex-col text-sm relative">
      <h2 className="text-md font-semibold mb-4">Question {currentQuestionIndex + 1} of {totalQuestions}</h2>
      
      <div className="absolute top-4 right-4 flex space-x-2">
        <button
          className={`
            p-2 rounded-full shadow-lg
            transition-colors duration-200
            ${showExplanations 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-300 text-gray-600 hover:bg-blue-500 hover:text-white'}
          `}
          onClick={toggleExplanations}
          aria-label="Toggle Explanations"
        >
          <HelpCircle className="w-6 h-6" />
        </button>
        <button
          className="p-2 rounded-full shadow-lg transition-colors duration-200 bg-gray-300 text-gray-600 hover:bg-blue-500 hover:text-white"
          onClick={() => setShowMessageForm(true)}
          aria-label="Send Message"
        >
          <Mail className="w-6 h-6" />
        </button>
      </div>
      
      {userResponse.flagged && (
        <p className="text-red-500 text-sm mb-2">
          This question was flagged for review
        </p>
      )}

      <div className="mb-4 flex-grow overflow-auto standard-scrollbar">
        <h3 className="font-sm mb-2">{question.questionContent}</h3>
        <div className="mt-4">
          <TooltipProvider>
            {options.map((option: string, index: number) => (
              <Tooltip key={index} open={showExplanations ? undefined : false}>
                <TooltipTrigger asChild>
                  <div 
                    className={`p-3 mb-2 rounded ${getOptionClass(index)} text-sm`}
                    onMouseEnter={() => {
                      if (showExplanations) {
                        if (index === correctAnswerIndex) {
                          handleViewCorrectExplanation();
                        }
                        if (index === options.indexOf(userResponse.userAnswer) && !userResponse.isCorrect) {
                          handleViewUserExplanation();
                        }
                      }
                    }}
                  >
                    {option}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" style={{ maxWidth: '30vw', minWidth: '800px' }}>
                  {explanations[index]
                    ? explanations[index]
                    : index === correctAnswerIndex
                      ? 'This is the correct answer.'
                      : 'This is an incorrect answer.'}
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>

        {/* Move the Next/Previous buttons here */}
        <div className="flex justify-between mt-4 mb-4">
          <button
            onClick={onPrevious}
            disabled={isFirst}
            className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={onNext}
            disabled={isLast}
            className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>

        <div className="mb-4" >
          <ChatBotInLineForReview 
            chatbotContext={{ contentTitle: '', context: '' }}
            key={question.id}
          />
        </div>
      </div>

      {showMessageForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 max-w-[90%]">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Send us a message</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const messageInput = e.currentTarget.elements.namedItem('message') as HTMLTextAreaElement;
              handleSendMessage(messageInput.value);
            }} className="space-y-4">
              <textarea
                name="message"
                placeholder="Your message"
                className="w-full p-2 rounded resize-none border text-gray-800"
                required
                rows={4}
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowMessageForm(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
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
      )}

    </div>
  );
};

export default ReviewQuestionComponent;
