import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Question, UserResponse } from '@/types';
import { Mail, CheckCircle, ThumbsUp, ThumbsDown } from "lucide-react";
import ChatBotInLineForReview from '@/components/chatbot/ChatBotInLineForReview';
import { Passage } from '@/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from 'react-hot-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from "next/navigation";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

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
  const router = useRouter();
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'upvote' | 'downvote' | null>(null);
  const [complaintCategory, setComplaintCategory] = useState<string | null>(null);
  const [clickedOptionIndex, setClickedOptionIndex] = useState<number | null>(null);

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

  const handleSendMessage = async (userMessage: string) => {
    try {
      const feedbackInfo = feedbackType === 'upvote'
        ? `User upvoted question`
        : `User downvoted question. Complaint category: ${complaintCategory}`;

      const fullMessage = `
Feedback Type: ${feedbackInfo}
Question ID: ${question?.id}
User Test ID: ${userResponse.userTestId}

User Feedback:
${userMessage}
      `.trim();

      const response = await fetch('/api/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: fullMessage }),
      });

      if (response.ok) {
        toast.success('Feedback sent successfully!');
        setShowFeedbackForm(false);
      } else {
        throw new Error('Failed to send feedback');
      }
    } catch (error) {
      console.error('Error sending feedback:', error);
      toast.error('Failed to send feedback. Please try again.');
    }
  };

  const handleFinishReview = async () => {
    if (isReviewFinished) return;

    setIsReviewFinished(true);

    try {
      const response = await fetch('/api/user-test/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userTestId: userResponse.userTestId }),
      });

      if (!response.ok) {
        throw new Error('Failed to complete review');
      }

      const data = await response.json();

      if (data.alreadyReviewed) {
        // If already reviewed, redirect to home page
        router.push('/home');
      } else {
        // If not already reviewed, show reward dialog and play sound
        setShowRewardDialog(true);
        const audio = new Audio('/levelup.mp3');
        audio.play();
      }
    } catch (error) {
      console.error('Error completing review:', error);
      setIsReviewFinished(false);
      // Redirect to home page in case of an error
      router.push('/home');
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

  if (!question) return null;
  const options = JSON.parse(question.questionOptions);
  const correctAnswerIndex = 0;

  const getOptionClass = (index: number) => {
    if (index === clickedOptionIndex) {
      return 'bg-blue-500 text-white';
    }
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
    <div className="flex flex-col h-full bg-white text-black text-sm relative">
      <div className="p-6 border-b sticky top-0 bg-white z-10">
        <h2 className="text-md font-semibold mb-4">Question {currentQuestionIndex + 1} of {totalQuestions}</h2>
        
        <div className="absolute top-4 right-4 flex space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="p-2 rounded-full shadow-lg transition-colors duration-200 bg-gray-300 text-gray-600 hover:bg-green-500 hover:text-white"
                  onClick={() => {
                    setFeedbackType('upvote');
                    setShowFeedbackForm(true);
                  }}
                  aria-label="Upvote Question"
                >
                  <ThumbsUp className="w-6 h-6" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                Upvote Question
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="p-2 rounded-full shadow-lg transition-colors duration-200 bg-gray-300 text-gray-600 hover:bg-red-500 hover:text-white"
                  onClick={() => {
                    setFeedbackType('downvote');
                    setShowFeedbackForm(true);
                  }}
                  aria-label="Downvote Question"
                >
                  <ThumbsDown className="w-6 h-6" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                Downvote Question
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
      </div>

      <div className="flex-grow overflow-y-auto">
        <div className="p-6">
          <div className="mb-4">
            <h3 className="font-sm mb-5">{question.questionContent}</h3>
            <div className="mt-5">
              <TooltipProvider>
                {options.map((option: string, index: number) => (
                  <Tooltip 
                    key={index}
                    open={clickedOptionIndex === index ? true : undefined}
                  >
                    <TooltipTrigger asChild>
                      <div 
                        className={`p-3 mb-2 rounded ${getOptionClass(index)} text-sm cursor-pointer`}
                        onMouseEnter={() => handleOptionHover(index)}
                        onClick={() => {
                          setClickedOptionIndex(clickedOptionIndex === index ? null : index);
                          handleOptionHover(index);
                        }}
                      >
                        {option}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent 
                      side="right" 
                      className="max-w-[30vw] min-w-[300px] bg-gray-50 text-gray-800 border border-gray-600"
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

            <div className="flex justify-between mt-8 mb-8">
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
          </div>

          <ChatBotInLineForReview 
            chatbotContext={generateChatbotContext()}
            key={question.id}
          />
        </div>
      </div>

      <Dialog open={showFeedbackForm} onOpenChange={setShowFeedbackForm}>
        <DialogContent className="sm:max-w-md" closeButtonClassName="text-black hover:text-gray-700">
          <DialogHeader>
            <DialogTitle className="text-center text-black">
              {feedbackType === 'upvote' ? 'What did you like?' : 'What can we improve?'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            const messageInput = e.currentTarget.elements.namedItem('message') as HTMLTextAreaElement;
            handleSendMessage(messageInput.value);
          }} className="space-y-4">
            {feedbackType === 'downvote' && (
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
            )}
            <textarea
              name="message"
              placeholder="Your feedback"
              className="w-full p-2 rounded resize-none border text-gray-800"
              required
              rows={6}
            />
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowFeedbackForm(false)}
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

      <Dialog open={showRewardDialog} onOpenChange={setShowRewardDialog}>
        <DialogContent className="sm:max-w-md" closeButtonClassName="text-black hover:text-gray-700">
          <DialogHeader className="text-center">
            <DialogTitle className="text-center text-black">Congratulations!</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-6 space-y-4">
            <Image
              src="/game-components/PixelCupcake.png"
              alt="Coin"
              width={96}
              height={96}
            />
            <p className="text-center text-lg text-black">
              You&apos;ve earned <span className="font-bold">1 cupcake coin</span> for reviewing today!
            </p>
            {isLast && part2Test && (
              <>
                <p className="text-center text-md ml-2 text-black">Want to run it back with new questions?</p>
                <Link
                  href={`/test/testquestions?id=${part2Test.id}`}
                  className="inline-block bg-[--theme-hover-color] text-white px-6 ml-2 py-3 rounded-lg hover:opacity-80 transition-all duration-300"
                  onClick={() => setShowRewardDialog(false)}
                >
                  Start {part2Test.title}
                </Link>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReviewQuestionComponent;