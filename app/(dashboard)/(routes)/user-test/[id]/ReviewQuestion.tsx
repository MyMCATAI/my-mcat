// components/review/ReviewQuestion.tsx
import React, { useState, useEffect } from 'react';
import { Question, UserResponse } from '@/types';
import ChatBotWidget from '@/components/chatbot/ChatbotWidget';

interface ReviewQuestionComponentProps {
  question?: Question;
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
  onNext,
  onPrevious,
  isFirst,
  isLast,
  currentQuestionIndex,
  totalQuestions
}) => {
  const [selectedOption, setSelectedOption] = useState<string>(userResponse.userAnswer);
  const [selectedAnswerNote, setSelectedAnswerNote] = useState<string>('');

  useEffect(() => {
    if (question) {
      setSelectedOption(userResponse.userAnswer);
      const options = JSON.parse(question.questionOptions);
      const answerNotes = JSON.parse(question.questionAnswerNotes || '[]');
      const userAnswerIndex = options.indexOf(userResponse.userAnswer);
      setSelectedAnswerNote(answerNotes[userAnswerIndex] || '');
    }
  }, [question, userResponse]);

  if(!question) return null
  const options = JSON.parse(question.questionOptions);
  const answerNotes = JSON.parse(question.questionAnswerNotes || '[]');

  const handleOptionClick = (option: string, index: number) => {
    setSelectedOption(option);
    setSelectedAnswerNote(answerNotes[index] || '');
  };

  const chatbotContext = {
    contentTitle: question.passageId ? question.passageId.toString() : 'Unknown Passage',
    context: answerNotes.join(' ')
  };

  return (
    <div className="p-6 bg-white text-black h-full flex flex-col">
      <h2 className="text-xl font-semibold mb-4">Question {currentQuestionIndex + 1} of {totalQuestions}</h2>
      <div className="mb-4 flex-grow">
        <h3 className="">{question.questionContent}</h3>
        <div className="mt-4 text-white">
          {options.map((option: string, index: number) => (
            <div 
              key={index} 
              className={`p-2 mb-2 rounded cursor-pointer ${
                option === selectedOption
                  ? option === options[0]
                    ? 'bg-green-500'
                    : 'bg-red-500'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
              onClick={() => handleOptionClick(option, index)}
            >
              {option}
            </div>
          ))}
        </div>
        <div className="mt-4">
          <p>Your original answer: {userResponse.userAnswer}</p>
          <p>Correct answer: {options[0]}</p>
          <p className={userResponse.isCorrect ? "text-green-500" : "text-red-500"}>
            {userResponse.isCorrect ? "Correct" : "Incorrect"}
          </p>
          <p>Time spent: {userResponse.timeSpent || "0"} seconds</p>
          {selectedAnswerNote && (
            <div className="mt-2">
              <h4 className="font-semibold">Explanation for selected answer:</h4>
              <p>{selectedAnswerNote}</p>
            </div>
          )}
          {userResponse.userNotes && <p>Your notes: {userResponse.userNotes}</p>}
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
      <div className="mt-4">
        <ChatBotWidget chatbotContext={chatbotContext} />
      </div>
    </div>
  );
};

export default ReviewQuestionComponent;