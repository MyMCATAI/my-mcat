import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Question, UserResponse } from '@/types';
import { Mail, CheckCircle } from "lucide-react";
import ChatBotInLineForReview from '@/components/chatbot/ChatBotInLineForReview';
import { Passage } from '@/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from 'react-hot-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Image from 'next/image';
import Link from 'next/link';

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
  testTitle: string;
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
  totalQuestions,
  testTitle
}) => {
  const [explanations, setExplanations] = useState<string[]>([]);
  const [showMessageForm, setShowMessageForm] = useState(false);
  const [hasViewedUserExplanation, setHasViewedUserExplanation] = useState(false);
  const [hasViewedCorrectExplanation, setHasViewedCorrectExplanation] = useState(false);
  const [showRewardDialog, setShowRewardDialog] = useState(false);
  const [isReviewFinished, setIsReviewFinished] = useState(false);
  const [hasViewedCorrectAnswer, setHasViewedCorrectAnswer] = useState(false);
  const [isReviewed, setIsReviewed] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [part2Test, setPart2Test] = useState<{ id: string; title: string } | null>(null);

  useEffect(() => {
    if (question) {
      const answerNotes = JSON.parse(question.questionAnswerNotes || '[]');
      setExplanations(answerNotes);
      setHasViewedUserExplanation(false);
      setHasViewedCorrectExplanation(false);
      setIsReviewed(!!userResponse.isReviewed || false);
    }

    // Reset states when question changes
    setHasViewedCorrectAnswer(false);
    
    // Clear existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Set new timer
    timerRef.current = setTimeout(() => {
      updateUserResponse(null);
    }, 10000);

    // Cleanup function
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [question, userResponse]);

  const updateUserResponse = useCallback(async (newReviewNote: string | null) => {
    if (!userResponse.id) return;

    const updatedResponse = {
      id: userResponse.id,
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
      setIsReviewed(true);
    } catch (error) {
      console.error('Error updating user response:', error);
    }
  }, [userResponse]);

  useEffect(() => {
    const userGotItRight = userResponse.isCorrect;
    const needsToViewUserExplanation = !userGotItRight;

    if (
      hasViewedCorrectExplanation &&
      (userGotItRight || hasViewedUserExplanation)
    ) {
      updateUserResponse(null);
    }
  }, [hasViewedUserExplanation, hasViewedCorrectExplanation, userResponse, updateUserResponse]);

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

  const handleFinishReview = async () => {
    if (isReviewFinished) return;

    setIsReviewFinished(true);

    try {
      const response = await fetch('/api/user-info', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 1 }),
      });

      if (!response.ok) {
        throw new Error('Failed to add cupcake coin');
      }

      const data = await response.json();
      console.log('Cupcake coin added, new score:', data.score);

      setShowRewardDialog(true);
      const audio = new Audio('/levelup.mp3');
      audio.play();
    } catch (error) {
      console.error('Error adding cupcake coin:', error);
      toast.error('Failed to add cupcake coin. Please try again.');
      setIsReviewFinished(false);
    }
  };

  const handleOptionHover = (index: number) => {
    if (index === correctAnswerIndex && !hasViewedCorrectAnswer) {
      setHasViewedCorrectAnswer(true);
      updateUserResponse(null);
    }
  };

  useEffect(() => {
    const fetchPart2Test = async () => {
      if (isLast && testTitle.toLowerCase().includes('part 1')) {
        try {
          const response = await fetch(`/api/test/find-next?title=${encodeURIComponent(testTitle)}`);
          if (response.ok) {
            const data = await response.json();
            if (data) {
              setPart2Test({ id: data.id, title: data.title });
            }
          }
        } catch (error) {
          console.error('Error fetching Part 2 test:', error);
        }
      }
    };

    fetchPart2Test();
  }, [isLast, testTitle]);

  const Part2Popup = () => {
    if (!part2Test) return null;

    return (
      <div className="fixed bottom-8 right-8 bg-white p-6 rounded-xl shadow-2xl z-50 max-w-sm">
        <h3 className="text-xl font-bold mb-3 text-gray-800">Continue to Part 2</h3>
        <p className="mb-4 text-gray-600">{"You've completed Part 1. Ready for the next challenge?"}</p>
        <Link
          href={`/test/testquestions?id=${part2Test.id}`}
          className="inline-block bg-gradient-to-r from-blue-500 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-blue-800 transition-all duration-300"
        >
          Start {part2Test.title}
        </Link>
      </div>
    );
  };

  if (!question) return null;
  const options = JSON.parse(question.questionOptions);
  const correctAnswerIndex = 0;

  const getOptionClass = (index: number) => {
    if (index === correctAnswerIndex) {
      return 'bg-green-500 text-white';
    }
    if (index === options.indexOf(userResponse.userAnswer) && !userResponse.isCorrect) {
      return 'bg-red-500 text-white';
    }
    return 'bg-gray-200 text-black hover:bg-gray-300 cursor-pointer';
  };

  const generateChatbotContext = () => {
    if (!question || !passageData) return { contentTitle: '', context: '' };

    const options = JSON.parse(question.questionOptions);
    const answerNotes = JSON.parse(question.questionAnswerNotes || '[]');
    const userAnswerIndex = options.indexOf(userResponse.userAnswer);
    const correctAnswerIndex = 0;

    const context = `I'm currently reviewing a question on this passage: ${passageData.text}

The question was: ${question.questionContent}

I chose the option: "${userResponse.userAnswer}" which was ${userResponse.isCorrect ? 'correct' : 'incorrect'}.

Here is the correct answer: "${options[correctAnswerIndex]}"

Explanation for the correct answer: ${answerNotes[correctAnswerIndex]}

${!userResponse.isCorrect ? `Explanation for my answer: ${answerNotes[userAnswerIndex]}` : ''}

Help me understand this question so I can learn.`;

    return {
      contentTitle: passageData.title,
      context: context
    };
  };

  return (
    <div className="p-6 bg-white text-black h-full flex flex-col text-sm relative">
      <h2 className="text-md font-semibold mb-4">Question {currentQuestionIndex + 1} of {totalQuestions}</h2>
      
      <div className="absolute top-4 right-4 flex space-x-2">
        <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className="p-2 rounded-full shadow-lg transition-colors duration-200 bg-gray-300 text-gray-600 hover:bg-blue-500 hover:text-white"
              onClick={() => setShowMessageForm(true)}
              aria-label="Send Message"
            >
              <Mail className="w-6 h-6" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            Send us a message
          </TooltipContent>
        </Tooltip>
        </TooltipProvider>
      </div>
      {isReviewed && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex items-center text-green-600">
          <CheckCircle className="w-4 h-4 mr-1" />
          <span className="text-sm">Reviewed</span>
        </div>
      )}

      {userResponse.flagged && (
        <p className="text-red-500 text-sm mb-2">
          This question was flagged for review
        </p>
      )}

      <div className="overflow-auto standard-scrollbar">
        <h3 className="font-sm mb-2">{question.questionContent}</h3>
        <div className="mt-4">
          <TooltipProvider>
            {options.map((option: string, index: number) => (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <div 
                    className={`p-3 mb-2 rounded ${getOptionClass(index)} text-sm cursor-pointer`}
                    onMouseEnter={() => handleOptionHover(index)}
                  >
                    {option}
                  </div>
                </TooltipTrigger>
                <TooltipContent 
                  side="right" 
                  className="max-w-[30vw] min-w-[300px] bg-gray-50 text-gray-800 border border-gray-200"
                >
                  <p>
                    {explanations[index]
                      ? explanations[index]
                      : index === correctAnswerIndex
                        ? 'This is the correct answer.'
                        : 'This is an incorrect answer.'}
                  </p>
                  <p className="mt-2 font-semibold">
                    {index === correctAnswerIndex ? '✅ Correct' : '❌ Incorrect'}
                  </p>
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>
      </div>

      <div className="mb-4" >
        <ChatBotInLineForReview 
          chatbotContext={generateChatbotContext()}
          key={question.id}
        />
      </div>

      <div className="flex justify-between mt-4 mb-4">
        <button
          onClick={onPrevious}
          disabled={isFirst}
          className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          Previous
        </button>
        {isLast ? (
          <button
            onClick={handleFinishReview}
            disabled={isReviewFinished}
            className={`bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded ${
              isReviewFinished ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isReviewFinished ? 'Review Finished' : 'Finish Review'}
          </button>
        ) : (
          <button
            onClick={onNext}
            className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded"
          >
            Next
          </button>
        )}
      </div>

      {showMessageForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[480px] max-w-[90%]">
            <h3 className="text-lg font-semibold mb-2 text-gray-800">Send Us a Message</h3>
            <p className="text-sm text-gray-600 mb-4">
              We value your input! Please share any feedback about MyMCAT, this specific question, or any other concerns/ideas you may have.
            </p>
            <form onSubmit={(e) => {
              e.preventDefault();
              const messageInput = e.currentTarget.elements.namedItem('message') as HTMLTextAreaElement;
              handleSendMessage(messageInput.value);
            }} className="space-y-4">
              <textarea
                name="message"
                placeholder="Your feedback (e.g., platform suggestions, question clarity, technical issues)"
                className="w-full p-2 rounded resize-none border text-gray-800"
                required
                rows={6}
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
                  Send Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Dialog open={showRewardDialog} onOpenChange={setShowRewardDialog}>
        <DialogContent className="sm:max-w-md" closeButtonClassName="text-black hover:text-gray-700">
          <DialogHeader className="text-center">
            <DialogTitle className="text-center text-black">Congratulations!</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-6">
            <Image
              src="/game-components/PixelCupcake.png"
              alt="Coin"
              width={96}
              height={96}
              className="mb-4"
            />
            <p className="text-center text-lg text-black">
              You&apos;ve earned <span className="font-bold">1 cupcake coin</span> for reviewing today!
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {isLast && part2Test && <Part2Popup />}
    </div>
  );
};

export default ReviewQuestionComponent;