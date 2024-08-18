import React, { useState, useEffect } from 'react';
import { Question, UserResponse } from '@/types';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";
import ChatbotWidget from '@/components/chatbot/ChatbotWidget';
import { PassageData } from '@/components/test/Passage';

interface ReviewQuestionComponentProps {
  question?: Question;
  passageData?: PassageData;
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
  const [isOpen, setIsOpen] = useState(true);
  const [chatbotContext, setChatbotContext] = useState({
    contentTitle: "",
    context: ""
  });
  useEffect(() => {
    if (question) {
      const options = JSON.parse(question.questionOptions);
      const answerNotes = JSON.parse(question.questionAnswerNotes || '[]');
      setExplanations(answerNotes);
      const userAnswerIndex = options.indexOf(userResponse.userAnswer);
      setSelectedExplanationIndex(userAnswerIndex);

      const correctAnswer = options[0];
      const userAnswer = options[userAnswerIndex];

      const context = `
      I'm reviewing a test question I've answered, here's some context

      ${passageData ? "Questions Passage: " + passageData.text : ""} \n
      Question: ${question.questionContent} \n
      Options: ${question.questionOptions} \n
      Correct Answer: ${correctAnswer} \n
      My Answer: ${userAnswer} \n
      Result: ${userResponse.isCorrect ? 'Correct' : 'Incorrect'} \n
      Time Spent: ${userResponse.timeSpent || "0"} seconds \n
      ${userResponse.isCorrect? "": `Explanation for my answer: ${answerNotes[userAnswerIndex] || 'No explanation available.'} \n`}
      
      Explanation for correct answer: ${answerNotes[0] || 'No explanation available.'} \n
            
      Please provide any insights, clarifications, or additional information about this question and the answers.
            `.trim();
      setChatbotContext({
        contentTitle: question.questionContent.slice(0.60),
        context
      })
    }


  }, [question, userResponse]);

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
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-4 border border-gray-200 rounded-lg">
          <CollapsibleTrigger className="flex justify-between items-center w-full p-4 font-semibold">
            Explanation and Notes
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="p-4">
            <div className="max-h-[400px] overflow-y-auto">
              <p><strong>Your answer:</strong> {userResponse.userAnswer}</p>
              <p><strong>Correct answer:</strong> {options[correctAnswerIndex]}</p>
              <p className={userResponse.isCorrect ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                {userResponse.isCorrect ? "Correct" : "Incorrect"}
              </p>
              <p><strong>Time spent:</strong> {userResponse.timeSpent || "0"} seconds</p>
              
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
            </div>
          </CollapsibleContent>
        </Collapsible>
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
      <div className="mt-4">
        <ChatbotWidget chatbotContext={chatbotContext} buttonSize={120} chatbotWidth={750} chatbotHeight={300}
        isVoiceEnabled={false}
        />
      </div>
    </div>
  );
};

export default ReviewQuestionComponent;