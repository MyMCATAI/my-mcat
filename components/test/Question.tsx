import React, { useEffect, useState } from "react";
import { Question, TestQuestion } from "@/types";

interface QuestionsProps {
  question: Question;
  onNext: () => void;
  onPrevious: () => void;
  isFirst: boolean;
  isLast: boolean;
  onAnswer: (questionId: string, answer: string, isCorrect: boolean) => void;
  userAnswer?: string;
}

const Question: React.FC<QuestionsProps> = ({ 
  question, 
  onNext, 
  onPrevious, 
  isFirst, 
  isLast,
  onAnswer,
  userAnswer
}) => {
  const [randomizedOptions, setRandomizedOptions] = useState<string[]>([]);
  const options = JSON.parse(question.questionOptions);
  // First string in array should always be correct
  const correctAnswer = options[0]


  useEffect(() => {
    // Fisher-Yates shuffle algorithm
    const shuffled = [...options];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    setRandomizedOptions(shuffled);
  }, [question]);
  
  const handleAnswerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedAnswer = event.target.value;
    const isCorrect = selectedAnswer === correctAnswer;
    console.log("selectedAnswer:",selectedAnswer)
    console.log("correct:",isCorrect)
    onAnswer(question.id, event.target.value,isCorrect);
  };

  return (
    <div className="bg-[#001326] min-h-screen px-3">
      <div className="sticky top-0 left-0 right-0 text-white p-4 flex justify-between bg-[#001326]">
        <button
          onClick={onPrevious}
          disabled={isFirst}
          className={`bg-[#ffffff] text-black py-2 px-4 rounded ${
            isFirst ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          Previous
        </button>
        <button
          onClick={onNext}
          disabled={isLast}
          className={`bg-[#ffffff] text-black py-2 px-4 rounded ${
            isLast ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          Next
        </button>
      </div>
      <div className="h-[80vh] overflow-auto p-4">
        <div className="mb-8">
          <h1 className="text-white text-2xl font-bold my-4">{`Question ${question.questionID}`}</h1>
          <p className="text-white text-xl mb-4">{question.questionContent}</p>
          <form className="text-white space-y-2">
            {randomizedOptions.map((option: string, idx: number) => (
              <label key={idx} className="flex items-center">
                <input
                  type="radio"
                  name={`question${question.questionID}`}
                  value={option}
                  checked={userAnswer === option}
                  onChange={handleAnswerChange}
                  className="mr-2"
                />
                {option}
              </label>
            ))}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Question;