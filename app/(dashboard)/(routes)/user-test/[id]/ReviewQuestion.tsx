// components/review/ReviewQuestion.tsx
import React from 'react';
import { Question, UserResponse } from '@/types';

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
  if(!question) return null
  const options = JSON.parse(question.questionOptions);

  return (
    <div className="p-6 bg-[#0A2744] text-white h-full flex flex-col">
      <h2 className="text-xl font-semibold mb-4">Question {currentQuestionIndex + 1} of {totalQuestions}</h2>
      <div className="mb-4 flex-grow">
        <h3 className="font-semibold">{question.questionContent}</h3>
        <div className="mt-4">
          {options.map((option: string, index: number) => (
            <div 
              key={index} 
              className={`p-2 mb-2 rounded ${
                option === userResponse.userAnswer
                  ? userResponse.isCorrect
                    ? 'bg-green-500'
                    : 'bg-red-500'
                  : option === options[0]
                    ? 'bg-green-500'
                    : 'bg-gray-700'
              }`}
            >
              {option}
            </div>
          ))}
        </div>
        <div className="mt-4">
          <p>Your answer: {userResponse.userAnswer}</p>
          <p>Correct answer: {options[0]}</p>
          <p className={userResponse.isCorrect ? "text-green-500" : "text-red-500"}>
            {userResponse.isCorrect ? "Correct" : "Incorrect"}
          </p>
          <p>Time spent: {userResponse.timeSpent || "0"} seconds</p>
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
    </div>
  );
};

export default ReviewQuestionComponent;