import React, { useState, useEffect, useRef } from 'react';
import { Question, UserResponse } from '@/types';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import InlineChatbot from '@/components/chatbot/InlineChatbot';
import { Passage } from '@/types';

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

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
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
  const [isLoading, setIsLoading] = useState(false);
  const [isExplanationsOpen, setIsExplanationsOpen] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [context, setContext] = useState("");

  const [showExplanations, setShowExplanations] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (question) {
      const options = JSON.parse(question.questionOptions);
      const answerNotes = JSON.parse(question.questionAnswerNotes || '[]');
      setExplanations(answerNotes);
      const userAnswerIndex = options.indexOf(userResponse.userAnswer);
      setSelectedExplanationIndex(userAnswerIndex);

      const correctAnswer = options[0];
      const userAnswer = options[userAnswerIndex];

      setContext(`
      I'm reviewing a test question I've answered, here's some context on my answer

      ${passageData ? "Questions Passage: " + passageData.text : ""} \n\n
      Question: ${question.questionContent} \n
      Options: ${question.questionOptions} \n
      Correct Answer: ${correctAnswer} \n
      My Answer: ${userAnswer} \n
      Result: ${userResponse.isCorrect ? 'Correct' : 'Incorrect'} \n
      Time Spent: ${userResponse.timeSpent || "0"} seconds \n
      ${userResponse.isCorrect? "": `Explanation for my answer: ${answerNotes[userAnswerIndex] || 'No explanation available.'} \n`}
      
      Explanation for correct answer: ${answerNotes[0] || 'No explanation available.'} \n
            
      I'm going to explain my line of thinking and defend my answer, help me use this context to learn.

      Here's my explanation: 
      `)

      // Reset chat messages when question changes
      setChatMessages([]);
      setThreadId(null);
    }
  }, [question, userResponse, passageData]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    setShowExplanations(userResponse.isReviewed === true);
  }, [userResponse]);

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
      setShowExplanations(true);
    } catch (error) {
      console.error('Error updating user response:', error);
    }
  };

  const handleMessageSent = (message: string) => {
    console.log("Message sent:", message);
    updateUserResponse(message);
  };

  const handleSkipDefense = () => {
    updateUserResponse(null);
    setShowExplanations(true);
  };

  if (!question) return null;
  const options = JSON.parse(question.questionOptions);
  const correctAnswerIndex = 0; // Assuming the correct answer is always the first option

  const getOptionClass = (index: number) => {
    if (index === correctAnswerIndex && showExplanations) {
      return 'bg-green-500 text-white';
    }
    if (index === options.indexOf(userResponse.userAnswer) && !userResponse.isCorrect && showExplanations) {
      return 'bg-red-500 text-white';
    }
    if (index === selectedExplanationIndex) {
      return 'bg-blue-500 text-white';
    }
    return 'bg-gray-200 text-black hover:bg-gray-300 cursor-pointer';
  };

  const handleOptionClick = (index: number) => {
    setSelectedExplanationIndex(index);
  };

  return (
    <div className="p-6 bg-white text-black h-full flex flex-col text-sm">
      <h2 className="text-lg font-semibold mb-4">Question {currentQuestionIndex + 1} of {totalQuestions}</h2>
      <div className="mb-4 flex-grow overflow-auto">
        <h3 className="font-medium mb-2">{question.questionContent}</h3>
        <div className="mt-4">
          {options.map((option: string, index: number) => (
            <div 
              key={index} 
              className={`p-3 mb-2 rounded ${getOptionClass(index)}`}
              onClick={() => handleOptionClick(index)}
            >
              {option}
            </div>
          ))}
        </div>
        
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-semibold">Defend your answer:</h4>
             {!showExplanations && ( <Button
                onClick={handleSkipDefense}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs py-1 px-2 rounded"
              >
                Skip Defense
              </Button>)}
            </div>
            <InlineChatbot 
              context={context}
              onShowExplanations={() => {
                setShowExplanations(true);
                console.log("User's initial response:", userResponse.userAnswer);
              }}
              onMessageSent={handleMessageSent}
              key={question.id} // Add this line to reset the InlineChatbot when the question changes
            />
          </div>

        <div className="max-h-[400px] overflow-y-auto">
        {(showExplanations) && (
        <Collapsible
          open={isExplanationsOpen}
          onOpenChange={setIsExplanationsOpen}
          className="mt-4 border border-gray-200 rounded-lg"
        >
          <CollapsibleTrigger className="flex justify-between items-center w-full p-4 font-semibold">
            Explanations and Details
            {isExplanationsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="p-4">
            <p><strong>Your answer:</strong> {userResponse.userAnswer}</p>
            <p><strong>Time spent:</strong> {userResponse.timeSpent || "0"} seconds</p>
            <p><strong>Correct answer:</strong> {options[correctAnswerIndex]}</p>
            <p className={userResponse.isCorrect ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
              {userResponse.isCorrect ? "Correct" : "Incorrect"}
            </p>

            {selectedExplanationIndex !== null && (
              <div className="mt-4">
                <h4 className="font-semibold">Explanation for selected answer:</h4>
                <p className={`p-3 rounded ${selectedExplanationIndex === correctAnswerIndex ? 'bg-green-100' : 'bg-red-100'}`}>
                  {explanations[selectedExplanationIndex]}
                </p>
              </div>
            )}

            {selectedExplanationIndex !== correctAnswerIndex && (
              <div className="mt-4">
                <h4 className="font-semibold">Explanation for correct answer:</h4>
                <p className="bg-green-100 p-3 rounded">{explanations[correctAnswerIndex]}</p>
              </div>
            )}

            {userResponse.userNotes && (
              <div className="mt-4">
                <h4 className="font-semibold">Your notes:</h4>
                <p className="bg-blue-100 p-3 rounded">{userResponse.userNotes}</p>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      )}

            </div>
      </div>
      <div className="flex justify-between mt-4">
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
    </div>
  );
};

export default ReviewQuestionComponent;